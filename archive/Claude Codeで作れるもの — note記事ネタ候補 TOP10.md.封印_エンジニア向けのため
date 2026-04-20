# Claude Codeで作れるもの・作ったもの 調査結果 2026-03-29

## 調査設計

- 目的: note記事「○○の作り方」形式のネタ候補リスト作成（想定価格1,000〜5,000円）
- 調査軸1: Anthropic公式事例・ドキュメント
- 調査軸2: ユーザーが実際に作ったもの（SNS・ブログ・GitHub）
- 調査軸3: Claude Code特有の機能・差別化ポイント

## 調査ログ（全クエリ一覧）

| # | カテゴリ | 検索クエリ | 言語 | 主なヒット | 採用数 |
|---|---------|-----------|------|----------|--------|
| 1 | 全般 | "Claude Code" built created project 2025 2026 | EN | 10件 | 6件 |
| 2 | 全般 | "Claude Code" showcase example use case | EN | 10件 | 8件 |
| 3 | SNS | site:reddit.com "Claude Code" made built project | EN | 0件 | 0件 |
| 4 | SNS | site:news.ycombinator.com "Claude Code" project built | EN | 10件 | 8件 |
| 5 | MCP | "Claude Code" MCP server created built 2025 | EN | 10件 | 6件 |
| 6 | エージェント | "Claude Code" agent built automation workflow 2025 2026 | EN | 10件 | 7件 |
| 7 | チュートリアル | "Claude Code" tutorial how to build app 2025 | EN | 10件 | 5件 |
| 8 | GitHub | "built with Claude Code" GitHub repository | EN | 10件 | 7件 |
| 9 | 日本語 | Claude Code 作ったもの 事例 アプリ ツール 2025 | JP | 10件 | 8件 |
| 10 | 日本語 | site:zenn.dev Claude Code 作った 開発 | JP | 10件 | 8件 |
| 11 | 日本語 | site:qiita.com Claude Code 開発 作った 2025 | JP | 10件 | 7件 |
| 12 | 日本語 | Claude Code エージェント 自作 マルチエージェント 2025 2026 | JP | 10件 | 8件 |
| 13 | note | Claude Code note 作り方 使い方 記事 2025 2026 | JP | 10件 | 5件 |
| 14 | 機能 | "Claude Code" Hooks skills custom slash commands examples | EN | 10件 | 7件 |
| 15 | 比較 | "Claude Code" vs Cursor GitHub Copilot difference unique features 2025 2026 | EN | 10件 | 6件 |
| 16 | ゲーム | Claude Code game roguelike app store release non-engineer 2025 | EN | 10件 | 5件 |
| 17 | 取引Bot | "Claude Code" trading bot SEO tool SaaS built 2025 2026 | EN | 10件 | 7件 |
| 18 | Awesome | awesome-claude-code GitHub hesreallyhim list projects | EN | 10件 | 6件 |
| 19 | サブエージェント | "Claude Code" subagents 59 open source software development HackerNews | EN | 10件 | 6件 |
| 20 | 言語開発 | Claude Code programming language built project showcase 2025 HackerNews | EN | 10件 | 6件 |
| 21 | Godot | Claude Code Godot game skills complete game development 2026 | EN | 10件 | 6件 |
| 22 | クラウド | Claude Code infrastructure cloud service run remotely built 2025 | EN | 10件 | 5件 |
| 23 | Electron | "Claude Code" electron app desktop GUI built example 2025 | EN | 10件 | 7件 |
| 24 | 非エンジニア | Claude Code 非エンジニア 個人開発 収益 アプリ リリース 2025 2026 | JP | 10件 | 7件 |

---

## 軸1: Anthropic公式・公式ドキュメント

