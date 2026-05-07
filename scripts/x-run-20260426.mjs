import { uploadMedia, createDraft } from './typefully.mjs';
import { writeFileSync, mkdirSync } from 'fs';

const DATE = '2026-04-26';

const posts = [
  {
    slot: 'morning',
    type: 'daily',
    hook_type: '中途半端スタート・等身大',
    publish_at: `${DATE}T08:00:00+09:00`,
    text: `日曜の朝、Brain の最終チェックしてる。\n\n明日朝9時に出すつもり。画像差し込んだり、レビュー特典の Notion 整えたり、地味な作業の方が時間かかった。\n\n文章を書くより周辺を整える方が大変なやつだった。`,
    draftTitle: '20260426_morning_brain_finalcheck',
  },
  {
    slot: 'noon',
    type: 'daily',
    hook_type: '数字先行・体験談',
    publish_at: `${DATE}T12:30:00+09:00`,
    text: `クラウドワークス始めてから、応募文を Claude Code に書かせるようになって通過率が体感5倍くらいに上がった。\n\n最初は自分で1から書いてて、毎回30分かけて1件出して、ぜんぶスルーされてた。\n\n「自分で書く」が一番非効率だったやつ。`,
    draftTitle: '20260426_noon_cw_5x_passrate',
  },
  {
    slot: 'night1',
    type: 'daily',
    hook_type: '体言止めスタート・Brain ティーザー',
    publish_at: `${DATE}T20:00:00+09:00`,
    text: `明日朝9時、Brain で初めての商品を出します。\n\nClaude Code × クラウドワークス受注実録、3ジャンル分の作業ログ。\n\n応募0件で止まってた頃から、データ入力・Excel・Webアプリで案件取れるまでの記録を全部書いた。\n\n先着50部・¥100スタート（48時間限定）\n\n明日朝、改めて告知します。`,
    image_path: 'x/images/samune.png',
    draftTitle: '20260426_night1_brain_teaser',
  },
  {
    slot: 'night2',
    type: 'daily',
    hook_type: '内心代弁・X4',
    publish_at: `${DATE}T22:00:00+09:00`,
    text: `副業始める前、AI とかわたしには関係ないと思ってた時期がある。\n\n文系だし、エンジニアの世界の話だと思ってた。\n\nその思い込みが崩れたのは「使ったら稼げた」一点だけだった。\n\n明日、Brain で初めての商品を出す。なんか変な気持ち。`,
    draftTitle: '20260426_night2_kawatta_kimochi',
  },
];

const results = [];

console.log('▶ samune.png アップロード中...');
const samuneMediaId = await uploadMedia('x/images/samune.png');
console.log(`  → media_id: ${samuneMediaId}`);

for (const p of posts) {
  const mediaIds = p.image_path ? [samuneMediaId] : [];
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
  brain_url: 'https://brain-market.com/u/moyuchi/a/b1QTM2QjMgoTZsNWa0JXY',
  posts: results,
  quote_rts: [],
  buzz_promo_replies: [],
  media_registry: {
    samune: samuneMediaId,
  },
};

mkdirSync('x/scheduled', { recursive: true });
writeFileSync(
  `x/scheduled/${DATE.replace(/-/g, '')}.json`,
  JSON.stringify(logData, null, 2)
);

console.log('\n✅ 全4件予約完了');
console.log(`記録: x/scheduled/${DATE.replace(/-/g, '')}.json`);
results.forEach((r) =>
  console.log(`  - ${r.slot} [${r.hook_type}] draft_id=${r.draft_id}`)
);
