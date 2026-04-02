---
title: MCP Elicitationを副業に使ったら、クライアントへの確認待ちが週2時間→15分になった話
type: jituroku
price: 500
tags: [ClaudeCode, MCP, 副業, 自動化, 大学生, クラウドワークス, エンジニア, フリーランス]
created: 2026-04-02
status: final
score: 23
---

副業でCW案件を受けてると、最初の詰まりポイントって「要件の確認」じゃないですか。

自分は毎週これで止まってた。

案件を受注してClaude Codeに作業させようとすると、必ずどこかで「あれ、この仕様どっちですか」ってなる。クライアントにメッセージして、返信が来るまで待って、また再開。1案件で3〜5往復が普通で、週に複数こなしてたら確認待ちだけで週2時間以上消えてた。

3月にClaude Codeのアップデートで「MCP Elicitation」という機能が追加されて、試してみたら確認待ちがほぼ消えた。

週2時間→15分。1ヶ月で約7時間が戻ってきた計算になる。

## MCP Elicitationって何ができるのか

MCP（Model Context Protocol）は、Claude Codeに外部ツールを繋ぐ仕組みのこと。GitHubとかNotionとかをClaude Codeから操作させる時に使う、あれ。

そのMCPサーバー側が「タスクの途中でユーザーに質問を出す」機能がElicitation。2026年3月14日のv2.1.76で追加された。

> **できること一言で言うと**
> Claude Codeが作業を始める前（あるいは途中）に、必要な情報をフォーム形式でUIに表示してくれる。ラジオボタン・チェックボックス・数値入力が使える。

自分の使い方はこれ。

案件受注直後に「ヒアリングMCPサーバー」を起動する。Claude Codeが実装に入る前に、クライアントの要件を整理するための質問フォームが画面に出てくる。答えるだけで、その内容がClaudeに自動で渡されて実装が始まる。

## Before/Afterの数字

> **導入前**
> 要件確認の往復メッセージが 1案件あたり平均3〜5往復
> 確認待ちで止まる時間が 週2〜2.5時間
> 作業再開までのラグが 平均4〜8時間（クライアントの返信次第）

↓ ヒアリングMCPサーバー導入後

> **導入後**
> 要件確認の往復が ほぼゼロ（初期ヒアリングで90%解決）
> 確認待ちで止まる時間が 週15〜20分（細かい追加確認のみ）
> 作業再開までのラグが ほぼゼロ（フォーム回答後すぐ作業再開）

案件の作業時間自体は変わっていないが、「止まっている時間」が消えた。これが地味に大きい。

## 実際にどう動くのか

Claude Codeのターミナルで `start_hearing` ツールを呼ぶと、こんなフォームが出てくる。

> 「案件タイプを選んでください」
> ○ Webアプリ開発  ○ 業務自動化  ○ データ処理  ○ LP・サイト制作

> 「クライアントが用意するもの（複数選択可）」
> □ デザインカンプ  □ 画像・素材  □ テキスト  □ API/認証情報

> 「納期（日数）」[数値入力]  「レスポンシブ対応が必要か」[Yes / No]

フォームへの入力は2〜3分。答えた内容はClaude Codeに自動で渡されて「では始めます」とすぐ作業に入る。

作業前に必要な情報を全部洗い出してあるので、途中で「あれ、どっちですか」が出ない。

---

**ここから先は有料エリアです（¥500）**

この先で手に入るもの
1. ヒアリングMCPサーバーの完全なコード（TypeScript）
2. 案件タイプ別フォーム設計（Web開発・業務自動化・データ処理の3パターン）
3. 回答内容をInstruction Sheetに変換するプロンプトテンプレート全文
4. つまずきポイント3つと具体的な解決方法
5. Elicitation以降のワークフロー全体図

---

## MCPサーバーのコード

Node.js + TypeScriptで書いた。`@modelcontextprotocol/sdk` を使う。

```typescript
// cw-hearing-server.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  { name: "cw-hearing", version: "1.0.0" },
  { capabilities: { tools: {}, elicitation: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "start_hearing",
      description: "CW案件受注時のヒアリングフォームを起動する",
      inputSchema: {
        type: "object",
        properties: {
          project_name: { type: "string", description: "案件名" },
        },
        required: ["project_name"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "start_hearing") {
    const result = await server.elicit({
      message: "案件の基本情報を入力してください",
      requestedSchema: {
        type: "object",
        properties: {
          project_type: {
            type: "string",
            title: "案件タイプ",
            enum: ["webApp", "automation", "dataProcessing", "lp"],
            enumNames: ["Webアプリ開発", "業務自動化", "データ処理", "LP制作"],
          },
          client_provides: {
            type: "array",
            title: "クライアントが用意するもの",
            items: {
              type: "string",
              enum: ["design", "images", "text", "api"],
              enumNames: ["デザインカンプ", "画像・素材", "テキスト", "API情報"],
            },
          },
          deadline_days: {
            type: "number",
            title: "納期（日数）",
          },
          responsive: {
            type: "boolean",
            title: "レスポンシブ対応が必要",
          },
          budget: {
            type: "string",
            title: "予算感",
            enum: ["under10k", "10to30k", "30to60k", "over60k"],
            enumNames: ["1万以下", "1〜3万", "3〜6万", "6万以上"],
          },
        },
        required: ["project_type", "deadline_days"],
      },
    });

    if (result.action === "accept") {
      const d = result.content;
      return {
        content: [
          {
            type: "text",
            text: `ヒアリング完了\n案件タイプ: ${d.project_type}\n納期: ${d.deadline_days}日\nレスポンシブ: ${d.responsive ? "あり" : "なし"}\nクライアント提供: ${(d.client_provides || []).join(", ")}`,
          },
        ],
      };
    }
    return { content: [{ type: "text", text: "キャンセルされました" }] };
  }
  throw new Error("Unknown tool");
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

### 起動方法

```bash
# インストール
npm install @modelcontextprotocol/sdk

