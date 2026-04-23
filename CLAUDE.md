# content-pipeline

AI（Claude Code）を活用した note & X 運用パイプライン。

## プロジェクト概要

- **「副業・稼ぎ方」が軸、「手段がClaude/AI」が後**のフレーミングでコンテンツを発信
- 「非エンジニアの大学生がAIだけで月14万稼いだ」等身大の一次情報が差別化の核心
- 稼いだ結果→失敗→使ったツール（Claude）の順番で語る。ツール紹介から入らない
- 他のAIツール（ChatGPT, Gemini等）は比較文脈でのみ言及。メインにしない
- Claude / Claude Code は主軸ツールとして全記事に登場するが、「副業初心者でも使える」前提で説明する

### ターゲット遵守（絶対）

- **ターゲットは非エンジニア副業初心者**。エンジニア向け記事は禁止
- **NG主題**: Claude Code新機能解説・SDK使い方・プラグイン紹介・CLAUDE.md運用深掘り・プロジェクト構造話・技術比較ベンチマーク。これらが主役の記事は書かない
- **OK主題**: 副業で稼いだ体験・クラウドワークス応募の工夫・案件獲得のコツ・日常業務の効率化体験。Claude Codeは「使った道具」として脇役で登場
- 「エンジニアじゃないと無理そうに見えるけど」を末尾に足すだけで非エンジ向けにしたつもりになるのは禁止。**主題そのものが非エンジの副業悩みに紐づいていること**

## note 記事タイプ

1. **速報記事（sokuho）**: Claude/Anthropicの新機能を「副業・稼ぎ方に使えるか」視点で即日レビュー。不定期。有料500円
2. **実録記事（jituroku）**: 困ってたこと→AIに頼んだら解決した→稼げた、の体験全記録。Claude Codeは「使った手段」として登場。週1本。有料1,500〜2,000円
3. **ノウハウ記事（knowhow）**: 非エンジニアでもAIで副業できる方法・手順。Claude活用は「道具の使い方」として説明。月2本。無料 or 有料

## X ツイートタイプ

| タイプ | 頻度 | 役割 |
|---|---|---|
| 速報ツイート | Claude新機能リリース時 | トレンド乗り・リーチ拡大 |
| 実況ツイート | 週3〜4本 | 親近感・継続フォロー動機 |
| ノウハウスレッド | 週1〜2本 | 保存・拡散 |
| 実績報告 | 月1〜2本 | 信頼構築 |
| note誘導 | 記事公開時 | note→X→note の循環 |
| 問いかけ型 | 週1〜2本 | リプライ数増・エンゲージメント |
| 図解カード型 | 週1本 | ブックマーク・保存率向上 |

## ルール

### 文体共通
- 大学生が自分の言葉で書いているトーン。AI感を出さない
- 「〜と言えるでしょう」「〜ではないでしょうか」等のAI定型フレーズ禁止
- 数字・実績は正確に。盛らない
- クライアント情報は必ず匿名化

### note 固有
- noteの装飾: HTML形式で出力。h2/h3見出し、太字、引用（blockquote）、コードブロック（pre>code）、箇条書き・番号付きリスト、区切り線、中央寄せが使用可能
- コードを載せる場合はコードブロック（pre>code）を使用

### X 固有

**2026-04-24 方針大幅改訂: 人間らしさ優先**

- 外部リンクは本文ではなく**リプライ**に置く（本文直埋めでリーチ30〜90%低下）
- 画像または動画は**できれば添付**（テキストのみも自然体として許容）
- ハッシュタグは 0〜2 個まで
- 宣伝感を出さない。体験・実況が軸
- **送信はユーザーが行う。スキルはドラフトを生成するだけ**

**hyui は個人アカウント**（文系大学生・副業実録）。メディア型・CEO型（claudecode_lab / masahirochaen 等）の模倣は**やめる**。

- 毎日4本固定 → **1〜4本可変・スキップも可**
- 時間帯固定 → **目安（厳守不要）**
- 文字数レンジ強制 → **廃止**（30〜280字で自然に）
- 箇条書き・ブラケット【速報】・クリック誘導語句 → **毎回必須ではない・たまに使う調味料**
- 書き出し5型散らし・同一リズム禁止 → **推奨レベル**（強制しない）
- 「文系の自分でもできた」機械挿入 → **自然に出る時のみ**

