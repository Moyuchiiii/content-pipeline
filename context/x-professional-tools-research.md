# プロフェッショナルX運用ツール・スキル・OSS調査（2026-04-23）

調査担当: sasaki-search
調査期間: 2026-04-23
調査方法: WebSearch + WebFetch による実在確認済み（記憶ベース情報なし）

---

## X API 2026年の現状（前提知識）

2026年2月6日より、X APIはサブスクリプション制からデフォルト**従量課金（pay-per-use）**に移行。新規開発者は固定月額プランに加入不可。

| 操作 | 2026年4月時点の単価 |
|---|---|
| 投稿作成 (Write) | $0.015/件（4/20改定、旧$0.01） |
| 投稿読み取り (Read) | $0.005/件 |
| 自己投稿・フォロワー等（Owned Reads） | $0.001/件 |
| URLを含む投稿 | $0.20/件（召喚リプライは$0.01） |
| 月間読み取り上限（pay-per-use） | 200万件（超過時Enterprise要） |

**旧固定プラン（既存加入者のみ継続可）**

| ティア | 月額 | 読み取り/月 | 書き込み/月 |
|---|---|---|---|
| Free | $0 | 約500件（実質不可） | 1,500件 |
| Basic | $100 | 10,000件 | 3,000件（7日間検索のみ） |
| Pro | $5,000 | 1,000,000件 | 無制限（全アーカイブ検索可） |
| Enterprise | $42,000+ | カスタム | カスタム |

**結論**: hyui の Typefully 連携は "Write only" なので従量課金は月$1前後で抑えられる。Read（分析・競合監視）は代替APIか無料ツールで補うのが費用対効果が高い。

参照: https://devcommunity.x.com/t/x-api-pricing-update-owned-reads-now-0-001-other-changes-effective-april-20-2026/263025

---

## Category A: Claude Code / AI系 X運用スキル

### A-1. x-research-skill（rohunvora）

- **GitHub**: https://github.com/rohunvora/x-research-skill
- **スター数**: 1,100+（1.1k）
- **言語**: TypeScript 100%
- **コスト**: 検索1ページ≒$0.50。キャッシュ機能で節約可能
- **機能**:
  - エンゲージメント順ソート・時間フィルタリング付き検索
  - ウォッチリスト（複数アカウント監視）
  - スレッド完全取得・会話追跡
  - ユーザープロフィール最新ツイート表示
  - キャッシュで重複API課金防止
- **必要なもの**: X API Bearer Token（読み取り用）
- **セキュリティ注意**: AIエージェント使用時にトークンがセッションログに記録される可能性あり
- **hyui組込可否**: ○ 競合19アカウント監視・バズ検知の強化に直接使える。Chrome MCP監視の代替または補完として有力

---

### A-2. claude-skill-twitter（PHY041）

- **GitHub**: https://github.com/PHY041/claude-skill-twitter
- **スター数**: 3（新規リリース）
- **コア技術**: `rnet`（Rust製HTTPクライアント）によるChrome TLSフィンガープリントでCloudflareをバイパス
- **X APIキー不要**（ブラウザクッキーのみで動作）
- **3つのサブスキル**:
  1. **twitter-cultivate**: アカウント成長システム。TweepCredヘルススコアリング・シャドウバン検知・アンフォロー推奨・アルゴリズム最適化投稿
  2. **twitter-intel**: キーワード検索エンジン。1クエリ200+ツイート取得・エンゲージメントフィルタリング・時系列トレンド分析
  3. **twitter-x-gtm**: コンテンツ戦略ツールキット。フック公式・コンテンツミックス・スレッドテンプレート・イベントコンテンツプレイブック
- **hyui組込可否**: ◎ APIキー不要で3スキルすべてhyuiの /x-run に統合可能。特に twitter-cultivate（シャドウバン検知）と twitter-x-gtm（フック公式）は直接組み込む価値が高い

---

### A-3. Xquik x-twitter-scraper

- **GitHub**: https://github.com/Xquik-dev/x-twitter-scraper
- **スター数**: 53
- **言語**: JavaScript 99.6%
- **MCP統合**: 2つのMCPツール搭載
- **機能規模**: 111 REST APIエンドポイント、23種類の抽出機能
- **機能詳細**:
  - ツイート検索・ルックアップ
  - ユーザープロフィール取得
  - フォロワー・フォロー中ユーザー抽出
  - リプライ・RT・引用ツイート抽出
  - アカウント監視 + Webhook配信（無料）
  - DM履歴取得
  - メディアダウンロード
- **料金**: $0.00015/読み取り（公式X APIの33倍安い）、月$20〜
- **hyui組込可否**: ○ 競合分析・フォロワー調査に使える。MCP対応なのでClaude Codeから直接呼び出し可能

