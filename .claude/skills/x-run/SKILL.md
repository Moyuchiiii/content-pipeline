---
name: x-run
description: hyui_cc の X / Threads 投稿を Typefully 経由で自動予約する毎日実行スキル。引用RTと日常1〜4本を生成→承認→X+Threadsクロスポスト予約まで全自動。
allowed-tools: Bash, Write, Read, Edit, Glob, Grep, WebFetch, WebSearch, mcp__notion__notion-search, mcp__notion__notion-fetch, mcp__notion__notion-update-page, mcp__claude-in-chrome__tabs_context_mcp, mcp__claude-in-chrome__tabs_create_mcp, mcp__claude-in-chrome__navigate, mcp__claude-in-chrome__get_page_text, mcp__claude-in-chrome__read_page, mcp__claude-in-chrome__javascript_tool
---

# /x-run

hyui の X / Threads 投稿を Typefully 経由で毎日自動予約するパイプライン。

- **X**: @hyui_cc（アンダースコア1つ）
- **Threads**: @hyui__cc（アンダースコア2つ・Instagram と同期）

---

## コンセプト

- **毎日実行**: 1日1回 `/x-run` を叩くと、翌日分の投稿（日常 **1〜4本**・スキップ可 + 引用RT 0〜3本 + 告知差し替え + バズ宣伝リプ）をTypefullyに予約
- **マルチプラットフォーム（2026-04-27 追加）**: 同じ本文を X と Threads の両方に同時投稿（クロスポスト）。Typefully の Social Set #300622 に X+Threads 両方紐付け済み
- **人間らしさ優先**: hyui は個人アカウント（文系大学生）なので、メディア型の型強制はしない。日常ツイートはネタがない日はスキップしてOK（詳細 Phase 3 冒頭）
- **Typefully経由**: X純正予約は使わない。Typefully API v2 で schedule_at 指定
- **引用RTはAI全般公式アカウントのみ**: Claude / OpenAI / Google / Meta 等の公式（日本語インフルエンサーは対象外）
- **画像戦略は段階運用**: Phase 1は画像なしで送信、Phase 2から自動添付（後述）

### クロスポスト方針（X / Threads 振り分け）

| 投稿タイプ | X | Threads | 理由 |
|---|---|---|---|
| 日常ツイート 1〜4本 | ✅ | ✅ | 同本文をクロスポスト |
| note/Brain 告知 | ✅ | ✅ | 同本文・同画像をクロスポスト |
| スレッド連投（水/日） | ✅ | ✅ | Threads もスレッド対応 |
| 告知のセルフ引用RT | ✅ | ❌ | Threads 引用RT文化薄め・X 限定 |
| 引用RT（@claudeai 等） | ✅ | ❌ | quote_post_url は X 専用運用 |
| バズ宣伝リプ | ✅ | ❌ | reply_to_url は X 専用 |

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

### 🔴 最優先（2026-04-26 追加・「Brain初投稿」誤生成事故の再発防止）

- **`context/published-history.md`（必読・最優先）** — 直近30日の note / Brain / X 投稿履歴・主要主張・「初」「N本目」インデックス
  - 「Brain で初めての」「初投稿」「N本目」「初告知」など**数量・順序主張をする前に必ず照合**
  - 内心代弁テンプレ（X4型）で創作的バックストーリーを盛る場合も、ここの「数値・実績ストック」と矛盾しないか確認
  - 告知ツイート・ティーザー・宣伝リプ全てに適用
- **`context/persona-hyui.md`（必読・人格 Single Source of Truth・2026-04-27 追加）** — Hyui の経歴・思想・スタンス・公開済エピソードの集約ファイル
  - 「副業歴」「思想」「組織観」「キャリア観」「親世代観」「就活スタンス」「使ってる道具」を語るツイート前に**必ず照合**
  - 内心代弁・X4型バックストーリー創作時はこのファイルの「3. 思想・スタンス」「5. 公開済エピソード引き出し」と矛盾しないか必ず確認
  - 一人称「わたし」統一・口癖・NG領域もここに集約。voice-samples.md と同期
  - 矛盾検知時はこのファイル側を正とし、ツイート本文を書き換える