**残す必須ルール**:
- AI定型フレーズ禁止（「〜でしょう」「〜ではないでしょうか」「いかがでしたか」「〜してみましょう」）
- 「また書く」「〜派？」は NG（`x-anti-ai-patterns.md` の根拠あり）
- 外部URL本文直埋め禁止（リプへ分離）
- 送信前にユーザー承認必須

詳細: `.claude/skills/x-run/SKILL.md` Phase 3 冒頭の「運用方針」参照

## スキル

- `/content` : ~~全自動パイプライン~~（非推奨: コンテキスト枯渇で品質低下するため）。個別実行を推奨: `/collect-stats` → `/note-run` → `/content-engine` → `/x-run` → `/brain-run`
- `/note-run` : note記事のみ生成。トピック選定→競合調査→記事生成→編集→最終稿出力
- `/x-run` : 毎日実行で翌日の X 予約投稿を生成→承認→Typefully送信する自動パイプライン。日常 1〜4 本（朝/昼/夜前半/夜後半の目安・スキップ可）+ 引用RT 0〜3本（AI全般公式アカウント対象）+ 告知差し替え（pending_cta）+ バズ宣伝リプ
- `/brain-run` : noteで作った記事を Brain 向けに拡張リライトして販売ドラフト生成。コード全文・プロンプト全文・テンプレ付きの ¥1,980〜版を brain/today/ に出力。投稿は手動
- `/content-engine` : 1ネタ→複数フォーマット展開。note草稿からXスレッド・単発ツイート・カードテキストを一括生成
- `/collect-stats` : X Analytics・noteダッシュボードをブラウザ操作でデータ収集。x-performance.md / note-performance.md / Notion を自動更新

## Notion連携

### 共有DB
| DB | data_source | 用途 |
|---|---|---|
| 記事管理 | `collection://812aa728-8d3e-42e4-a9cd-6a91c303b2c2` | 記事ステータス・Xステータス管理 |
| ネタ帳 | `collection://1a603b4f-d1e4-4ed7-8c75-c7c0a5b7e595` | X発案ネタ・未使用ネタのストック |

### 記事管理DB フィールド一覧（18フィールド）

| フィールド名 | タイプ | 備考 |
|---|---|---|
| 記事名 | title | 記事タイトル |
| 記事タイプ | select | 速報 / 実録 / ノウハウ |
| ステータス | select | 進行中 / 完了 / 投稿済み |
| トピック | text | 選定理由・元ネタ |
| メモ | text | PDCA記録・メモ |
| note公開日 | date | note投稿日 |
| noteURL | url | note投稿後のURL |
| note PV | number | ページビュー数 |
| noteスキ | number | スキの数 |
| note価格 | number | ¥（有料記事の場合） |
| Xステータス | select | 未投稿 / 草稿完成 / 投稿済み |
| XURL | url | 投稿後の X ポスト URL |
| Brainステータス | select | 未作成 / 草稿完成 / 投稿済み / 告知済み |
| BrainURL | url | 投稿後の Brain 商品ページ URL |
| Brain価格 | number | ¥ |
| Brain還元率 | number | % |
| Brain公開日 | date | 投稿日 |
| Brain売上 | number | 月次更新 |

### フィールド更新責任分界

**note-run が自動管理:**
- 記事名・記事タイプ・ステータス・トピック・メモ（Phase 2/8）
- **noteURL・note公開日・Xステータス(`未投稿`)・ステータス(`完了`)（Phase 9 Step 1 でユーザーに URL を聞いて自動入力）**

**brain-run が自動管理:**
- Brainステータス・Brain価格・Brain還元率・Brain公開日（Phase 7 で草稿完成時）
- **BrainURL・Brain公開日（最終）・Brainステータス(`投稿済み`)（Phase 8 Step 1 でユーザーに URL を聞いて自動入力）**

