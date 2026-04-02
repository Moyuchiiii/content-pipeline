---
title: Claude Code Agent Teamsを副業案件に使ったら、1人でできる仕事量が変わった話
type: knowhow
price: 500
tags: [ClaudeCode, Claude, AgentTeams, 副業, 大学生, AI活用, クラウドワークス, 自動化, エージェント, 時短]
created: 2026-04-01
status: final
score: 22
---

## 副業案件で初めて「複数のClaudeが同時に動く」画面を見た話

Webアプリ案件でLP改修と管理画面のUIアップデートを同時に頼まれた。どちらも独立した作業で、ファイルもディレクトリも完全に別。

普通に一人でやれば「LP改修を2日、管理画面を2〜3日」の順番になる。でも、そこでふと思った。この2つ、並列でいけるんじゃないか。

Claude Code v2.1.32から実験的に使えるAgent Teamsを試してみたら、ターミナルに複数のClaude Codeが同時に動く画面が出てきた。最初はちょっとびっくりした。でも慣れてくると、これが当たり前になる。

今回は設定方法から「副業案件での実際の使い方」まで全部書く。プロンプトテンプレートも、CLAUDE.mdの設定例も、コストの現実も、全部出す。

## Agent Teamsって何？

通常のClaude Codeは1セッション＝1インスタンスで動く。自分が指示して、Claudeが動いて、また指示して、という往復。これがAgent Teamsを使うと、複数のClaude Codeインスタンスが「チーム」として同時に動く。

仕組みはシンプルで、1つのセッションが「Team Lead」として全体を統括して、他の「Teammates」が並列でタスクをこなす。

**Team Lead**
タスクを分解して、各Teammateに割り振る。全体の進行を把握する

**Teammates**
割り当てられたタスクを独立して実行する。互いに直接メッセージを送れる

Subagentsという機能もあるけど、こちらはメインエージェントへの一方通行。Agent TeamsはTeammates同士が直接通信できる点が違う。複数の視点が必要な作業や、並列で独立した作業に向いてる。

ファイルロックも内蔵されているから、2つのClaudeが同じファイルを同時に触るときは自動で競合を回避してくれる。

## 副業案件に投入した理由

Webアプリ案件で月収14万を達成した話（記事13）の続きで、同じクライアントからLP改修＋管理画面UIのアップデートを同時に依頼された。

LP側はReactコンポーネントの修正で`src/components/`配下。管理画面側は`src/admin/`配下で完全に独立している。依存関係もない。

「これ、2人のClaudeが並列で動けば半分の時間じゃないか」と思ってAgent Teamsを試した。

## 設定は1行だけ

まず`~/.claude/settings.json`に以下を追加する。

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

これだけ。`claude --version`でv2.1.32以上になっているか確認しておく。

設定後にClaude Codeを起動すると、普段と見た目は変わらない。でも「チームを作って」と頼むと、ターミナルに複数のインスタンスが立ち上がる。

---

【ここから有料】

## 実際に使ったチーム起動プロンプト

LP改修と管理画面を並列でやりたいときに使ったプロンプトがこれ。

```
Create an agent team with 2 teammates for this project.

Teammate 1 (LP担当):
- Work on src/components/ directory only
- Task: Revise the hero section and CTA button styles as described in lp-requirements.md
- Do NOT touch anything in src/admin/

Teammate 2 (管理画面担当):
- Work on src/admin/ directory only
- Task: Update the dashboard UI components as described in admin-requirements.md
- Do NOT touch anything in src/components/

Both: Use Sonnet model. Require plan approval before making any changes.
Report to me when each task is done.
```

ポイントは3つ。「どのディレクトリを触るか」「何をしてはいけないか」「プラン承認を要求するか」。この3つを最初から書いておくと、チームメンバーが暴走しにくくなる。

「Require plan approval」をつけると、Teammateは実装前にリーダーにプランを提出する。承認してから動く。副業案件では絶対入れたほうがいい。

## どのタスクをAgent Teams向きにするか

なんでもAgent Teamsに投げればいいわけじゃない。調整コストが増えるぶん、並列作業から得られるものが大きくないと逆効果になる。

**向いてるタスク**
独立したディレクトリ・ファイルへの変更 / 複数視点でのコードレビュー（セキュリティ・パフォーマンス・テストカバレッジを別々のClaudeが担当）/ 複数仮説を並列で調査するデバッグ