- **`context/archive/published-{先月YYYY-MM}.md`（必読）** — 30日より前の過去主張・累計件数の参照

### 月初圧縮トリガー（x-run 起動時に自動実行）

毎月 1〜3 日の最初の `/x-run` 実行時:
1. `published-history.md` の最古エントリ日付が「先月以前」かチェック
2. 該当する場合: 先月分を抽出して `context/archive/published-{先月YYYY-MM}.md` に Append（既存があれば追記、なければ新規作成）
3. `published-history.md` から先月以前のエントリを削除（「初系主張インデックス」と「数値・実績ストック」セクションは永続保持・削除しない）
4. 完了したら `「✅ {先月} 分を archive に圧縮しました（N件移動）」` と通知

### 標準コンテキスト

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
- `context/source-strategy.md` — ネタ帳 DB 構造・source-run との連携ルール（あれば参照）
- `today/` の最新記事（あれば実録ネタとして参照）
- `x/published/` 過去7日分（重複ネタ防止）

### Phase 2: Xネタ帳から引用RT候補取得（旧公式アカウント監視を source-run に移管・2026-04-24 改訂）

公式アカウント監視は `/source-run` に統合済み。x-run はXネタ帳から「引用RT候補」を読み込む。

#### Step 1: Xネタ帳の「未使用 + 引用RT候補」レコード取得

`mcp__notion__notion-fetch` で `collection://6af7d0ce-64a0-4347-a5e3-325d27b440b8` を参照:
- ステータス=`未使用`
- ネタタイプ=`引用RT候補`
- 発見日が直近 24 時間以内（鮮度フィルタ）

該当レコードから以下を抽出:
- ネタ名 / 元URL / 書きたいニュアンス / 優先度

#### Step 2: 候補ゼロ時のフォールバック

ネタ帳に該当レコード0件の場合:
1. 「⚠️ Xネタ帳に新鮮な引用RT候補なし。`/source-run x` を先に推奨」と通知
2. **緊急時のみ**、最低限の Tier 1 アカウント（@claudeai / @AnthropicAI のみ）を直接スキャン
3. それ以外は引用RT 0 件で続行

#### Step 3: 引用RT文の生成

取得した候補から、`context/x-influencer-research.md` の 10 パターンに従って引用RT本文を生成。書き方のルールは既存通り。

**引用RTコメントの書き方（3点セット必須）:**

`context/x-influencer-research.md` の「引用RT時のコメント文体サンプル（10パターン）」を参照。基本テンプレ:

```
[1行目: 速報感 or 驚き・チャエン風]
  例: 「【速報】Claude Designが公開された」
      「これ本当に異次元なんだよな、、、」
      「こういうの出るたびに思うんだけど、」

[2行目: 個人視点・文系大学生の実体験]
  例: 「文系のわたしでも3時間→15分になった」
      「副業で使ってみたら…」
      「エンジニアじゃないわたしでもできた」

[3行目: 副業への応用・CTA]
  例: 「副業してる人は絶対使った方がいい」
      「同じ状況の人に届いてほしい」
      「詳細は後で note にまとめる」
```

10パターンの具体例は `context/x-influencer-research.md` の該当セクションから必ず1つ型を選んで宣言してから書くこと。

**引用RT採用後の Notion 更新:** Xネタ帳から取得したネタを引用RT として採用した場合、Phase 7 投稿成功後にステータス=`採用済み`に更新（`mcp__notion__notion-update-page`）。

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

### Phase 3: 日常ツイート生成（1〜4本・気分次第でスキップ可・2026-04-24 緩和）

**基本姿勢**: ネタ・気分・告知の有無で 1〜4本を柔軟に生成。「4本生成しなきゃ」と強制しない。書ける枠だけ埋め、他はスキップ。複数本生成する時は下記の時間帯・雰囲気を**参考に**する（固定ではない）。

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



### 🌱 運用方針（2026-04-24 大改訂・人間らしさ優先）

**前提の切り替え**: hyui は個人アカウント（文系大学生・副業実録）。メディア型・CEO型（claudecode_lab / masahirochaen 等）を参考にしすぎると AI 臭が出る。以下の原則に従う:

