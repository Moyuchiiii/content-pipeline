---
name: source-run
description: ネタ探し専任スキル。副業・Claude新機能・Brain市場・X公式アカウントを横断スキャンし、note/X/Brain それぞれのネタ帳に振り分け投入する。生成は各runに委譲。
user-invocable: true
allowed-tools: Bash, Write, Read, Edit, Glob, Grep, WebFetch, WebSearch, mcp__notion__notion-search, mcp__notion__notion-fetch, mcp__notion__notion-create-pages, mcp__notion__notion-update-page, mcp__claude-in-chrome__tabs_context_mcp, mcp__claude-in-chrome__tabs_create_mcp, mcp__claude-in-chrome__navigate, mcp__claude-in-chrome__get_page_text, mcp__claude-in-chrome__read_page, mcp__claude-in-chrome__javascript_tool
---

# /source-run

content-pipeline のネタ探し専任スキル。広域スキャン → プラットフォーム適合度判定 → 3 ネタ帳に振り分け投入。

各 run（note-run / x-run / brain-run）からスキャン機能を分離・統合した中央発掘エンジン。

---

## コンセプト

- **ネタ発掘専任**: 記事/ツイート生成は各 run に委譲。source-run は Notion ネタ帳に積むまで
- **1ネタ → 複数ネタ帳投入 OK**: Claude Design 速報 → noteネタ帳 + Xネタ帳両方に投入可（プラットフォーム適合度が複数 high の場合）
- **ユーザー手動起動**: 毎日強制ではない。気が向いた時に `/source-run` 実行
- **連続実行推奨**: 完了後に「続けて /note-run / /x-run / /brain-run どれ起動する？」と案内
- **重複防止**: 既存ネタ帳の `未使用` レコードと元URLマッチでスキップ
- **ユーザー手動投入の受け皿**: 「このリアクションしたい」「このネタで記事書きたい」を Claude Code に投げると Xネタ帳/noteネタ帳に直接追加

---

## 起動オプション

| 引数 | 処理 |
|---|---|
| （なし） | **全系統スキャン**（A/B/C/D 4 系統並行） |
| `note` | note向けスキャン（A 副業 + B Claude新機能）→ noteネタ帳投入 |
| `x` | X向けスキャン（B Claude新機能 + D 公式アカウント）→ Xネタ帳投入 |
| `brain` | Brain向けスキャン（C Brain市場 + 過去note資産）→ Brainネタ帳投入 |
| `dry-run` | 投入せず結果表示のみ（テスト用） |
| `add` | ユーザー手動投入モード（対話形式で1ネタ追加） |

---

## Phase 0: コンテキスト読み込み + 環境チェック

### Step 0-A: Chrome MCP ログイン状態の事前チェック（必須・2026-04-24 追加）

系統 D・E は Chrome MCP で X を直接スキャンするため、**ログイン状態を最初に確認する**:

1. `mcp__claude-in-chrome__tabs_context_mcp` で現在のタブ状況確認
2. `mcp__claude-in-chrome__navigate` で `https://x.com/home` を開く
3. `mcp__claude-in-chrome__javascript_tool` で以下実行:
   ```javascript
   const isLoggedIn = !document.querySelector('[data-testid="loginButton"]') 
                    && !!document.querySelector('[data-testid="primaryColumn"]');
   const username = document.querySelector('[data-testid="UserName"]')?.innerText || 'unknown';
   ({isLoggedIn, username})
   ```
4. `isLoggedIn === false` の場合:
   ```
   ❌ Chrome に X (Twitter) がログインされていません。
   先にブラウザでログインしてから /source-run を再実行してください。
   このまま続けると系統 D・E がスキップされ、Xネタ帳が空になります。
   
   続行しますか？ (y/N)
   ```
   ユーザーが N を選んだら処理中断。Y を選んだら系統 D・E をスキップして A/B/C のみ実行。

### Step 0-B: 必要ファイル読み込み

以下を必ず読む:

### 🔴 最優先で読むファイル（2026-04-26 追加・重複ネタ防止）

**0-B-Top. `context/published-history.md`（必読・最優先）**
- 直近30日の note / Brain / X 投稿履歴・主要主張・キーフレーズが全件入ってる
- ネタ帳に新規投入する前に**必ずここと照合**して、既存記事と完全に重複するネタを弾く
- タイトル類似性・キーフレーズ重複・「初」系主張の二重投入を防ぐ

**0-B-Top1.5. `context/persona-hyui.md`（必読・人格 Single Source of Truth・2026-04-27 追加）**
- Hyui の経歴・思想・スタンス・「7. 応援したい人 / 距離を取りたい人」が入ってる
- ネタ採否判定時にペルソナ適合度（NG領域・距離取る相手・未経験ジャンル等）を**必ず照合**
- 動画副業・物販・FX等の未経験ジャンルは「やってないからわからない」スタンスのため、リアクション系ネタ投入時に注意

