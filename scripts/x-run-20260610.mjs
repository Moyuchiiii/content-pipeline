#!/usr/bin/env node
// /x-run daily-auto 実行スクリプト（2026-06-10 分予約）
// 4本のドラフトを Typefully に予約する:
//   1. 朝07:00 Opus 4.8 数字報告（クロスポスト・X+Threads）
//   2. 昼12:30 WWDC26 Apple-Gemini 速報所感（クロスポスト）
//   3. 夜20:00 note告知 WWDC26 Siri/Claude 統合記事（クロスポスト）
//   4. 夜23:00 引用RT TheRundownAI WWDC26（quote_post_url・X 側のみ引用挙動）

import { createDraft } from './typefully.mjs';

const results = [];

async function safeCreate(label, opts) {
  try {
    console.log(`\n▶ ${label} 作成中...`);
    const res = await createDraft(opts);
    console.log(`✅ ${label} 完了 draft_id=${res.id || res.draft_id || '?'}`);
    results.push({ label, success: true, response: res });
    return res;
  } catch (err) {
    console.error(`❌ ${label} 失敗: ${err.message}`);
    results.push({ label, success: false, error: err.message });
    return null;
  }
}

// 1. 朝07:00 Opus 4.8 数字報告（クロスポスト）
await safeCreate('朝07:00 数字報告 Opus 4.8 FrontierCode', {
  posts: [{
    text: `Cognition の新ベンチマーク FrontierCode の数字。

最難50題 Diamondセット:
・Claude Opus 4.8: 13.4%（1位）
・GPT-5.5: 6.3%
・Gemini 3.1 Pro: 4.7%

「OSSメンテナがマージしたくなるコード品質」基準で測ったやつ。Claude派でいて良かった。`
  }],
  publishAt: '2026-06-10T07:00:00+09:00',
  target: 'cross',
  crossPostToThreads: true,
  draftTitle: '朝07:00 Opus 4.8 数字報告 - 2026-06-10',
});

// 2. 昼12:30 WWDC26 速報所感（クロスポスト）
await safeCreate('昼12:30 速報所感 WWDC26', {
  posts: [{
    text: `【速報】Apple WWDC26 で Apple Intelligence の中身が Gemini ベースに刷新。

でも iOS 27 では Siri に Claude も繋がる予定。

Claude 派副業者として一瞬「終わった？」って思ったけど、結論は逆だった。Apple 公式 AI は Gemini だけど、第三者 AI を選ぶ自由が公式化された。`
  }],
  publishAt: '2026-06-10T12:30:00+09:00',
  target: 'cross',
  crossPostToThreads: true,
  draftTitle: '昼12:30 WWDC26 速報所感 - 2026-06-10',
});

// 3. 夜20:00 note告知（クロスポスト・リプにURL）
await safeCreate('夜20:00 note告知 WWDC26 Siri/Claude', {
  posts: [
    {
      text: `iPhone の Siri に Claude が繋がる時代が来た。

Apple WWDC26 で発表された Apple-Gemini 提携と、iOS 27 の第三者AI 統合。Claude 依存してる副業大学生として、何が変わるかを整理した。

「Apple 公式は Gemini だけど、Claude を選ぶ自由が公式化された」と読んでる。

詳細はnote↓`,
    },
    {
      text: 'https://note.com/moyuchi_aistu/n/n52000aab2acc',
    },
  ],
  publishAt: '2026-06-10T20:00:00+09:00',
  target: 'cross',
  crossPostToThreads: true,
  draftTitle: '夜20:00 note告知 WWDC26 - 2026-06-10',
});

// 4. 夜23:00 引用RT TheRundownAI WWDC26（quote_post_url → 自動 X 限定化）
await safeCreate('夜23:00 引用RT TheRundownAI WWDC26', {
  posts: [{
    text: `Siri AI の新仕様、Claude 派副業者として刺さるのはここ。

クラウドワークスの案件文を iPhone で見ながら、Hey Siri 経由で Claude に整理させる動きが iPhone1台で完結する未来。

iOS 27 リリース秋まで待つけど、これは普通に楽しみ。`,
    quote_post_url: 'https://x.com/TheRundownAI/status/2064048288190636036',
  }],
  publishAt: '2026-06-10T23:00:00+09:00',
  target: 'cross',
  crossPostToThreads: true,
  draftTitle: '夜23:00 引用RT WWDC26 - 2026-06-10',
});

// 結果サマリ出力
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 Typefully 予約結果サマリ:');
const successCount = results.filter(r => r.success).length;
const failCount = results.filter(r => !r.success).length;
console.log(`✅ 成功: ${successCount}件 / ❌ 失敗: ${failCount}件`);

// 結果を JSON で標準出力
console.log('\n📄 結果 JSON:');
console.log(JSON.stringify(results, null, 2));

process.exit(failCount > 0 ? 1 : 0);