1. **「書くべき時に書く」**: 毎日4本必須ではない。ネタがない日は**1〜2本でも、ゼロでも OK**。無理に枠を埋めない
2. **テンプレは「参考」であって「強制」ではない**: 以下のリズム型・フック型・文字数レンジは「迷ったら使う」程度の位置付け。型に当てはめるほど AI 臭が強くなる
3. **短文OK・長文OK**: 30字の一言感想（「これ普通にすごい」）から250字の体験談まで、自然な長さで書く
4. **箇条書き・ブラケット・クリック誘導は「たまに使う」調味料**: 毎ツイート使うと媒体化する。週の数本だけ
5. **「文系の自分」の機械挿入禁止**: 自然に出てこない時は入れない
6. **失敗談・愚痴・雑な感想を混ぜる**: 毎回「成功ストーリー」だと人間じゃない。「今日詰まった」「これ微妙だった」も OK

### 時間帯別の目安（厳守ではない）

| 枠 | 時間 | テーマの参考 | 備考 |
|---|---|---|---|
| 朝 | 08:00 | 作業実況 / 昨日の出来事 | スキップ可 |
| 昼 | 12:30 | AIニュース・速報所感 | 速報がない日はスキップ可 |
| 夜前半 | 20:00 | 副業の裏側 / 告知枠 | 告知がない日は感想・雑談でOK |
| 夜後半 | 22:00 | 1日の振り返り・ぽつり | 疲れてたら書かない |

**枠を埋めることが目的化しないこと**。1日に朝だけ1本・夜だけ1本でも自然。

### 曜日別の雰囲気（ゆるい推奨）

- **月**: 週の始まり感（今週やりたいこと・先週の振り返り）
- **水**: 中盤の数字報告が自然に入りやすい
- **金**: 週末前のテンション・1週間の学び
- **土日**: 作業してない日の雑談・生活感
- それ以外の日は**普通に書きたいこと書く**

曜日で特定トピック強制は廃止。

**ネタソース（優先順・2026-04-24 改訂）:**

1. **Xネタ帳（最優先）**: `mcp__notion__notion-fetch` で `collection://6af7d0ce-64a0-4347-a5e3-325d27b440b8` から「未使用」かつ「ネタタイプ=リアクション/フック案/Before/After/数字報告/日常/速報所感/問いかけ」のレコードを優先度順に取得。発案元=`ユーザー手動`を最優先
2. `today/` の最新記事（あればBefore/Afterや失敗談を抜き出し）
3. `x/published/` の過去7日ログ（同じネタ連投を避ける重複チェック）
4. `note/published/` の過去記事（実績引用OK）
5. `context/x-performance.md` の成功パターン
6. ユーザーから1行メモ（引数で渡せる: `/x-run daily-auto "今日は/loopでブログ1本書いた"`）

**Xネタ帳から採用したネタは、Phase 7 投稿成功後にステータス=`採用済み`に更新**（`mcp__notion__notion-update-page`）。

**文体ルール（必須項目・緩和版）:**

**【必須の最低限】:**
- 一人称「わたし」統一（ひらがな）（「僕」「俺」「自分」NG）
- 280字以内（改行込み・X の制約）
- AI定型フレーズ禁止: 「〜と言えるでしょう」「〜ではないでしょうか」「いかがでしたか」「〜してみましょう」等（`writing-rules.md` 参照）
- 「また書く」「〜派？」は NG（`x-anti-ai-patterns.md` の根拠あり）

**【参考・推奨レベル】:**（使うと効果あり。でも毎回強制ではない）
- ハッシュタグ原則なし（月1〜2本の固定ポストのみ `#Claude` `#AI副業`）
- フックは `context/x-hook-formulas.md` 10型を参考に（**宣言不要。自然に書けない時だけ参照**）
- 書き出しパターンは `context/voice-samples.md` の5型（A〜E）を参考に（**強制散らし不要。気分で書く**）
- 締めは「体言止め・数字・誘導矢印・感情余韻・読点切れ」など自然なもの（「また書く」NG）
- 問いかけは直接質問（「〜派？」）より、自分の見方を先に出す書き方が自然（必須ではない）
- 「文系の自分でもできた」などのペルソナ表現は**自然に出てきた時のみ**。機械的挿入はNG