**0-B-Top2. `context/archive/published-{先月YYYY-MM}.md`（必読）**
- 30日より前の過去ネタ重複チェック用

**戦略・ペルソナ:**
- `context/source-strategy.md` — スキャン戦略・スキャン対象・適合度判定基準
- `context/note-profile.md` — note ペルソナ・ターゲット
- `context/x-profile.md` — X ペルソナ・ターゲット
- `context/brain-profile.md` — Brain ペルソナ・ターゲット
- `context/note-strategy.md` — note 収益化戦略
- `context/x-strategy.md` — X 運用戦略
- `context/brain-strategy.md` — Brain 運用戦略

**過去実績（PDCA）:**
- `context/note-performance.md` — note PDCA データ
- `context/x-performance.md` — X PDCA データ・フォロワー段階

**重複防止用（Notion）:**
- noteネタ帳 (`collection://1a603b4f-d1e4-4ed7-8c75-c7c0a5b7e595`) の `未使用` 全件
- Xネタ帳 (`collection://6af7d0ce-64a0-4347-a5e3-325d27b440b8`) の `未使用` 全件
- Brainネタ帳 (`collection://1198a5a1-6955-41da-928b-ad79f07d2a1b`) の `未使用` 全件

各ネタ帳から `元URL` / `ソースURL` を抽出してキャッシュ。Phase 4 投入時の重複判定に使う。

---

## Phase 1: 広域スキャン（5 系統 全実行・絶対ルール）

### 🚨 絶対ルール（2026-04-24 改訂・厳守）

**5 系統（A / B / C / D / E）すべて + 各系統内の全サブ項目を完全実行する。**

#### サブ項目レベルでも完全実行が必須

- 系統 A: WebSearch **7 クエリ全部**
- 系統 B: WebSearch **6 本文クエリ + 1 補助クエリ 全部**
- 系統 C: WebFetch brain-market.com + WebSearch 4 補助クエリ **全部**
- 系統 D: **Tier 1 の 8 アカウント全部 + Tier 2 の 5 アカウント全部 + Tier 3 の 6 アカウント全部 = 計 19 アカウント全部**
- 系統 E: **E-1 の全 7 カテゴリのキーワード全部 + E-2 トレンドタブ取得**

#### 禁止事項

以下の判断・フレーズは**絶対禁止**:

- ❌「時間効率優先で主要対象に絞った」
- ❌「主要トピックはカバー済みなのでサブ項目スキップ」
- ❌「もう十分なネタが見つかった」
- ❌「曜日分散ロジックに従って今日はTier1のみ」
- ❌「対象を10アカウントに絞った」（19全部やる）
- ❌「キーワード4/7だけ実施」（7全部やる）

#### 状態は「✅完全実行 / ❌スキップ」の2択

- 「⚠️ 部分実施」「⚠️ 部分失敗」のラベル使用禁止
- サブ項目を 1 つでも省いたら、その系統は **❌スキップ扱い**
- Chrome MCP ログアウト等の物理的失敗のみ ❌ スキップ正当化可
- 「時間がかかるから」「同じ話題なので」等の判断によるスキップは禁止

#### 例外: `/source-run light` モードのみ簡略化可

引数 `light` を明示した場合のみ、曜日分散ロジック（旧バージョン）で軽量実行可:
- Tier 1 のみスキャン
- E-1 の上位3カテゴリのみ
- それ以外の引数なし実行は**フル実行必須**

### 系統別の進捗ログ義務化

各系統の開始時・終了時にターミナルに進捗を必ず出力:

```
━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 系統A 副業トレンド スキャン開始（WebSearch 7クエリ）
[クエリ実行中...]
✅ 系統A 完了 — ヒット: N件 / エラー: なし

🔍 系統B Claude/Anthropic新機能 スキャン開始（WebSearch 6クエリ）
...
```

→ Phase 5 の最終報告で **系統別の取得件数を必ず明示**（後述フォーマット参照）

---

### 系統 A: 副業・AI副業トレンド（note向け主軸・X向け副軸）

ツール: `WebSearch`

クエリ（旧 note-run スキャン B 由来）:
```
- AI 副業 稼ぎ方 OR 始め方 site:note.com OR site:x.com
- クラウドワークス AI OR Claude 案件 OR 受注
- AI副業 OR "AIで稼ぐ" 大学生 OR 初心者
- フリーランス AI 効率化 OR 自動化 OR 時短
- 非エンジニア AI 副業 OR 稼ぐ OR 案件
- ChatGPT OR Claude 初心者 副業 OR 稼ぎ方
- AI 在宅 副業 主婦 OR 学生 OR 会社員
```

