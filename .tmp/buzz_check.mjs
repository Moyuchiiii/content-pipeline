import { detectBuzz } from '../scripts/typefully.mjs';

const buzzed = await detectBuzz({
  days: 7,
  likesThreshold: 5,
  impressionsThreshold: 500,
  retweetsThreshold: 1,
});

console.log(`バズ候補: ${buzzed.length}件`);
for (const b of buzzed) {
  console.log(`---`);
  console.log(`URL: ${b.tweet_url}`);
  console.log(`❤️${b.likes} 🔁${b.retweets} 👁${b.impressions}`);
  console.log(`本文: ${b.text?.slice(0, 120)}`);
  console.log(`投稿時刻: ${b.published_at}`);
}