**【文字数】:**
- 厳密レンジなし。30〜280字の間で**自然に書ける長さ**
- 短い感想「これすごい」「詰まった…」も OK
- 長めの体験談（200字超）も OK
- 情報量を増やしたい時の参考目安: 速報系 130〜160字・体験談 140〜180字

**【箇条書きの使いどころ】:**（毎回使う必要なし・使いすぎると媒体っぽくなる）

| 使う場面 | 記号 | 個数 |
|---|---|---|
| 機能リスト（速報・ノウハウ） | 「•」または「・」 | 3〜5項目 |
| 手順（ノウハウ） | 「①②③」 | 3〜5ステップ |
| 比較（Before/After） | 「→」矢印 | 2〜3行 |

**使うのは週の数本だけ**。雑談・感想・愚痴・日常実況のツイートでは基本使わない。

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

**外部URLを本文に入れない**（赤髪SNS研究所等のSNS運用情報源で「外部リンクは本文に直書きするとリーチが下がる」と指摘されている。具体数字「30〜50%低下」の出典は2026-04-27時点で未確認のため留保表現。ロジック自体は2026年X アルゴリズム解説ページ akagami.blog で言及あり）。必ずセルフリプに分離。

**クリック誘導語句（使うのは告知・詳細誘導時のみ・毎回必須ではない）:**

以下は「リプにURLを置いて誘導する時」「note/Brain告知する時」に使う。日常の雑談・感想ツイートには**付けない**（付けると宣伝感が出る）。

- 「詳細↓」（速報ソース・解説リンクがある時）
- 「詳細はnote↓」（note記事誘導・告知時）
- 「スレッドで解説👇」（重要ニュースで続きがある時）
- 「事例👇」（具体例リンクへ）
- 「元論文はこちら↓」（一次ソース引用時）
- 「続報はリプ↓」（スレッド1本目末尾）
- 「👇🧵」（スレッド明示・たまに使う）

**使用頻度の目安**: 週4〜5本程度（告知がある日+ソースへの誘導がある日）。日常ツイートの8割は**誘導語句なしで終わる**のが自然。

**リズムの多様性（推奨・強制ではない）:**

複数本投稿する時、書き出しや締めが全部同じパターンだと単調になる。意識的に散らせるといいけど、**1本だけの日は気にしなくていい**。

散らす時の参考:
- 朝の作業実況: 体言止めテーゼ or 数字先行ファクト
- 昼のニュース所感: 感嘆スタート or 速報ブラケット or「〜だな」系
- 夜前半の副業裏側: 会話感スタート or 実況型
- 夜後半の振り返り: 問いかけ代替（断言テーゼ・普遍化・内心代弁）

生成後の自己チェックは「不自然なほど似てないか」程度で OK。機械的な型散らしは不要。

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
   X: @hyui_cc / Threads: @hyui__cc
━━━━━━━━━━━━━━━━━━━━━━━━━

▼ 日常ツイート 4本（→ X+Threads クロスポスト）

【朝 08:00】Before/After型
配信: ✅ X / ✅ Threads
──────────
{本文}
──────────
画像: x/images/YYYYMMDD_am.png（配置済み）

【昼 12:30】驚き発見型
配信: ✅ X / ✅ Threads
──────────
{本文}
──────────
画像: x/images/claude_code.png（話題: Claude Code新機能）

【夜前半 20:00】実況型
配信: ✅ X / ✅ Threads
──────────
{本文}
──────────
画像: なし

【夜後半 22:00】問いかけ型
配信: ✅ X / ✅ Threads
──────────
{本文}
──────────
画像: なし

▼ 引用RT {N}本（上限なし・質フィルタのみ・X 限定）

【引用RT 1 / 予定 09:30】
配信: ✅ X / ❌ Threads（引用RT は X 限定）
引用元: @claudeai の https://x.com/claudeai/status/...
元ツイート要約: 「Claude Opus 4.7 リリース」
──────────
{コメント文}
──────────
画像: なし

▼ 宣伝リプ {M}本（Phase 2.7: 自分のバズ検知・X 限定）