収集:
- タイトル / URL / 発見日 / 1行要約 / 緊急度

### 系統 B: Claude/Anthropic 新機能（全プラットフォーム共通候補）

ツール: `WebSearch`

クエリ（旧 note-run スキャン A 由来）:
```
- "Claude Code" 新機能 OR アップデート OR update
- "Claude" 新機能 OR リリース OR アップデート
- "Anthropic" リリース OR 発表 OR announcement
- "Claude Dispatch" OR "Claude Cowork" OR "Claude Desktop"
- "Claude API" OR "Claude SDK" 変更 OR 新機能
- "Anthropic" blog OR engineering（公式ブログの更新確認）
```

補助クエリ:
- `"Claude" vs "ChatGPT" OR vs "Gemini"`（比較記事ネタ）

### 系統 C: Brain 市場ランキング（Brain向け主軸）

ツール: `WebFetch`

対象 URL:
- `https://brain-market.com/` — 新着・ランキング

補助検索（`WebSearch`）:
```
- Brain "Claude Code" site:brain-market.com
- Brain "AI副業" 人気 ranking
- Brain "クラウドワークス" 販売
- Brain "ChatGPT" "プロンプト集"
```

収集:
- 商品タイトル / 価格（¥）/ 推定販売数 / カテゴリ / URL

### 系統 D: X 公式アカウント監視（X向け引用RT候補）

ツール: `mcp__claude-in-chrome__*`

**Tier 1（毎日チェック・8 アカウント）:**
- https://x.com/claudeai
- https://x.com/ClaudeDevs
- https://x.com/AnthropicAI
- https://x.com/OpenAI
- https://x.com/ChatGPTapp
- https://x.com/GoogleDeepMind
- https://x.com/GeminiApp
- https://x.com/AIatMeta

**Tier 2（曜日分散・5 アカウント）:**
- https://x.com/xai
- https://x.com/perplexity_ai
- https://x.com/runwayml
- https://x.com/midjourney
- https://x.com/suno_ai_

**Tier 3（話題時のみ・6 アカウント）:**
- https://x.com/therundownai
- https://x.com/rowancheung
- https://x.com/MistralAI
- https://x.com/SakanaAILabs
- https://x.com/ELYZA_inc
- https://x.com/cyberagent_ai

各 Tier の バズ閾値（フォロワー段階・絶対値）:

| Tier | いいね閾値 |
|---|---|
| Tier 1（公式8） | 500 超 |
| Tier 2（公式5） | 1000 超 |
| Tier 3（ニュース・個人6） | 2000 超 |

**【2026-04-24 改訂】曜日分散ロジック撤廃**:

引数なし `/source-run` 実行時は **Tier 1 / 2 / 3 全 19 アカウント全部スキャン必須**。

軽量実行したい場合は `/source-run light` 引数を明示。曜日分散ロジックは light モードでのみ適用:

| 曜日 (light モードのみ) | スキャン対象 |
|---|---|
| 月 | Tier 1 + Tier 2（xai, perplexity）|
| 火 | Tier 1 + Tier 2（runway, midjourney）|
| 水 | Tier 1 + Tier 2（suno）+ Tier 3（therundownai）|
| 木 | Tier 1 + Tier 3（rowancheung, MistralAI）|
| 金 | Tier 1 + Tier 3（SakanaAILabs, ELYZA）|
| 土 | Tier 1 + Tier 3（cyberagent_ai）|
| 日 | Tier 1 のみ（軽量運用）|

JS でタイムライン取得（旧 x-run Phase 2 ロジック流用）:
```javascript
const tweets = [...document.querySelectorAll('article[data-testid="tweet"]')]
  .slice(0, 10)
  .map(a => {
    const text = a.innerText;
    const likesMatch = text.match(/(\d+(?:,\d+)*|\d+(?:\.\d+)?[Kk万])\s*$/m);
    return { text, rawLikes: likesMatch?.[1] };
  });
```

**Chrome MCP がログアウト状態なら系統 D はスキップ**して報告に明記。

### 系統 E: X 検索・トレンドスキャン（公式アカウント外も含む広域・2026-04-24 追加）

公式アカウント発信を待たず、メディア・個人・ニュース系から流れてくる**ホットなトピック**（例: GPT-5.5 リーク話題等）を拾う。系統 D だけだと公式が発表する前の盛り上がりや、第三者解説で広がる話題を取り逃す。

ツール: `mcp__claude-in-chrome__*`

#### E-1: キーワード横断検索（Live タブ・最新順）

各検索 URL を Chrome MCP で開き、直近 24 時間のバズツイートを抽出:

```
https://x.com/search?q={キーワード}&f=live&src=typed_query
```

**検索キーワード（毎回実行・横断）:**

