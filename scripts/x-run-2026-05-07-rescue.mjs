#!/usr/bin/env node
// 1/5 失敗分の再予約（5/7 12:30 → 14:30）
import { createDraft } from './typefully.mjs';

const result = await createDraft({
  posts: [{
    text: 'これ、副業の使い分けがゴッソリ塗り替わる週になった気がする。\n\nClaudeが先週MS365（Excel/Word/PPT/Outlook）対応した直後に、ChatGPTもExcel/Sheets直接編集対応か。\n\n・Claude: Office全部\n・ChatGPT: スプレッドシート系\n・Gemini: Docs/Slides/Drive\n\nClaude派副業者として、ジャンル別に再整理してる。',
    quote_post_url: 'https://x.com/ChatGPTapp/status/2051776032127238266'
  }],
  publishAt: '2026-05-07T18:00:00+09:00',
  target: 'x-only',
  draftTitle: '引用RT ChatGPTapp Excel/Sheets 5/7 18:00 (rescue)',
});

const draftId = result.id || result.draft_id || result.uuid;
const privateUrl = result.share_url || result.private_url || null;
console.log(`OK ChatGPTapp 引用RT 5/7 14:30 -> draft_id=${draftId}`);
console.log(`private_url=${privateUrl}`);
console.log('\n=== RESULT_JSON ===');
console.log(JSON.stringify({ draft_id: draftId, private_url: privateUrl }, null, 2));