【宣伝リプ 1 / 予定 10:00】
配信: ✅ X / ❌ Threads（reply_to_url は X 専用）
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
配信: ✅ X / ✅ Threads（告知本体はクロスポスト）
元記事: {記事タイトル}
URL: {note URL}
──────────
{告知本文}
──────────
画像: note サムネ ({image_path})

【セルフ引用RT 翌朝07:00】補足コメント
配信: ✅ X / ❌ Threads（quote_post_url は X 限定）
──────────
{6時間後の引用RT文}
──────────
画像: なし
```

**▼ スレッド日（水曜 or 日曜で告知なし）**

```
【夜前半 20:00】📚 スレッド投稿 {N}本（水曜ノウハウ）
配信: ✅ X / ✅ Threads（スレッドもクロスポスト）
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

// 日常ツイート（X+Threads クロスポスト）
await createDraft({
  posts: [{ text: '本文', media_ids: [] }],
  publishAt: '2026-04-24T08:00:00+09:00',
  crossPostToThreads: true,  // ✅ Threads にも流す
});

// 告知ツイート（X+Threads クロスポスト・画像付き）
await createDraft({
  posts: [{ text: '告知本文', media_ids: [thumbnailId] }],
  publishAt: '2026-04-24T20:00:00+09:00',
  crossPostToThreads: true,  // ✅ note/Brain 告知も Threads クロスポスト
});

// スレッド連投（X+Threads クロスポスト）
await createDraft({
  posts: [
    { text: '1本目（フック）' },
    { text: '2本目' },
    { text: '3本目（まとめ）' },
  ],
  publishAt: '2026-04-24T20:00:00+09:00',
  crossPostToThreads: true,  // ✅ Threads もスレッド連投対応
});

// 引用RT（X 限定・Threads スキップ）
await createDraft({
  posts: [{
    text: 'コメント本文',
    quote_post_url: 'https://x.com/claudeai/status/xxx',
  }],
  publishAt: '2026-04-24T09:30:00+09:00',
  // crossPostToThreads は指定不要（quote_post_url 検出で自動 X 限定化）
});

// バズ宣伝リプ（X 限定・Threads スキップ）
await createDraft({
  posts: [{ text: '宣伝リプ本文' }],
  publishAt: '2026-04-24T10:00:00+09:00',
  replyToUrl: 'https://x.com/moyuchi_cc/status/xxx',
  // replyToUrl 検出で自動 X 限定化
});
```

**重要**: `crossPostToThreads: true` を指定しても、posts のいずれかが `quote_post_url` を持つ場合や `replyToUrl` が指定されている場合は、`createDraft` 側で自動的に Threads を無効化する。X 限定運用の取り違えを防ぐ安全装置。

### Phase 7: 投稿履歴保存 + pending_cta クリーンアップ

#### 7-1. `x/scheduled/YYYYMMDD.json` に記録:

各レコードの `cross_posted_to` フィールドで、どのプラットフォームへ流したかを残す。後追い分析と Notion 反映の元データになる。

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
      "cross_posted_to": ["x", "threads"],
      "draft_id": "typefully_draft_id",
      "private_url": "..."
    },
    {
      "type": "cta_note",
      "slot": "night1",
      "source_cta": "x/pending_cta/done/note_20260423_xxx.json",
      "publish_at": "2026-04-24T20:00:00+09:00",
      "text": "...",
      "cross_posted_to": ["x", "threads"],
      "draft_id": "..."
    },
    {
      "type": "cta_self_quote",
      "slot": "next_morning",
      "publish_at": "2026-04-25T07:00:00+09:00",
      "text": "...",
      "cross_posted_to": ["x"],
      "draft_id": "..."
    },
    {
      "type": "thread",
      "slot": "night1",
      "theme": "水曜ノウハウ",
      "publish_at": "2026-04-24T20:00:00+09:00",
      "posts_count": 6,
      "cross_posted_to": ["x", "threads"],
      "draft_id": "..."
    },
    {
      "type": "quote_rt",
      "source_account": "claudeai",
      "source_url": "https://x.com/claudeai/status/...",
      "publish_at": "2026-04-24T09:30:00+09:00",
      "text": "...",
      "cross_posted_to": ["x"],
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
      "cross_posted_to": ["x"],
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
   X: @hyui_cc / Threads: @hyui__cc

内訳:
- 日常 {D}本（朝/昼/夜前半/夜後半）→ X+Threads
- 告知 {C}本 → X+Threads
- スレッド {T}本 → X+Threads
- 引用RT {Q}本 → X 限定
- バズ宣伝リプ {B}本 → X 限定

Typefullyで確認:
https://typefully.com/queue

次回 /x-run は明日の同じ時間に実行してください。
```