# ビルド（tsconfig.json で module: nodenext を設定）
npx tsc

# claude_desktop_config.json に追加
{
  "mcpServers": {
    "cw-hearing": {
      "command": "node",
      "args": ["/path/to/cw-hearing-server.js"]
    }
  }
}
```

claude_desktop_config.jsonに追記してClaude Desktopを再起動するとMCPサーバーが立ち上がる。あとはClaude Codeのセッションで「案件ヒアリングを始めて」と指示するとフォームが出てくる。

## 案件タイプ別フォーム設計

基本フォームに加えて、案件タイプごとに追加で聞く項目がある。自分が使っている3パターン。

### Webアプリ開発の場合

> 追加で聞く項目
> ・認証機能が必要か（ログイン・会員管理）
> ・DBは何を使うか（クライアント指定があるか）
> ・既存のデザインシステムはあるか

認証の有無で工数が2〜3倍変わるので、これが一番重要。受注前に聞けていれば見積もりミスを防げる。

### 業務自動化の場合

> 追加で聞く項目
> ・対象業務の頻度（毎日 / 週次 / 月次）
> ・現在の手動作業の所要時間
> ・使っているツール名（Slack / GAS / Notion等）
> ・APIキーはクライアントが用意できるか

APIキーを自分で用意できるかどうかは初日に聞いておかないと後で詰まる。これで1日無駄にしたことがある。

### LP・サイト制作の場合

> 追加で聞く項目
> ・ターゲット層（年齢・職種）
> ・参考にしたいサイトのURL
> ・SEO対策が必要か

## 回答内容をInstruction Sheetに変換するプロンプト

フォームの回答をClaude Codeに渡した後、以下のプロンプトで「Instruction Sheet」を生成させる。これをCLAUDE.mdの先頭に貼り付けてから実装に入ると、方向性のズレがほぼなくなった。

```
フォームの回答内容をもとに、以下の形式でInstruction Sheetを作成してください。

## 案件概要
[案件タイプ・規模感・予算感]

## クライアント情報
[用意してもらうもの / 当方で準備するもの]

## 技術要件
[必要な技術スタック・制約・前提条件]

## 納期
[XX日後の YYYY-MM-DD]

## 優先度マトリクス
高 [必須機能・絶対に外せないもの]
中 [あれば望ましい機能]
低 [余力があれば対応する機能]

## 不明点・確認事項
[フォームで回答されなかった項目・追加確認が必要なこと]
```

「不明点・確認事項」の欄がポイントで、フォームで答えきれなかった部分をClaudeが自動で洗い出してくれる。これを最初にクライアントへ一括送信することで、往復が1往復で終わるようになった。

## つまずきポイント3つ

### 1. フォームが表示されない

MCPサーバーの初期化に `elicitation: {}` を追加し忘れると、フォームが出ない。エラーも出ないのでハマりやすい。上のコードの `capabilities: { tools: {}, elicitation: {} }` の部分を確認。

### 2. 複数案件でセッションが混乱する

複数のClaude Codeウィンドウで同じMCPサーバーを使うと、フォームの返答がどのセッションに向かうか混乱することがある。案件ごとに別ターミナルで独立したセッションを立ち上げる運用にしたら解消した。

### 3. 質問が多すぎて自分でも面倒になる

最初に10問以上設定したら作業開始前に萎えた。今は「これがないと作業が止まる情報」だけに絞って5問以内。細かい仕様は作業中にその都度聞く方が自然だった。

## Elicitation以降のワークフロー全体図

今の流れはこれ。

> 1. 案件受注
> 2. `start_hearing` でフォーム起動 → 2〜3分で回答
> 3. ClaudeがフォームからInstruction Sheetを生成
> 4. 「不明点」をクライアントに一括送信（1往復で完結）
> 5. CLAUDE.mdに案件情報を貼り付け
> 6. Auto Modeで実装開始
> 7. 大きな判断が必要な時だけElicitationで再確認
> 8. 納品

ステップ4が今まで3〜5往復だったところ。情報が整理された状態で聞けるから、クライアントも「この人わかってる」ってなって回答が早くなった気がする。

正直、MCPサーバーを自分で書くのは最初は面倒だった。でも一度設定してしまえば毎週使える。設定に3〜4時間かかったが、週7時間節約できているので3週間でペイした。

今はヒアリングにしか使っていないが、「実装中に仕様の選択肢を出す」使い方も試している。「このAPIが動かない場合、代替案AとBのどちらで実装しますか」とClaude Codeが聞いてくれて、答えるだけで作業が続く。Claude Codeに仕事させていて一番ストレスだった「詰まって止まる問題」が減った。

次はElicitation + Auto Modeを組み合わせて「完全放置で案件完了」を目指した話を書く予定。Auto Mode x Elicitationで、どこまで無人で進められるかの実験をしている。

### あわせて読みたい
- [大学生がClaude Codeでクラウドワークス案件を受注→納品してみた全記録](https://note.com/moyuchi_aistu/n/nb99fc24e5eaa)
- [副業の"承認待ち"が1案件あたり30分→5分になった話｜Claude Code Auto Mode 導入記](https://note.com/moyuchi_aistu/n/n2057c13b0cfb)
