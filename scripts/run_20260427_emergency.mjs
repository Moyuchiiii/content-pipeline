#!/usr/bin/env node
// 4/27 緊急投稿: Brain告知3本（14:00 / 20:00 / 22:00）

import { createDraft, uploadMedia } from './typefully.mjs';
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');
const BRAIN_URL = 'https://brain-market.com/u/moyuchi/a/b1QTM2QjMgoTZsNWa0JXY';

async function main() {
  console.log('🖼️  サムネアップロード中...');
  const samuneId = await uploadMedia(resolve(PROJECT_ROOT, 'x/images/samune.png'));
  console.log(`   ✅ media_id: ${samuneId}`);

  const text1 = `先着50部・¥100スタート（48時間限定）。

Brain で新しい商品公開した。Claude Code × クラウドワークス受注実録、データ入力 / Excel / Web の3ジャンルの作業ログ。

応募0件で詰まってた頃から、3ジャンルで案件取れるまでの記録を全部書いた。

詳細はBrain↓`;

  const text2 = `Brain で新しい商品出してから半日経った。

特典の Notion ページを地味に作り込んだやつを今朝公開した。
Claude Code × CW の応募テンプレ集と継続案件チェックリスト、レビュー書いてくれた人にだけ送ってる。

商品本編より特典の方が時間かかった気がする。

¥100セール、48時間で終わる。早めに動いてもらえるとありがたい。`;

  const text3 = `Brain で新しいの出した日、なんか変な気持ちで終わりそう。

前のは手探りだったけど、今回はある程度型ができた状態で出した。

うまくいかない方が多いから、今日も静かにベッドで天井見てる感じ。
それでも止めずに続けてきた人だけが残るのは、副業もBrainも同じだなと思う。`;

  console.log('\n📤 [1/3] 14:00 速報・告知 送信中...');
  const draft1 = await createDraft({
    posts: [
      { text: text1, media_ids: [samuneId] },
      { text: BRAIN_URL },
    ],
    publishAt: '2026-04-27T14:00:00+09:00',
    draftTitle: '20260427_14_brain_announce_late',
    crossPostToThreads: true,
  });
  console.log(`   ✅ draft_id=${draft1.id} private_url=${draft1.private_url || draft1.share_url}`);

  console.log('\n📤 [2/3] 20:00 告知補足 送信中...');
  const draft2 = await createDraft({
    posts: [
      { text: text2 },
      { text: BRAIN_URL },
    ],
    publishAt: '2026-04-27T20:00:00+09:00',
    draftTitle: '20260427_night1_brain_followup',
    crossPostToThreads: true,
  });
  console.log(`   ✅ draft_id=${draft2.id} private_url=${draft2.private_url || draft2.share_url}`);

  console.log('\n📤 [3/3] 22:00 内心代弁 送信中...');
  const draft3 = await createDraft({
    posts: [
      { text: text3 },
    ],
    publishAt: '2026-04-27T22:00:00+09:00',
    draftTitle: '20260427_night2_brain_reflection',
    crossPostToThreads: true,
  });
  console.log(`   ✅ draft_id=${draft3.id} private_url=${draft3.private_url || draft3.share_url}`);

  // x/scheduled/20260427.json 保存
  const scheduled = {
    date: '2026-04-27',
    created_at: new Date().toISOString(),
    note_url: null,
    brain_url: BRAIN_URL,
    emergency_recovery: '本日キュー全空状態から13:40に滑り込み生成・送信',
    posts: [
      {
        slot: 'noon_late',
        type: 'cta_brain',
        hook_type: '数字先行・告知',
        publish_at: '2026-04-27T14:00:00+09:00',
        text: text1,
        reply: BRAIN_URL,
        quote_post_url: null,
        image_source: 'x/images/samune.png',
        media_ids: [samuneId],
        cross_posted_to: ['x', 'threads'],
        source_cta: 'x/pending_cta/brain_20260425_cw_3genre_jissokuLog.json',
        draft_id: draft1.id,
        private_url: draft1.private_url || null,
      },
      {
        slot: 'night1',
        type: 'cta_brain',
        hook_type: '事実先行・補足告知',
        publish_at: '2026-04-27T20:00:00+09:00',
        text: text2,
        reply: BRAIN_URL,
        quote_post_url: null,
        image_source: null,
        media_ids: [],
        cross_posted_to: ['x', 'threads'],
        source_cta: 'x/pending_cta/brain_20260425_cw_3genre_jissokuLog.json',
        draft_id: draft2.id,
        private_url: draft2.private_url || null,
      },
      {
        slot: 'night2',
        type: 'daily',
        hook_type: '内心代弁・X4型',
        publish_at: '2026-04-27T22:00:00+09:00',
        text: text3,
        reply: null,
        quote_post_url: null,
        image_source: null,
        media_ids: [],
        cross_posted_to: ['x', 'threads'],
        source_cta: null,
        draft_id: draft3.id,
        private_url: draft3.private_url || null,
      },
    ],
    quote_rts: [],
    buzz_promo_replies: [],
    media_registry: {
      samune: samuneId,
    },
  };

  writeFileSync(
    resolve(PROJECT_ROOT, 'x/scheduled/20260427.json'),
    JSON.stringify(scheduled, null, 2),
    'utf8'
  );
  console.log('\n📝 x/scheduled/20260427.json 保存完了');

  console.log('\n✅ 全3件 Typefully 予約投稿成功');
  console.log(`   キュー確認: https://typefully.com/queue`);
}

main().catch((err) => {
  console.error('❌ ERROR:', err.message);
  process.exit(1);
});