---

### A-4. mcpmarket.com のX系スキル群

mcpmarket.com（Claude Codeスキルマーケットプレイス）で確認できたX関連スキル:

| スキル名 | URL | 特徴 |
|---|---|---|
| X (Twitter) Automation | https://mcpmarket.com/tools/skills/x-twitter-automation | 33コマンド、X API v2統合 |
| X (Twitter) Automation Pro | https://mcpmarket.com/tools/skills/x-twitter-automation-pro | ChromeDevToolsProtocol経由のブラウザ自動化、Markdownアーティクル投稿対応 |
| X Integration (Browser) | https://mcpmarket.com/tools/skills/x-twitter-integration | ブラウザ自動化でAPI費用を回避 |
| X Scraper by Xquik | https://mcpmarket.com/tools/skills/x-twitter-scraper-by-xquik | 上記Xquikスキルのマーケット版 |

---

### A-5. ComposioHQ awesome-claude-skills のX系スキル

- **GitHub**: https://github.com/ComposioHQ/awesome-claude-skills（55.6kスター）
- **Twitter Algorithm Optimizer**: Twitterのオープンソースアルゴリズムを解析・活用してリーチを最大化。既存ツイートのリライトと編集
- **Twitter Automation**: ツイート・検索・ユーザー・リスト・エンゲージメントの自動化

---

### A-6. Typefully 公式スキル（VoltAgent awesome-agent-skills）

- **URL**: https://officialskills.sh/typefully/skills/typefully
- **機能**: X / LinkedIn / Threads / Bluesky / Mastodon へのコンテンツ作成・スケジュール・投稿
- **hyui組込可否**: ◎ Typefullyをすでに使っているhyuiにとって、Claude Codeから直接Typefully APIを操作できる正式スキル

---

## Category B: OSS GitHub リポ（高スター・活発）

| リポジトリ | URL | スター数 | 最終更新 | 言語 | 主要機能 |
|---|---|---|---|---|---|
| tweepy/tweepy | https://github.com/tweepy/tweepy | 11,100+ | 2025年6月（v4.16.0） | Python | X API v2完全対応、非同期処理、MITライセンス |
| PLhery/node-twitter-api-v2 | https://github.com/PLhery/node-twitter-api-v2 | 1,600+ | 2025年11月（v1.28.0） | TypeScript 97.8% | v1.1/v2完全対応、依存ゼロ23KB、ストリーミング対応 |
| vladkens/twscrape | https://github.com/vladkens/twscrape | 2,400+ | 2025年4月（v0.17.0） | Python | GraphQL/検索API実装、公式APIキー不要、非同期対応 |
| d60/twikit | https://github.com/d60/twikit | 4,300+ | 2025年2月（v2.3.1） | Python | 内部API使用、APIキー不要、DM送信可、2025年11月以降Cloudflareブロックで不安定 |
| rohunvora/x-research-skill | https://github.com/rohunvora/x-research-skill | 1,100+ | 2025年内 | TypeScript | Claude Code/OpenClaw向け調査スキル（Category A参照） |
| enescingoz/awesome-n8n-templates | https://github.com/enescingoz/awesome-n8n-templates | 21,400+ | 2026年3月 | - | 280+テンプレート、X関連5本含む |
| privatenumber/snap-tweet | https://github.com/privatenumber/snap-tweet | 記載なし | 2025年内 | TypeScript | ツイートスクリーンショットOSS |
| gkamradt/twitter-reply-bot | https://github.com/gkamradt/twitter-reply-bot | 66 | 2023年 | Python | LLM使用自動返信ボット（古め） |

### スクレイピングツール状況（2026年4月）

- **snscrape**: 引き続き動作するが信頼性低下。HTML構造変化に脆弱
- **twikit**: 4,300スター。2025年11月以降Cloudflareブロックで不安定。使用前に最新状況確認要
- **twscrape**: 2,400スター。現時点で最も安定。GraphQL APIを使用、複数アカウントで自動ローテーション
- **twint**: 非推奨・実質動作不可

### OSS高スターリポ（周辺）

| リポジトリ | URL | スター数 | メモ |
|---|---|---|---|
| fa0311/AwesomeTwitterUndocumentedAPI | https://github.com/fa0311/AwesomeTwitterUndocumentedAPI | 記載なし | 非公開APIリスト（参考） |
| awesome-n8n-templates | https://github.com/enescingoz/awesome-n8n-templates | 21,400+ | X投稿自動化テンプレート含む |

---

## Category C: Typefully 以外の主要ツール（比較）

### C-1. Typefully（現在hyuiが使用中）

