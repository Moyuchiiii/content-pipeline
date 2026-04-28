import { deleteDraft, uploadMedia, createDraft } from './typefully.mjs';
import { writeFileSync, mkdirSync, unlinkSync, existsSync } from 'fs';

// ========================================
// Step 1: 4/30 既予約 4本を削除（4/29 にスライドのため）
// ========================================
const oldDraftIds = [8891059, 8891060, 8891061, 8891062];

console.log('▶ 4/30 既予約 4本を削除中...');
for (const id of oldDraftIds) {
  try {
    await deleteDraft(id, 'cross');
    console.log(`  ✅ draft_id=${id} 削除完了`);
  } catch (e) {
    console.log(`  ⚠️ draft_id=${id} 削除失敗: ${e.message}`);
  }
}

// 4/30 のスケジュールログを削除
const oldLogPath = 'x/scheduled/20260430.json';
if (existsSync(oldLogPath)) {
  unlinkSync(oldLogPath);
  console.log(`  ✅ ${oldLogPath} 削除完了`);
}

// ========================================
// Step 2: 4/29 で再予約（同内容・時刻のみ変更）
// ========================================
const DATE = '2026-04-29';

const posts = [
  {
    slot: 'morning',
    type: 'daily',
    hook_type: '会話感スタート・短文実況',
    publish_at: `${DATE}T08:00:00+09:00`,
    text: `4ヶ月前のわたし、AIに案件説明コピペして「応募文書いて」って投げてた。\n\n3週間応募ゼロ。\n\n今日 note にしたけど、変わったのは1点だけ。\n「書いて」じゃなくて「クライアントの困りごとを5つ並べて」から始めるようになっただけ。\n\n丸投げ → 道具派、ここの切替が全部だった。`,
    cross_post: true,
    draftTitle: '20260429_morning_marubuke_to_dougu',
  },
  {
    slot: 'noon',
    type: 'daily',
    hook_type: '速報ブラケット・副業視点',
    publish_at: `${DATE}T12:30:00+09:00`,
    text: `【速報】NEC が日本企業初の Anthropic グローバルパートナーになった。\n\nClaude Cowork で金融/製造/政府向け業界特化AI を共同開発するらしい。\n\n副業で Claude にどっぷり依存してる文系大学生として\n「日本企業に Claude が本格普及したら案件単価上がりそう」と勝手に楽観してる。\n\n詳細↓`,
    reply_text: `https://www.anthropic.com/news/anthropic-nec`,
    image_path: 'x/images/anthropic.png',
    cross_post: true,
    draftTitle: '20260429_noon_nec_anthropic',
    notion_xneta_id: '3508795a-75fd-816f-abf4-fced1603b3de',
  },
  {
    slot: 'night1',
    type: 'cta_note',
    hook_type: '速報・告知・数字フック',
    publish_at: `${DATE}T20:00:00+09:00`,
    text: `AI副業に挑戦する人の9割が3ヶ月以内に挫折するらしい。\n\n原因はツールじゃなかった。\n「AIを丸投げ先で使うか・道具で使うか」の1点だけ。\n\nわたしは前者で3週間応募ゼロ→後者に切替で1週間で3スカウト→月14万まで来た。\n\nその境界線を全部書いた。\n\n詳細はnote↓`,
    reply_text: `https://note.com/moyuchi_aistu/n/n51272e7fff1a`,
    cross_post: true,
    draftTitle: '20260429_night1_marubuke_cta',
    source_cta: 'x/pending_cta/done/note_20260429_ai-fukugyo-marubuke.json.posted',
    auto_rt_recommended: true,
  },
  {
    slot: 'night2',
    type: 'daily',
    hook_type: '問いかけ代替X1・自分の立場先出し',
    publish_at: `${DATE}T22:00:00+09:00`,
    text: `副業で AI 使うとき\n「全部AIにやらせる派」と「AIに整理させて自分で書き直す派」がいる。\n\nわたしは後者。\n\n前者は最初の1ヶ月だけ楽。3ヶ月目で消える。\n後者は最初しんどいけど積み上がる。\n\n差は「AIに任せる範囲を決めれるかどうか」。\nそれだけだった。`,
    cross_post: true,
    draftTitle: '20260429_night2_2極化_問いかけ',
    notion_xneta_id: '3508795a-75fd-8121-9f25-dedf309d0617',
  },
];

