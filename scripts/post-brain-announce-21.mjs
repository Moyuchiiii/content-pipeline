// 単発実行用: Brain 3本目 21:00 告知をクロスポスト予約
import { uploadMedia, createDraft } from './typefully.mjs';

const main = async () => {
  console.log('🖼️ サムネアップロード中...');
  const mediaId = await uploadMedia(
    'today/brain/images/brain_2026-04-28_main_14man_journey/thumb.jpg',
    'cross'
  );
  console.log('✅ メディア ID:', mediaId);

  const text = `Brain 3本目、出した。

noteのメイン商品（¥2,000・月14万になった話）を、14日カリキュラムに組み直した完全版。
プロンプト 20本・コード 3案件全文・CLAUDE.md 5種、ぜんぶ同梱で計33,000字。

ローンチ 3日間 ¥1,980（先着 50部）→ 定価 ¥3,980。
詳細↓`;

  const replyUrl = 'https://brain-market.com/u/moyuchi/a/b0YDN2QjMgoTZsNWa0JXY';

  console.log('📝 ドラフト作成中... (X+Threads クロスポスト・21:00予約)');
  const result = await createDraft({
    posts: [
      { text, media_ids: [mediaId] },
      { text: replyUrl }, // セルフリプ
    ],
    publishAt: '2026-04-28T21:00:00+09:00',
    target: 'cross',
    crossPostToThreads: true,
    draftTitle: 'Brain 3本目 告知 21:00 (Main 14man journey)',
  });

  console.log('✅ 予約完了');
  console.log('Draft ID:', result.id || result.draft_id);
  console.log('Private URL:', result.share_url || result.private_url);
};

main().catch((err) => {
  console.error('❌ エラー:', err.message);
  process.exit(1);
});
