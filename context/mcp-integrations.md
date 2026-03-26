# MCP連携ガイド

content-pipeline で使える MCP サーバーのセットアップと使い方。

---

## Exa MCP（検索強化）

### インストール

```bash
npm install -g exa-mcp-server
```

または `claude_desktop_config.json` に追加:

```json
{
  "mcpServers": {
    "exa": {
      "command": "npx",
      "args": ["-y", "exa-mcp-server"],
      "env": {
        "EXA_API_KEY": "your-exa-api-key"
      }
    }
  }
}
```

API キーは [Exa Dashboard](https://dashboard.exa.ai/) で取得。

### content-pipeline での使い方

**note-run Phase 3（競合調査）での活用:**

```
# WebFetch の代わりに Exa を使う場合
mcp__exa__search: "note [キーワード] スキ数 [年月]"
→ noteの上位記事URLを取得
→ mcp__exa__get_contents で本文取得
→ タグ・構成・フックを分析
```

**WebFetch との使い分け:**
- Exa: 最新記事の発見・ランキング調査に強い
- WebFetch: 特定URLのコンテンツ取得に使う

### SKILL.md frontmatter への追加

```yaml
allowed-tools: Read, Write, WebSearch, WebFetch, mcp__exa__search, mcp__exa__get_contents
```

---

## Firecrawl MCP（スクレイピング強化）

### インストール

```bash
npm install -g firecrawl-mcp
```

`claude_desktop_config.json` に追加:

```json
{
  "mcpServers": {
    "firecrawl": {
      "command": "npx",
      "args": ["-y", "firecrawl-mcp"],
      "env": {
        "FIRECRAWL_API_KEY": "your-firecrawl-api-key"
      }
    }
  }
}
```

API キーは [Firecrawl](https://www.firecrawl.dev/) で取得。

### content-pipeline での使い方

**Phase 3 での WebFetch 代替:**

Firecrawl は JavaScript レンダリングが必要なページ（React製サイト等）に強い。
note の記事ページはほぼ WebFetch で取れるが、動的に読み込まれるコメント数・スキ数には Firecrawl が有効。

```
# note 記事の詳細情報取得
mcp__firecrawl__scrape:
  url: "https://note.com/moyuchi/n/xxxxx"
  formats: ["markdown", "html"]
  actions:
    - type: wait
      milliseconds: 2000  # 動的コンテンツの読み込み待ち
```

**競合記事の全文スクレイピング:**

```
# 複数記事を一括取得
mcp__firecrawl__batch_scrape:
  urls: ["url1", "url2", "url3"]
  formats: ["markdown"]
```

### SKILL.md frontmatter への追加

```yaml
allowed-tools: Read, Write, WebSearch, mcp__firecrawl__scrape, mcp__firecrawl__batch_scrape
```

---

## YouTube Transcript MCP（動画リサーチ）

### インストール

```json
{
  "mcpServers": {
    "youtube-transcript": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-youtube-transcript"]
    }
  }
}
```

（APIキー不要。YouTube の字幕機能を利用）

### content-pipeline での使い方

**競合動画のリサーチ:**

```
# 同テーマのYouTube動画の字幕を取得してリサーチ素材にする
mcp__youtube_transcript__get_transcript:
  url: "https://www.youtube.com/watch?v=xxxxx"
  lang: "ja"
```

**活用パターン:**

1. 同テーマの人気YouTube動画の字幕を取得
2. 動画の構成・話している内容を note 記事の参考にする
3. 「動画ではわかりにくいが文章で読みたい」需要を狙った記事を書く
4. 字幕をそのままコピーするのは禁止。「文章化・補足」として活用

### SKILL.md frontmatter への追加

```yaml
allowed-tools: Read, Write, mcp__youtube_transcript__get_transcript
```

---

## Memory MCP（跨ぎセッション記憶）

### インストール

```json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    }
  }
}
```

### content-pipeline での使い方

**content-memory.md との使い分け:**

| | Memory MCP | content-memory.md |
|---|---|---|
| 更新頻度 | リアルタイム（セッション内） | セッション終了時に保存 |
| 内容 | 一時的な作業状態・途中経過 | 永続的な成功/失敗パターン |
| 参照 | MCP ツール経由 | Read ツール経由 |
| 用途 | 「今日の記事で使ったフック」「今回試したアプローチ」 | 「過去30記事のスキ数TOP3の特徴」 |

**使用例:**

```
# セッション中に試行錯誤した情報を一時保存
mcp__memory__create_entities:
  entities:
    - name: "今日の記事実験"
      entityType: "experiment"
      observations:
        - "フック型: 数字から始める → 反応あり"
        - "タイトルに「大学生」を入れた → CTR高そう"

# セッション終了前に content-memory.md に転記して永続化
```

### SKILL.md frontmatter への追加

```yaml
allowed-tools: Read, Write, mcp__memory__create_entities, mcp__memory__search_nodes, mcp__memory__add_observations
```

---

## n8n-MCP（自動配信）

### インストール

n8n をセルフホストまたは n8n.io クラウドで使用している前提。

```json
{
  "mcpServers": {
    "n8n": {
      "command": "npx",
      "args": ["-y", "n8n-mcp"],
      "env": {
        "N8N_API_KEY": "your-n8n-api-key",
        "N8N_HOST": "https://your-n8n-instance.com"
      }
    }
  }
}
```

### content-pipeline での使い方

**note完成後の自動投稿パイプライン設計:**

```
note-run で記事生成
    ↓
mcp__n8n__execute_workflow:
  workflow_id: "note-auto-post"
  data:
    title: "記事タイトル"
    body: "記事本文（HTML）"
    tags: ["タグ1", "タグ2"]
    publish: false  # まず下書き保存（人間が最終確認）
    ↓
n8n ワークフロー:
  1. note API で下書き作成
  2. Discord に「下書き作成しました。確認してください」通知
  3. (人間が確認・承認)
  4. 公開ボタン押下
```

**推奨構成（自動化の範囲）:**

| フェーズ | 自動化OK | 人間が必ず確認 |
|---|---|---|
| 記事生成 | ✅ | - |
| 下書き保存 | ✅ | - |
| 公開 | ❌ | 必ず確認してから |
| SNS告知ツイート | ❌ | 必ず確認してから |

### SKILL.md frontmatter への追加

```yaml
allowed-tools: Read, Write, mcp__n8n__execute_workflow, mcp__n8n__get_workflow
```

---

## 全 MCP を有効化した SKILL.md frontmatter 例

```yaml
---
name: note-run
description: note記事を生成するスキル
user-invocable: true
allowed-tools: >-
  Read,
  Write,
  WebSearch,
  WebFetch,
  mcp__exa__search,
  mcp__exa__get_contents,
  mcp__firecrawl__scrape,
  mcp__youtube_transcript__get_transcript,
  mcp__memory__create_entities,
  mcp__memory__search_nodes,
  mcp__notion__notion-fetch,
  mcp__n8n__execute_workflow
---
```

**注意:** 使わない MCP はコメントアウトしておく。allowed-tools が増えるとスキルの起動が遅くなる場合がある。