- **URL**: https://typefully.com
- **料金**: 無料プランあり、Creator $19/月〜
- **API**: あり（公開API + MCP統合）
- **強み**: ライティング特化、AIドラフト生成・フック改善、スレッド作成、X/LinkedIn/Threads/Bluesky/Mastodon対応
- **制限**: メンション取得・返信管理機能なし

---

### C-2. Hypefury

- **URL**: https://hypefury.com
- **料金**:
  - Starter: $29/月（$250/年）
  - Creator: $65/月（$590/年）★最人気
  - Business: $97/月（$890/年）
  - Agency: $199/月（$1,800/年）
  - 全プラン7日間無料トライアル
- **API**: なし（公開APIなし）
- **AI機能**: なし（コンテンツ作成は手動）
- **独自グロース機能**:
  - Smart Engaging: ニッチアカウントへの返信を30分で30件支援
  - Autoplugs: エンゲージメント閾値到達時に自動プロモーションリプライ
  - Auto-Repost: エバーグリーン再投稿（Auto-Unpostで重複削除）
  - Auto DM: 最大400件/日（Agencyプラン）
  - Tweet to Reels: ツイートを動画化（Business以上）
- **Typefullyとの比較**: Typefullyはライティング特化、HypefuryはエンゲージメントとDM特化。APIなしのため自動化パイプラインには組み込み不可
- **hyui向け評価**: Typefullyと完全に補完関係。Auto DMとAutoplugsは1,000フォロワー以降に強力

---

### C-3. Tweet Hunter / Taplio

- **URL**: https://tweethunter.io / https://taplio.com
- **料金（Tweet Hunter）**:
  - Discover: $29/月
  - Grow: $49/月（最多選択）
  - Enterprise: $199/月
  - 7日間無料トライアル
- **API**: ページ上の明記なし（内部APIの可能性あり）
- **AI機能**: 
  - 2,000,000+バイラルツイートライブラリへのアクセス
  - AIライター（日次ツイート生成・リライト・スレッドフック）
  - カスタムAIモデル訓練（Enterprise）
  - AI生成リプライ（Enterprise）
  - X CRM（リスト・エンゲージメント履歴管理）
- **独自グロース機能**: Auto DM・Auto RT・Auto Plug
- **Taplio**: LinkedIn版Tweet Hunter（$39/月〜）
- **Typefullyとの比較**: Tweet HunterはAIコンテンツ生成とCRMが強い。Typefullyより高価だがバイラルコンテンツ参照ライブラリが価値あり
- **hyui向け評価**: GrowプランのバイラルライブラリとCRMは価値高いが$49/月。フォロワー100人超後の検討候補

---

### C-4. Buffer

- **URL**: https://buffer.com
- **料金**: 無料（3チャンネル、10投稿/チャンネル）、Essentials $5/月/チャンネル、Team $10/月/チャンネル
- **API**: あり
- **AI機能**: AIアシスト（キャプション生成等）
- **対応プラットフォーム**: X/Twitter・Instagram・Facebook・LinkedIn・Pinterest・TikTok・Threads・YouTube・Bluesky・Mastodon・Google Businessなど11プラットフォーム
- **Typefullyとの比較**: Bufferは多プラットフォーム管理に強いが、Xに特化した機能はTypefullyが上
- **hyui向け評価**: 将来的にInstagram/TikTokも運用する場合の候補。現状は不要

---

### C-5. SocialBee

- **URL**: https://socialbee.com
- **料金**: $29/月〜
- **AI機能**: あり
- **独自機能**: カテゴリベーススケジューリング（コンテンツを自動的にバランス配分）、エバーグリーンコンテンツリサイクル
- **Typefullyとの比較**: エバーグリーン再投稿管理に特化。Hypefuryより柔軟なカテゴリ管理
- **hyui向け評価**: エバーグリーン管理はHypefuryの代替候補

---

### C-6. Hootsuite

- **URL**: https://hootsuite.com
- **料金**: Standard $199/月、Advanced $399/月
- **API**: あり
- **hyui向け評価**: 企業向け高価格帯。副業個人クリエイターには不適

---

### C-7. Later

- **URL**: https://later.com
- **料金**: 無料プランあり、$25/月〜
- **独自機能**: 視覚的コンテンツカレンダー（Instagram重視）
- **hyui向け評価**: Instagram特化のため現状不適

---

### C-8. Blotato

- **URL**: https://blotato.com
- **料金**: Starter $29/月（1,250AIクレジット、20アカウント）、Creator $97/月（5,000クレジット）、Freemium無料トライアルあり
- **API**: あり（n8n/Make/Zapier連携対応）
- **AI機能**: Claude・GPT-4等複数モデル選択可、無制限AIライティング（全プラン）
- **独自機能**:
  - コンテンツリミックス: YouTube動画・記事・PDF→X/TikTok/Instagram等に自動変換
  - フェイスレス動画生成（ElevenLabs音声合成統合）
  - クロスプラットフォーム配信（X含む6プラットフォーム）