| カテゴリ | キーワード |
|---|---|
| OpenAI 次世代モデル | `"GPT-5"` / `"GPT-5.5"` / `"GPT-6"` / `"OpenAI 新モデル"` |
| Claude 系 | `"Claude" 新機能` / `"Claude" リリース` / `"Claude Code"` 速報 |
| Anthropic 系 | `"Anthropic"` 発表 / `"Anthropic"` 新製品 |
| 競合大手 | `"Gemini" 新機能` / `"Grok" リリース` / `"Llama"` 新版 |
| メディア生成 | `"Sora"` / `"Veo"` / `"Nano Banana"` |
| AI エージェント | `"AIエージェント"` バズ / `"computer use"` |
| 副業文脈 | `"AI 副業"` 月10万 / `"Claude 副業"` 案件 |

**JS でタイムライン取得（系統 D と同じロジック・Live タブ用）:**

```javascript
const tweets = [...document.querySelectorAll('article[data-testid="tweet"]')]
  .slice(0, 20)
  .map(a => {
    const text = a.innerText;
    const likesMatch = text.match(/(\d+(?:,\d+)*|\d+(?:\.\d+)?[Kk万])\s*$/m);
    const linkMatch = a.querySelector('a[href*="/status/"]')?.href;
    return { text, rawLikes: likesMatch?.[1], url: linkMatch };
  });
```

**バズ閾値（系統 E）**:
- いいね **1,000 超** OR リポスト **200 超**
- 直近 **24 時間以内** の投稿のみ

#### E-2: トレンドタブ監視

`https://x.com/explore/tabs/trending` を開いて急上昇トピックを取得:

```javascript
const trends = [...document.querySelectorAll('[data-testid="trend"]')]
  .map(t => t.innerText);
```

AI / テック関連のトレンドキーワードを抽出（「Claude」「GPT」「Anthropic」「OpenAI」「AI」等の文字を含むもの）し、各トレンドに対して E-1 の検索を追加実行。

#### 系統 E の出力振り分けルール

抽出したバズツイートは以下の基準で各ネタ帳へ振り分け:

| ツイート性質 | 投入先 | ネタタイプ |
|---|---|---|
| AI 公式の新機能リーク・速報 | noteネタ帳 + Xネタ帳 | note=速報 / X=速報所感 |
| 副業視点で語れるトピック | Xネタ帳 | 引用RT候補 or リアクション |
| バズってる解説スレッド | Xネタ帳 | 引用RT候補 |
| 技術解説でnote記事化できる | noteネタ帳 | ノウハウ |
| Brain 商品ネタになりそう | Brainネタ帳 | 商材タイプ自動判定 |

#### 系統 D との違い

| 系統 | 監視対象 | カバレッジ |
|---|---|---|
| **D** | 公式アカウント 19 個 | 公式発表は確実に取れるが、第三者経由で広がる話題は取り逃す |
| **E** | キーワード検索 + トレンドタブ | **公式外の発信も含めてホットな話題を拾える**。例: GPT-5.5 リーク等は公式より先にメディアが報じる |

両方併用することで、AI 系のホットトピックを取りこぼさない構造にする。

**Chrome MCP がログアウト状態なら系統 E もスキップ**して報告に明記。

---

## Phase 2: 3軸全件判定（全ネタ × 3プラットフォーム同時判定・2026-04-25 改訂）

### 🎯 コア原則

**「1ネタ収集 → 3プラットフォーム全部で『向く / 向かない』をbinary判定 → 向く先のみ投入。1ネタが3ネタ帳全部に入ることを積極的に許容する。」**

GPT-5.5 や Anthropic 投資のような業界全体イベントは、note でも X でも Brain でも書ける。**重複投入を恐れず、角度を変えて全プラットフォームに保存する**。

### 判定の流れ

各ネタについて以下の 3 問を順番に答える。「YES なら投入」「NO なら不投入＋理由メモ」。

#### Q1. note 向きか？

YES の条件（**いずれか1つ満たせばYES**）:
- hyui の「文系大学生 × 副業」視点で書ける角度がある
- 非エンジニア副業初心者の悩み（お金・時間・案件・継続率）に紐づく
- 副業の体験談として実装/再現/活用エピソードが書ける
- 業界全体イベント（新モデル・大型投資・大手AI発表）で「副業者として何が変わるか」が書ける

NO の例:
- API/SDK の純技術解説で副業者に直接ベネフィットがない
- 主題がエンジニア向けで「副業視点の角度」が一切作れない

NO の場合: 不投入理由をメモに記録（例: 「副業視点の角度作れず・社内マーケットプレイス実験のため」）

#### Q2. X 向きか？

YES の条件（**いずれか1つ満たせばYES**）:
- 280字でフックが立つ
- 速報性 or バズ要素 or 引用RT価値がある
- hyui のペルソナで個人視点が出せる（共感・実況・所感など）
- 競合大手の発表（OpenAI/Google/Meta 等）で「Claude派の所感」が出せる

