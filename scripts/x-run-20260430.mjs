// 4/30 X+Threads 予約投稿バッチ（再送信版・Connectors告知メイン）
// 旧版（4/29朝に自動生成・なぜか稼げない人記事告知）を全削除して再構築

import { uploadMedia, createDraft } from './typefully.mjs';
import { writeFileSync, mkdirSync, existsSync, renameSync } from 'fs';
import path from 'path';

const DATE = '2026-04-30';
const NOTE_URL = 'https://note.com/moyuchi_aistu/n/nc32f948903a4';
const QUOTE_PUSH_URL = 'https://x.com/ClaudeDevs/status/2049154855143649315';

// メディアアップロード（夜前半告知用・サムネ画像があれば）
const thumbPath = 'today/note/draft_20260429_claude-creative-connectors_thumb.png';
let thumbMediaId = null;
if (existsSync(thumbPath)) {
  console.log(`▶ ${thumbPath} アップロード中...`);
  const r = await uploadMedia(thumbPath, 'cross');
  thumbMediaId = r.media_id;
  console.log(`  → media_id: ${thumbMediaId}`);
}

const posts = [];

// ① 朝08:00 — 日常実況（短文・クロスポスト）
console.log('▶ morning ドラフト作成中...');
const morningText = `朝、Connectors の記事公開した翌日。

note 投稿したらコメント来るかなって張り付いてしまうの、まだ抜けない。
Adobe コネクタ、4ヶ月後の自分が当たり前に使ってると思う。`;

const morning = await createDraft({
  posts: [{ text: morningText }],
  publishAt: `${DATE}T08:00:00+09:00`,
  draftTitle: `4/30 朝 日常実況 (クロスポスト)`,
  target: 'cross',
  crossPostToThreads: true,
});
console.log(`  → draft_id: ${morning.id}`);
posts.push({
  slot: 'morning',
  type: 'daily',
  hook_type: '中途半端スタート・短文実況',
  publish_at: `${DATE}T08:00:00+09:00`,
  text: morningText,
  reply: null,
  quote_post_url: null,
  image_source: null,
  media_ids: [],
  cross_posted_to: ['x', 'threads'],
  source_cta: null,
  notion_xneta_id: null,
  auto_rt_recommended: false,
  draft_id: morning.id,
  private_url: morning.share_url,
});

// ② 昼12:30 — 引用RT @ClaudeDevs Push Notifications（X限定）
console.log('▶ noon ドラフト作成中（引用RT・X限定）...');
const noonText = `これが地味に効くやつ。

Claude に長時間タスク投げて、ターミナル張り付き続ける時間が
副業4ヶ月目でもまだ消えてなかった。

Push 通知が来るなら、寝てる間に走らせた仕事を朝確認して、
出かけながら修正指示を投げる、が普通になる。

ベースのフローが変わる側。`;

const noon = await createDraft({
  posts: [{ text: noonText, quote_post_url: QUOTE_PUSH_URL }],
  publishAt: `${DATE}T12:30:00+09:00`,
  draftTitle: `4/30 昼 引用RT @ClaudeDevs Push Notifications (X限定)`,
  target: 'x-only',
});
console.log(`  → draft_id: ${noon.id}`);
posts.push({
  slot: 'noon',
  type: 'quote_rt',
  hook_type: '体言止めスタート・型A',
  publish_at: `${DATE}T12:30:00+09:00`,
  text: noonText,
  reply: null,
  quote_post_url: QUOTE_PUSH_URL,
  image_source: null,
  media_ids: [],
  cross_posted_to: ['x'],
  source_cta: null,
  notion_xneta_id: '3518795a-75fd-81e7-8ce5-de406907f5b6',
  auto_rt_recommended: false,
  draft_id: noon.id,
  private_url: noon.share_url,
});

// ③ 夜前半20:00 — note告知 Connectors（クロスポスト・本体+リプ・Auto-RT推奨ON）
console.log('▶ night1 ドラフト作成中（note告知・クロスポスト）...');
const night1Text = `Adobe・Canva・Blender が、全部 Claude から動かせるようになった。

副業のクリエイティブ系案件のフローが
今日から少しずつ書き換わる側だと思う。

「9連携で何が変わって、何は変わらないか」を
文系大学生の副業視点で全部整理した。

詳細はnote↓`;

const night1Posts = [{ text: night1Text }];
if (thumbMediaId) {
  night1Posts[0].media_ids = [thumbMediaId];
}
night1Posts.push({ text: NOTE_URL });