- **背景**: Sabrina Ramonov（0→100万フォロワー13ヶ月）が構築
- **Typefullyとの比較**: Typefullyはライティング特化、BlotatoはYouTube/記事からのリミックスと動画生成が強み
- **hyui向け評価**: note/Brain記事→X投稿への自動リミックスに直接使える。$29/月は費用対効果が高い

---

### C-9. Publer

- **URL**: https://publer.com
- **料金**: 無料（Twitter/X除外）、Professional $12/月（3アカウント）、Business $21/月
- **API**: なし（公開API）
- **AI機能**: GPT-4、DALL-E 3（Business以上）
- **独自機能**: 一括スケジュール（最大500投稿）、Xスレッド対応、エバーグリーンリサイクル、RSS自動投稿
- **hyui向け評価**: 無料プランにTwitter/Xが含まれないため割高感あり

---

## Category D: AI駆動グロースハック・分析系

### D-1. Phantombuster

- **URL**: https://phantombuster.com
- **料金**: Starter $69/月（5スロット、20時間/月）、Pro $159/月（15スロット、80時間）、Team $439/月
- **14日無料トライアル**（クレカ不要）
- **機能**: クラウドベーススクレイピング+自動化（Twitter含む）。プロフィール抽出・連絡先取得・アウトリーチ自動化
- **課金モデル**: リード数ではなく「実行時間」で課金
- **hyui向け評価**: $69/月は割高。フォロワー獲得目的の自動フォロー/エンゲージはX規約違反リスクあり。フォロワー100人以下では非推奨

---

### D-2. Circleboom

- **URL**: https://circleboom.com
- **料金（Twitter Management）**: 無料（プレビューのみ）、Limited $9.99/月、Pro $16.99/月、Plus $23.99/月（2アカウント、10万フォロワーまで）、Premium $29.99/月（2アカウント、100万フォロワーまで）
- **機能**:
  - フォロワー監査（スパム・ボット・非アクティブアカウント検出）
  - フォロー/アンフォロー管理
  - ツイート・いいね削除（アーカイブ一括削除）
  - 競合分析
  - Circleboom Publish（別料金、マルチプラットフォーム投稿管理）
- **hyui向け評価**: フォロワー質の管理とアカウント健全性確認に有用。Pro $16.99/月は費用対効果あり。1,000フォロワー超後に導入推奨

---

### D-3. Fedica（旧Audiense）

- **URL**: https://fedica.com
- **料金**: Publish $10/月（または$15/月）、Grow $24/月（または$29/月）、Research $79/月（または$129/月）、無料プランあり（10予約投稿、9プラットフォーム）
- **機能**: フォロワー増減追跡・タイムライン履歴・フォロワー詳細分析（関心・地域・アクティブ時間）・自動レポートスケジュール
- **hyui向け評価**: Grow $24/月でオーディエンスインサイト取得可能。フォロワー100人超後の本格分析に。X Analytics（無料）を超えた深掘りに有効

---

### D-4. n8n Twitter/X テンプレート

- **GitHub**: https://github.com/enescingoz/awesome-n8n-templates（21,400スター）
- **X関連テンプレート**:
  1. GPT-4コンテンツ生成 + Googleスプレッドシート管理 + 自動投稿
  2. Twitterバーチャルバナー自動生成
  3. YouTube新動画→X自動投稿
  4. バーチャルAIインフルエンサー管理
  5. Twitter Virtual AIアカウント運用
- **n8n公式テンプレート**: https://n8n.io/workflows/8010-automate-twitter-posting-with-gpt-4-content-generation-and-google-sheets-tracking/
  - 動作: 定期スケジュール実行→GPT-4でツイート生成→Google Sheets重複チェック→X投稿→履歴記録
  - コスト: n8nは無料（セルフホスト可）、OpenAI API + X API費用は別途発生
- **hyui向け評価**: ◎ 既存のTypefully APIワークフローをn8nに移植・拡張できる。セルフホスト版n8nは月額ゼロで使える

---

### D-5. Make/Zapier X (Twitter) テンプレート

- **ZapierのX統合**: 復活済み（一時停止後）。主要テンプレート:
  - Google Sheets行追加→X自動投稿
  - 新規フォロワー→スラック通知
  - X言及→CRM登録
  - RSS新記事→X自動投稿
  - X自動いいね（センチメント分析）
