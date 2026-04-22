---
name: x-run
description: hyui_cc の X（Twitter）投稿を Typefully 経由で自動予約する毎日実行スキル。引用RTと日常4本を生成→承認→スケジュール予約まで全自動。
allowed-tools: Bash, Write, Read, Edit, Glob, Grep, WebFetch, WebSearch, mcp__notion__notion-search, mcp__notion__notion-fetch, mcp__notion__notion-update-page, mcp__claude-in-chrome__tabs_context_mcp, mcp__claude-in-chrome__tabs_create_mcp, mcp__claude-in-chrome__navigate, mcp__claude-in-chrome__get_page_text, mcp__claude-in-chrome__read_page, mcp__claude-in-chrome__javascript_tool
---

# /x-run

hyui_cc（@hyui_cc）のX投稿を Typefully 経由で毎日自動予約するパイプライン。

---

## コンセプト

- **毎日実行**: 1日1回 `/x-run` を叩くと、翌日分の投稿（日常4本 + 引用RT 0〜3本）をTypefullyに予約
- **Typefully経由**: X純正予約は使わない。Typefully API v2 で schedule_at 指定
- **引用RTはAI全般公式アカウントのみ**: Claude / OpenAI / Google / Meta 等の公式（日本語インフルエンサーは対象外）
- **画像戦略は段階運用**: Phase 1は画像なしで送信、Phase 2から自動添付（後述）

---

## Phase 0: 起動判定

### ① 環境変数チェック

```bash
# projects/content-pipeline/.env から読み込む
TYPEFULLY_API_KEY  必須
TYPEFULLY_SOCIAL_SET_ID  必須（初回は空・setup モードで取得）
```

未設定なら:
```
⚠️ Typefully 環境変数が未設定です
→ projects/content-pipeline/.env を開いて TYPEFULLY_API_KEY を記入してください
→ 完了後 /x-run setup を実行して Social Set ID を取得します
```

### ② 起動ルート判定

| 引数 | 処理 |
|---|---|
| （なし） | **daily-auto**（メイン）— 明日分を予約 |
| `setup` | Social Set ID 取得 → .env に書き込み |
| `queue` | 現在のTypefullyキューを表示 |
| `dry-run` | 生成はするが Typefully に送らない（テスト用） |

---

## モード: setup（初回のみ）

`scripts/typefully.mjs` のヘルパー関数 `getSocialSets()` を呼んで、hyui_cc に紐づく Social Set ID を取得し、.env に追記する。

```bash
node scripts/typefully.mjs list-social-sets
```

出力例:
```
Social Sets:
1. ID: abc123... | hyui_cc (X)
```

ユーザーに ID を確認してもらい、.env の `TYPEFULLY_SOCIAL_SET_ID` に書き込む。

---

## モード: daily-auto（メイン）

### Phase 1: コンテキスト読み込み

必ず以下を読む:

- `context/x-profile.md` — Hyui ブランド・ターゲット
- `context/x-strategy.md` — アルゴリズム対策・時間帯戦略・引用RT対象リスト
- `context/x-hook-formulas.md` — フック10型（ツイート生成前に必ず1つ宣言）
- `context/voice-samples.md` — 文体サンプル・NGパターン・**書き出し5型（A〜E）・リプ誘導・問いかけ代替4型（X1〜X4）**
- `context/writing-rules.md` — **禁止フレーズ60+個・AI定型表現リスト・X特有NGパターン**（生成後に必ず全件照合）
- `context/x-anti-ai-patterns.md` — **競合200本分析・AIくささ根本解決テンプレ10パターン**（2026-04-23追加・必読）
- `context/x-content-depth-research.md` — **@claudecode_lab 46本実測・目標文字数・URL配置ルール・クリック誘導語句・濃度向上10テンプレ**（2026-04-23追加・最重要）
- `context/x-performance.md` — 過去実績・フック型別成功率
- `context/content-memory.md` — **過去の成功パターン・AI感失敗ログ**（同じ失敗を繰り返さない）
- `context/x-influencer-research.md` — 引用RTコメント10パターン（引用RT生成時参照）
- `today/` の最新記事（あれば実録ネタとして参照）
- `x/published/` 過去7日分（重複ネタ防止）

### Phase 2: Claude公式＆AI全般アカウント監視

claude-in-chrome MCPで下記を順に開き、過去24時間のツイートを取得:

**Tier 1（毎日チェック・8アカウント）:**
- https://x.com/claudeai
- https://x.com/ClaudeDevs
- https://x.com/AnthropicAI
- https://x.com/OpenAI
- https://x.com/ChatGPTapp
- https://x.com/GoogleDeepMind
- https://x.com/GeminiApp
- https://x.com/AIatMeta

**Tier 2（公式のみ・5アカウント）:**
- https://x.com/xai
- https://x.com/perplexity_ai
- https://x.com/runwayml
- https://x.com/midjourney
- https://x.com/suno_ai_

**Tier 3（話題時のみ・6アカウント）:**
- https://x.com/therundownai
- https://x.com/rowancheung
- https://x.com/MistralAI
- https://x.com/SakanaAILabs
- https://x.com/ELYZA_inc
- https://x.com/cyberagent_ai

**選定基準（引用RT対象）:**
1. 新機能・モデル発表（リリース系）
2. 重要アップデート（API・価格・仕様変更）
3. バズ度（いいね1000以上 or 引用が多い）
4. hyui が「文系・副業視点で語れるか」（語れないなら除外）