const night1 = await createDraft({
  posts: night1Posts,
  publishAt: `${DATE}T20:00:00+09:00`,
  draftTitle: `4/30 夜前半 note告知 Connectors (クロスポスト・Auto-RT推奨ON)`,
  target: 'cross',
  crossPostToThreads: true,
});
console.log(`  → draft_id: ${night1.id}`);
posts.push({
  slot: 'night1',
  type: 'cta_note',
  hook_type: '体言止めスタート・告知',
  publish_at: `${DATE}T20:00:00+09:00`,
  text: night1Text,
  reply: NOTE_URL,
  quote_post_url: null,
  image_source: thumbMediaId ? thumbPath : null,
  media_ids: thumbMediaId ? [thumbMediaId] : [],
  cross_posted_to: ['x', 'threads'],
  source_cta: 'x/pending_cta/note_20260429_claude-creative-connectors.json',
  notion_xneta_id: null,
  auto_rt_recommended: true,
  draft_id: night1.id,
  private_url: night1.share_url,
});

// ④ 夜後半22:00 — 問いかけ代替 単価二極化（クロスポスト）
console.log('▶ night2 ドラフト作成中...');
const night2Text = `クリエイティブ副業の単価、これから二極化する。

Claude が動かせるようになった範囲（バナー量産・スライドリサイズ）は崩壊側。
判断と指示が要る範囲（ブランドガイド込み・複合納品）は上昇側。

わたしは後者に振る。手作業の側で消耗するより、判断料で稼ぐ側に座っとく。`;

const night2 = await createDraft({
  posts: [{ text: night2Text }],
  publishAt: `${DATE}T22:00:00+09:00`,
  draftTitle: `4/30 夜後半 問いかけ代替 単価二極化 (クロスポスト)`,
  target: 'cross',
  crossPostToThreads: true,
});
console.log(`  → draft_id: ${night2.id}`);
posts.push({
  slot: 'night2',
  type: 'daily',
  hook_type: 'テーゼ先出し・X1型問いかけ代替',
  publish_at: `${DATE}T22:00:00+09:00`,
  text: night2Text,
  reply: null,
  quote_post_url: null,
  image_source: null,
  media_ids: [],
  cross_posted_to: ['x', 'threads'],
  source_cta: null,
  notion_xneta_id: null,
  auto_rt_recommended: false,
  draft_id: night2.id,
  private_url: night2.share_url,
});

// scheduled JSON 上書き
const scheduledData = {
  date: DATE,
  created_at: new Date().toISOString(),
  note_url: NOTE_URL,
  brain_url: null,
  posts,
  buzz_promo_replies: [],
  quote_rts: [
    {
      slot: 'noon',
      source_url: QUOTE_PUSH_URL,
      source_account: 'ClaudeDevs',
      draft_id: noon.id,
    }
  ],
  media_registry: thumbMediaId ? { [thumbPath]: thumbMediaId } : {},
  notes: [
    '旧版（4/29朝自動生成）のドラフト 8897829-8897832 を削除して再構築',
    'メインは Connectors 記事 (nc32f948903a4) 告知に差し替え',
    '昼は @ClaudeDevs Push Notifications 引用RT（X限定）',
    'バズ宣伝リプ 0本（フォロワー段階1〜100人・直近7日 likes 5以上の該当ツイートなし）',
    'Threads-only スキップ（TYPEFULLY_THREADS_ONLY_SOCIAL_SET_ID 確認未取・運用負荷考慮）',
    'セルフ引用RT (5/1 朝07:00補足) は告知投稿後にURL確定するため次回 /x-run で別途予約',
  ],
};

mkdirSync('x/scheduled', { recursive: true });
writeFileSync(`x/scheduled/${DATE}.json`, JSON.stringify(scheduledData, null, 2));

// pending_cta 移動
const ctaSrc = 'x/pending_cta/note_20260429_claude-creative-connectors.json';
const ctaDst = 'x/pending_cta/done/note_20260429_claude-creative-connectors.json.posted';
if (existsSync(ctaSrc)) {
  mkdirSync('x/pending_cta/done', { recursive: true });
  renameSync(ctaSrc, ctaDst);
  console.log(`▶ pending_cta 移動: ${path.basename(ctaSrc)} → done/`);
}

console.log('\n✅ 全4件再予約完了');
console.log(`記録: x/scheduled/${DATE}.json`);
console.log('\n内訳:');
console.log(`  X: 4 / Threads: 3 (引用RTは X 限定)`);
posts.forEach(p => {
  const flag = p.auto_rt_recommended ? ' 🔥AUTO-RT推奨' : '';
  console.log(`  - ${p.slot} [${p.type}] ${p.cross_posted_to.join('+')} draft_id=${p.draft_id}${flag}`);
});