- **Make**: n8nと同様のX連携テンプレートあり
- **制限**: サービス自体のAPI制限に依存（投稿スケジューリング主体）

---

### D-6. AI バズ予測系（OSS実装）

実装は存在するが、いずれも古い（2018〜2022年）。2025年以降の実用的なOSSバズ予測モデルは見当たらない:

| リポジトリ | URL | 手法 | 現状 |
|---|---|---|---|
| nilabja9/TwitterBuzzML | https://github.com/nilabja9/TwitterBuzzML | ML | 古め（研究用） |
| felixpeters/tweet-engagement-prediction | https://github.com/felixpeters/tweet-engagement-prediction | Deep Learning | 古め（研究用） |
| remidomingues/Virality-Prediction | https://github.com/remidomingues/Virality-Prediction | ML | 古め（研究用） |

**代替アプローチ（2026年現実的）**: Tweet Hunterの2Mバイラルツイートライブラリを参照するか、自前でエンゲージメントデータを蓄積してパターン分析する

---

## Category E: 見落としがちな領域の深掘り

### E-1. メンション・リプ取得の自動化（Typefullyは非対応）

**現状**: Typefully API にはメンション取得・返信機能がない。

**推奨ツール**:
- **tweepy + Streaming API**: 公式X APIで `/2/tweets/search/stream` を使いリアルタイムメンション取得。ただしBasic以上($100/月)が必要
- **twscrape（OSS・無料）**: ログインアカウント使用でメンション取得可能。スター数2,400+、2025年4月更新
  - URL: https://github.com/vladkens/twscrape
- **Xquik MCP**: $0.00015/リクエストでメンション取得可能なMCPツール
- **statusbrew**: 統合インボックスで返信管理（$69/月〜）

**hyui向け推奨**: twscrapeをClaude Codeから呼び出してメンションを定期取得し、重要なメンションのみDiscord通知するカスタムスクリプトが最安

---

### E-2. フォロワー分析（誰がフォローしたか・関心分析）

**現状**: X Analytics（Premium含む）は基本分析のみ。詳細フォロワー属性分析には専用ツールが必要。

**推奨ツール**:
- **Fedica Grow プラン（$24/月）**: フォロワーの関心・地域・アクティブ時間分析。フォロー/アンフォロー履歴タイムライン
- **Circleboom Pro（$16.99/月）**: フォロワー詳細インサイト、ボット検出
- **Followerwonk（無料〜）**: 毎日フォロー・アンフォロー変化をモニタリング。タイムスタンプ付き
  - URL: https://followerwonk.com
- **twscrape（OSS）**: フォロワーリストを自前取得して分析

---

### E-3. 競合ベンチマーク（自動週次レポート）

**推奨ツール**:
- **Rival IQ**: 自動ベンチマーク（エンゲージメント率・投稿頻度・ハッシュタグ効果・オーディエンス成長を業界標準と比較）
- **Socialinsider**: X専用分析＋自動レポートスケジュール（メール配信）
- **Sprout Social**: X Competitors Report（アカウント横断比較）
- **Metricool**: X ベンチマーク（無料プランあり）
  - URL: https://metricool.com/twitter-benchmarking-competitive-analysis/
- **自前構築（最安）**: twscrape で競合アカウントのデータを定期取得→Google Sheetsに蓄積→n8nで週次レポート生成

**hyui向け推奨**: フォロワー100人以下はMetricool無料版で十分。100人超でSocialinsider$59/月を検討

---

### E-4. コンテンツリミックス（過去の成功ツイートを自動リライト）

**現状**: 商用ツールは多いがOSSは限定的。

**推奨ツール**:
- **Blotato（$29/月）**: note/Brain記事→X投稿への自動変換が可能。n8n/Zapier連携あり
- **Hypefury Auto-Repost**: エバーグリーンコンテンツの定期再投稿（Creator $65/月〜）
- **SocialBee**: カテゴリベースエバーグリーン再投稿（$29/月〜）
- **Bulkly**: SNS自動化ワークフロー（エバーグリーンキュー）
- **自前構築**: collect-stats スキルで過去のエンゲージメントデータを取得し、高パフォーマンスツイートをClaude APIでリライト→Typefully APIでスケジュール

**hyui向け推奨**: x-run と collect-stats を組み合わせてClaude APIでリライトするカスタムスキル構築が最適

---

### E-5. 視覚コンテンツA/Bテスト

**現状**: X公式の広告マネージャーはA/Bテスト対応（有料広告のみ）。オーガニック投稿のA/Bテスト専用OSSは存在しない。

