// 5/1 X+Threads 予約投稿バッチ
// plan.json 採用: morning(/recap)/noon(/team-onboarding)/night1(Sundar Pichai Gemini告知)/night2(ゴブリン風刺引用RT)

import { uploadMedia, createDraft } from './typefully.mjs';
import { writeFileSync, mkdirSync, existsSync, renameSync } from 'fs';

const DATE = '2026-05-01';
const NOTE_URL = 'https://note.com/moyuchi_aistu/n/nc33fe22e12e4';
const QUOTE_GOBLIN_URL = 'https://x.com/i__t/status/2049697065660493949';

// ===== ブランドロゴ画像アップロード =====
console.log('▶ ブランドロゴアップロード中...');
const claudeCodeMediaId = await uploadMedia('x/images/claude_code.png', 'cross');
console.log(`  → claude_code.png media_id: ${claudeCodeMediaId}`);

const geminiMediaId = await uploadMedia('x/images/gemini.png', 'cross');
console.log(`  → gemini.png media_id: ${geminiMediaId}`);

const posts = [];

// ===== ① 朝07:00 — Before/After /recap（クロスポスト） =====
console.log('▶ morning ドラフト作成中（/recap Before/After）...');
const morningText = `朝起きて Claude Code 開いた瞬間、昨日の続きが20分かかってたのが1分で戻れるようになった。

新しく出た /recap コマンドが、これまでの会話・修正したファイル・次にやるタスクを自動でまとめてくれる。

授業挟んでも、夜寝落ちしても、戻ってきた時の「えっと何してたっけ」が消える。`;

const morning = await createDraft({
  posts: [{ text: morningText, media_ids: [claudeCodeMediaId] }],
  publishAt: `${DATE}T07:00:00+09:00`,
  draftTitle: `5/1 朝 /recap Before/After (クロスポスト)`,
  target: 'cross',
  crossPostToThreads: true,
});
console.log(`  → draft_id: ${morning.id}`);
posts.push({
  slot: 'morning',
  type: 'daily',
  hook_type: 'Before/After体言止め',
  publish_at: `${DATE}T07:00:00+09:00`,
  text: morningText,
  reply: null,
  quote_post_url: null,
  image_source: 'x/images/claude_code.png',
  media_ids: [claudeCodeMediaId],
  cross_posted_to: ['x', 'threads'],
  source_cta: null,
  notion_xneta_id: '3528795a-75fd-81b5-8a55-e90d731e963e',
  auto_rt_recommended: false,
  draft_id: morning.id,
  private_url: morning.share_url,
});

// ===== ② 昼12:30 — /team-onboarding 速報所感（クロスポスト） =====
console.log('▶ noon ドラフト作成中（/team-onboarding 速報所感）...');
const noonText = `Claude Code に /team-onboarding ってコマンドが地味に来てた。

自分の使用履歴を分析してチーム向けオンボーディングガイドを自動生成するやつ。

個人副業のわたしは「次の案件に切り替える時の自分用クイックリファレンス」に使えそう。試したい。`;

const noon = await createDraft({
  posts: [{ text: noonText, media_ids: [claudeCodeMediaId] }],
  publishAt: `${DATE}T12:30:00+09:00`,
  draftTitle: `5/1 昼 /team-onboarding 速報所感 (クロスポスト)`,
  target: 'cross',
  crossPostToThreads: true,
});
console.log(`  → draft_id: ${noon.id}`);
posts.push({
  slot: 'noon',
  type: 'daily',
  hook_type: '速報所感・体言止め',
  publish_at: `${DATE}T12:30:00+09:00`,
  text: noonText,
  reply: null,
  quote_post_url: null,
  image_source: 'x/images/claude_code.png',
  media_ids: [claudeCodeMediaId],
  cross_posted_to: ['x', 'threads'],
  source_cta: null,
  notion_xneta_id: '3528795a-75fd-81fb-96eb-e31dcc6bcbb7',
  auto_rt_recommended: false,
  draft_id: noon.id,
  private_url: noon.share_url,
});