**x-run が自動管理:**
- Xステータス = `投稿済み`（Phase 7-3・告知採用時のみ）
- Brainステータス = `告知済み`（Phase 7-3・Brain告知時のみ）

**collect-stats が自動管理:**
- note PV・noteスキ（Step 4で記事名キーに upsert）

**ユーザー手動更新（スキル側で自動化していない）:**
- XURL（X告知投稿後・note-run/brain-run の範囲外・Typefully 管理）
- Brain売上（月次手動・collect-stats 拡張で自動化検討中）

### 投稿URLヒアリングの流れ

- `/note-run` が Phase 9 の最後で「noteに投稿した？ URL教えて」と聞く → URL を受け取ったら Notion 自動更新
- `/brain-run` が Phase 8 の最後で「Brain に投稿した？ URL と最終価格・還元率・公開日を教えて」と聞く → 自動更新
- 「まだ」と答えた場合は Notion 更新をスキップし、後で Notion UI から手動更新 or 次回スキル実行時に再度ヒアリング

### Xステータスの意味

Xステータスは **note/brain 告知ツイートのステータス** を表す。日常4本ツイート・引用RT・バズ宣伝リプは `x/scheduled/YYYYMMDD.json` と Typefully で管理され、Notion には記録しない。

### 連携フロー

**note → X:**
1. `/note-run` が記事を完成させる
2. Notion の `Xステータス` を **未投稿** にセット（自動）
3. `/x-run` 起動時に未投稿記事を自動検知 → ツイート生成
4. 投稿後に `Xステータス` を **投稿済み** に更新

**note → Brain:**
1. `/note-run` が記事を完成させる（実録・ノウハウタイプのみ Brain 化推奨）
2. note 投稿後、`/brain-run` でドラフト生成
3. `brain/today/` に本文・メタ情報を出力
4. ユーザーが手動で Brain に投稿（自動投稿は reCAPTCHA のためリスク高）
5. 投稿後に Notion の `Brainステータス` を **投稿済み** に更新

**X → note:**
1. `/x-run trend` でトレンドをスキャン
2. 「記事化すべき」ネタを Notion ネタ帳に **X発案** として追加（自動）
3. `/note-run` がネタ帳の X発案ネタを優先ピックアップ

## フォルダ構成

```
content-pipeline/
  today/                        # 最新投稿用（常にここを開く）
                                # 次回 /note-run 実行時に自動で正規フォルダへ移動
  context/                      # 共有コンテキスト
    note-profile.md             # note プロフィール
    x-profile.md                # X アカウントプロフィール
    brain-profile.md            # Brain プロフィール（3パターン・ガイド）
    note-strategy.md            # note 収益化戦略
    x-strategy.md               # X 運用戦略
    brain-strategy.md           # Brain 運用戦略・商品ラインナップ計画
    voice-samples.md            # 文体サンプル
    note-performance.md         # note パフォーマンスデータ
    x-performance.md            # X パフォーマンスデータ
    existing-articles.md        # 既存記事一覧
  note/
    drafts/jituroku/            # 実録記事草稿
    drafts/sokuho/              # 速報記事草稿
    drafts/knowhow/             # ノウハウ記事草稿
    drafts/research/            # リサーチ結果
    published/                  # 投稿済みログ
  x/
    drafts/singles/             # 単発ツイート草稿
    drafts/threads/             # スレッドツイート草稿
    published/                  # 投稿済みログ
  brain/
    today/                      # 最新 Brain 用ドラフト（すぐ開ける場所）
    drafts/jituroku/            # 実録記事の Brain 草稿バックアップ
    drafts/knowhow/             # ノウハウ記事の Brain 草稿バックアップ
    published/                  # 投稿済みログ
  .claude/skills/
    note-run/SKILL.md           # /note-run スキル定義
    x-run/SKILL.md              # /x-run スキル定義
    brain-run/SKILL.md          # /brain-run スキル定義
    content-engine/SKILL.md     # /content-engine スキル定義
  .github/prompts/              # 記事タイプ別プロンプト
  .github/workflows/            # GitHub Actions
  gemini_prompt_guide.md        # サムネイル生成ガイド
```