**現実的なアプローチ**:
- 同じ内容で「画像あり」「なし」「異なる画像」を別曜日に投稿し、collect-stats でエンゲージメントを比較
- 画像付き投稿はリツイート率150%増のデータがある（参考: https://bluegiftdigital.com/what-twitter-x-features-ab-testing/）
- Typefully の分析でインプレッション・エンゲージメント率を比較

**ツール**: TweetPeek AI（https://www.tweetpeek.ai）がエンゲージメント予測機能を提供

---

### E-6. 投稿タイミング最適化（個人オーディエンス適応）

**現状**: 汎用データ（火曜〜木曜 9AM〜3PM）はあるが、個人オーディエンスに特化したOSSはない。

**推奨アプローチ**:
- **X Premium Analytics（無料）**: 自分のオーディエンスのアクティブ時間帯を確認可能
- **Fedica Grow（$24/月）**: フォロワーのアクティブ時間分析
- **Typefully**: 投稿データ蓄積後にベストタイム提案機能あり
- **自前**: collect-stats で時間帯別エンゲージメントを蓄積し、Claude APIで分析する週次タスク化

**汎用ベストタイム（2026年データ）**:
- ベスト日時: 火曜日 AM9:00（8,700万ツイート分析ベース）
- 次点: 水曜 AM10:00、AM9:00
- 最適帯: 平日 12PM〜6PM
- 参照: https://buffer.com/resources/best-time-to-post-on-twitter-x/

---

### E-7. X Premium Revenue Share 最適化

**2026年の現状**:
- 収益化要件: フォロワー500+、過去3ヶ月で500万インプレッション以上、X Premium加入必須
- 収益モデル: Premiumユーザーのエンゲージメントによる月額分配（Premium登録ユーザーからの収益の25%）
- 収益目安: 1,000〜10,000フォロワー帯で$10〜100/月、中堅（それ以上）$300〜2,000/月
- **最適化戦略**:
  1. Premiumユーザーからのエンゲージメントを最大化（一般ユーザーより収益インパクト大）
  2. 返信・引用RTを誘発するコンテンツ（いいねよりリプライが高単価）
  3. 米国オーディエンスへのリーチを意識（CPM最高）
  4. 金融・テクノロジー・ビジネスニッチが高CPM

**hyui向け**: hyuiの「文系大学生・副業・月14万」ニッチはフォロワー500人+500万PVが収益化の壁。まずフォロワー数よりPV蓄積を優先する

---

### E-8. ダイレクトメッセージ自動化（規約遵守範囲）

**2026年X規約での制限**:
- 公式API v2でDM送信は可能（Pay-per-use: 書き込み$0.015/件）
- スパム的な一斉送信は規約違反・アカウント凍結リスク
- 合法的な使用例: 新規フォロワーへのウェルカムDM、コンテンツ購入者への自動DM

**推奨ツール**:
- **Hypefury Auto DM（Creatorプラン $65/月〜）**: 最大250件/日のDM自動送信
- **Tweet Hunter Auto DM（Growプラン $49/月〜）**: 投稿へのリプライ者への自動DM
- **DM Dad（https://dmdad.com/x）**: X DM特化自動化ツール（無料プランあり）
- **Pipedream + X API**: サーバーレスでDMトリガー設定
- **自前（Tweepy + X API）**: Pay-per-use $0.015/件でカスタムDM自動化

---

### E-9. スレッド画像化（TweetShot等）

**推奨ツール**:

| ツール | URL | 無料 | 特徴 |
|---|---|---|---|
| TwitterShots | https://twittershots.com | 無料/有料 | バッチエクスポート（最大50件）、Zapier/Make連携（2026/2更新） |
| TweetPik（by TweetHunter） | https://tweethunter.io/tweetpik | 無料 | シンプルなスクリーンショット取得 |
| PostSpark | https://postspark.app/x-post | 無料 | 美麗デザイン、背景カスタマイズ |
| Pikaso | https://pikaso.me | 無料 | プロフィール画像化対応 |
| snap-tweet（OSS） | https://github.com/privatenumber/snap-tweet | 無料 | 複数ツイート一括処理、--show-thread フラグ |

**hyui向け推奨**: TwitterShots + Zapier/Make連携でBrain/note記事の引用ツイートを自動画像化する仕組みが有効

---

### E-10. バズ予測モデル（OSS実装）

**結論**: 実用的な2025〜2026年時点のOSSバズ予測モデルは存在しない。学術的な実装は古く実用外。

**現実的な代替手段**:
1. **Tweet Hunterのバイラルライブラリ（2Mツイート）**: パターン参照で事実上のバズ予測代替
2. **自前エンゲージメントデータ蓄積**: collect-stats で100投稿分のデータ蓄積後、Claude APIにパターン分析させる
3. **Typefully AIスコア**: 下書き段階でのエンゲージメント予測（機能として実装済み）
4. **X Premium Analytics**: 投稿後インプレッション推移の実績ベース分析