const results = [];
const mediaRegistry = {};

console.log('\n▶ 4/29 で再予約中...');
for (const p of posts) {
  let mediaIds = [];
  if (p.image_path) {
    if (!mediaRegistry[p.image_path]) {
      console.log(`▶ ${p.image_path} アップロード中...`);
      mediaRegistry[p.image_path] = await uploadMedia(p.image_path);
      console.log(`  → media_id: ${mediaRegistry[p.image_path]}`);
    }
    mediaIds = [mediaRegistry[p.image_path]];
  }

  const draftPosts = [{ text: p.text, media_ids: mediaIds }];

  if (p.quote_post_url) {
    draftPosts[0].quote_post_url = p.quote_post_url;
  }
  if (p.reply_text) {
    draftPosts.push({ text: p.reply_text, media_ids: [] });
  }

  console.log(`▶ ${p.slot} ドラフト作成中...`);
  const draft = await createDraft({
    posts: draftPosts,
    publishAt: p.publish_at,
    draftTitle: p.draftTitle,
    crossPostToThreads: p.cross_post,
  });

  results.push({
    slot: p.slot,
    type: p.type,
    hook_type: p.hook_type,
    publish_at: p.publish_at,
    text: p.text,
    reply: p.reply_text || null,
    quote_post_url: p.quote_post_url || null,
    image_source: p.image_path || null,
    media_ids: mediaIds,
    cross_posted_to: p.cross_post && !p.quote_post_url ? ['x', 'threads'] : ['x'],
    source_cta: p.source_cta || null,
    notion_xneta_id: p.notion_xneta_id || null,
    auto_rt_recommended: p.auto_rt_recommended || false,
    draft_id: draft.id,
    private_url: draft.private_url || null,
  });
  console.log(`  → draft_id: ${draft.id}`);
}

const logData = {
  date: DATE,
  created_at: new Date().toISOString(),
  note_url: 'https://note.com/moyuchi_aistu/n/n51272e7fff1a',
  brain_url: null,
  posts: results,
  buzz_promo_replies: [],
  quote_rts: [],
  media_registry: mediaRegistry,
  notes: [
    '4/30 既予約 4本（draft 8891059-8891062）を削除し 4/29 にスライド（公開当日告知のため）',
    'セルフ引用RT (翌朝07:00補足) は告知投稿後にURL確定するため、次回 /x-run で別途予約',
    'バズ宣伝リプ 0本（フォロワー段階1〜100人・直近7日 likes 5以上の該当ツイートなし）',
    '引用RT 0本（source-run 系統D/E スキップで X 公式新鮮URL未取得）',
  ],
};

mkdirSync('x/scheduled', { recursive: true });
writeFileSync(
  `x/scheduled/${DATE.replace(/-/g, '')}.json`,
  JSON.stringify(logData, null, 2)
);

console.log(`\n✅ 全${results.length}件 4/29 で再予約完了`);
console.log(`記録: x/scheduled/${DATE.replace(/-/g, '')}.json`);
console.log(`\n内訳:`);
const xCount = results.length;
const threadsCount = results.filter(r => r.cross_posted_to.includes('threads')).length;
console.log(`  X: ${xCount} / Threads: ${threadsCount}`);
results.forEach((r) =>
  console.log(`  - ${r.slot} [${r.type}] ${r.cross_posted_to.join('+')} draft_id=${r.draft_id}${r.auto_rt_recommended ? ' 🔥AUTO-RT推奨' : ''}`)
);