**本数上限なし（2026-04-23更新・ユーザー指示）**: 質フィルタ（上記1〜4）を満たす限り全件採用。実務上は公式アカウントの投稿頻度的に1日0〜5件に自然収束する。**4本ルールは日常ツイート枠のみ適用**。速報・引用RTは別枠で無制限。

**該当なしの日は引用RTゼロでOK**（無理やり作らない）。

**バズ度スキャンロジック（2026-04-23 D: 能動検出）:**

各Tierのバズ閾値:

| Tier | いいね閾値 | 必須チェック頻度 |
|---|---|---|
| Tier 1（公式8） | **500超** | 毎日 |
| Tier 2（公式5） | **1000超** | 曜日分散（月火水木金=月2〜3回） |
| Tier 3（ニュース・個人6） | **2000超** | 話題時のみ（週1〜2回） |

Chrome MCP で各タイムラインの上位ツイートを `javascript_tool` で評価:

```javascript
// 各アカウントのページで以下を実行してツイート・いいね数を取得
const tweets = [...document.querySelectorAll('article[data-testid="tweet"]')]
  .slice(0, 10)
  .map(a => {
    const text = a.innerText;
    const likesMatch = text.match(/(\d+(?:,\d+)*|\d+(?:\.\d+)?[Kk万])\s*$/m);
    return { text, rawLikes: likesMatch?.[1] };
  });
```

取得したツイートをバズ度（いいね数）でソート → 閾値超えを引用RT候補として優先度付け。

**曜日別のTier 2/3 スキャン割り当て:**

| 曜日 | スキャン対象 |
|---|---|
| 月 | Tier 1 + Tier 2（xai, perplexity）|
| 火 | Tier 1 + Tier 2（runway, midjourney）|
| 水 | Tier 1 + Tier 2（suno）+ Tier 3（therundownai）|
| 木 | Tier 1 + Tier 3（rowancheung, MistralAI）|
| 金 | Tier 1 + Tier 3（SakanaAILabs, ELYZA）|
| 土 | Tier 1 + Tier 3（cyberagent_ai）|
| 日 | Tier 1 のみ（軽量運用）|

これにより19アカウント全部を毎日スキャンする重負荷を回避しつつ、週全体でカバー。

**引用RTコメントの書き方（3点セット必須）:**

`context/x-influencer-research.md` の「引用RT時のコメント文体サンプル（10パターン）」を参照。基本テンプレ:

```
[1行目: 速報感 or 驚き・チャエン風]
  例: 「【速報】Claude Designが公開された」
      「これ本当に異次元なんだよな、、、」
      「こういうの出るたびに思うんだけど、」

[2行目: 個人視点・文系大学生の実体験]
  例: 「文系の自分でも3時間→15分になった」
      「副業で使ってみたら…」
      「エンジニアじゃない自分でもできた」

[3行目: 副業への応用・CTA]
  例: 「副業してる人は絶対使った方がいい」
      「同じ状況の人に届いてほしい」
      「詳細は後で note にまとめる」
```

10パターンの具体例は `context/x-influencer-research.md` の該当セクションから必ず1つ型を選んで宣言してから書くこと。

### Phase 2.5: note/Brain 告知判断（pending_cta スキャン）

`x/pending_cta/` をスキャンして、**翌日の夜前半20:00枠を告知に差し替えるか** 判定する。

#### スキャン対象

`x/pending_cta/*.json`（`done/` 配下は除外）

各 JSON ファイルは `note-run` / `brain-run` が保存した告知候補メタ情報。

#### 告知する条件（すべて満たす）

1. ✅ JSON の `target_fit` が `high` または `medium`
2. ✅ `created_at` から **7日以内**（鮮度切れ除外）
3. ✅ 同じ `source` の告知が過去7日に `x/published/` に存在しない（重複防止）
4. ✅ JSON から記事タイトル・核心が抽出可能（破損ファイルは除外）

#### 告知しない条件（いずれか該当）

- ❌ `target_fit: "low"`（エンジニア寄り・ターゲット乖離）
- ❌ 公開から 7日以上経過
- ❌ 過去7日に同じ記事を告知済み
- ❌ JSON が破損・必須フィールド欠損

→ 告知しない判定のファイルは `x/pending_cta/done/` に `reason` メタ付きで移動:
```
x/pending_cta/done/note_20260423_xxx.json.skipped_{reason}
```

理由タグ: `target_fit_low` / `stale_over_7days` / `duplicate` / `broken`

#### 優先順位（複数候補がある場合）

1. **brain 告知 > note 告知**（売上直結を優先）
2. **`suggested_priority: high` > `normal`**
3. **新しい created_at が優先**

**最大1件まで採用。** 余ったものは翌日以降に繰越（`pending_cta/` に残す）。

#### 採用後の処理

Phase 3 で夜前半20:00枠を告知に差し替える。採用された JSON は Phase 6（Typefully送信）成功時に `x/pending_cta/done/` に移動。

#### 告知文の生成ルール

採用された JSON の `atomic_ideas` から **最もXで伸びそうな1〜2個** を選び、以下のフォーマットで告知ツイート本文を生成:

```
[フック1行: 数字 or 状況変化]
[自分の視点・体験（1〜2行）]
[読むべき人 or 何が分かるか（1行）]

※ URL はリプライに置く（本文には入れない）
※ note/brain のサムネを画像添付（JSON の image_path から）
```

**6時間後のセルフ引用RT文も同時生成**（別角度のコメント・`x-strategy.md` 既存ルール準拠）。
告知本体の投稿予定時刻 + 6時間後の時刻で Typefully に予約（深夜23:00超なら翌朝07:00に調整）。