NO の例:
- 速報性ゼロ＋副業視点の言及も困難
- 既に古い・話題性が消えている

NO の場合: 不投入理由をメモに記録

#### Q3. Brain 向きか？

YES の条件（**すべて満たせばYES**・3問の中で最も厳しい）:
- テンプレ・チェックリスト・プロンプト集 等に体系化できる
- ¥1,980〜¥4,980 の販売価値が出せる（買う側の費用対効果が成立する）
- 副業学習者ターゲットにフィットする
- Brain 内既存商品との明確な差別化が可能

NO の例:
- 速報単発で体系化困難
- 商品化しても¥1,980 の価値が出ない
- Brain 内競合飽和で差別化困難

NO の場合: 不投入理由をメモに記録（例: 「速報単発・体系化困難・テンプレ化できない」）

### 判定例（実例ベース）

| ネタ | Q1 note | Q2 X | Q3 Brain | 投入先 |
|---|---|---|---|---|
| OpenAI GPT-5.5 発表 | ✅「副業者は乗り換えるべきか」 | ✅速報所感・大バズ | ✅「vs Claude 副業早見表」 | **3ネタ帳全部** |
| Anthropic $400億投資 | ✅「Claude消える心配ゼロ」副業安心 | ✅速報所感 | ❌商品化困難 | note + X |
| Anthropic Project Deal | ❌副業実用性低・社内実験 | ✅大バズ引用RT | ❌商品化困難 | X のみ |
| Claude Design × Canva | ✅既存LP記事の続編 | ✅Before/After体験 | ✅LPテンプレ集 | **3ネタ帳全部** |
| xAI Grok Voice 1.0 | ❌音声・副業直結弱 | ✅速報所感（弱め） | ❌商品化困難 | X のみ |
| AI副業 月収46,010円データ | ✅副業初心者ドンピシャ | ✅数字報告型 | ✅「副業実録ノウハウ集」 | **3ネタ帳全部** |

### 角度メモの書き方（投入時必須）

YES 判定したネタは、各ネタ帳のメモ欄に**「角度メモ」を必ず1〜2行で記載**:

| ネタ帳 | メモ書式 |
|---|---|
| noteネタ帳 | `note角度: {YES理由・どう書くか1行}` |
| Xネタ帳 | `X角度: {YES理由・どんなトーンで書くか1行}` |
| Brainネタ帳 | `Brain角度: {YES理由・どんな商材で出すか1行}` |

NO 判定したネタの不投入理由は **Phase 5 報告で集計表示** する（個別ネタ帳には記録しない）。

### 旧スコアリングの位置づけ（参考扱い）

旧 5項目スコアリング（市場/悩み/緊急/差別化/実績/非エン適合度）は判定の参考材料として頭の中で使ってよいが、**最終判定は YES / NO の binary** で行う。「閾値3.0以上で投入」のような機械的ルールは廃止。

### ハードフロアの廃止

非エンジニア適合度が低くても、副業視点の角度が1つでも作れれば note にも投入する。ハードフロアで弾かない。**「角度を作れるか」が新基準**。

---

## Phase 3: 重複防止チェック

Phase 0 でキャッシュした各ネタ帳の `未使用` レコードと、Phase 1 の発見ネタを照合:

### 判定ロジック
1. **元URL 完全一致** → 既存ネタ。スキップ
2. **元URL 異なるがネタ名 80% 以上一致** → 派生ネタとして投入（メモに「派生元: ◯◯」）
3. **完全に新規** → 新規投入

照合は各ネタ帳ごとに独立で行う（noteネタ帳に既出でも、Xネタ帳には新規かもしれない）。

---

## Phase 4: ネタ帳投入（YES判定先のみ・2026-04-25 改訂）

各ネタを `mcp__notion__notion-create-pages` で「Phase 2 で YES と判定したネタ帳」のみに投入。NO 判定のネタ帳には投入しない。1ネタ最大3ネタ帳投入される。

### 不投入リスト（Phase 5 報告用）

各ネタについて NO 判定した理由を、Phase 5 で集計表示するため**ローカル変数として記録**しておく:

```
{
  "ネタ名": "<タイトル>",
  "noteSkipReason": "<NOの場合の理由 / null>",
  "xSkipReason": "<NOの場合の理由 / null>",
  "brainSkipReason": "<NOの場合の理由 / null>"
}
```

### noteネタ帳投入（data_source_id: `1a603b4f-d1e4-4ed7-8c75-c7c0a5b7e595`）

