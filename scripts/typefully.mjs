#!/usr/bin/env node
// Typefully API v2 ヘルパー
// 用途: hyui_cc の X 予約投稿を自動化する /x-run スキルから呼び出す
// 仕様: https://support.typefully.com/en/articles/8718287-typefully-api
// 調査メモ: projects/content-pipeline/context/typefully-api-research.md

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ENV_PATH = resolve(__dirname, '..', '.env');
const BASE = 'https://api.typefully.com/v2';

function loadEnv() {
  try {
    const text = readFileSync(ENV_PATH, 'utf8');
    const env = {};
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx < 0) continue;
      const key = trimmed.slice(0, idx).trim();
      const value = trimmed.slice(idx + 1).trim();
      env[key] = value;
    }
    return env;
  } catch (err) {
    throw new Error(`Cannot read .env at ${ENV_PATH}: ${err.message}`);
  }
}

const env = loadEnv();
const API_KEY = env.TYPEFULLY_API_KEY;
const SOCIAL_SET_ID = env.TYPEFULLY_SOCIAL_SET_ID;

if (!API_KEY) {
  console.error('❌ TYPEFULLY_API_KEY が .env に設定されていません');
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
};

async function callApi(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers,
    ...options,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status} ${res.statusText}: ${body}`);
  }
  return res.json();
}

export async function getSocialSets() {
  return callApi('/social-sets?limit=50');
}

export async function getMe() {
  return callApi('/me');
}

export async function getQueue({ startDate, endDate } = {}) {
  if (!SOCIAL_SET_ID) throw new Error('TYPEFULLY_SOCIAL_SET_ID が未設定');
  const params = new URLSearchParams();
  if (startDate) params.set('start_date', startDate);
  if (endDate) params.set('end_date', endDate);
  const query = params.toString();
  const path = `/social-sets/${SOCIAL_SET_ID}/queue${query ? `?${query}` : ''}`;
  return callApi(path);
}

/**
 * X 投稿のアナリティクス取得（B: バズ検知 / C: collect-stats 用）
 * @param {object} opts
 * @param {string} [opts.startDate] ISO 8601 日付（例: "2026-04-16"）
 * @param {string} [opts.endDate] ISO 8601 日付
 * @param {number} [opts.limit] 取得件数上限
 */
export async function getAnalytics({ startDate, endDate, limit } = {}) {
  if (!SOCIAL_SET_ID) throw new Error('TYPEFULLY_SOCIAL_SET_ID が未設定');
  const params = new URLSearchParams();
  if (startDate) params.set('start_date', startDate);
  if (endDate) params.set('end_date', endDate);
  if (limit) params.set('limit', String(limit));
  const query = params.toString();
  const path = `/social-sets/${SOCIAL_SET_ID}/analytics/x/posts${query ? `?${query}` : ''}`;
  return callApi(path);
}

/**
 * バズ検出: いいね/インプ閾値を超えた自分のツイートを抽出
 *
 * Typefully API の実レスポンス構造（2026-04-23 実測）:
 * { post_id, url, preview_text, created_at, metrics: { impressions, engagement: { likes, shares, comments, quotes, saves } } }
 *
 * @param {object} opts
 * @param {number} [opts.days=7] 過去何日分をスキャンするか
 * @param {number} [opts.likesThreshold=100] いいね閾値
 * @param {number} [opts.impressionsThreshold=10000] インプ閾値
 * @param {number} [opts.retweetsThreshold=10] リポスト閾値
 */
export async function detectBuzz({
  days = 7,
  likesThreshold = 100,
  impressionsThreshold = 10000,
  retweetsThreshold = 10,
} = {}) {
  const endDate = new Date().toISOString().slice(0, 10);
  const startDate = new Date(Date.now() - days * 86400000)
    .toISOString()
    .slice(0, 10);

  const data = await getAnalytics({ startDate, endDate, limit: 100 });
  const posts = data.results || data.data || data.posts || [];

  const extract = (p) => ({
    likes: p.metrics?.engagement?.likes ?? p.likes ?? 0,
    retweets: p.metrics?.engagement?.shares ?? p.retweets ?? 0,
    impressions: p.metrics?.impressions ?? p.impressions ?? 0,
    replies: p.metrics?.engagement?.comments ?? p.replies ?? 0,
    quotes: p.metrics?.engagement?.quotes ?? 0,
    saves: p.metrics?.engagement?.saves ?? p.bookmarks ?? 0,
  });

  const buzzed = posts.filter((p) => {
    const m = extract(p);
    return (
      m.likes >= likesThreshold ||
      m.impressions >= impressionsThreshold ||
      m.retweets >= retweetsThreshold
    );
  });

  return buzzed.map((p) => {
    const m = extract(p);
    return {
      tweet_id: p.post_id || p.id,
      tweet_url:
        p.url ||
        (p.post_id ? `https://x.com/moyuchi_cc/status/${p.post_id}` : null),
      text: p.preview_text || p.text || '',
      likes: m.likes,
      retweets: m.retweets,
      impressions: m.impressions,
      replies: m.replies,
      saves: m.saves,
      published_at: p.created_at || p.published_at,
    };
  });
}