// ===== ③ 夜前半20:00 — note告知 Sundar Pichai Gemini（クロスポスト・本体+リプ・Auto-RT推奨ON） =====
console.log('▶ night1 ドラフト作成中（note告知・クロスポスト）...');
const night1Text = `副業の提案資料案件、Claude → 手で資料化 で45分かかってたのが、Gemini に資料化任せて20分になった。

4月29日リリースで Gemini が Docs もスライドも PDF も Excel も全部チャット直生成できるようになって、本文 Claude × ファイル化 Gemini の2層分担が刺さる。

Workspace案件持ってる副業者向け。

詳細はnote↓`;

const night1 = await createDraft({
  posts: [
    { text: night1Text, media_ids: [geminiMediaId] },
    { text: NOTE_URL },
  ],
  publishAt: `${DATE}T20:00:00+09:00`,
  draftTitle: `5/1 夜前半 note告知 Sundar Pichai Gemini (クロスポスト・Auto-RT推奨ON)`,
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
  image_source: 'x/images/gemini.png',
  media_ids: [geminiMediaId],
  cross_posted_to: ['x', 'threads'],
  source_cta: 'x/pending_cta/note_20260430_gemini-files-claude-vs-gemini.json',
  notion_xneta_id: null,
  auto_rt_recommended: true,
  draft_id: night1.id,
  private_url: night1.share_url,
});

// ===== ④ 夜後半23:00 — 引用RT ゴブリン風刺（X限定） =====
console.log('▶ night2 ドラフト作成中（引用RT・X限定）...');
const night2Text = `これ笑った。

Anthropic も Google も Mistral も新機能・新モデル出してて、Claude派のわたしは追いきれないくらい便利になってるんだけど、

OpenAI さん側のゴブリンはちょっと心配になってきた。

副業で Claude に集中できる時期、いま意外と貴重かも。`;

const night2 = await createDraft({
  posts: [{ text: night2Text, quote_post_url: QUOTE_GOBLIN_URL }],
  publishAt: `${DATE}T23:00:00+09:00`,
  draftTitle: `5/1 夜後半 引用RT ゴブリン風刺 (X限定)`,
  target: 'x-only',
});
console.log(`  → draft_id: ${night2.id}`);
posts.push({
  slot: 'night2',
  type: 'quote_rt',
  hook_type: '共感・自虐風',
  publish_at: `${DATE}T23:00:00+09:00`,
  text: night2Text,
  reply: null,
  quote_post_url: QUOTE_GOBLIN_URL,
  image_source: null,
  media_ids: [],
  cross_posted_to: ['x'],
  source_cta: null,
  notion_xneta_id: '3528795a-75fd-812d-a527-d9663d34013a',
  auto_rt_recommended: false,
  draft_id: night2.id,
  private_url: night2.share_url,
});

// ===== ⑤ x/scheduled/20260501.json に保存 =====
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
const pendingCtaSrc = 'x/pending_cta/note_20260430_gemini-files-claude-vs-gemini.json';
const pendingCtaDest = 'x/pending_cta/done/note_20260430_gemini-files-claude-vs-gemini.json.posted';
mkdirSync('x/pending_cta/done', { recursive: true });
if (existsSync(pendingCtaSrc)) {
  renameSync(pendingCtaSrc, pendingCtaDest);
  console.log(`✅ pending_cta done/ へ移動: ${pendingCtaDest}`);
}

// ===== ⑦ 完了報告 =====
console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`✅ 5/1 予約投稿 4本 Typefully に送信完了`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`内訳:`);
console.log(`  - 日常2本（朝/昼） → X+Threads クロスポスト`);
console.log(`  - 告知1本（夜前半） → X+Threads クロスポスト・Auto-RT推奨`);
console.log(`  - 引用RT 1本（夜後半） → X 限定`);
console.log(`\nTypefullyで確認: https://typefully.com/queue`);
console.log(`セルフ引用RT は 5/1 20:00 投稿後に Typefully UI で手動予約（quote_post_url 補完）`);