```json
{
  "parent": { "data_source_id": "1a603b4f-d1e4-4ed7-8c75-c7c0a5b7e595" },
  "properties": {
    "ネタ名": "<タイトル>",
    "ステータス": "未使用",
    "記事タイプ候補": "速報 / 実録 / ノウハウ のいずれか",
    "ソースURL": "<URL>",
    "date:発見日:start": "YYYY-MM-DD",
    "date:発見日:is_datetime": 0,
    "発案元": "source-run",
    "優先度": "高 / 中 / 低",
    "メモ": "note角度: {Q1のYES理由・どう書くか1行} ・ 系統{A|B|C|D|E}発見 ・ 1行要約"
  }
}
```

### Xネタ帳投入（data_source_id: `6af7d0ce-64a0-4347-a5e3-325d27b440b8`）

```json
{
  "parent": { "data_source_id": "6af7d0ce-64a0-4347-a5e3-325d27b440b8" },
  "properties": {
    "ネタ名": "<タイトル>",
    "ステータス": "未使用",
    "ネタタイプ": "リアクション / フック案 / Before/After / 数字報告 / 日常 / 速報所感 / 問いかけ / 引用RT候補 のいずれか",
    "発案元": "source-run",
    "優先度": "高 / 中 / 低",
    "date:発見日:start": "YYYY-MM-DD",
    "date:発見日:is_datetime": 0,
    "元URL": "<URL>",
    "書きたいニュアンス": "共感 / 逆張り / 速報所感 / データ追加 等",
    "推奨時間帯": "朝 / 昼 / 夜前半 / 夜後半 / 任意",
    "メモ": "X角度: {Q2のYES理由・どんなトーンで書くか1行} ・ 系統{B|D|E}発見"
  }
}
```

### Brainネタ帳投入（data_source_id: `1198a5a1-6955-41da-928b-ad79f07d2a1b`）

```json
{
  "parent": { "data_source_id": "1198a5a1-6955-41da-928b-ad79f07d2a1b" },
  "properties": {
    "ネタ名": "<タイトル>",
    "ステータス": "未使用",
    "商材タイプ": "ノウハウ集 / テンプレ集 / プロンプト集 / 実録マニュアル のいずれか",
    "発案元": "source-run",
    "対象note記事": "<関連note記事タイトル or 空（Brain単独ネタの場合）>",
    "想定価格帯": "1980 / 2980 / 4980 のいずれか",
    "target_fit": "high / medium / low",
    "date:発見日:start": "YYYY-MM-DD",
    "date:発見日:is_datetime": 0,
    "元URL": "<URL>",
    "メモ": "Brain角度: {Q3のYES理由・どんな商材で出すか1行} ・ 系統{B|C|D|E}発見 ・ 競合相場 ¥{価格}"
  }
}
```

---

## Phase 5: 完了報告（系統別の詳細ログ義務化・2026-04-24 強化）

### ターミナル出力フォーマット（必須）