### Phase 2.7: 自分のバズ検知→宣伝リプ生成（2026-04-23追加）

Typefully API から自分の過去7日のツイートアナリティクスを取得し、**バズったツイートへの宣伝リプ** を自動生成する。

#### バズ判定基準（フォロワー数適応型）

hyui のフォロワー成長に応じて閾値を動的に変更。`context/x-performance.md` のフォロワー数を読み取って以下から選ぶ:

| フォロワー段階 | いいね | インプ | リポスト |
|---|---|---|---|
| **1〜100人（現在）** | 5以上 | 500以上 | 1以上 |
| 100〜500人 | 20以上 | 2,000以上 | 5以上 |
| 500〜2,000人 | 50以上 | 5,000以上 | 10以上 |
| 2,000人以上 | 100以上 | 10,000以上 | 10以上 |

絶対値ではなく**相対値**（自分の平均の3〜5倍超）で判定する手もあるが、シンプルさ優先で上記固定テーブルを採用。フォロワー数が次の段階に到達したらSKILL.md の判定関数を書き換える。

`scripts/typefully.mjs` の `detectBuzz()` ヘルパーを呼ぶ:

```javascript
import { detectBuzz } from './scripts/typefully.mjs';

const buzzed = await detectBuzz({
  days: 7,
  likesThreshold: 100,
  impressionsThreshold: 10000,
});
// → [{tweet_id, tweet_url, text, likes, retweets, impressions, published_at}, ...]
```

#### 宣伝リプ文の生成ルール

バズったツイートの内容を読み取り、**関連する note/brain 記事への自然な誘導リプ** を生成:

```
[バズツイートの話題に沿った軽い一言]

[関連する note/brain 記事の一言紹介]

{note または brain の URL（リプではURL本文埋めOK・バズ投稿のリプはアルゴリズムに影響しにくい）}
```

文体ルール（`x-strategy.md` の「バズったときの宣伝リプライ」準拠）:

- 「実はこれに関連した記事まとめてます」「詳しく書いたやつがあって」
- 「ぜひ〜」「参考にしてください」は使わない
- **宣伝感を出さない**（本人が紹介してる感）
- **URL はこのリプ本文に直接貼ってOK**（通常ツイートとは違う）

#### 重複防止

- 同じバズツイートに2回宣伝リプを作らない
- `x/scheduled/` 過去7日のログを参照して `source_tweet_id` の重複をチェック
- 既に宣伝済みのバズは再検出してもスキップ

#### Typefully 予約投稿（reply_to_url 指定）

`createDraft()` の `replyToUrl` オプションを使う:

```javascript
await createDraft({
  posts: [{ text: promo_reply_body }],
  publishAt: '2026-04-24T10:00:00+09:00',
  replyToUrl: buzz.tweet_url,
  draftTitle: `バズ宣伝リプ ${buzz.tweet_id}`,
});
```

Typefully が `platforms.x.settings.reply_to_url` で指定ツイートへのリプとして予約。

#### 投稿タイミング

- **朝 10:00 枠**（バズ発見翌日の朝）に予約
- 日常4本と被らない時間帯を選ぶ（08:00と12:30の間）
- 複数バズがある場合は時間を分散（10:00 / 11:00 / 14:00 / 16:00）

#### ゼロ件の日

バズなしの日は Phase 2.7 の出力ゼロ。無理やり宣伝しない。

### Phase 3: 日常4本生成（+ 告知枠・スレッド枠の優先順位）

#### 夜前半20:00枠の決定ロジック（優先順位）

| 優先度 | 条件 | 枠の中身 |
|---|---|---|
| 🥇 1 | Phase 2.5 で採用された告知候補がある | **note/brain 告知ツイート** |
| 🥈 2 | 曜日が **水曜** or **日曜** | **スレッド投稿**（5〜7本連投） |
| 🥉 3 | それ以外 | **通常の「副業の裏側」単発ツイート** |

告知が最優先。告知枠が使われた日は、スレッドは翌週の水/日に繰越。

#### スレッド枠の内容（水・日）

| 曜日 | スレッド主題 | 本数 |
|---|---|---|
| 水 | **ノウハウスレッド**（副業で実際やった○○、5ステップ など）| 5〜7本 |
| 日 | **今週の振り返りスレッド**（学び・失敗談・数字報告）| 4〜6本 |

スレッドの書き方:
- 1本目: フック（数字・Before/After・問題提起）
- 中盤: 1ツイート1アイデア（箇条書き禁止、文章で）
- 最終: まとめ + note 誘導（ある場合）or フォロー訴求
- 各ツイートは120〜260字で、長さを揃える
- スレッドは Typefully に `posts` 配列で一括送信（自動でリプライ繋ぎ）

#### 引用RTのスレッド化判定（2026-04-23追加・実データ準拠）

Phase 2 で引用RT候補が選定されたとき、**スレッド化するか単発で出すか** を以下基準で判定:

**単発で出す（主流・91%のケース）:**
- Claude/AI新機能の速報（軽〜中程度のアップデート）
- 感想・コメント系の引用
- 問いかけ系

→ 1ツイート130〜160字で「【速報】+ 内容要約 + 箇条書き3項 + 副業影響1行 + 詳細↓」で完結。セルフリプに公式URLを置く。

**スレッド化する（重大ニュース時のみ・claudecode_lab方式）:**
- 価格改定・使用条件変更など**影響範囲の大きいニュース**
- hyui が「使ってみた」実況系として3〜5本で展開したいもの
- 新機能の詳細解説が必要なもの

