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

## Phase 0: コンテキスト読み込み

以下を必ず読む:

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

## Phase 1: 広域スキャン（4 系統並行）

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

曜日別スキャン割り当て（過負荷回避）:

| 曜日 | スキャン対象 |
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

---

## Phase 2: プラットフォーム適合度判定

各ネタについて、3 プラットフォームへの適合度を 1〜5 点で判定する。

### note 適合度 (noteAdapt)

| 項目 | 判定基準 |
|---|---|
| 非エンジニア適合度 | 主題が非エンジニアの副業課題か。Claude Code 機能解説・SDK 等は低スコア |
| 市場の大きさ | そのトピックに関心がある層の推定数 |
| 悩みの深さ | お金を払ってでも解決/知りたいレベルか（HARM 法則） |
| 緊急度 | 「今すぐ知りたい」か（速報性） |
| 差別化可能性 | hyui の実体験で書けるか |

合計点を 5 で割って平均（0〜5 点）。**非エンジニア適合度が 4 点未満は noteAdapt = 0 にハードフロア**。

### X 適合度 (xAdapt)

| 項目 | 判定基準 |
|---|---|
| 短文化可能性 | 280 字でフックが立つか |
| リアクション性 | 引用RT・リプ反応が見込めるか |
| バズ可能性 | 数字や驚きが含まれるか |
| 副業視点で語れるか | hyui ペルソナで個人視点を出せるか |
| 速報性 | リアルタイム発信が向くか |

合計点 / 5（0〜5 点）。

### Brain 適合度 (brainAdapt)

| 項目 | 判定基準 |
|---|---|
| ノウハウ体系化 | テンプレ・チェックリスト・プロンプト集にできるか |
| 販売単価妥当性 | ¥1,980〜¥4,980 で買う価値が出せるか |
| ターゲット層適合 | Brain 利用者層（副業学習者）にフィットするか |
| 既存 note 起点 | 既存 note 記事から拡張できるか（あればプラス） |
| 競合との差別化 | Brain 内同ジャンル商品との明確な差を出せるか |

合計点 / 5（0〜5 点）。

### 投入判定

各ネタ帳への投入条件:

| ネタ帳 | 投入条件 |
|---|---|
| noteネタ帳 | `noteAdapt >= 3.0` |
| Xネタ帳 | `xAdapt >= 3.0` |
| Brainネタ帳 | `brainAdapt >= 3.0` |

→ **1 ネタが複数ネタ帳に投入されることを許容**（同じ Claude Design 速報が note + X 両方に入る等）

---

## Phase 3: 重複防止チェック

Phase 0 でキャッシュした各ネタ帳の `未使用` レコードと、Phase 1 の発見ネタを照合:

### 判定ロジック
1. **元URL 完全一致** → 既存ネタ。スキップ
2. **元URL 異なるがネタ名 80% 以上一致** → 派生ネタとして投入（メモに「派生元: ◯◯」）
3. **完全に新規** → 新規投入

照合は各ネタ帳ごとに独立で行う（noteネタ帳に既出でも、Xネタ帳には新規かもしれない）。

---

## Phase 4: ネタ帳投入

各ネタを `mcp__notion__notion-create-pages` で対応するネタ帳に投入。

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
    "メモ": "noteAdapt={点}/5 ・ 系統{A|B|C}発見 ・ 1行要約"
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
    "メモ": "xAdapt={点}/5 ・ 系統{B|D}発見"
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
    "メモ": "brainAdapt={点}/5 ・ 系統{C}発見 ・ 競合相場 ¥{価格}"
  }
}
```

---

## Phase 5: 完了報告

ターミナル出力:

```
━━━━━━━━━━━━━━━━━━━━━━━━━
✅ /source-run 完了

📊 スキャン結果:
- 系統 A（副業トレンド）: {N1} 件
- 系統 B（Claude新機能）: {N2} 件
- 系統 C（Brain市場）: {N3} 件
- 系統 D（X公式アカウント）: {N4} 件

📥 ネタ帳投入:
- noteネタ帳: 新規 {note_new} 件 / 重複スキップ {note_dup} 件
- Xネタ帳: 新規 {x_new} 件 / 重複スキップ {x_dup} 件
- Brainネタ帳: 新規 {brain_new} 件 / 重複スキップ {brain_dup} 件

🚀 おすすめ次アクション:
- /note-run    → noteネタ帳 高優先 {hi_count} 件あり
- /x-run       → Xネタ帳 高優先 {hi_count} 件あり
- /brain-run from-idea → Brainネタ帳 high target_fit {hi_count} 件あり

━━━━━━━━━━━━━━━━━━━━━━━━━
```

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
- **x-run**: ネタ帳空 → 旧 Phase 3 ネタソース（today/ / x/published/ / x-performance.md）にフォールバック
- **brain-run**: ネタ帳空 → 既存ルート A（note記事起点）で動作

---

## 古いネタの自動見送りクリーンアップ

source-run 起動時、各ネタ帳の `未使用` レコードを走査:
- **発見日から 30 日経過** したネタは `見送り` に自動更新（メモに「30 日経過自動見送り」追記）
- これにより未使用ネタの肥大化を防ぐ

---

## エラーハンドリング

### Chrome MCP ログアウト
→ 系統 D（X 公式アカウント監視）スキップ、A/B/C のみ実行。報告に明記。

### Notion MCP 失敗
→ 該当ネタ帳投入のみスキップ、他は続行。失敗ネタは `today/source-run-failed-{date}.json` にバックアップ。

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