```
━━━━━━━━━━━━━━━━━━━━━━━━━
✅ /source-run 完了

🔍 系統別 実行ログ（全5系統の状態を必ず明記）:

[系統 A] 副業トレンド (WebSearch)
  ├ 実行クエリ数: 7 / 7
  ├ 取得ヒット数: {N1_hit}
  ├ 適合度通過: {N1_pass}
  ├ ネタ帳投入: {N1_inj}
  └ 状態: ✅成功 / ⚠️部分失敗 / ❌スキップ（理由: {reason}）

[系統 B] Claude/Anthropic新機能 (WebSearch)
  ├ 実行クエリ数: 6 / 6
  ├ 取得ヒット数: {N2_hit}
  ├ 適合度通過: {N2_pass}
  ├ ネタ帳投入: {N2_inj}
  └ 状態: ✅成功 / ⚠️部分失敗 / ❌スキップ

[系統 C] Brain市場 (WebFetch brain-market.com)
  ├ WebFetch成功: ✅/❌
  ├ 取得商品数: {N3_hit}
  ├ 適合度通過: {N3_pass}
  ├ ネタ帳投入: {N3_inj}
  └ 状態: ✅成功 / ⚠️部分失敗 / ❌スキップ

[系統 D] X公式19アカウント (Chrome MCP)
  ├ Chrome MCP ログイン: ✅/❌
  ├ スキャン対象アカウント: {N4_acc} / 19
  ├ 取得ツイート数: {N4_hit}
  ├ バズ閾値超え: {N4_pass}
  ├ ネタ帳投入: {N4_inj}
  └ 状態: ✅成功 / ⚠️部分失敗 / ❌スキップ（理由: {reason}）

[系統 E] X検索・トレンド (Chrome MCP)
  ├ Chrome MCP ログイン: ✅/❌
  ├ E-1 キーワード検索: {N5e1_query}クエリ実行 / {N5e1_hit}件取得
  ├ E-2 トレンド取得: {N5e2_trend}件
  ├ バズ閾値超え: {N5_pass}
  ├ ネタ帳投入: {N5_inj}
  └ 状態: ✅成功 / ⚠️部分失敗 / ❌スキップ（理由: {reason}）

📥 ネタ帳投入合計:
- noteネタ帳: 新規 {note_new} 件 / 重複スキップ {note_dup} 件 / 3軸判定NO {note_skip} 件
- Xネタ帳: 新規 {x_new} 件 / 重複スキップ {x_dup} 件 / 3軸判定NO {x_skip} 件
- Brainネタ帳: 新規 {brain_new} 件 / 重複スキップ {brain_dup} 件 / 3軸判定NO {brain_skip} 件

📊 3軸判定マトリクス:
（判定済みネタ × プラットフォーム別 YES/NO の集計）
- 3ネタ帳全部YES: {N1} 件（GPT-5.5・Claude Design 等の業界全体イベント級）
- 2ネタ帳YES: {N2} 件
- 1ネタ帳YES: {N3} 件
- 0ネタ帳YES（全NO）: {N0} 件 ← Phase 5 報告だけで終わるネタ

❌ 不投入理由集計（NO判定の集計）:
- note不投入の主な理由: {top_note_skip_reasons}（例: 副業視点角度作れず）
- X不投入の主な理由: {top_x_skip_reasons}（例: 速報性ゼロ＋副業視点困難）
- Brain不投入の主な理由: {top_brain_skip_reasons}（例: 速報単発・体系化困難）

⚠️ スキップ系統がある場合（必ず出力）:
- 系統 D ❌: Chrome MCP ログアウト → ブラウザで X ログイン後に /source-run 再実行
- 系統 X ❌: {具体的理由}

🚀 おすすめ次アクション（順序重要・x-run は最後）:

【1番目】記事生成系を先に実行（pending_cta を出力）
- /note-run            → noteネタ帳 高優先 {hi_count} 件あり
- /brain-run from-idea → Brainネタ帳 high target_fit {hi_count} 件あり

【2番目】最後に x-run（pending_cta + Xネタ帳を取り込んで予約投稿生成）
- /x-run → Xネタ帳 高優先 {hi_count} 件 + 今日生成した告知も組込

理由: note-run / brain-run が出力する x/pending_cta/*.json を
      x-run Phase 2.5 が取り込んで翌日の告知ツイートに差し替える設計。
      x-run を先に走らせると今日の新記事告知が抜ける。

━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 異常検知ルール（自己点検・2026-04-24 強化）

完了報告の出力前に以下を自動チェック:

1. **5系統のうち1つでも実行率 < 100%（サブ項目省略含む）** → ⚠️ 警告: 「サブ項目を完全実行できていません。系統 X のサブ項目 Y/N がスキップされた理由を確認してください」
2. **系統 D で 19 アカウント未満スキャン** → ⚠️ 警告: 「Tier 1 / 2 / 3 すべての 19 アカウントをスキャンしてください。light モードでない引数なし実行では全実行必須です」
3. **系統 E で 7 カテゴリキーワード未満** → ⚠️ 警告: 「E-1 の 7 カテゴリ全部実行してください」
4. **Xネタ帳投入 0 件 + 系統 D・E のいずれかが ❌** → ⚠️ 警告: 「Chrome MCP のログイン状態を確認してください」
5. **全系統合計投入数が 3 件未満** → ⚠️ 警告: 「スキャン結果が極端に少ない。クエリの妥当性を見直してください」

### 部分実施の自動再実行

異常検知ルール 1〜3 が発動した場合、報告前に**スキップしたサブ項目を自動で再実行**してから完了報告を出す。AIが「もう終わった」と判断するのを禁止。

Discord 通知（リード Webhook・成功時）:
```bash
printf '{"embeds":[{"title":"✅ source-run 完了","color":5763719,"fields":[{"name":"投入件数","value":"note: {N}件 / X: {N}件 / Brain: {N}件","inline":false}],"footer":{"text":"content-pipeline"}}]}' \
  | curl -H "Content-Type: application/json" -X POST -d @- "{LEAD_WEBHOOK}"
```

---

## モード: add（ユーザー手動投入）

ユーザーが「このリアクションしたい」「このネタで記事書きたい」を投げた時の対話モード。

### 起動例

```
/source-run add
```

### 対話フロー

```
🎯 どのネタ帳に追加？
  1. noteネタ帳
  2. Xネタ帳
  3. Brainネタ帳

→ ユーザー: 2

📝 ネタ内容を教えて:
  - URL（あれば）
  - 一言メモ（書きたいニュアンス・どんな角度で書きたいか）

→ ユーザー: 「https://x.com/xxx/status/yyy このツイートに共感した、副業視点で乗っかりたい」

🏷️ ネタタイプは？
  1. リアクション
  2. フック案
  3. 引用RT候補
  ...

