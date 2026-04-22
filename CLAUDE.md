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
- 外部リンクは本文ではなく**リプライ**に置く（本文直埋めでリーチ30〜90%低下）
- 画像または動画を**必ず添付**（テキストのみは不利）
- ハッシュタグは 0〜2 個まで
- 宣伝感を出さない。体験・実況が軸
- **送信はユーザーが行う。スキルはドラフトを生成するだけ**

## スキル

- `/content` : ~~全自動パイプライン~~（非推奨: コンテキスト枯渇で品質低下するため）。個別実行を推奨: `/collect-stats` → `/note-run` → `/content-engine` → `/x-run` → `/brain-run`
- `/note-run` : note記事のみ生成。トピック選定→競合調査→記事生成→編集→最終稿出力
- `/x-run` : 毎日実行で翌日の X 予約投稿を生成→承認→Typefully送信する自動パイプライン。日常4本（朝/昼/夜前半/夜後半）+ 引用RT 0〜3本（AI全般公式アカウント対象）
- `/brain-run` : noteで作った記事を Brain 向けに拡張リライトして販売ドラフト生成。コード全文・プロンプト全文・テンプレ付きの ¥1,980〜版を brain/today/ に出力。投稿は手動
- `/content-engine` : 1ネタ→複数フォーマット展開。note草稿からXスレッド・単発ツイート・カードテキストを一括生成
- `/collect-stats` : X Analytics・noteダッシュボードをブラウザ操作でデータ収集。x-performance.md / note-performance.md / Notion を自動更新

## Notion連携

### 共有DB
| DB | data_source | 用途 |
|---|---|---|
| note記事管理 | `collection://812aa728-8d3e-42e4-a9cd-6a91c303b2c2` | 記事ステータス・Xステータス管理 |
| ネタ帳 | `collection://1a603b4f-d1e4-4ed7-8c75-c7c0a5b7e595` | X発案ネタ・未使用ネタのストック |

### note記事DBの追加フィールド（x-pipeline用）
| フィールド名 | タイプ | 値の選択肢 |
|---|---|---|
| `Xステータス` | select | 未投稿 / 草稿完成 / 投稿済み |
| `X草稿パス` | text | ドラフトファイルの絶対パス |
| `XURL` | url | 投稿後の X ポスト URL |

### note記事DBの追加フィールド（brain-pipeline用）
| フィールド名 | タイプ | 値の選択肢 |
|---|---|---|
| `Brainステータス` | select | 未作成 / 草稿完成 / 投稿済み |
| `Brain 草稿パス` | text | ドラフトファイルの絶対パス |
| `Brain URL` | url | 投稿後の Brain 商品ページ URL |
| `Brain 価格` | number | ¥ |
| `Brain 還元率` | number | % |
| `Brain 公開日` | date | 投稿日 |
| `Brain 売上` | number | 月次更新 |

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
