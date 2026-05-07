// 5/2 X+Threads 予約投稿バッチ
// plan.json 5/1版採用: morning(MS Word Anthropic)/noon(Claude Security)/night1(Claude Security note告知)/night2(GPT-5.5 Codex 問いかけ)

import { uploadMedia, createDraft } from './typefully.mjs';
import { writeFileSync, mkdirSync, existsSync, renameSync } from 'fs';

const DATE = '2026-05-02';
const NOTE_URL = 'https://note.com/moyuchi_aistu/n/n314d7d21e49b';

// ===== ブランドロゴ画像アップロード =====
console.log('▶ ブランドロゴアップロード中...');
const claudeMediaId = await uploadMedia('x/images/claude.png', 'cross');
console.log(`  → claude.png media_id: ${claudeMediaId}`);

const posts = [];

// ===== ① 朝08:00 — MS Word Anthropic 速報所感（クロスポスト） =====
console.log('▶ morning ドラフト作成中（MS Word Anthropic 速報所感）...');
const morningText = `びっくりした。Word の Copilot 編集機能で Anthropic Claude が選べるようになる、5月中旬から。

Microsoft 4/30 発表。文書作成・推敲案件で GPT と Claude を切り替えられる時代に入る。

CW の Word 案件、しばらくこれで遊べそう。`;

const morning = await createDraft({
  posts: [{ text: morningText, media_ids: [claudeMediaId] }],
  publishAt: `${DATE}T08:00:00+09:00`,
  draftTitle: `5/2 朝 MS Word Anthropic 速報所感 (クロスポスト)`,
  target: 'cross',
  crossPostToThreads: true,
});
console.log(`  → draft_id: ${morning.id}`);
posts.push({
  slot: 'morning',
  type: 'daily',
  hook_type: '感嘆スタート・型B',
  publish_at: `${DATE}T08:00:00+09:00`,
  text: morningText,
  reply: null,
  quote_post_url: null,
  image_source: 'x/images/claude.png',
  media_ids: [claudeMediaId],
  cross_posted_to: ['x', 'threads'],
  source_cta: null,
  notion_xneta_id: '3538795a-75fd-81c9-87b1-dd9b217ae26b',
  auto_rt_recommended: false,
  draft_id: morning.id,
  private_url: morning.share_url,
});

// ===== ② 昼12:30 — Claude Security 速報所感（クロスポスト） =====
console.log('▶ noon ドラフト作成中（Claude Security 速報所感）...');
const noonText = `Claude Security が public beta になった。Opus 4.7 でコードベースをまるごとスキャンして脆弱性を見つけ、パッチも書いてくれる。

ただし Claude Enterprise 限定。@zento_ai の試算だと「年額80万＋従量課金で諭吉100万飛ぶ」。

副業 Pro $20 派のわたしは、シンプルに別の世界の話だった。`;

const noon = await createDraft({
  posts: [{ text: noonText, media_ids: [claudeMediaId] }],
  publishAt: `${DATE}T12:30:00+09:00`,
  draftTitle: `5/2 昼 Claude Security 速報所感 (クロスポスト)`,
  target: 'cross',
  crossPostToThreads: true,
});
console.log(`  → draft_id: ${noon.id}`);
posts.push({
  slot: 'noon',
  type: 'daily',
  hook_type: '速報所感・体言止め・型A',
  publish_at: `${DATE}T12:30:00+09:00`,
  text: noonText,
  reply: null,
  quote_post_url: null,
  image_source: 'x/images/claude.png',
  media_ids: [claudeMediaId],
  cross_posted_to: ['x', 'threads'],
  source_cta: null,
  notion_xneta_id: '3538795a-75fd-813e-a623-c5beb1da91f0',
  auto_rt_recommended: false,
  draft_id: noon.id,
  private_url: noon.share_url,
});

// ===== ③ 夜前半20:00 — note告知 Claude Security 副業視点（クロスポスト・Auto-RT推奨ON） =====
console.log('▶ night1 ドラフト作成中（note告知・クロスポスト）...');
const night1Text = `@claudeai が昨日 Claude Security の public beta を出した。コード脆弱性をAIが点検する時代になった、けど個人 Pro 契約には来ない。

「諭吉100万飛ぶ」エンプラの話を、副業大学生として遠目に眺めて整理した。

副業者の納品物の品質保証、半年後どう変わるか。

詳細はnote↓`;

