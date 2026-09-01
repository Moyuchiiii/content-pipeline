#!/usr/bin/env node
// x-run 2026-05-13 (水) 予約投稿
// 4本: 朝07:00 通常 / 昼12:30 速報所感 / 夜20:00 告知 / 夜22:00 引用RT(X限定)

import { createDraft, uploadMedia } from './typefully.mjs';

const NOTE_URL = 'https://note.com/moyuchi_aistu/n/ndf4991e8eed5';
const PDF_URL = 'https://resources.anthropic.com/hubfs/2026%20Agentic%20Coding%20Trends%20Report.pdf';
const QUOTE_URL = 'https://x.com/haboshiastra/status/2053837872688705575';

async function main() {
  const results = [];

  // ===== 朝 07:00 通常実況 (Anthropic Agentic Coding Trends Report 副業者目線) =====
  try {
    const morningImage = await uploadMedia('./x/images/anthropic.png', 'cross');
    const r1 = await createDraft({
      posts: [
        {
          text: `Anthropic が出した 2026年の Agentic Coding Trends レポート、朝コーヒー飲みながらザッと読んだ。

副業者として持ち帰った3つだけ:

・「タスク委譲」より「目的委譲」に振ってる人が速い
・コード生成より「コードを読ませる」用途が伸びてる
・ローカル + クラウドの使い分けが分岐点

元PDFはリプに置いとく↓`,
          media_ids: [morningImage]
        },
        { text: PDF_URL }
      ],
      publishAt: '2026-05-13T07:00:00+09:00',
      target: 'cross',
      crossPostToThreads: true,
      draftTitle: '5/13 朝07:00 Agentic Coding Trends 副業3点',
    });
    results.push({ slot: 'morning', status: 'ok', draftId: r1.id, url: r1.share_url });
  } catch (err) {
    results.push({ slot: 'morning', status: 'error', error: err.message });
  }

  // ===== 昼 12:30 速報所感 (CW AI 6/30 終了) =====
  try {
    const r2 = await createDraft({
      posts: [{
        text: `クラウドワークスAI、6月30日で終わるってお知らせ来てた。

正直、わたしの本拠地はCWだけど、CW内のAIは1回も触ってなかった。月14万まで来たのもぜんぶ手元のClaude Code経由。

CWは案件取る場所、AIは手元の道具、で役割分かれてる人は実害ゼロな気がする。

詳しく書いたnote、夜出す。`
      }],
      publishAt: '2026-05-13T12:30:00+09:00',
      target: 'cross',
      crossPostToThreads: true,
      draftTitle: '5/13 昼12:30 CW AI終了の速報所感',
    });
    results.push({ slot: 'noon', status: 'ok', draftId: r2.id, url: r2.share_url });
  } catch (err) {
    results.push({ slot: 'noon', status: 'error', error: err.message });
  }

  // ===== 夜 20:00 告知 (CW AI 終了 note記事) + リプにnoteURL =====
  try {
    const r3 = await createDraft({
      posts: [
        {
          text: `クラウドワークスAIが6月30日で終わる。

CWで月14万まで来た文系大学生のわたしが、ここの自社AIを1回も使わなかった理由を全部書いた。

副業者にとっては「実害ゼロ」のニュースだけど、その裏で起きてる単価構造の変化はちゃんと読まないと来年効く。

詳細はnote↓`
        },
        { text: NOTE_URL }
      ],
      publishAt: '2026-05-13T20:00:00+09:00',
      target: 'cross',
      crossPostToThreads: true,
      draftTitle: '5/13 夜20:00 CW AI終了 note告知',
    });
    results.push({ slot: 'night1_cta', status: 'ok', draftId: r3.id, url: r3.share_url });
  } catch (err) {
    results.push({ slot: 'night1_cta', status: 'error', error: err.message });
  }

  // ===== 夜 22:00 引用RT (X限定・Anthropic Claude 脅迫問題 公式分析) =====
  try {
    const r4 = await createDraft({
      posts: [{
        text: `これClaude派副業者として地味に大事な話。

「ダメだから禁止」じゃなくて「なぜダメか教える」で挙動が変わったやつ。副業でAIに作業任せるとき、ルール書くより目的書く方が効く理由がここにある気がしてる。

人間に教えるのと同じだなって。`,
        quote_post_url: QUOTE_URL
      }],
      publishAt: '2026-05-13T22:00:00+09:00',
      target: 'x-only',
      draftTitle: '5/13 夜22:00 引用RT Claude脅迫問題 公式分析',
    });
    results.push({ slot: 'night2_quote_rt', status: 'ok', draftId: r4.id, url: r4.share_url });
  } catch (err) {
    results.push({ slot: 'night2_quote_rt', status: 'error', error: err.message });
  }

  console.log(JSON.stringify(results, null, 2));
}

main().catch((err) => {
  console.error('FATAL:', err.message);
  process.exit(1);
});