→ 3本構成:
1. 1本目: 【悲報】or【朗報】ブラケット + 要約 + 箇条書き3項 + 「続報はリプ↓」
2. 2本目: 詳細説明 + 副業への具体影響 + 手順 or 背景
3. 3本目: 「詳細はnote↓」 + URL（セルフリプ）

**判断フロー（自動）:**
1. 引用元のバズ度（いいね1000超 or 引用100超）→ スレッド候補
2. 価格・料金・プラン変更ワード検出 → スレッド確定
3. 「使ってみた」実況ネタ → スレッド候補
4. それ以外 → 単発



**時間帯別テンプレ（固定）:**

| 枠 | 時間 | テーマ | フック型候補 |
|---|---|---|---|
| 朝 | 08:00 | 作業Before/After | 数字型・Before/After型 |
| 昼 | 12:30 | AIニュース所感 | 驚き発見型・逆張り型 |
| 夜前半 | 20:00 | 副業の裏側 | 実況型・問題提起型 |
| 夜後半 | 22:00 | 問いかけ・共感 | 問いかけ型・希少性型 |

**曜日別特化:**

| 曜日 | 朝 | 昼 | 夜前半 | 夜後半 |
|---|---|---|---|---|
| 月 | 今週計画宣言 | AIニュース所感 | 先週の副業振り返り | 問いかけ |
| 火 | 通常Before/After | 通常 | 通常 | 通常 |
| 水 | 通常 | 通常 | **数字報告（収益・時短）** | 通常 |
| 木 | 通常 | 通常 | 通常 | 通常 |
| 金 | 通常 | 通常 | **今週使ってよかったツール** | 通常 |
| 土 | 軽め（作業しない日は実況） | 通常 | 通常 | 通常 |
| 日 | 通常 | 通常 | **今週の学び振り返り** | 問いかけ |

**ネタソース（優先順）:**

1. `today/` の最新記事（あればBefore/Afterや失敗談を抜き出し）
2. `x/published/` の過去7日ログ（同じネタ連投を避ける重複チェック）
3. `note/published/` の過去記事（実績引用OK）
4. `context/x-performance.md` の成功パターン
5. ユーザーから1行メモ（引数で渡せる: `/x-run daily-auto "今日は/loopでブログ1本書いた"`）

**文体ルール（絶対）:**

- 一人称「自分」統一
- **「文系の自分でもできた」**を各日1〜2本に自然挿入（毎ツイート同位置NG。散発的に）
- 断定語尾は「できる」じゃなくて「できた」（実体験フレーム）
- ハッシュタグ原則なし（月1〜2本の固定ポストのみ `#Claude` `#AI副業`）
- 280字以内（改行込み）
- フック1行目は `context/x-hook-formulas.md` の10型から選択・宣言必須
- **書き出しは `context/voice-samples.md` の書き出し5型（A〜E）から散らす。4本同じ型禁止**
- **締めは「また書く」NG。** `writing-rules.md` の「X 締めパターン推奨」5種（体言止め・数字・誘導矢印・感情余韻・読点切れ）から選ぶ
- **問いかけは「〜派？」NG。** `voice-samples.md` の問いかけ代替4型（自分立場先出し・普遍化・一文テーゼ・内心代弁）から選ぶ
- NGフレーズ全件照合（`voice-samples.md` + `writing-rules.md` + `x-anti-ai-patterns.md` の Step 3 新NG）

**目標文字数（@claudecode_lab 46本実測準拠・2026-04-23）:**

| 枠 | 目標文字数 | 理由 |
|---|---|---|
| 朝 Before/After | **145〜175字** | 数字+箇条書き2〜3項で情報密度UP |
| 昼 AIニュース所感 | **130〜160字** | ブラケット+背景情報+副業への影響 |
| 夜前半 副業の裏側 | **140〜175字** | 実績数字+Before/After+感情締め |
| 夜後半 問いかけ | **120〜150字** | テーゼ型（問いより断言） |

**100字未満は原則NG**（情報密度不足で薄くなる）。**180字超も避ける**（@claudecode_lab 最長180字台）。

**箇条書きルール（濃度確保の必須手段）:**

| 使う場面 | 記号 | 個数 |
|---|---|---|
| 機能リスト（速報） | 「•」または「・」 | 3〜5項目 |
| 手順（ノウハウ） | 「①②③」または「1. 2. 3.」 | 3〜5ステップ |
| 比較（Before/After） | 「→」矢印 | 2〜3行 |
| 要約（速報後半） | 「-」ハイフン | 2〜4項目 |

**絵文字ブラケット採用基準:**

| ブラケット | 使う場面 |
|---|---|
| 【速報】 | AI系ニュースを最速で伝える |
| 【朗報】 | 副業に使えるポジティブなニュース |
| 【悲報】 | 注意すべきネガティブな変化 |
| 【注意】 | セキュリティ・リスク情報 |
| 【実績報告】 | 月次の収益・成果報告 |
| 【実録】 | 作業実況・体験談 |

hyui は絵文字なしの **claudecode_lab方式**（【速報】）をベース。チャエンの【⚡️速報】等の絵文字付きは使わない。

**URL配置ルール（絶対）:**