→ ユーザー: 1（または何も答えなければ自動推定）

✅ Xネタ帳に投入しました
- ネタ名: {自動生成}
- ネタタイプ: リアクション
- ニュアンス: 共感・副業視点
- ステータス: 未使用
- 発案元: ユーザー手動

次回 /x-run で自動的に拾われます。
```

### ショートカット投入（自然言語経由）

ユーザーが Claude Code に直接以下のように投げた場合も同等処理:

```
「この URL https://x.com/xxx に共感した、X 投稿でリアクションしたい」
↓
Xネタ帳に「ユーザー手動・リアクション」で自動投入
```

---

## モード: dry-run（投入せず確認のみ）

Phase 0〜3 まで実行し、Phase 4（投入）と Phase 5（報告）の代わりに「投入予定リスト」を表示するだけ。テスト・確認用。

```
🧪 dry-run 結果（投入は実行しません）

【noteネタ帳投入予定】 N 件
1. {タイトル} | noteAdapt: 4.2/5 | 速報 | 高
2. ...

【Xネタ帳投入予定】 N 件
...

【Brainネタ帳投入予定】 N 件
...

実際に投入するには引数なしで /source-run を実行してください。
```

---

## 各 run との連携

### note-run
- Phase 1（旧トレンドスキャン）→ **削除**
- Phase 2（旧スキャン+ネタ帳投入）→ **noteネタ帳から `未使用` を読み込む方式に変更**
- 6項目スコアリング・記事管理DB登録は note-run に残す

### x-run
- Phase 2（旧公式アカウント監視）→ **source-run に移管**
- Phase 3（日常ツイートのネタソース）→ **Xネタ帳優先・空時はフォールバック**
- Phase 2.5（pending_cta）/ Phase 2.7（バズ検知）→ **x-run に残す**（リアルタイム性優先）

### brain-run
- Phase 1（Brain 相場調査）→ **既存ルートに残す**（価格決定の精度確保）
- 新ルート C（`/brain-run from-idea`）→ Brainネタ帳から `未使用` を読んで生成

---

## ネタ帳が空の場合のフォールバック

各 run は対応ネタ帳が空でも動作するよう、各 run 側に最低限の自前スキャン機能を残す（簡易版）:

- **note-run**: ネタ帳空 → 「/source-run を先に実行することを推奨」と通知し、最低限のスキャン B（副業トレンド）だけ実行
- **x-run**: ネタ帳空 → 旧 Phase 3 ネタソース（today/note/ / x/published/ / x-performance.md）にフォールバック
- **brain-run**: ネタ帳空 → 既存ルート A（note記事起点）で動作

---

## 古いネタの自動見送りクリーンアップ

source-run 起動時、各ネタ帳の `未使用` レコードを走査:
- **発見日から 30 日経過** したネタは `見送り` に自動更新（メモに「30 日経過自動見送り」追記）
- これにより未使用ネタの肥大化を防ぐ

## today/source-run/ の自動クリーンアップ

source-run 起動時、`today/source-run/` 配下の古いバックアップを削除:
- **7 日以上前** の `failed-*.json` を削除
- **目的**: today/ 配下は常に「最新の作業セット」だけが残る状態を保つ

実装例（Bash）:
```bash
# 7日経過した failed-*.json を削除
find today/source-run/ -name "failed-*.json" -type f -mtime +7 -delete 2>/dev/null
```

`today/source-run/` が空または該当ファイルなしならスキップ。

---

## エラーハンドリング

### Chrome MCP ログアウト
→ 系統 D（X 公式アカウント監視）スキップ、A/B/C のみ実行。報告に明記。

### Notion MCP 失敗
→ 該当ネタ帳投入のみスキップ、他は続行。失敗ネタは `today/source-run/failed-{date}.json` にバックアップ。

### スキャン 0 件
→ 「本日は新規ネタなし。既存ネタ帳を確認してください」と報告。

---

## 関連ファイル

- `context/source-strategy.md` — スキャン戦略・適合度判定詳細
- `.claude/skills/note-run/SKILL.md` — note 記事生成（Phase 1 削除済み）
- `.claude/skills/x-run/SKILL.md` — X ツイート生成（Phase 2 整理済み）
- `.claude/skills/brain-run/SKILL.md` — Brain 商品生成（from-idea ルート追加）
- `CLAUDE.md` — 全体アーキテクチャ・3 ネタ帳の役割

---

## 禁止事項

- **送信ボタンをユーザー承認なしに押さない**（X 投稿等は当然 NG。これは生成スキル側のルール）
- **APIキーをチャットログに表示しない**
- **既存ネタ帳のレコードを削除しない**（ステータス更新のみ）
- **重複ネタを強制投入しない**（Phase 3 で必ずチェック）
