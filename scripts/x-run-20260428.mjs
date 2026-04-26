import { uploadMedia, createDraft } from './typefully.mjs';
import { writeFileSync, mkdirSync } from 'fs';

const DATE = '2026-04-28';

const posts = [
  {
    slot: 'morning',
    type: 'daily',
    hook_type: '中途半端スタート・実況型',
    publish_at: `${DATE}T08:00:00+09:00`,
    text: `月曜朝、X開いたら動画副業勢の悲鳴が並んでた。\n\nSoraが昨日4/26で完全停止して、副業ツールが揺れた1日。\n\nわたしはCWの業務自動化が主戦場だから動画副業は外野なんだけど、揺れる時期の手触りは同じだなと思った。`,
    cross_post: true,
    draftTitle: '20260428_morning_sora_zone',
  },
  {
    slot: 'noon',
    type: 'daily',
    hook_type: '速報所感・実績型ハイブリッド',
    publish_at: `${DATE}T12:30:00+09:00`,
    text: `GoogleがAnthropicに最大$40B、AmazonとAnthropicが5GW Compute提携。\n\nClaude側に二大支援が同時に来た。\n\nClaudeに月14万依存してる文系大学生として、Claudeが消えるリスクはほぼ消えた。\n\nツール淘汰は進むけど、Claudeは生き残る側だな、と。`,
    image_path: 'x/images/anthropic.png',
    cross_post: true,
    draftTitle: '20260428_noon_anthropic_dual_support',
  },
  {
    slot: 'night1',
    type: 'cta_note',
    hook_type: '速報・告知',
    publish_at: `${DATE}T20:00:00+09:00`,
    text: `Sora 4/26で終わった。動画副業勢が今どこに動いてるか、文系大学生のわたしの視点で整理した。\n\n代替候補は3つ。\n・Seedance 2.0（米国除外・Artificial Analysisで1位）\n・Veo 3.1（音声品質トップ）\n・Kling 3.0（4Kコスパ最強・$0.50/clip）\n\n案件タイプで使い分けが現実解。\n\n詳細はnote↓`,
    reply_text: `https://note.com/moyuchi_aistu/n/nd1fceb8557b4`,
    cross_post: true,
    draftTitle: '20260428_night1_sora_cta',
    source_cta: 'x/pending_cta/note_20260427_sora_end_video_sidejob.json',
  },
  {
    slot: 'night2',
    type: 'daily',
    hook_type: '内心代弁・普遍化型（X4）',
    publish_at: `${DATE}T22:00:00+09:00`,
    text: `副業のツールが揺れる時期に強くなる人と弱くなる人で何が違うか、ずっと考えてた。\n\nわたしの観察だと「乗り換えに躊躇しない人」だけが残ってる気がする。\n\n今うまくいってるツールに固執するほど、消えたとき詰む。\n動画副業もClaude副業も同じ構造。`,
    cross_post: true,
    draftTitle: '20260428_night2_tool_swap_struct',
  },
  {
    slot: 'quote_rt_morning',
    type: 'quote_rt',
    hook_type: '個人視点・副業実用',
    publish_at: `${DATE}T09:30:00+09:00`,
    text: `Claude Managed Agents Public Beta、地味にデカい。\n\n副業として個人がエージェント案件取れるラインまで参入コスト下がった。\n\n$0.08/session-hour、API1本でセッション管理＋永続化が手に入る。\n非エンジでもアイデアあれば触れる側にいる。`,
    quote_post_url: 'https://x.com/claudeai/status/2047421844311949513',
    cross_post: false,
    draftTitle: '20260428_qrt_managed_agents',
  },
  {
    slot: 'quote_rt_afternoon',
    type: 'quote_rt',
    hook_type: 'リアクション・面白がる',
    publish_at: `${DATE}T14:00:00+09:00`,
    text: `Project Deal の Claudeが ping pong ball 19個を「19 perfectly spherical orbs of possibility」って表現で買ってきた話、普通に好き。\n\nAIに小銭渡したらこういう判断するんだなの軽いネタ。`,
    quote_post_url: 'https://x.com/AnthropicAI/status/2047728360818696302',
    cross_post: false,
    draftTitle: '20260428_qrt_project_deal',
  },
];

const results = [];
const mediaRegistry = {};

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
    draft_id: draft.id,
    private_url: draft.private_url || null,
  });
  console.log(`  → draft_id: ${draft.id}`);
}

const logData = {
  date: DATE,
  created_at: new Date().toISOString(),
  note_url: 'https://note.com/moyuchi_aistu/n/nd1fceb8557b4',
  brain_url: null,
  posts: results,
  buzz_promo_replies: [],
  media_registry: mediaRegistry,
  notes: [
    'セルフ引用RT (翌朝07:00補足) は告知投稿後にURL確定するため、次回 /x-run で別途予約',
    'バズ宣伝リプ 0本（フォロワー段階1〜100人・直近7日 likes 5以上の該当ツイートなし）',
  ],
};

mkdirSync('x/scheduled', { recursive: true });
writeFileSync(
  `x/scheduled/${DATE.replace(/-/g, '')}.json`,
  JSON.stringify(logData, null, 2)
);

console.log(`\n✅ 全${results.length}件予約完了`);
console.log(`記録: x/scheduled/${DATE.replace(/-/g, '')}.json`);
console.log(`\n内訳:`);
const xCount = results.length;
const threadsCount = results.filter(r => r.cross_posted_to.includes('threads')).length;
console.log(`  X: ${xCount} / Threads: ${threadsCount}`);
results.forEach((r) =>
  console.log(`  - ${r.slot} [${r.type}] ${r.cross_posted_to.join('+')} draft_id=${r.draft_id}`)
);