| 状況 | 配置場所 | 本文末尾の書き方 |
|---|---|---|
| note告知 | **リプ** | 「記事書いた↓」or「詳細はnote↓」 |
| 速報ソース | **リプ** | 「詳細↓」or「詳細はリプに」or「元論文はこちら↓」 |
| 引用RT | 不要 | 元ツイートに含まれる |
| Brain告知 | **リプ** | 「販売開始↓」or「事例👇」 |
| 参考記事 | **リプ** | 「参考はこちら↓」 |

**外部URLを本文に入れない**（赤髪SNS研究所調査でリーチ30〜50%低下が実証）。必ずセルフリプに分離。

**クリック誘導語句リスト（実データ採用版）:**

本文末尾に必ず配置。以下から選択:

- 「詳細↓」（速報・解説の末尾・汎用）
- 「詳細はnote↓」（note記事誘導）
- 「詳細はこちら：」（スレッド継続リプ用）
- 「スレッドで解説👇」（重要ニュースの続き展開）
- 「事例👇」（具体例・記事誘導）
- 「元論文はこちら↓」（一次ソース提示）
- 「便利です↓」（使ってみた感想の後）
- 「続報はリプ↓」（スレッド1本目末尾）
- 「以下続く」（スレッド明示）
- 「👇🧵」（すぐる方式・スレッド絵文字）

**同一リズム禁止ルール（重要）:**

日常4本が全部「事実→気づき→結び」の同じリズムになるとAI生成感MAX。4本のリズム型を明確に散らす:

| 枠 | 推奨リズム型 |
|---|---|
| 朝 Before/After | **型A: 体言止めテーゼ** or **型D: 数字先行ファクト** |
| 昼 AIニュース所感 | **型C: 速報ブラケット** or **型B: 感嘆スタート** |
| 夜前半 副業の裏側 | **型E: 中途半端スタート（会話感）** or **型A: 体言止め実況** |
| 夜後半 問いかけ | **型X1-X4: 問いかけ代替** のいずれか（直接質問NG） |

4本生成後、「書き出し型が3種類以上に散っているか」を必ず自己チェック。

### Phase 4: 画像戦略（ブランドロゴ自動添付）

画像は `x/images/` 配下から選択。Typefully の `uploadMedia()` でアップロード後に `media_ids` に渡す。

#### 4-1. ブランドロゴマップ（昼のAIニュース所感で使用）

話題キーワードから自動選択する:

| 話題キーワード | 使用ロゴ | 対応アカウント |
|---|---|---|
| Claude Opus/Sonnet/Haiku、Claude App、モデル発表 | `claude.png` | @claudeai |
| Claude Code、Agent Skills、`/powerup`、CLI、SDK、API | `claude_code.png` | @ClaudeDevs |
| Anthropic（企業・研究・法務・採用） | `anthropic.png` | @AnthropicAI |
| OpenAI（企業） | `openai.webp` | @OpenAI |
| ChatGPT（アプリ） | `chatgpt.png` | @ChatGPTapp |
| Google DeepMind（研究） | `google_deepmind.png` | @GoogleDeepMind |
| Gemini（アプリ・モデル） | `gemini.png` | @GeminiApp |
| Meta AI / Llama | `meta_ai.jpg` | @AIatMeta |
| xAI / Grok | `xai.png` | @xai |
| Perplexity | `perplexity.png` | @perplexity_ai |
| Runway / 動画生成 | `runway.png` | @runwayml |
| Midjourney / 画像生成 | `midjourney.jpg` | @midjourney |
| Suno / 音楽生成 | `suno.webp` | @suno_ai_ |
| 上記以外・複合トピック | **画像なし** | - |

**選択ロジック:**
1. ツイート本文と引用RT対象から主要な話題を判定
2. 優先順位: Claude Code > Claude > Anthropic > 他社公式
3. 複数ブランドが関係する場合は最も主役のもの1つのみ選択（複数ロゴの合成はしない）

#### 4-2. 時間帯別 画像ソース

| 枠 | 画像ソース | フォールバック |
|---|---|---|
| **朝 08:00 / Before/After** | `x/images/YYYYMMDD_am.png`（ユーザーが前夜に配置）| なければ画像なし |
| **昼 12:30 / AIニュース所感** | **4-1 のブランドロゴマップで自動選択** | 判定不能なら画像なし |
| **夜前半 20:00 / 副業の裏側** | `x/images/YYYYMMDD_pm.png`（ユーザー任意）| なければ画像なし |
| **夜後半 22:00 / 問いかけ** | 画像なし | - |
| **引用RT** | 画像なし（引用カードで代用） | - |

#### 4-3. 画像アップロードのコード例

```javascript
import { uploadMedia, createDraft } from './scripts/typefully.mjs';

// ロゴ画像をアップロード
const mediaId = await uploadMedia('./x/images/claude.png');

// 画像付きドラフト作成
await createDraft({
  posts: [{ text: '...', media_ids: [mediaId] }],
  publishAt: '2026-04-24T12:30:00+09:00',
});
```

#### 4-4. 画像がないフォールバック動作

対応する画像ファイルが存在しない場合、**エラーにせず画像なしで送信**する。
ログ出力:
```
⚠️ 画像未検出: {slot} {expected_path} → 画像なしで送信
```

### Phase 5: ドラフト承認（ユーザー）

以下のフォーマットでチャットに全投稿を表示（夜前半枠は「通常 / 告知 / スレッド」で表示が変わる）:

**▼ 通常日（告知なし・平日）**

