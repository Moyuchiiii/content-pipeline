#!/usr/bin/env node
// x-run 2026-05-10 (土) 予約投稿
// 5本: 朝07/昼12:30/夜20:00 告知/夜23:00/翌朝07:00 セルフ引用RT補足

import { createDraft, uploadMedia } from './typefully.mjs';

const NOTE_URL = 'https://note.com/moyuchi_aistu/n/nef19453190e5';

async function main() {
  const results = [];

  // ===== 朝 07:00 日常実況 =====
  try {
    const r1 = await createDraft({
      posts: [{
        text: `土曜の朝、コーヒー飲みながら今週の振り返り。
note 1本（金融プロ用Claudeエージェント10種の話）と Brain ネタ仕込み。
副業4ヶ月目、月14万キープが見えてきた。

派手さじゃなくて続けてるかどうかだなって最近思う。`
      }],
      publishAt: '2026-05-10T07:00:00+09:00',
      target: 'cross',
      crossPostToThreads: true,
      draftTitle: '5/10 朝07:00 土曜実況',
    });
    results.push({ slot: 'morning', status: 'ok', draftId: r1.id, url: r1.share_url });
  } catch (err) {
    results.push({ slot: 'morning', status: 'error', error: err.message });
  }

  // ===== 昼 12:30 速報所感 (Goldman/Blackstone) =====
  try {
    const noonImage = await uploadMedia('./x/images/anthropic.png', 'cross');
    const r2 = await createDraft({
      posts: [{
        text: `中堅企業に Claude が入る波、もう来てる。

Anthropicが今週 Goldman Sachs と Blackstone と組んで企業向けAI会社を作った。
ターゲットは地方銀行・地域メーカー・地域医療。

副業者目線では、CWに「Claude導入支援」案件が3〜6ヶ月で来る伏線。
プロフィールに「Claude Pro利用可能」1行入れておく価値ある。`,
        media_ids: [noonImage]
      }],
      publishAt: '2026-05-10T12:30:00+09:00',
      target: 'cross',
      crossPostToThreads: true,
      draftTitle: '5/10 昼12:30 Anthropic Wall Street進出',
    });
    results.push({ slot: 'noon', status: 'ok', draftId: r2.id, url: r2.share_url });
  } catch (err) {
    results.push({ slot: 'noon', status: 'error', error: err.message });
  }

  // ===== 夜 20:00 告知 (finance-agents-10) + リプにnoteURL =====
  try {
    const night1Image = await uploadMedia('./x/images/claude.png', 'cross');
    const r3 = await createDraft({
      posts: [
        {
          text: `Anthropicが金融プロ用のClaudeエージェント10種を出した。
驚いたのが、Pro $20プラン全部に入ったこと。

中身は「調べて・まとめて・チェックする」作業ばかり。
副業の中小企業案件にそのまま転用できる。

文系大学生のわたしが3つ触ってみた話、note記事にまとめた。
詳細はnote↓`,
          media_ids: [night1Image]
        },
        { text: NOTE_URL }
      ],
      publishAt: '2026-05-10T20:00:00+09:00',
      target: 'cross',
      crossPostToThreads: true,
      draftTitle: '5/10 夜20:00 finance-agents-10 告知',
    });
    results.push({ slot: 'night1_cta', status: 'ok', draftId: r3.id, url: r3.share_url });
  } catch (err) {
    results.push({ slot: 'night1_cta', status: 'error', error: err.message });
  }

  // ===== 夜 23:00 速報所感 (CEO警告) =====
  try {
    const night2Image = await uploadMedia('./x/images/anthropic.png', 'cross');
    const r4 = await createDraft({
      posts: [{
        text: `「狭い時間窓で、世界中のソフトの脆弱性10万件超を治す必要がある」

Anthropic CEO Dario Amodeiの警告。例のMythosが見つけたやつの続報。

副業でClaude Pro使ってるわたし的には、Anthropicが「攻める側」じゃなく「治す側」に立ってるのが地味に安心要素。`,
        media_ids: [night2Image]
      }],
      publishAt: '2026-05-10T23:00:00+09:00',
      target: 'cross',
      crossPostToThreads: true,
      draftTitle: '5/10 夜23:00 CEO警告 Mythos続報',
    });
    results.push({ slot: 'night2', status: 'ok', draftId: r4.id, url: r4.share_url });
  } catch (err) {
    results.push({ slot: 'night2', status: 'error', error: err.message });
  }

  // ===== 5/11 07:00 セルフ引用RT補足 (X限定) =====
  try {
    const r5 = await createDraft({
      posts: [{
        text: `Excel・PowerPoint・Word に Claude が直接入った話、書ききれてなかった。

副業のCW案件で「Excelデータ→Wordレポート」月2件やってる。今までDesktopで往復してた作業が、アプリ内で完結する。

4/29のAdobe・Canva・Blender続きの本命がこれかも。`
      }],
      publishAt: '2026-05-11T07:00:00+09:00',
      target: 'x-only',
      draftTitle: '5/11 朝07:00 finance-agents 補足セルフ引用RT',
    });
    results.push({ slot: 'self_quote_next_morning', status: 'ok', draftId: r5.id, url: r5.share_url });
  } catch (err) {
    results.push({ slot: 'self_quote_next_morning', status: 'error', error: err.message });
  }

  console.log(JSON.stringify(results, null, 2));
}

main().catch((err) => {
  console.error('FATAL:', err.message);
  process.exit(1);
});
