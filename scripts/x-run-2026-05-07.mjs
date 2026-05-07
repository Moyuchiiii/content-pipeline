#!/usr/bin/env node
// /x-run daily-auto 2026-05-07 実行スクリプト
// plan.json の x.slots に基づき、5/7-5/8 の 5 本を Typefully に予約

import { createDraft } from './typefully.mjs';

const drafts = [
  {
    label: '1/5 引用RT ChatGPTapp Excel/Sheets 5/7 12:30',
    args: {
      posts: [{
        text: 'これ、副業の使い分けがゴッソリ塗り替わる週になった気がする。\n\nClaudeが先週MS365（Excel/Word/PPT/Outlook）対応した直後に、ChatGPTもExcel/Sheets直接編集対応か。\n\n・Claude: Office全部\n・ChatGPT: スプレッドシート系\n・Gemini: Docs/Slides/Drive\n\nClaude派副業者として、ジャンル別に再整理してる。',
        quote_post_url: 'https://x.com/ChatGPTapp/status/2051776032127238266'
      }],
      publishAt: '2026-05-07T12:30:00+09:00',
      target: 'x-only',
      draftTitle: '引用RT ChatGPTapp Excel/Sheets 5/7 12:30',
    },
  },
  {
    label: '2/5 note告知 SpaceX-Anthropic 5/7 20:00',
    args: {
      posts: [
        { text: 'note書いた。\n\n5/6にAnthropicがSpaceXと組んで、Claude Codeの5時間制限を2倍にした日の話。\n\nPro月20ドル据え置きで、実質Maxの一歩前みたいな枠が手に入った感覚。\n副業大学生として何が変わったかを記録した。\n\n詳細はnote↓' },
        { text: 'https://note.com/moyuchi_aistu/n/ne6b1e71946c7' },
      ],
      publishAt: '2026-05-07T20:00:00+09:00',
      target: 'cross',
      crossPostToThreads: true,
      draftTitle: 'note告知 SpaceX-Anthropic 5/7 20:00',
    },
  },
  {
    label: '3/5 引用RT singo405 iOS27 5/7 23:00',
    args: {
      posts: [{
        text: 'え、これは…\n\niOS 27 で Apple Intelligence Extensions が入って、Siri/Writing Tools/Image Playground から Claude や Gemini を呼べる仕様らしい。\n\nApple端末でClaudeが選べないストレス、地味に大きかった。\nChatGPT一強だったApple AIの壁が崩れる兆し。',
        quote_post_url: 'https://x.com/singo405/status/2051994059691143224'
      }],
      publishAt: '2026-05-07T23:00:00+09:00',
      target: 'x-only',
      draftTitle: '引用RT singo405 iOS27 Apple Intelligence 5/7 23:00',
    },
  },
  {
    label: '4/5 引用RT claudeai SpaceX 5/8 07:00',
    args: {
      posts: [{
        text: 'SpaceX提携でClaude Code 2倍。\n\nPro月3000円で副業してる文系大学生としては正直大きい。\n5時間制限が10時間相当に。\nPro/Maxのピーク制限も解除。\nOpus API も considerably 引き上げ。\n\n副業の段取り、組み直すレベル。',
        quote_post_url: 'https://x.com/claudeai/status/2052060691893227611'
      }],
      publishAt: '2026-05-08T07:00:00+09:00',
      target: 'x-only',
      draftTitle: '引用RT claudeai SpaceX-Anthropic 5/8 07:00',
    },
  },
  {
    label: '5/5 セルフ補足 SpaceX翌朝 5/8 09:00',
    args: {
      posts: [{
        text: '昨日のSpaceX×Anthropicの話、結局いちばん変わるのは「夜帯のClaude Codeが普通に動くこと」だと思う。\n\n授業・バイト後の22-25時、副業大学生にとってここが本番。\nピーク制限解除はPro/Max対象だけど、24時間使える前提に変わった意味が大きい。\n\n副業の段取り、1週間で組み直してる。'
      }],
      publishAt: '2026-05-08T09:00:00+09:00',
      target: 'cross',
      crossPostToThreads: true,
      draftTitle: 'セルフ補足 SpaceX翌朝 5/8 09:00',
    },
  },
];

const results = [];
for (const d of drafts) {
  try {
    const result = await createDraft(d.args);
    const draftId = result.id || result.draft_id || result.uuid;
    const privateUrl = result.share_url || result.private_url || null;
    results.push({ label: d.label, ok: true, draft_id: draftId, private_url: privateUrl });
    console.log(`OK ${d.label} -> draft_id=${draftId}`);
  } catch (err) {
    results.push({ label: d.label, ok: false, error: err.message });
    console.error(`NG ${d.label}: ${err.message}`);
  }
}

console.log('\n=== RESULTS_JSON_BEGIN ===');
console.log(JSON.stringify(results, null, 2));
console.log('=== RESULTS_JSON_END ===');
