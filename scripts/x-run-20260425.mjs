import { uploadMedia, createDraft } from './typefully.mjs';
import { writeFileSync, mkdirSync } from 'fs';

const DATE = '2026-04-25';

const posts = [
  {
    slot: 'morning',
    type: 'daily',
    hook_type: '日常実況・等身大',
    publish_at: `${DATE}T08:00:00+09:00`,
    text: `朝起きて一番に Claude のチェックしてる、最近の習慣。\n\n寝てる間に走らせた作業の結果を見るだけなんだけど、\nこれやってから副業の時間の使い方ガラッと変わった。\n\n「働く時間を増やす」じゃなくて\n「寝てる時間にも進んでる」発想に切り替わるのが大きかった。`,
    draftTitle: '20260425_morning_routine',
  },
  {
    slot: 'quote_rt',
    type: 'quote_rt',
    hook_type: '引用RT・観察評価',
    source_url: 'https://x.com/AI1033659848478/status/2047514351360409928',
    publish_at: `${DATE}T09:30:00+09:00`,
    text: `この計算式、ほんとにキレイにハマる。\n\nでも文系のわたしの場合、AIライターじゃなくて\n「業務自動化スクリプト」を選んだ方が単価高かった。\n\n1件¥15,000〜¥65,000、月4〜5件で月14万になった。\n\nどのジャンル選ぶかが、実は月10万到達までの一番の変数だと思う。`,
    quote_post_url: 'https://x.com/AI1033659848478/status/2047514351360409928',
    draftTitle: '20260425_quote_ai_writer_model',
  },
  {
    slot: 'noon',
    type: 'daily',
    hook_type: '速報ブラケット',
    publish_at: `${DATE}T12:30:00+09:00`,
    text: `【速報】\nGPT-5.5 が出た。OpenAIが4/23に発表。\n\nベンチマークで Claude Opus 4.7 のコーディング・推論・数学を上回ったらしい。\n\n副業で ChatGPT Plus($20) 使ってる人的には、\n今日から使えるのが一番大事なポイント。\n\nClaude と ChatGPT、並行で手元に置いて使い分ける時代が続いてる。\n\n詳細↓`,
    reply_text: '元情報はこちら↓\nhttps://x.com/OpenAI/status/2047376561205325845',
    image_path: 'x/images/openai.webp',
    draftTitle: '20260425_noon_gpt55_release',
  },
  {
    slot: 'night1',
    type: 'daily',
    hook_type: '数字報告',
    publish_at: `${DATE}T20:00:00+09:00`,
    text: `クラウドワークスのAI関連案件、2026年は5,832件超に急増してる。\n\n2年前のわたしはそもそも「AI案件」というカテゴリがあるのも知らなかった。\n\n「AIに関心はあるけど副業どこから始めたらいいかわからない」って人、\n参入が遅れるほど不利になる業界じゃないし、\n今から始めても遅いってことはないと思う。`,
    draftTitle: '20260425_night1_cw_ai_5832',
  },
  {
    slot: 'night2',
    type: 'daily',
    hook_type: '内心代弁・等身大',
    publish_at: `${DATE}T22:00:00+09:00`,
    text: `副業4ヶ月目の気づき。\n\n月14万稼げるようになると、お金の心配が消えて、別の悩みが出てきた。\n\n・案件を選ぶ余裕ができて、逆に何を断るか迷う\n・やれることが増えて、やりたいこともないのに走り続ける\n・休むことに罪悪感が出てくる\n\n「稼げない悩み」と「稼げる悩み」は全然違う種類のやつだった。`,
    draftTitle: '20260425_night2_4month_shift',
  },
];

const results = [];

console.log('▶ openai.webp アップロード中...');
const openaiMediaId = await uploadMedia('x/images/openai.webp');
console.log(`  → media_id: ${openaiMediaId}`);

for (const p of posts) {
  const mediaIds = p.image_path ? [openaiMediaId] : [];
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
  });

  results.push({
    slot: p.slot,
    type: p.type,
    hook_type: p.hook_type,
    publish_at: p.publish_at,
    text: p.text,
    reply: p.reply_text || null,
    source_url: p.source_url || null,
    quote_post_url: p.quote_post_url || null,
    image_source: p.image_path || null,
    media_ids: mediaIds,
    draft_id: draft.id,
    private_url: draft.private_url,
  });
  console.log(`  → draft_id: ${draft.id}`);
}

const logData = {
  date: DATE,
  created_at: new Date().toISOString(),
  note_url: null,
  posts: results,
  quote_rts: [],
  buzz_promo_replies: [],
  media_registry: {
    openai_logo: openaiMediaId,
  },
};

mkdirSync('x/scheduled', { recursive: true });
writeFileSync(
  `x/scheduled/${DATE.replace(/-/g, '')}.json`,
  JSON.stringify(logData, null, 2)
);

console.log('\n✅ 全5件予約完了');
console.log(`記録: x/scheduled/${DATE.replace(/-/g, '')}.json`);
results.forEach((r) =>
  console.log(`  - ${r.slot} [${r.hook_type}] draft_id=${r.draft_id}`)
);