Discord通知（リードWebhook）:
```bash
printf '{"embeds":[{"title":"✅ X+Threads 予約投稿完了","color":5763719,"fields":[{"name":"投稿日","value":"{明日の日付}","inline":true},{"name":"本数","value":"{N}件","inline":true},{"name":"内訳","value":"日常{D}/告知{C}/スレッド{T} → X+Threads クロスポスト\\n引用RT{Q}/バズ宣伝リプ{B} → X 限定","inline":false}],"footer":{"text":"hyui (X: @hyui_cc / Threads: @hyui__cc)"}}]}' \
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
- [ ] 一人称は「わたし」統一（ひらがな）（「僕」「俺」「自分」NG）
- [ ] 断定語尾は「できた」（「できる」で締めない）
- [ ] ハッシュタグなし（or 固定ポスト日のみ最大2個）
- [ ] 「■」「【】」付き見出し箇条書きブロックを使っていない（AI感の主因 ※速報の【速報】は例外）

### リズム多様性チェック（AI感の最大防止）
- [ ] 日常4本の書き出しが5型（A〜E）のうち**3種類以上**に散っている
- [ ] 4本全部が「事実→気づき→結び」の同一構造になっていない
- [ ] 締めパターンが4本で異なる（体言止め / 数字 / 誘導矢印 / 感情余韻 / 読点切れ）
- [ ] 夜後半の問いかけが「〜派？」等の直接質問になっていない → `voice-samples.md` 問いかけ代替4型（X1〜X4）から選択している

### 構造チェック（2026-04-24 緩和版）
- [ ] 280字以内（X の制約・**必須**）
- [ ] **外部URLが本文に埋め込まれていない**（必ずセルフリプへ分離・**必須**）
- [ ] 告知ツイート（note/brain誘導）にはクリック誘導語句（「詳細はnote↓」等）が入っている
- [ ] 告知以外の日常・雑談ツイートにクリック誘導語句が**つきすぎていない**（全ツイートに付いていたら削る）
- [ ] 箇条書き・ブラケット【速報】が**毎ツイート使われていない**（1日の中で使うのは1〜2本まで）
- [ ] 文字数は自然。**目標レンジの強制チェック廃止**（30〜280字の間で書きたい長さで OK）

### 重複チェック
- [ ] `x/published/` 過去7日と同じネタ・同じ切り口ではない
- [ ] 同じ引用元のツイートに2日連続で引用RTしていない

### 🔴 「初」「N本目」系 事実主張チェック（2026-04-26 追加・必須）

> 2026-04-26 night1/night2 で「Brain で初めての商品を出す」というハルシネーションが混入した事故の再発防止。

- [ ] 全ツイート本文に対して以下の正規表現で grep:
  - `初めて` / `初の` / `初投稿` / `1本目` / `N本目` / `第\d+弾` / `最初の` / `初告知` / `デビュー`
- [ ] ヒットした場合、**`context/published-history.md` の「初系主張インデックス」**と照合
  - **Brain 関連**: Brain 1本目は `published-history.md` の Brain 投稿済みリストの 1 件目を確認
  - **note 関連**: 「メイン商品」「月14万」「失ったもの3つ」等の初告知日と一致するか確認
  - **X 関連**: 同じ初系発言を過去30日内にしていないか確認
- [ ] 矛盾があれば再生成。「2本目」「次の」「新しい」等の正確な表現に書き換える
- [ ] 内心代弁テンプレ（X4型）で創作的バックストーリーを盛る場合、`published-history.md` の「数値・実績ストック」と矛盾しないかも確認

### リプ誘導チェック（スレッド時・詳細誘導時）
- [ ] スレッド1本目の末尾に「👇🧵」「スレッドで解説👇」「以下続く」等の誘導がある
- [ ] 画像詳細をリプに回す場合「詳細↓」「こちら👉」等の明示がある

### 技術チェック
- [ ] 引用RTの `quote_post_url` がURL形式（tweet ID ではない）
- [ ] `publish_at` が ISO 8601 の `+09:00` 形式で指定されている
- [ ] 280字内でフックが1行目にある
- [ ] 改行位置が自然（単語途中で切れていない）

### クロスポスト整合性チェック（2026-04-27 追加・必須）
- [ ] 日常ツイート・告知本体・スレッド連投は `crossPostToThreads: true` を `createDraft` に渡している（X+Threads 両方に流れる）
- [ ] 引用RT（quote_post_url あり）は `crossPostToThreads` 指定なし（自動 X 限定化される）
- [ ] バズ宣伝リプ（replyToUrl あり）は `crossPostToThreads` 指定なし（自動 X 限定化される）
- [ ] 告知のセルフ引用RT（翌朝07:00）は X 限定運用（quote_post_url を持つため自動スキップ）
- [ ] `x/scheduled/YYYYMMDD.json` の各レコードに `cross_posted_to` 配列が含まれている（`["x"]` または `["x", "threads"]`）

### 自己照合プロトコル（Phase 5 承認前に実行・2026-04-24 緩和版）

生成した全ツイート本文を以下の手順でチェック:

1. **【必須】NGフレーズ検索**: `x-anti-ai-patterns.md` / `writing-rules.md` / `voice-samples.md` の NG リスト（「また書く」「派？」「正直な感想」「〜ではないでしょうか」「〜してみましょう」等）を1行ずつ文字列検索 → ヒットしたら再生成
2. **【必須】外部URL本文埋め込みチェック**: 本文にURLが直書きされていたら再配置（セルフリプへ）
3. **【推奨】全ツイートが似すぎていないか確認**: 書き出し・締めが全部同じ形、全部箇条書き、全部ブラケット付き 等の「見るからに量産された感」があれば**1〜2本だけ手を入れる**（完全に散らす必要なし）
4. **【推奨】「文系の自分」の機械挿入チェック**: 全てのツイートに「文系の自分」「大学生の自分」が入っていたら抜く（自然に1本だけ残す）
5. **【推奨】クリック誘導語句の使いすぎチェック**: 日常4本全部に「詳細↓」等が付いていたら2本以上剥がす（告知目的の1本だけに残す）

以下は**廃止**:
- ~~書き出し5型の強制散らし（2種以下で再生成）~~
- ~~締めパターンの多様性チェック（同じ締め3本以上で再生成）~~
- ~~文字数レンジチェック（100字未満・180字超で再生成）~~
- ~~全ツイートにクリック誘導語句必須~~

チェックパスしたら Phase 5（ユーザー承認）に進む。

### 情報量を足したい時の参考（2026-04-24 緩和版・「濃く」は必須ではない）

日常の雑談・感想・失敗談は**そのまま短く書けば OK**。「濃くする」操作は不要。

以下は「告知ツイート」「ノウハウ共有」「速報解説」など、情報量を意図的に増やしたい時だけ使うテクニック:

- 箇条書きで事実・手順を3〜5項列挙する
- 具体数字を入れる（「進捗が決まる」→「朝の10分で7割決まる」）
- リンクへの誘導を末尾に置く（「詳細はnote↓」）

**薄い vs 濃い（使い分け例）:**

```
🙆 薄くて OK（感想ツイート・65字）:
朝起きてすぐ Claude Code 開くの、もうルーティンになってる。
副業で寝てる間に作業進んでる感じが普通にすごい。

🙆 濃い方が向いてる（告知ツイート・155字）:
朝起きて最初にやってるのが Claude Code のチェック。
寝てる間に自動で走らせた作業の結果をまとめて見る。

・合ってる出力はそのまま納品フォルダへ
・微妙なとこは指示を書き直して再実行
・失敗はログだけ残して原因メモ

朝の10分で1日の進捗7割が決まる感じになってきた。
詳細はnote↓
```

**使い分けのコツ**: 感情・雑談・体験ひとこと系は薄くていい。ノウハウ・告知・情報提供系は厚みがあるといい。毎ツイート濃くすると媒体化するので避ける。

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
