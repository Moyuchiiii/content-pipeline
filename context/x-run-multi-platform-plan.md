# /x-run マルチプラットフォーム化実装プラン

> 2026-04-28 作成（戦略変更セッションからの引き継ぎメモ）
> 次セッションで /x-run スキル拡張するときに必読

---

## 🎯 実装目的

hyui_cc の X / Threads 両方を `/x-run` 一発で完璧に運用できる状態にする。

---

## ✅ 前提（既に揃っている・次セッションで再確認不要）

- [x] Typefully で 3 Social Set 作成済み（ユーザー手動）
- [x] `.env` に 3 ID 登録済み（ユーザー手動・hook ブロック対象なので Read 不可）
- [x] `.env.example` 更新済み（3 ID 用フィールド定義）
- [x] `x-strategy.md` に Typefully Auto-Retweet 運用ルール反映済み
- [x] `x-run/SKILL.md` Phase 0 ⓪ に Auto-RT 運用ルール参照記載済み

---

## 📦 .env 構造（[実機確認済 .env.example]）

```
TYPEFULLY_API_KEY=...

# 1. クロスポスト用（X+Threads 両方紐付け）
TYPEFULLY_SOCIAL_SET_ID=...

# 2. X 専用（@hyui_cc のみ紐付け・2026-04-28 新設）
TYPEFULLY_X_ONLY_SOCIAL_SET_ID=...

# 3. Threads 専用（@hyui__cc のみ紐付け・2026-04-28 新設）
TYPEFULLY_THREADS_ONLY_SOCIAL_SET_ID=...
```

---

## 📋 実装フェーズ

### Phase 1: 環境変数読み込み拡張（30分）

- `.claude/skills/x-run/SKILL.md` Phase 0 ① 環境変数チェックに 3 変数追加
- `scripts/typefully.mjs` に 3 Social Set 切り替えサポート追加（引数で `--social-set-id` 指定可能に）

### Phase 2: 配信先振り分けロジック（1〜2時間）

| 投稿タイプ | Social Set | 補足 |
|---|---|---|
| 日常実況・短文（朝/昼/夜short post） | クロスポスト | Auto-RT OFF |
| note/Brain告知（pending_cta 由来） | クロスポスト | Auto-RT ON |
| 引用RT（@claudeai 等公式アカウント） | X専用 | quote_post_url |
| バズ宣伝リプ | X専用 | reply_to_url |
| Threads長文体験談 | Threads専用 | 500字フル活用 |
| 連続投稿（Thread-to-Lead） | Threads専用 | 5〜7本スレッド |

実装は `/x-run` の Phase 5（生成）→ Phase 6（送信）の間に配信先判定ステップを追加。

### Phase 3: Threads単独投稿モード新設（1〜2時間）

- `/x-run threads-only` モード追加
- Threadsネタ帳から取得 → 500字フル活用の長文体験談生成
- Threads専用 Social Set に予約送信
- [WebSearch済] 参考: ここなさん月153万円事例（Threads主軸）

### Phase 4: X専用モード新設（1時間）

- 引用RT・バズリプを X専用 Social Set 経由で送信
- 既存の daily-auto 内で配信先判定して X専用に振り分け

### Phase 5: Auto-RT フラグ自動判定（30分・API対応次第）

- [要検証] Typefully API の `auto_retweet` パラメータ仕様確認
- 投稿タイプから ON/OFF 自動判定（[実機確認済 x-strategy.md] 判定基準あり）
- 対応してれば自動・してなければ手動継続（現状維持）

### Phase 6: ネタ帳整備（1時間）

- Xネタ帳 vs Threadsネタ帳の使い分けルール明確化
- `/source-run` でプラットフォーム適合度判定（既存ロジック拡張）
- Threadsネタ帳は「長文体験談・連続投稿ネタ」に特化

---

## 🥇 推奨着手順

1. **Phase 1+2+3+4 を一気に実装**（4〜6時間）
   - 環境変数 → 配信先振り分け → Threads単独 → X専用 まで一気通貫
2. **Phase 5** → API調査次第で対応
3. **Phase 6** → 運用2週間後に最適化

---

## 📝 このセッションで決まった戦略（参照用）

### コンテンツ戦略
- 等身大→「1〜2歩先を行く先輩」（先輩のお姉さん）
- 4月実績 ¥160,000見込→¥100,000確定
- アイコン承認（4プラットフォーム統一・GPT image生成・先輩感+親近感のバランス）
- プロフィール改修済（4プラットフォーム）
- メイン商品冒頭一人称統一+先輩フレーム1段落追加

### Typefully運用
- 3 Social Set（クロスポスト / X専用 / Threads専用）
- Auto-Retweet: Default OFF・告知系のみ個別ON
- 3段階RT構成（6時間後・25時間後・7日後10:30）
- 各RTは24時間後自動解除

### context/ 整理
- 29→25ファイル圧縮
- 削除: mcp-integrations / main-product-source / x-professional-tools-research / archive/note-article-draft
- 統合: anti-ai-writing-patterns → writing-rules

---

## 🔗 参照すべきファイル（次セッションで読み込み推奨）

優先度順:

1. `context/persona-hyui.md` — 先輩フレーム・4月¥10万・Hyui人格
2. `context/x-strategy.md` — Auto-RT 運用ルール・投稿タイプ別判定
3. `context/x-profile.md` — 3プラットフォーム（X/Threads/note）プロフィール
4. `.claude/skills/x-run/SKILL.md` — 既存スキル構造
5. `.env.example` — 環境変数テンプレ
6. `scripts/typefully.mjs` — Typefully API ラッパー
7. `published-history.md` — 直近30日投稿履歴

---

## ⚠️ 注意点

- `.env` は hook でブロック対象。直接 Read/Write 不可。ユーザー側で手動編集
- Typefully API v2 のみ有効（v1 は 2026-06-15 廃止予定）
- 投稿はユーザー承認必須（[実機確認済 CLAUDE.md] ブラウザ操作における送信禁止ルール）