**向いてないタスク**
同じファイルを複数のClaudeが触る / 前の処理の結果を受けて次が動く順序依存の作業 / 30分以下で終わる小さいタスク（オーバーヘッドのほうが大きくなる）

判断の一番簡単な基準は「この作業、人間2人が並列でやれるか？」。人間がバトンタッチしないといけない作業は、Claudeでも同じことが起きる。

## Agent Teams用にCLAUDE.mdを整えた

Agent Teamsを使うとき、全Teammateは自動でCLAUDE.mdを読む。プロジェクトルートのCLAUDE.mdに書いておけば、全員に共通のルールが適用される。

自分はAgent Teamsを使うプロジェクトには以下を追記した。

```markdown
## Agent Teams ルール

- 担当ディレクトリ以外のファイルは触らない
- 変更前に変更内容をリーダーにメッセージで報告すること
- テストが通っていない状態でTaskをCompletedにしない
- 外部APIを呼ぶコードを書く場合は必ず承認を求める
- 不明点があれば実装を止めてリーダーに確認する
```

特に「担当ディレクトリ以外のファイルは触らない」は必須。これがないと、LP担当のClaudeが管理画面のファイルをいじりはじめることがある。CLAUDE.mdに書いておくと全員が守る。

## コストの現実（Proプランだと詰まる）

Agent Teamsを使うと、トークン消費は単純に「チームメンバーの数×通常セッション」になる。3人チームなら3倍、5人なら5倍と考えておく。

Zennの実績データによると、1機能開発でOpusベースのセッション比で約7倍のトークン消費になったケースも報告されている。

**Proプランで詰まる理由**
Teammateが増えると、レートリミットに複数のインスタンスが同時に当たる。1人が詰まると他のチームメンバーの作業も止まる

自分はMaxプラン（$200/月）に切り替えてから使い始めた。Proプランで試した最初の数日は、30分に1回くらいレートリミットに当たって作業が止まった。

コスト抑制の具体策としてやってることは2つ。

1つ目は「Lead はOpus、Teammateは全員Sonnet」。起動プロンプトに `Use Sonnet for each teammate` と書くと指定できる。Leadがタスク設計・統括をして、Teammateが実装する構造なら、品質を保ちつつコストを抑えられる。

2つ目は「独立タスクはSubagentsに任せる」。Agent TeamsはTeammates同士が通信する分、調整コストが高い。コミュニケーション不要な単純な並列タスクはSubagentsのほうが安上がり。

## 自分がやらかした失敗3パターン

試した最初の1週間でやらかしたことを全部書く。

1つ目は「同じファイルに被った」。CLAUDE.mdの担当ディレクトリルールを書く前に試したとき、LP担当とは関係ない`utils.ts`を2人が同時に書き換えようとして、一方の変更が消えた。ファイルロックで防げるはずだが、CLAUDE.mdにルールを書いておくほうが確実。

2つ目は「タスクを細かく割りすぎた」。15分で終わるような小さなタスクをAgent Teamsで並列化したら、起動・通信・クリーンアップのオーバーヘッドで、普通にやるより遅くなった。1つのタスクは最低でも1〜2時間かかる規模にしたほうがいい。

3つ目は「リーダーが一人で動き出した」。指示を曖昧にすると、リーダーがチームメンバーを待たずに自分で実装を始める。「チームメンバーが完了するまで待て」と明示的に書かないと、リーダーが独走することがある。

```
Wait for all teammates to complete their tasks before proceeding with implementation.
```

この1行を起動プロンプトの末尾に入れておくと、リーダーの独走を防げる。

## やってみて変わったこと

**導入前**
LP改修（2日）→ 管理画面UI（2〜3日）の順番。合計4〜5日

**導入後**
LP改修と管理画面UIを並列実行。自分のレビュー時間込みで1.5〜2日

単純に速くなるだけじゃなくて、受けられる案件の種類が変わる感覚がある。「複数の独立した作業が同時に発生する大型案件」に入れるようになった。

副業で月収を上げる方法は「時給を上げる」か「稼働時間を増やす」かのどちらかだと思ってたけど、Agent Teamsを使うと「同じ時間で完成する案件量を増やす」という第3の選択肢が出てくる。

### あわせて読みたい
- [大学生がClaude Codeで初のWebアプリ案件を受注→月収10万突破した全記録](https://note.com/moyuchi_aistu/n/n31fc9ce97b98)
- [副業の"承認待ち"が1案件あたり30分→5分になった話｜Claude Code Auto Mode 導入記](https://note.com/moyuchi_aistu/n/n2057c13b0cfb)