```
━━━━━━━━━━━━━━━━━━━━━━━━━
📅 明日（YYYY-MM-DD 水）の予約投稿プレビュー
━━━━━━━━━━━━━━━━━━━━━━━━━

▼ 日常ツイート 4本

【朝 08:00】Before/After型
──────────
{本文}
──────────
画像: x/images/YYYYMMDD_am.png（配置済み）

【昼 12:30】驚き発見型
──────────
{本文}
──────────
画像: x/images/claude_code.png（話題: Claude Code新機能）

【夜前半 20:00】実況型
──────────
{本文}
──────────
画像: なし

【夜後半 22:00】問いかけ型
──────────
{本文}
──────────
画像: なし

▼ 引用RT {N}本（上限なし・質フィルタのみ）

【引用RT 1 / 予定 09:30】
引用元: @claudeai の https://x.com/claudeai/status/...
元ツイート要約: 「Claude Opus 4.7 リリース」
──────────
{コメント文}
──────────
画像: なし

▼ 宣伝リプ {M}本（Phase 2.7: 自分のバズ検知）

【宣伝リプ 1 / 予定 10:00】
返信先: https://x.com/moyuchi_cc/status/{tweet_id}
元ツイート: {バズッたツイートの要約} ❤️{likes} 🔁{retweets}
──────────
{宣伝リプ文（note/brain URL含む）}
──────────
reply_to_url: 指定済み（Typefullyが指定ツイートへのリプとして予約）

━━━━━━━━━━━━━━━━━━━━━━━━━
```

**▼ 告知日（note/brain 誘導）**

```
【夜前半 20:00】🔥 note告知（pending_cta から採用）
元記事: {記事タイトル}
URL: {note URL}
──────────
{告知本文}
──────────
画像: note サムネ ({image_path})

【セルフ引用RT 翌朝07:00】補足コメント
──────────
{6時間後の引用RT文}
──────────
画像: なし
```

**▼ スレッド日（水曜 or 日曜で告知なし）**

```
【夜前半 20:00】📚 スレッド投稿 {N}本（水曜ノウハウ）
主題: {テーマ}
──────────
1本目（フック）:
{本文}

2本目:
{本文}

...

N本目（まとめ + note誘導）:
{本文}
──────────
画像: 1本目のみ添付（あれば）
```

---

**ユーザーの返答パターン:**

```
この内容でTypefullyに予約投稿してOK？
 → "OK" or "送信して"         : そのまま送信
 → "修正: {番号} {指示}"       : 該当投稿を再生成
 → "{番号} やめて"             : 該当投稿を除外（他はそのまま送信）
 → "スレッド→単発に"           : 水/日のスレッドを単発ツイートに戻す
 → "告知やめて"                : pending_cta の採用取消・通常運用に戻す
 → "キャンセル"                 : 全件中止
```

この内容でTypefullyに予約投稿してOK？
 → "OK" or "送信して"  : そのまま送信
 → "修正: {番号} {指示}": 該当投稿を再生成
 → "キャンセル"         : 中止
```

ユーザーの返答に従う。**送信ボタンは明示承認があるまで押さない**（絶対厳守）。

### Phase 6: Typefully送信

**B案採用（即自動投稿モード）:**

- ドラフト作成時に `publish_at` に明日の時刻（ISO 8601）を指定
- Typefully キューに入った時点で自動投稿される
- 失敗時はエラーログを `x/logs/YYYYMMDD_error.log` に記録

`scripts/typefully.mjs` の `createDraft()` を呼ぶ:

```javascript
import { createDraft } from './scripts/typefully.mjs';

// 日常ツイート
await createDraft({
  posts: [{ text: '本文', media_ids: [] }],
  publishAt: '2026-04-24T08:00:00+09:00',
});