---

## hyui 統合提案（最重要）

### 即導入推奨 Tier 1（高優先・コスパ良い・導入簡単）

#### T1-1: claude-skill-twitter（PHY041）→ /x-run に統合

**なぜ今すぐ**: APIキー不要・無料・3スキルすべてhyuiの弱点を直撃
**実装ステップ**:
1. `git clone https://github.com/PHY041/claude-skill-twitter` でスキルを取得
2. `.claude/skills/twitter-cultivate/` `.claude/skills/twitter-intel/` `.claude/skills/twitter-x-gtm/` に配置
3. `x-run` SKILL.md の「競合監視フェーズ」に twitter-intel を組み込む
4. weekly-health-check として twitter-cultivate を定期実行化
5. コンテンツ戦略フェーズに twitter-x-gtm のフック公式を追加

**期待効果**: シャドウバン検知で凍結リスク低下、フック公式でエンゲージメント率向上

---

#### T1-2: twscrape（vladkens）→ collect-stats スキルに統合

**なぜ今すぐ**: スター2,400+、2025年4月更新、公式APIキー不要・完全無料
**GitHub**: https://github.com/vladkens/twscrape
**実装ステップ**:
1. `pip install twscrape` でインストール
2. Xアカウントを追加（`twscrape add_accounts accounts.txt`）
3. collect-stats スキルの「競合データ取得」部分をtwscrapeで補完
4. 競合19アカウントの週次データ（フォロワー数・インプレッション・エンゲージメント）を自動取得
5. Googleスプレッドシートまたはローカルファイルに蓄積

**期待効果**: 公式X API費用ゼロで競合データを自動収集、週次レポートの自動化

---

#### T1-3: Typefully MCP スキル → x-run / note-run / brain-run に統合

**なぜ今すぐ**: Typefullyを既に使用中のhyuiにとって最短で自動化を強化できる
**URL**: https://officialskills.sh/typefully/skills/typefully
**実装ステップ**:
1. Typefully MCPスキルをインストール（officialskills.shからコマンドを取得）
2. x-run SKILL.md の「投稿スケジュール」セクションをMCP経由のTypefully API呼び出しに更新
3. note-run / brain-run から note/Brain記事完成後に自動で告知ツイートをTypefully APIで予約
4. スレッド作成・引用RT・告知・宣伝リプの全テンプレートをMCP経由で操作

**期待効果**: Claude Codeから直接Typefullyを制御できるようになり、スキル間の連携が完結

---

#### T1-4: n8n + GPT-4 Twitter自動投稿テンプレート → セルフホスト

**なぜ今すぐ**: セルフホストn8nは無料、テンプレートは実績あり
**テンプレートURL**: https://n8n.io/workflows/8010-automate-twitter-posting-with-gpt-4-content-generation-and-google-sheets-tracking/
**実装ステップ**:
1. n8nをDockerでセルフホスト（既存インフラがあれば追加コスト不要）
2. テンプレートをインポートし、OpenAI API + X API + Google Sheetsを接続
3. Googleスプレッドシートに投稿アイデアを蓄積する「コンテンツバッファ」として活用
4. 定期スケジュール（6時間ごと）でGPT-4が自動ツイート生成→重複チェック→投稿

**期待効果**: note/Brain制作の傍らでX投稿が自動化される「寝ても回る仕組み」の実現

---

#### T1-5: Blotato（$29/月）→ note/Brain記事→X投稿リミックス自動化

**なぜ今すぐ**: $29/月で記事→ツイート変換が自動化でき、コンテンツ制作コストが激減
**URL**: https://blotato.com
**実装ステップ**:
1. Blotato Starterプランに登録（Freemium試用可）
2. note/Brain記事URLをBlotatoに入力し、X用コンテンツに自動変換
3. n8n/Make経由でBlotatoのAPIをhyuiのパイプラインに接続
4. brain-run / note-run の記事完成後に自動でBlotatoへ送信するフックを追加

**期待効果**: 1記事から5〜10ツイート分のコンテンツを自動生成、X運用の工数が大幅削減

---

### 中期検討 Tier 2（フォロワー100人超えてから）

#### T2-1: Hypefury Creator（$65/月）→ Autoplugs + Auto DM

**タイミング**: フォロワー200人超、月5〜10万PV達成後
**理由**: Autoplugs（バズ投稿へのプロモーションリプライ自動挿入）とAuto DM（250件/日）はある程度のエンゲージメントがないと効果が出ない
**URL**: https://hypefury.com
**Typefullyとの併用**: Typefullyをライティング、Hypefuryをエンゲージメント自動化として役割分担