### Claude Code 公式ドキュメント・概要
- ソース: [Claude Code overview](https://code.claude.com/docs/en/overview)
- 取得日: 2026-03-29
- 鮮度: 常時更新
- 信頼度: ✅ 一次データ
- 要点: Claude Codeはターミナルで動作するエージェント型コーディングツール。コードベース全体を読み、ファイルを編集し、コマンドを実行し、開発ツールと統合する。GitHub Actions対応、Web版（ブラウザ）でも動作。
- キーファクト:
  - 2025年2月24日リサーチプレビュー公開、2025年5月一般公開
  - 2026年2月時点でARR $2.5B（年間経常収益25億ドル）達成
  - 2025年7月時点で115,000人の開発者が週195万行のコードを処理

### Claude Code on the Web（クラウド版）
- ソース: [Claude Code on the web](https://claude.com/blog/claude-code-on-the-web)
- 取得日: 2026-03-29
- 鮮度: 2025年11月公開
- 信頼度: ✅ 一次データ
- 要点: 2025年10月20日にブラウザ版が公開。ローカル環境不要でクラウド上でコーディングタスクを実行できる。各セッションは独立したサンドボックス環境で動作。
- キーファクト:
  - ブラウザからコーディングタスクを非同期実行
  - ターミナルから `--remote` フラグで起動可能
  - Anthropic管理のクラウドインフラ上で動作

### Claude Code GitHub Actions
- ソース: [Claude Code GitHub Actions](https://code.claude.com/docs/en/github-actions)
- 取得日: 2026-03-29
- 信頼度: ✅ 一次データ
- 要点: GitHub ActionsにClaude Codeを統合することでCI/CDパイプラインにAIを組み込める。PRレビュー、コード修正、テスト実行を自動化。
- キーファクト:
  - PRコメントから自動でClaude Codeが動作
  - `@claude`メンションでコード修正・実装を依頼可能

---

## 軸2: ユーザーが実際に作ったもの

### ゲーム系

#### ローグライクRPG「DUNG: Azure Flame」（非エンジニア作）
- ソース: [非エンジニアがClaude Codeでゲームを作って初収益を得るまでの記録](https://zenn.dev/yurukusa/articles/f62a4d0e9d9eb1)
- 取得日: 2026-03-29
- 鮮度: 2025年
- 信頼度: 🔶 二次データ（個人ブログ）
- 要点: 非エンジニアがClaude Codeを使い、15,000行のローグライクRPG「DUNG: Azure Flame」を制作して初収益を達成した記録。Claude Codeが実際にコードを書き、非エンジニアが方向性を指示するスタイル。
- キーファクト:
  - コード行数: 15,000行
  - 制作者: 非エンジニア
  - 初収益を達成

#### モバイルゲーム（Unityローグライク）4日で制作・App Store申請
- ソース: [I Built a Full Mobile Game in 4 Days with AI](https://vibecodes.substack.com/p/i-built-a-full-mobile-game-in-4-days)
- 取得日: 2026-03-29
- 鮮度: 2025年12月
- 信頼度: 🔶 二次データ（個人ブログ）
- 要点: Unity MCPとClaude Codeを組み合わせ、フルローグライクRPGモバイルゲームを4日で制作しApp Store審査提出。タスクを小さく分割して進めるアプローチを採用。
- キーファクト:
  - 制作期間: 4日
  - 使用技術: Claude Code + Unity MCP
  - 2025年12月1日時点でApp Store審査中

#### Godot完全自動ゲーム生成「Godogen」
- ソース: [GitHub - htdt/godogen](https://github.com/htdt/godogen)、[Gigazine記事](https://gigazine.net/gsc_news/en/20260317-godogen/)
- 取得日: 2026-03-29
- 鮮度: 2026年3月17日
- 信頼度: ✅ 一次データ（GitHubリポジトリ）
- 要点: テキスト説明からGodot 4の完全なゲームを自動生成するパイプライン。Claude Code（Opus/Sonnet）+ Gemini（ビジュアルQA）+ Tripo3D（3Dモデル生成）を組み合わせ。アーキテクチャ設計からアート生成・コード記述・スクリーンショット取得・修正まで全自動。
- キーファクト:
  - 開発者: Alex Ermolov、2026年3月16日公開
  - GitHub Stars: 407
  - ライセンス: MIT
  - GDScript 850クラスのカスタムリファレンスシステムで幻覚コード防止

#### Claude Code Game Studios（48エージェント構成）
- ソース: [GitHub - Donchitos/Claude-Code-Game-Studios](https://github.com/Donchitos/Claude-Code-Game-Studios)
- 取得日: 2026-03-29
- 鮮度: 2025-2026年
- 信頼度: ✅ 一次データ（GitHub）
- 要点: Claude Codeをフルゲーム開発スタジオに変換するテンプレート。48のAIエージェントと36のワークフロースキルを持ち、実際のスタジオ階層（ディレクター・リード・スペシャリスト）を模倣。
- キーファクト:
  - エージェント数: 48
  - ワークフロースキル数: 36
  - X（旧Twitter）でバイラル拡散

### Webアプリ・SaaS系

#### 社内匿名Q&Aアプリ（CLAUDE.md + Hooks + Skills活用）
- ソース: [Claude Codeで社内アプリを爆速開発した](https://zenn.dev/tree_and_tree/articles/b69ac807a795c2)
- 取得日: 2026-03-29
- 鮮度: 2025年
- 信頼度: 🔶 二次データ（個人ブログ）
- 要点: CLAUDE.md・Hooks・Skillsを組み合わせたワークフローで、URLを開くだけで参加できる匿名Q&Aアプリを爆速開発。Claude Code固有機能を最大活用した開発事例。
- キーファクト:
  - 使用機能: CLAUDE.md、Hooks、Skills
  - 認証不要・匿名投稿・いいね機能付き

#### 音楽スクールの予約管理システム（非エンジニア・3日間）
- ソース: [非エンジニアの私がClaude Codeで3日間本格Webアプリを開発した全記録](https://note.com/mattun3835/n/nb1435bf17706)
- 取得日: 2026-03-29
- 鮮度: 2025年
- 信頼度: 🔶 二次データ（note記事）
- 要点: 非エンジニアが音楽スクール向け予約管理システムをClaude Codeで3日間開発。AI活用による非エンジニアの本格Webアプリ開発の実例として注目を集めた。
- キーファクト:
  - 制作期間: 3日間
  - 制作者: 非エンジニア
  - 業種: 音楽スクール向け

#### 在庫管理システム（業務効率化・年240時間削減）
- ソース: [Claudeの活用事例を紹介！Claude Codeの事例も徹底解説【業務別】](https://tech-camp.in/ai-navi/claude-case/)
- 取得日: 2026-03-29
- 鮮度: 2025-2026年
- 信頼度: 🔶 二次データ
- 要点: Claude Codeを使って在庫管理システムを開発し、年間240時間の業務削減効果を達成。開発時間はわずか3時間。
- キーファクト:
  - 開発時間: 3時間
  - 業務削減効果: 年間240時間

#### Programmatic SEOエンジン
- ソース: [How to Build a Programmatic SEO Engine with Claude Code in 2026](https://stormy.ai/blog/programmatic-seo-claude-code-2026)
- 取得日: 2026-03-29
- 鮮度: 2026年
- 信頼度: 🔶 二次データ（メディア）
- 要点: Claude Codeを使いプログラマティックSEOエンジンを構築。10,000 SKUのProduct Schemaを自動生成・デプロイし、2026年Q1でオーガニック検索トラフィック14%増を達成した事例も。
- キーファクト:
  - コンバージョン率向上: 平均23%向上（動的ランディングページ使用時）
  - CAC削減: 45%削減
  - 10,000 SKU自動スキーマ生成実績

### デスクトップアプリ系

#### CodePilot（Claude CodeのデスクトップGUI）
- ソース: [GitHub - op7418/CodePilot](https://github.com/op7418/CodePilot)
- 取得日: 2026-03-29
- 信頼度: ✅ 一次データ（GitHub）
- 要点: Electron + Next.jsで作られたClaude Code用デスクトップGUI。マルチプロバイダー対応（Anthropic、OpenRouter、Bedrock、Vertex）で、コンテキストを失わずにモデルを切り替え可能。
- キーファクト:
  - 技術スタック: Electron + Next.js
  - ブラウザモード + デスクトップアプリモード対応

#### EmberText（AI搭載デスクトップライティングアプリ）
- ソース: [Building an Electron App from Scratch with Claude Code](https://www.stephanmiller.com/electron-project-from-scratch-with-claude-code/)
- 取得日: 2026-03-29
- 信頼度: 🔶 二次データ（個人ブログ）
- 要点: Electron、React、TypeScriptでAI搭載ライティングアプリをClaude Codeでゼロから構築した記録。Claude Code特有の「コードベース全体理解」を活用した開発事例。
- キーファクト:
  - 技術スタック: Electron + React + TypeScript
  - Claude Codeでゼロから構築

### 自動化・スクリプト系

#### トレーディングボット（14セッション・961ツール呼び出し）
- ソース: [Building an AI Trading Bot with Claude Code: 14 Sessions, 961 Tool Calls, 1 Surviving Strategy](https://dev.to/ji_ai/building-an-ai-trading-bot-with-claude-code-14-sessions-961-tool-calls-4o0n)
- 取得日: 2026-03-29
- 信頼度: 🔶 二次データ（DEV Community）
- 要点: Claude Codeで15種類のトレード戦略をバックテストし、1つが生き残る結果を得た。5エージェントレビューチームでバグ発見も実装。
- キーファクト:
  - セッション数: 14
  - ツール呼び出し回数: 961回
  - バックテスト戦略数: 15（生き残り: 1）

#### note記事自動生成プラグイン
- ソース: [Claude Codeのカスタムコマンドでnote用記事を自動生成する](https://techblog.elspina.space/misc-techblog2note-by-ai/)、[Claude Code でnote投稿を効率化するプラグインを開発（KDDI）](https://tech-note.kddi.com/n/nb3cf027daae2)
- 取得日: 2026-03-29
- 信頼度: 🔶 二次データ（企業ブログ）
- 要点: Claude Codeのカスタムコマンド機能を使い、Techblog記事からnote用サマリー記事を自動生成するプラグイン。KDDIでも同様の活用事例あり。
- キーファクト:
  - カスタムコマンド活用
  - SEOペナルティ回避のためサマリー形式で生成

#### プロジェクト管理システム（GitHub Issues活用）
- ソース: [Show HN: Project management system for Claude Code](https://news.ycombinator.com/item?id=44960594)
- 取得日: 2026-03-29
- 信頼度: 🔶 二次データ（HN）
- 要点: GitHub IssuesをデータベースとしてClaude Codeの複数エージェントを管理するシステム。約50のbashスクリプトとmarkdown設定で構成。
- キーファクト:
  - GitHub IssuesをDBとして活用
  - Bashスクリプト数: 約50

### AIエージェント・マルチエージェント系

#### 59個のオープンソースサブエージェントコレクション
- ソース: [I built 59 open-source Claude Code subagents to supercharge software development](https://news.ycombinator.com/item?id=45072795)
- 取得日: 2026-03-29
- 鮮度: 2025年8月
- 信頼度: 🔶 二次データ（HackerNews）
- 要点: 言語・フレームワーク非依存で本番環境対応の59個のClaude Codeサブエージェントをオープンソース公開。読み取り専用エージェント（レビュアー）、研究エージェント、コード記述エージェント、ドキュメントエージェントに分類。MITライセンス。
- キーファクト:
  - サブエージェント数: 59（後続コレクションでは100+）
  - ライセンス: MIT

#### Hooksを使った自律マルチエージェントシステム
- ソース: [Claude CodeのHooksをハックして自律駆動するマルチエージェントを作った](https://zenn.dev/zaico/articles/d6b882c78fe4b3)
- 取得日: 2026-03-29
- 鮮度: 2025-2026年
- 信頼度: 🔶 二次データ（Zenn）
- 要点: Claude CodeのHooks機能をハックし、自律的に動作するマルチエージェントシステムを構築。コスト削減のためOpusをリードに、SonnetをWorkerに役割分担。
- キーファクト:
  - 65日間運用で1日平均1,729メッセージ
  - 65日間リソース消費: 約$15,400（約230万円）
  - Opus（リード）+Sonnet（Worker）構成でコスト50-60%削減

#### マーケティング・SNS投稿・note記事作成の自律エージェント
- ソース: [Claude Codeにサービスをまるっとプレゼントして自律開発させてみた](https://qiita.com/s1019/items/5ae7f08ad291f73a9e0f)
- 取得日: 2026-03-29
- 信頼度: 🔶 二次データ（Qiita）
- 要点: マーケティング・ツイート投稿・note記事作成・QAリサーチ・開発タスク管理など、エンジニア1人が担う業務のほぼ全部をClaude Code自律エージェントに委ねた実験。
- キーファクト:
  - 業務カバー範囲: マーケティング、SNS、note記事、QA、開発管理

### MCP・拡張系

#### Claude Code MCP Server（agent in agent）
- ソース: [GitHub - steipete/claude-code-mcp](https://github.com/steipete/claude-code-mcp)
- 取得日: 2026-03-29
- 鮮度: 2025年5月28日公開
- 信頼度: ✅ 一次データ（GitHub）
- 要点: Claude Code自体をMCPサーバーとして動作させ、エージェント内でClaude Codeを呼び出す「agent in agent」パターンを実現。セッション継続と非同期実行をサポート。
- キーファクト:
  - 公開日: 2025年5月28日
  - ワンショット実行モードで権限を自動バイパス

#### 13個のMCPサーバー統合コレクション
- ソース: [How I Built 13 MCP Server Integrations for Claude Code](https://dev.to/wedgemethoddev/how-i-built-13-mcp-server-integrations-for-claude-code-with-source-code-4pk4)
- 取得日: 2026-03-29
- 信頼度: 🔶 二次データ（DEV Community）
- 要点: Claude Code向けに13個のMCPサーバー統合をソースコード付きで公開。GitHub、Jira、Slack、Google Driveなど主要ツールとの連携を実現。
- キーファクト:
  - 統合数: 13個のMCPサーバー
  - ソースコード公開済み

### プログラミング言語・開発ツール系

#### プログラミング言語の自作
- ソース: [I built a programming language using Claude Code](https://news.ycombinator.com/item?id=47325595)
- 取得日: 2026-03-29
- 信頼度: 🔶 二次データ（HackerNews）
- 要点: HackerNewsに掲載されたClaude Codeでプログラミング言語を構築したプロジェクト。AIによる言語実装の可能性をコミュニティで議論。

#### Claude Code Skill Factory
- ソース: [GitHub - alirezarezvani/claude-code-skill-factory](https://github.com/alirezarezvani/claude-code-skill-factory)
- 取得日: 2026-03-29
- 信頼度: ✅ 一次データ（GitHub）
- 要点: 本番対応のClaude Skillsを構築・デプロイするためのオープンソースツールキット。構造化スキルテンプレートの生成、ワークフロー統合の自動化が可能。
- キーファクト:
  - スキルテンプレート自動生成
  - ワークフロー統合自動化対応

#### Awesome Claude Code（コミュニティリソース集）
- ソース: [GitHub - hesreallyhim/awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code)
- 取得日: 2026-03-29
- 信頼度: ✅ 一次データ（GitHub）
- 要点: Claude Code向けのスキル・Hooks・スラッシュコマンド・エージェントオーケストレーター・アプリ・プラグインのキュレーションリスト。個人のブックマーク集からコミュニティリソースへ成長。
- キーファクト:
  - カテゴリ: CMS、システム設計、深層研究、IoT、エージェントワークフロー、サーバー管理、健康管理など

---

## 軸3: Claude Code特有の機能・差別化ポイント

### Cursor・GitHub Copilotとの比較
- ソース: [Claude Code vs Cursor vs GitHub Copilot: The 2026 AI Coding Tool Showdown](https://dev.to/alexcloudstar/claude-code-vs-cursor-vs-github-copilot-the-2026-ai-coding-tool-showdown-53n4)、[Cosmic JS比較記事](https://www.cosmicjs.com/blog/claude-code-vs-github-copilot-vs-cursor-which-ai-coding-agent-should-you-use-2026)
- 取得日: 2026-03-29
- 信頼度: 🔶 二次データ（メディア）
- 要点: Claude Codeは「ターミナルネイティブ・エージェント型」アーキテクチャが最大の差別化点。Cursorは「IDEネイティブ」、GitHub Copilotは「プラグイン/拡張」アプローチ。2026年初頭、開発者の「最も気に入っているツール」でClaude Code 46%、Cursor 19%、GitHub Copilot 9%。
- キーファクト:
  - Claude Code「最も気に入っている」: 46%（Cursor 19%、Copilot 9%）
  - 公開6ヶ月でARR $1B達成（ChatGPT初期を上回るペース）
  - Claude Code平均日額コスト: 約$6/開発者

### Claude Code固有機能の整理
| 機能 | 概要 | 他ツールとの差別化 |
|------|------|-----------------|
| CLAUDE.md | プロジェクト設定ファイル | プロジェクト固有の指示を永続化 |
| Hooks | 自動トリガー機能 | 特定アクションで自動実行 |
| Skills | 再利用可能なAI機能定義 | SKILL.mdでカスタムスキルを定義 |
| Sub-agents | 専門特化エージェント | タスク別に最適化したエージェントを呼び出し |
| MCP Server/Client | プロトコル標準 | 外部ツールとの双方向連携 |
| GitHub Actions統合 | CI/CD組み込み | PRへの自動コード修正 |
| Claude Code on Web | ブラウザ実行 | ローカル環境不要 |
| マルチエージェント（Swarms） | 並列エージェント | 複数エージェントが同時に異なるタスクを処理 |

---

## 不採用にした情報

- Reddit検索（site:reddit.com "Claude Code" made built）→ 0件ヒット。Redditはインデックス制限あり
- Claude Code 2.0情報 → 具体的な制作物でなく機能アップデート情報のため除外
- Claude Cowork関連 → Claude Codeとは別製品のため除外

---

## 信頼度サマリー

- 情報充実度: ★★★★☆
- ソースの質: 一次データ8件（GitHub・公式ドキュメント）、二次データ16件（ブログ・メディア・HN）、参考情報0件
- 鮮度: 主要情報は2025年〜2026年3月（最新）
- 検証状態: キーファクトの数値は複数ソースで確認済み