// 引用RT
await createDraft({
  posts: [{
    text: 'コメント本文',
    quote_post_url: 'https://x.com/claudeai/status/xxx',
  }],
  publishAt: '2026-04-24T09:30:00+09:00',
});
```

### Phase 7: 投稿履歴保存 + pending_cta クリーンアップ

#### 7-1. `x/scheduled/YYYYMMDD.json` に記録:

```json
{
  "date": "2026-04-24",
  "created_at": "2026-04-23T23:45:00+09:00",
  "posts": [
    {
      "type": "daily",
      "slot": "morning",
      "publish_at": "2026-04-24T08:00:00+09:00",
      "hook_type": "Before/After型",
      "text": "...",
      "media_ids": ["uuid"],
      "draft_id": "typefully_draft_id",
      "private_url": "..."
    },
    {
      "type": "cta_note",
      "slot": "night1",
      "source_cta": "x/pending_cta/done/note_20260423_xxx.json",
      "publish_at": "2026-04-24T20:00:00+09:00",
      "text": "...",
      "draft_id": "..."
    },
    {
      "type": "cta_self_quote",
      "slot": "next_morning",
      "publish_at": "2026-04-25T07:00:00+09:00",
      "text": "...",
      "draft_id": "..."
    },
    {
      "type": "thread",
      "slot": "night1",
      "theme": "水曜ノウハウ",
      "publish_at": "2026-04-24T20:00:00+09:00",
      "posts_count": 6,
      "draft_id": "..."
    },
    {
      "type": "quote_rt",
      "source_account": "claudeai",
      "source_url": "https://x.com/claudeai/status/...",
      "publish_at": "2026-04-24T09:30:00+09:00",
      "text": "...",
      "draft_id": "..."
    },
    {
      "type": "buzz_promo_reply",
      "source_tweet_id": "1234567890",
      "source_tweet_url": "https://x.com/moyuchi_cc/status/1234567890",
      "source_metrics": { "likes": 145, "retweets": 12, "impressions": 12800 },
      "reply_to_url": "https://x.com/moyuchi_cc/status/1234567890",
      "publish_at": "2026-04-24T10:00:00+09:00",
      "text": "...",
      "draft_id": "..."
    }
  ]
}
```

#### 7-2. pending_cta クリーンアップ（Phase 2.5 で採用したもの）

告知として使った `x/pending_cta/*.json` を `x/pending_cta/done/` に移動する:

```bash
mv x/pending_cta/note_20260423_xxx.json x/pending_cta/done/note_20260423_xxx.json.posted
```

ファイル名末尾に `.posted` を付けることで、後から「いつ告知済みになったか」を追跡できる。

**Typefully送信が失敗した場合は移動しない**（次回 `/x-run` で再度拾えるようにする）。

#### 7-3. Notion ステータス更新（告知した場合のみ）

告知した記事の Notion レコードを更新:
- note の場合: `Xステータス` → `投稿済み`
- brain の場合: `Brainステータス` → `告知済み`（Brain自体の投稿済みフラグとは別）

### Phase 8: 完了報告

チャット上:
```
✅ {N}件の予約投稿をTypefullyに送信しました

内訳:
- 日常4本（朝/昼/夜前半/夜後半）
- 引用RT {M}本

Typefullyで確認:
https://typefully.com/queue

次回 /x-run は明日の同じ時間に実行してください。
```

Discord通知（リードWebhook）:
```bash
printf '{"embeds":[{"title":"✅ X予約投稿完了","color":5763719,"fields":[{"name":"投稿日","value":"{明日の日付}","inline":true},{"name":"本数","value":"{N}件","inline":true},{"name":"内訳","value":"日常4本 + 引用RT {M}本","inline":false}],"footer":{"text":"hyui_cc"}}]}' \
  | curl -H "Content-Type: application/json" -X POST -d @- "{LEAD_WEBHOOK}"
```

---

## モード: queue（Typefullyキュー確認）

`scripts/typefully.mjs` の `getQueue()` を呼んで、現在予約中の投稿を時系列で表示。

---

## モード: dry-run（テスト）

Phase 1〜5 までは通常通り実行。Phase 6（Typefully送信）だけスキップ。生成内容の確認用。

---

## 品質ゲート（投稿前に必ずチェック）

### 文体チェック（全件必須）
- [ ] 1ツイート280字以内（改行込み）
- [ ] フック10型から1つ宣言している
- [ ] **`writing-rules.md` の禁止フレーズ60+個を全件照合** （「〜でしょう」「ぜひ」「非常に重要」「いかがでしたか」等）
- [ ] **X特有NGを全件除外**: 「また書く」「〜派？」「正直な感想として」「〜してみましょう」
- [ ] **「文系の自分的には」の機械的挟み込みなし**（属性開示は散発的・自然な場所のみ）
- [ ] AI感のある言い回しがない（`voice-samples.md` NGリスト照合）
- [ ] 「文系の自分でもできた」相当のフレーズが日4本中1〜2本に自然挿入されている
- [ ] 一人称は「自分」統一（「僕」「俺」NG）
- [ ] 断定語尾は「できた」（「できる」で締めない）
- [ ] ハッシュタグなし（or 固定ポスト日のみ最大2個）
- [ ] 「■」「【】」付き見出し箇条書きブロックを使っていない（AI感の主因 ※速報の【速報】は例外）

### リズム多様性チェック（AI感の最大防止）
- [ ] 日常4本の書き出しが5型（A〜E）のうち**3種類以上**に散っている
- [ ] 4本全部が「事実→気づき→結び」の同一構造になっていない
- [ ] 締めパターンが4本で異なる（体言止め / 数字 / 誘導矢印 / 感情余韻 / 読点切れ）
- [ ] 夜後半の問いかけが「〜派？」等の直接質問になっていない → `voice-samples.md` 問いかけ代替4型（X1〜X4）から選択している

### 濃度・構造チェック（2026-04-23追加・@claudecode_lab実測準拠）
- [ ] 各ツイートが**目標文字数レンジ内**（朝 145〜175字 / 昼 130〜160字 / 夜前半 140〜175字 / 夜後半 120〜150字）
- [ ] **100字未満のツイートがない**（情報密度不足）
- [ ] **180字超のツイートがない**（@claudecode_lab 最長 180字台）
- [ ] 箇条書きが少なくとも日常4本中2本に入っている（「•」「①②③」「→」「-」のいずれか）
- [ ] 各ツイート末尾に**クリック誘導語句**が配置されている（「詳細↓」「事例👇」「詳細はnote↓」等）※夜後半の問いかけ型は例外
- [ ] 絵文字ブラケット（【速報】【朗報】【実録】等）が **AI系ニュース・実績報告・実録ツイート** に適切に付けられている
- [ ] **外部URLが本文に埋め込まれていない**（必ずセルフリプへ分離）

### 重複チェック
- [ ] `x/published/` 過去7日と同じネタ・同じ切り口ではない
- [ ] 同じ引用元のツイートに2日連続で引用RTしていない

### リプ誘導チェック（スレッド時・詳細誘導時）
- [ ] スレッド1本目の末尾に「👇🧵」「スレッドで解説👇」「以下続く」等の誘導がある
- [ ] 画像詳細をリプに回す場合「詳細↓」「こちら👉」等の明示がある

### 技術チェック
- [ ] 引用RTの `quote_post_url` がURL形式（tweet ID ではない）
- [ ] `publish_at` が ISO 8601 の `+09:00` 形式で指定されている
- [ ] 280字内でフックが1行目にある
- [ ] 改行位置が自然（単語途中で切れていない）

### 自己照合プロトコル（Phase 5 承認前に必ず実行・6ステップに拡張）

生成した全ツイート本文を以下の手順で自己チェック:

1. **`x-anti-ai-patterns.md` Step 3 の新NGリスト** を1行ずつ文字列検索（「また書く」「派？」「正直な感想」等）→ ヒットしたら再生成
2. **書き出し5型の散らし** を4本を並べて確認 → 2種以下なら再生成
3. **締めパターンの多様性** を確認 → 同じ締めが3本以上なら再生成
4. **ペルソナ挿入位置** を確認 → 4本とも同じ位置に「文系の自分的には」が入ってたら再配置
5. **文字数レンジチェック**（2026-04-23追加）→ 目標レンジ外（100字未満 or 180字超）なら再生成
6. **クリック誘導語句チェック**（2026-04-23追加）→ 夜後半以外の3本に誘導語句がなければ追加 or 再生成

この6ステップをパスしてから Phase 5 に進む。

### 濃度向上の具体的な書き方（@claudecode_lab 46本実測ベース）

**薄い → 濃い 変換例:**

```
❌ 薄い（97字）:
朝起きて最初にやってるのが Claude Code のチェック。
寝てる間に走らせた下書きを見て、合ってるとこだけ残す。
文系大学生の副業、朝の10分で進捗が決まる感じになってきた。

✅ 濃い（155字・目標レンジ内）:
朝起きて最初にやってるのが Claude Code のチェック。
寝てる間に自動で走らせた作業の結果をまとめて見る。

・合ってる出力はそのまま納品フォルダへ
・微妙なとこは指示を書き直して再実行
・失敗はログだけ残して原因メモ

文系大学生の副業、朝の10分で1日の進捗7割が決まる感じになってきた。

詳細はnote↓
```

**濃度向上の3原則:**
1. **箇条書きで事実・手順を列挙** → 情報密度+50%
2. **具体数字を入れる**（「進捗が決まる」→「進捗7割が決まる」）
3. **クリック誘導で続きを予告**（単発でも「詳細↓」で記事誘導）

---

## 禁止事項（絶対厳守）

- **送信ボタンをユーザー承認なしに押さない**（Typefullyドラフト作成も「送信」扱い）
- **APIキーをチャットログに表示しない**（環境変数経由のみ）
- **既存のTypefullyキューを上書き・削除しない**（新規ドラフト作成のみ）
- **引用RTに日本語インフルエンサーを含めない**（今回の方針。将来変更可）
- **同じ引用元のツイートに2日連続で引用RTしない**（重複防止）

---

## トラブルシューティング

### エラー: `401 Unauthorized`
- APIキーが間違ってる、または v1 キー（v2 が必要）
- `.env` のキー再確認

### エラー: `404 social_set_id not found`
- `/x-run setup` で Social Set ID を取り直す

### エラー: `Media processing failed`
- Phase 4b で画像アップロード時に発生
- S3 PUT 時に Content-Type を設定していないか確認（設定すべきでない）

### Phase 2 で Chrome がログアウト状態
- ユーザーに claude-in-chrome で手動ログインを依頼
- 解決するまで引用RTはスキップ（日常4本だけ送信）

---

## 関連ファイル

- `scripts/typefully.mjs` — Typefully API ヘルパー（hyui 専用パイプライン用）
- `.claude/skills/typefully/` — **公式 Typefully Skill**（typefully/agent-skills 公式・汎用操作用）
- `context/typefully-api-research.md` — API v2 仕様詳細
- `context/x-influencer-research.md` — 引用RT対象アカウント詳細
- `context/x-content-depth-research.md` — @claudecode_lab 46本実測・濃度設計
- `context/x-anti-ai-patterns.md` — 競合200本分析・AI感根絶テンプレ10パターン
- `context/x-profile.md` — hyui ブランド設計
- `context/x-strategy.md` — ツイートタイプ・アルゴリズム戦略
- `context/x-hook-formulas.md` — フック10型
- `context/voice-samples.md` — 文体・NGフレーズ
- `context/x-performance.md` — 過去実績

### 公式 Typefully Skill と hyui カスタムの役割分担

| 用途 | 使うもの |
|---|---|
| **自動化パイプライン（daily-auto・pending_cta連携・Phase 2.7バズ宣伝）** | `scripts/typefully.mjs`（hyui カスタム） |
| **アドホック操作**（「今このツイート即投稿して」的な単発） | `.claude/skills/typefully/`（公式） |
| **hyui 固有ルール適用**（4本構成・書き出し5型・文字数目標） | x-run スキル（hyui カスタム） |

**初回セットアップ（ユーザー作業・1回だけ）:**

公式 Typefully スキルを使うには API キーの設定が必要。hyui の `.env` とは別に、グローバル設定ファイル `~/.config/typefully/config.json` に登録:

```bash
cd D:/Claude/bussines/projects/content-pipeline
node .claude/skills/typefully/scripts/typefully.js setup
```

→ インタラクティブプロンプトで API キーを貼り付け → `~/.config/typefully/config.json` が自動作成される。これで公式スキルが使えるようになる。

既存の hyui パイプライン（`scripts/typefully.mjs`）は `.env` の `TYPEFULLY_API_KEY` をそのまま読むので、**公式スキルの setup をしなくても動く**。setup は「将来的にアドホック操作したい時」用。
