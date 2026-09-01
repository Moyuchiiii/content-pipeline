#!/usr/bin/env node
// /x-run daily-auto 一時スクリプト
// 対象日: 2026-05-16（土）
// 4本予約: morning引用RT + noon速報所感 + night1note告知 + night2引用RT
// 生成日: 2026-05-15

import { createDraft, uploadMedia } from './typefully.mjs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');

const NOTE_URL = 'https://note.com/moyuchi_aistu/n/n5ad530655339';
const TARGET_DATE = '2026-05-16';

// ─────────────────────────────────────
// ツイート本文
// ─────────────────────────────────────

const morning = {
  text: `Pro $20 派、これ地味に効くやつ。

Claude Code の weekly limit、7/13 まで +50% で動いてくれる。
副業で毎日使ってる側からすると、week 後半に枠尽きる感覚がしばらく忘れられそう。

ちょっと先回しにしてた案件、今週積めるかも。`,
  quote_post_url: 'https://x.com/ClaudeDevs/status/2054639777685934564',
};

const noon = `Anthropic、6/15 からサブスク仕様変わる。

ざっくり整理:
・Agent SDK / claude -p / GitHub Actions が月次クレジット別枠化
・Pro $20 / Max5x $100 / Max20x $200 が新たに付与
・ターミナルで claude 打って使う interactive は対象外（従来通り）

Pro $20 で Claude Code 普通に使ってる副業派は、ほぼ何も変わらない。

詳細は note に書いた↓`;

const night1Main = `今日、note 1本書いた。

「Anthropic 6/15 でサブスク仕様変わるって聞いて焦ったけど、Pro $20 で Claude Code interactive 使ってる副業派は、ほぼ何も変わらない」を整理した。

Agent SDK 使ってる人だけ別枠 $20 になる話。

公式ヘルプ + 3社報道で確認した内容を、Pro $20 派のわたしの視点で書いた↓`;

const night1Reply = NOTE_URL;

const night2 = {
  text: `これ来たんだ、、

マウスポインタ50年振りに再発明。
Gemini が画面のどこに何があるか理解して、声でも指差しでも動かせる。

わたしの副業でも、AI に「ここクリックして」って言える日が普通に来るんだろうな。`,
  quote_post_url: 'https://x.com/GoogleDeepMind/status/2054246119635300451',
};

// ─────────────────────────────────────
// 実行
// ─────────────────────────────────────

const results = {
  morning: null,
  noon: null,
  night1: null,
  night2: null,
  errors: [],
};

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`📅 /x-run daily-auto: 明日 ${TARGET_DATE} 分の予約投稿`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// 1. morning: 引用RT (07:00) - X限定
try {
  console.log('【1/4】 morning 07:00 引用RT (ClaudeDevs weekly limits +50%)');
  results.morning = await createDraft({
    posts: [morning],
    publishAt: `${TARGET_DATE}T07:00:00+09:00`,
    target: 'x-only',
    draftTitle: `[2026-05-16] morning 引用RT ClaudeDevs weekly limits +50%`,
  });
  console.log(`  ✅ Draft ID: ${results.morning.id}`);
  console.log(`  🔗 ${results.morning.private_url || '(URLなし)'}`);
} catch (err) {
  console.error(`  ❌ Error: ${err.message}`);
  results.errors.push({ slot: 'morning', error: err.message });
}

// 2. noon: 画像アップロード後ドラフト (12:30) - cross
try {
  console.log('\n【2/4】 noon 12:30 速報所感 (Anthropic サブスク刷新)');
  console.log('  → 画像 anthropic.png アップロード中...');
  const anthropicLogoId = await uploadMedia(
    resolve(PROJECT_ROOT, 'x/images/anthropic.png'),
    'cross'
  );
  console.log(`  ✅ Media ID: ${anthropicLogoId}`);

  results.noon = await createDraft({
    posts: [
      {
        text: noon,
        media_ids: [anthropicLogoId],
      },
    ],
    publishAt: `${TARGET_DATE}T12:30:00+09:00`,
    target: 'cross',
    crossPostToThreads: true,
    draftTitle: `[2026-05-16] noon 速報所感 Anthropic サブスク 6/15刷新`,
  });
  console.log(`  ✅ Draft ID: ${results.noon.id}`);
  console.log(`  🔗 ${results.noon.private_url || '(URLなし)'}`);
} catch (err) {
  console.error(`  ❌ Error: ${err.message}`);
  results.errors.push({ slot: 'noon', error: err.message });
}

// 3. night1: note告知 + リプライ (20:00) - cross
try {
  console.log('\n【3/4】 night1 20:00 note告知 + リプライURL');
  results.night1 = await createDraft({
    posts: [
      { text: night1Main },
      { text: night1Reply },
    ],
    publishAt: `${TARGET_DATE}T20:00:00+09:00`,
    target: 'cross',
    crossPostToThreads: true,
    draftTitle: `[2026-05-16] night1 note告知 Anthropic サブスク刷新`,
  });
  console.log(`  ✅ Draft ID: ${results.night1.id}`);
  console.log(`  🔗 ${results.night1.private_url || '(URLなし)'}`);
} catch (err) {
  console.error(`  ❌ Error: ${err.message}`);
  results.errors.push({ slot: 'night1', error: err.message });
}

// 4. night2: 引用RT (23:00) - X限定
try {
  console.log('\n【4/4】 night2 23:00 引用RT (GoogleDeepMind マウス+AI)');
  results.night2 = await createDraft({
    posts: [night2],
    publishAt: `${TARGET_DATE}T23:00:00+09:00`,
    target: 'x-only',
    draftTitle: `[2026-05-16] night2 引用RT GoogleDeepMind マウス+AI`,
  });
  console.log(`  ✅ Draft ID: ${results.night2.id}`);
  console.log(`  🔗 ${results.night2.private_url || '(URLなし)'}`);
} catch (err) {
  console.error(`  ❌ Error: ${err.message}`);
  results.errors.push({ slot: 'night2', error: err.message });
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('完了サマリー');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━');
const successCount = Object.values(results).filter(
  (v) => v && typeof v === 'object' && v.id
).length;
console.log(`成功: ${successCount}/4 件`);
if (results.errors.length > 0) {
  console.log(`エラー: ${results.errors.length} 件`);
  results.errors.forEach((e) => console.log(`  - ${e.slot}: ${e.error}`));
}
console.log('\nTypefully UI: https://typefully.com/queue');

// JSON で結果を stdout に出力（呼び出し側がパース可能）
console.log('\n=== RESULTS_JSON_START ===');
console.log(JSON.stringify(results, null, 2));
console.log('=== RESULTS_JSON_END ===');