---

#### T2-2: Tweet Hunter Grow（$49/月）→ バイラルライブラリ + CRM

**タイミング**: フォロワー500人超、コンテンツの方向性が定まってから
**理由**: 2,000,000+バイラルツイートライブラリとCRMは量産フェーズで本領発揮
**URL**: https://tweethunter.io
**注意**: $49/月はBlotato$29/月 + Typefully$19/月（既存）と合計$97/月になる。ROIを見極めてから

---

#### T2-3: Circleboom Pro（$16.99/月）→ フォロワー質管理 + 競合分析

**タイミング**: フォロワー500人超
**理由**: ボット・スパムフォロワーの定期クレンジングとエンゲージメント率の維持に
**URL**: https://circleboom.com

---

### 参考・将来検討 Tier 3

| ツール | URL | 備考 |
|---|---|---|
| Phantombuster | https://phantombuster.com | $69/月〜。規約違反リスクあり、大規模運用時のみ |
| Fedica Research（$79/月） | https://fedica.com | 本格的オーディエンス分析。フォロワー1,000人超後 |
| Socialinsider | https://socialinsider.io | 競合ベンチマーク自動レポート。月$59〜 |
| Tweet Archivist | https://tweetarchivist.com | ツイートアーカイブ・分析 |
| twikit（d60） | https://github.com/d60/twikit | APIキー不要だが2025年11月以降不安定。twscrapeを優先 |
| snscrape | https://snscrape.com | 信頼性低下中。twscrapeを優先 |
| x-research-skill（rohunvora） | https://github.com/rohunvora/x-research-skill | $0.50/検索ページ。コスト意識して使う |

---

### 統合アーキテクチャ提案

```
[コンテンツ制作層]
  note-run / brain-run
      ↓ 記事完成後フック
  Blotato API（記事→ツイートリミックス）
      ↓
  Typefully MCP スキル（スケジュール投稿）
  
[データ収集・監視層]
  twscrape（競合19アカウントの週次データ収集）
      ↓
  collect-stats スキル（エンゲージメント蓄積・分析）
  
  x-research-skill（バズ投稿検知・競合監視）
  twitter-intel スキル（キーワード200+ツイート取得）
  
[コンテンツ戦略層]
  twitter-cultivate（シャドウバン検知・アカウント健全性）
  twitter-x-gtm（フック公式・スレッドテンプレート）
      ↓
  x-run スキル（投稿ロジック・スケジュール管理）
  
[自動化バックグラウンド]
  n8n（セルフホスト）
    - GPT-4コンテンツ生成 + Google Sheetsバッファ管理
    - note/Brain記事→X自動告知
    - 週次競合レポート生成
```

#### /x-run SKILL.md の改修箇所（具体的）

1. **Phase 2「競合監視」**: Chrome MCPによる手動監視 → twscrape による自動週次収集に更新
2. **Phase 3「コンテンツ戦略」**: twitter-x-gtm のフック公式テンプレートを参照するルールを追加
3. **Phase 4「投稿実行」**: Typefully REST API呼び出し → Typefully MCPスキル呼び出しに更新
4. **新Phase「アカウント健全性チェック」**: twitter-cultivate を週次で呼び出しシャドウバン検知
5. **新Phase「コンテンツリミックス」**: brain-run / note-run 完成後のBlotato連携フックを追加

#### 新設スキルの提案

1. **x-intelligence**: x-research-skill + twitter-intel を統合した競合・バズ監視専用スキル
2. **x-health-monitor**: twitter-cultivate をベースにしたシャドウバン・アカウント健全性定期チェック
3. **content-remix**: Blotato API経由で note/Brain記事をX/TikTok/Instagram用コンテンツに変換

---

## 調査時の注意点・制約

1. **X API 2026年4月の変更**: Pay-per-use移行後、Owned Reads $0.001、Writes $0.015に変更（4/20施行）。既存スキルのAPI呼び出しコスト計算を更新推奨
2. **twikit の不安定性**: 2025年11月以降Cloudflareブロックで動作不安定。代替はtwscrape
3. **claude-skill-twitter のスター数**: 3スター（非常に新しいリポ）。本番使用前にREADMEと実装を精査すること
4. **規約リスク**: Phantombuster等の自動フォロー/エンゲージ系はX規約違反→アカウント凍結リスクあり。Hypefury/Tweet HunterのAuto DMも過度な使用は要注意
5. **日本語コミュニティ**: ZennとQiitaでX自動化（GitHub Actions + X API v2）の記事あり（https://zenn.dev/beachone1155/articles/20251001-x-automation）。日本語ターゲットのhyuiにとって参考になる実装例
