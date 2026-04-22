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
- `context/x-strategy.md` — アルゴリズム対策・時間帯戦略
- `context/x-hook-formulas.md` — フック10型
- `context/voice-samples.md` — 文体・NGフレーズ
- `context/x-performance.md` — 過去実績・成功パターン
- `context/writing-rules.md` — 禁止フレーズ
- `today/` の最新記事（あれば参照）

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

**最大3件まで選定。** 該当なしの日は引用RTゼロでOK（無理やり作らない）。

### Phase 3: 日常4本生成

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
- **「文系の自分でもできた」**を各日1〜2本に自然挿入
- 断定語尾は「できる」じゃなくて「できた」（実体験フレーム）
- ハッシュタグ原則なし（月1〜2本の固定ポストのみ `#Claude` `#AI副業`）
- 280字以内（改行込み）
- フック1行目は `context/x-hook-formulas.md` の10型から選択・宣言必須
- NGフレーズ（`context/voice-samples.md` 準拠）: 「〜でしょう」「重要です」「まず最初に」等

### Phase 4: 画像戦略（段階運用）

**Phase 4a（Phase 1 運用: 最初の1〜2週間）**

- 全投稿を **画像なしで送信**
- Typefully UI で翌朝ユーザーが手動で画像追加
- Chat上には「推奨画像: 作業スクショ / ロゴ+短文カード / なし」の指示だけ表示

**Phase 4b（Phase 2 運用: 安定後）**

- 朝 Before/After: `x/images/YYYYMMDD_morning.png` をユーザーが用意 → 検出して添付
- 昼 AIニュース所感: 引用元の公式ツイートをブラウザでスクショ → 自動添付
- 夜前半 副業の裏側: 任意（ユーザーメモに画像パス指定できる）
- 夜後半 問いかけ: 画像なし
- 引用RT: 画像なし（引用カードで代用）

**初期は Phase 4a で運用。** ユーザーから「画像自動化したい」と言われたら Phase 4b に切り替える。

### Phase 5: ドラフト承認（ユーザー）

以下のフォーマットでチャットに全投稿を表示:

```
━━━━━━━━━━━━━━━━━━━━━━━━━
📅 明日（YYYY-MM-DD）の予約投稿プレビュー
━━━━━━━━━━━━━━━━━━━━━━━━━

▼ 日常ツイート 4本

【朝 08:00】Before/After型
──────────
{本文}
──────────
推奨画像: 作業スクショ

【昼 12:30】驚き発見型
──────────
{本文}
──────────
推奨画像: なし（Phase 1運用）

【夜前半 20:00】実況型
──────────
{本文}
──────────
推奨画像: 作業画面スクショ

【夜後半 22:00】問いかけ型
──────────
{本文}
──────────
推奨画像: なし

▼ 引用RT {N}本

【引用RT 1 / 予定 09:30】
引用元: @claudeai の https://x.com/claudeai/status/...
元ツイート要約: 「Claude Opus 4.7 リリース」
──────────
{コメント文}
──────────

━━━━━━━━━━━━━━━━━━━━━━━━━

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

### Phase 7: 投稿履歴保存

`x/scheduled/YYYYMMDD.json` に記録:

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
      "draft_id": "typefully_draft_id",
      "share_url": "..."
    },
    {
      "type": "quote_rt",
      "source_account": "claudeai",
      "source_url": "https://x.com/claudeai/status/...",
      "publish_at": "2026-04-24T09:30:00+09:00",
      "text": "...",
      "draft_id": "..."
    }
  ]
}
```

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

- [ ] 1ツイート280字以内
- [ ] フック10型から1つ宣言している
- [ ] AI感のある言い回しがない（`context/voice-samples.md` NGリスト照合）
- [ ] 「文系の自分でもできた」が日4本中1〜2本に入っている
- [ ] ハッシュタグなし（or 固定ポスト日のみ最大2個）
- [ ] 引用RTの `quote_post_url` がURL形式（tweet ID ではない）
- [ ] `publish_at` が ISO 8601 の `+09:00` 形式で指定されている
- [ ] 280字内でフックが1行目にある

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

- `scripts/typefully.mjs` — Typefully API ヘルパー
- `context/typefully-api-research.md` — API v2 仕様詳細
- `context/x-influencer-research.md` — 引用RT対象アカウント詳細
- `context/x-profile.md` — hyui ブランド設計
- `context/x-strategy.md` — ツイートタイプ・アルゴリズム戦略
- `context/x-hook-formulas.md` — フック10型
- `context/voice-samples.md` — 文体・NGフレーズ
- `context/x-performance.md` — 過去実績