export async function uploadMedia(filePath) {
  if (!SOCIAL_SET_ID) throw new Error('TYPEFULLY_SOCIAL_SET_ID が未設定');
  const fileName = filePath.split(/[\\/]/).pop();

  const { media_id, upload_url } = await callApi(
    `/social-sets/${SOCIAL_SET_ID}/media/upload`,
    { method: 'POST', body: JSON.stringify({ file_name: fileName }) }
  );

  const fileBuffer = readFileSync(filePath);
  const putRes = await fetch(upload_url, { method: 'PUT', body: fileBuffer });
  if (!putRes.ok) {
    throw new Error(`S3 upload failed: ${putRes.status}`);
  }

  for (let i = 0; i < 30; i++) {
    const { status } = await callApi(
      `/social-sets/${SOCIAL_SET_ID}/media/${media_id}`
    );
    if (status === 'ready') return media_id;
    if (status === 'failed') throw new Error('Media processing failed');
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error('Media processing timeout');
}

/**
 * Typefully ドラフト作成
 * @param {object} opts
 * @param {Array<{text: string, media_ids?: string[], quote_post_url?: string}>} opts.posts
 * @param {string} opts.publishAt ISO 8601（例: "2026-04-24T08:00:00+09:00"）/ "now" / "next-free-slot"
 * @param {string} [opts.draftTitle] 内部管理用タイトル
 * @param {string[]} [opts.tags]
 * @param {string} [opts.replyToUrl] リプライ先のXツイートURL（バズ宣伝リプ用）
 */
export async function createDraft({
  posts,
  publishAt,
  draftTitle,
  tags,
  replyToUrl,
}) {
  if (!SOCIAL_SET_ID) throw new Error('TYPEFULLY_SOCIAL_SET_ID が未設定');
  if (!Array.isArray(posts) || posts.length === 0) {
    throw new Error('posts は非空配列が必要');
  }
  if (!publishAt) throw new Error('publishAt が必要');

  const xPlatform = {
    enabled: true,
    posts,
  };
  if (replyToUrl) {
    xPlatform.settings = { reply_to_url: replyToUrl };
  }

  const body = {
    platforms: { x: xPlatform },
    publish_at: publishAt,
    share: false,
  };
  if (draftTitle) body.draft_title = draftTitle;
  if (tags) body.tags = tags;

  return callApi(`/social-sets/${SOCIAL_SET_ID}/drafts`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

async function main() {
  const cmd = process.argv[2];

  if (cmd === 'list-social-sets') {
    const sets = await getSocialSets();
    const list = sets.results || sets.data || sets.items || [];
    console.log(`Social Sets (${list.length} found):`);
    list.forEach((s, i) => {
      const account = s.username ? `@${s.username}` : '(no username)';
      const name = s.name || '(no name)';
      console.log(`${i + 1}. ID: ${s.id} | ${account} | ${name}`);
    });
    console.log('\n→ 対応する ID を .env の TYPEFULLY_SOCIAL_SET_ID に記入してください');
    return;
  }

  if (cmd === 'me') {
    const me = await getMe();
    console.log(JSON.stringify(me, null, 2));
    return;
  }

  if (cmd === 'queue') {
    const queue = await getQueue();
    console.log(JSON.stringify(queue, null, 2));
    return;
  }

  if (cmd === 'test-draft') {
    const testText = `テストドラフト ${new Date().toISOString()}`;
    const res = await createDraft({
      posts: [{ text: testText }],
      publishAt: 'next-free-slot',
      draftTitle: 'API疎通テスト',
    });
    console.log(JSON.stringify(res, null, 2));
    console.log('\n→ Typefully UI で確認してください: https://typefully.com/queue');
    return;
  }

  console.error(`Usage:
  node scripts/typefully.mjs list-social-sets    Social Set 一覧取得
  node scripts/typefully.mjs me                  アカウント情報取得
  node scripts/typefully.mjs queue               現在のキュー確認
  node scripts/typefully.mjs test-draft          テスト用ドラフトを next-free-slot で作成
`);
  process.exit(1);
}

const invokedAsScript =
  Boolean(process.argv[1]) && process.argv[1].endsWith('typefully.mjs');
if (invokedAsScript) {
  main().catch((err) => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
}