const night1 = await createDraft({
  posts: [
    { text: night1Text, media_ids: [claudeMediaId] },
    { text: NOTE_URL },
  ],
  publishAt: `${DATE}T20:00:00+09:00`,
  draftTitle: `5/2 夜前半 note告知 Claude Security 副業視点 (クロスポスト・Auto-RT推奨ON)`,
  target: 'cross',
  crossPostToThreads: true,
});
console.log(`  → draft_id: ${night1.id}`);
posts.push({
  slot: 'night1',
  type: 'cta_note',
  hook_type: '数字フック告知',
  publish_at: `${DATE}T20:00:00+09:00`,
  text: night1Text,
  reply: NOTE_URL,
  quote_post_url: null,
  image_source: 'x/images/claude.png',
  media_ids: [claudeMediaId],
  cross_posted_to: ['x', 'threads'],
  source_cta: 'x/pending_cta/note_20260501_claude-security-side-job-view.json',
  notion_xneta_id: null,
  auto_rt_recommended: true,
  draft_id: night1.id,
  private_url: night1.share_url,
});

// ===== ④ 夜後半22:00 — GPT-5.5 + Codex /goal 問いかけ（クロスポスト） =====
console.log('▶ night2 ドラフト作成中（GPT-5.5 Codex 問いかけ）...');
const night2Text = `GPT-5.5 + Codex の /goal で AI を days 単位で走らせ続けられる時代になってる。Claude Code /loop 派のわたしは今日初めて知って結構衝撃だった。

X 見てると「Claude から GPT-5.5+Codex に移った」勢も増えてきてる。

両方使うのが現実解になっていきそう、と思ってて、、`;

const night2 = await createDraft({
  posts: [{ text: night2Text }],
  publishAt: `${DATE}T22:00:00+09:00`,
  draftTitle: `5/2 夜後半 GPT-5.5 Codex 問いかけ (クロスポスト)`,
  target: 'cross',
  crossPostToThreads: true,
});
console.log(`  → draft_id: ${night2.id}`);
posts.push({
  slot: 'night2',
  type: 'daily',
  hook_type: '問いかけ・自分の立場先出し型X1・型A体言止め',
  publish_at: `${DATE}T22:00:00+09:00`,
  text: night2Text,
  reply: null,
  quote_post_url: null,
  image_source: null,
  media_ids: [],
  cross_posted_to: ['x', 'threads'],
  source_cta: null,
  notion_xneta_id: '3538795a-75fd-811f-875d-d93672f4eaed',
  auto_rt_recommended: false,
  draft_id: night2.id,
  private_url: night2.share_url,
});

// ===== ⑤ x/scheduled/20260502.json に保存 =====
const scheduledRecord = {
  date: DATE,
  created_at: new Date().toISOString(),
  posts,
};
const scheduledPath = `x/scheduled/${DATE.replace(/-/g, '')}.json`;
mkdirSync('x/scheduled', { recursive: true });
writeFileSync(scheduledPath, JSON.stringify(scheduledRecord, null, 2), 'utf8');
console.log(`✅ ${scheduledPath} に履歴保存完了`);

// ===== ⑥ pending_cta クリーンアップ =====
const pendingCtaSrc = 'x/pending_cta/note_20260501_claude-security-side-job-view.json';
const pendingCtaDest = 'x/pending_cta/done/note_20260501_claude-security-side-job-view.json.posted';
mkdirSync('x/pending_cta/done', { recursive: true });
if (existsSync(pendingCtaSrc)) {
  renameSync(pendingCtaSrc, pendingCtaDest);
  console.log(`✅ pending_cta done/ へ移動: ${pendingCtaDest}`);
}

// ===== ⑦ 完了報告 =====
console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`✅ 5/2 予約投稿 4本 Typefully に送信完了`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`内訳:`);
console.log(`  - 日常3本（朝/昼/夜後半） → X+Threads クロスポスト`);
console.log(`  - 告知1本（夜前半 Claude Security note） → X+Threads クロスポスト・Auto-RT推奨`);
console.log(`\nTypefullyで確認: https://typefully.com/queue`);
console.log(`セルフ引用RT は 5/2 20:00 投稿後に Typefully UI で手動予約（quote_post_url 補完）`);
