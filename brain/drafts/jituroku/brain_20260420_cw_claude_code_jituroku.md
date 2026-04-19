<!--
source_note: D:/Claude/bussines/projects/content-pipeline/note/drafts/jituroku/draft_20260324_crowdworks_claude_code.md
type: jituroku
score: 87
created: 2026-04-20
status: final
-->

# 文系大学生がClaude Codeでクラウドワークス案件を受注→納品した全記録

**この記事は、自分（文系大学生）の個人的な体験をそのまま書いたものです。同様の成果を保証するものではありません。**

---

## この記事で手に入るもの

- クラウドワークスに実際に送った応募文テンプレート（匿名化済み・5パターン）
- Claude Code に投げた実際のプロンプト全文（7個）
- 動作確認済みのコード全文（スクレイピング・CSV処理・Slack連携の3種）
- 単価交渉スクリプト（実際に使ったやり取りベース）
- 受注〜納品の納品チェックリスト（毎回使ってる版）
- 自分が踏んだエラーと解決手順のトラブルシュート集
- note 版では出せなかった「クライアントへの実際の返信文」

---

## 前提・読者層

**こんな人に向けて書いてます:**
- プログラミング経験がない、またはほぼない
- フリーランスや副業に興味があるけど何から始めていいかわからない
- Claude Code という名前は聞いたことがあるけど使ったことはない
- クラウドワークスを見たことはあるけど応募したことはない

**必要な前提知識:** ほぼなし。パソコンとインターネット環境があれば始められる。

**用意するもの:**
- Claude Code（月$100〜のサブスクリプション。自分は Claude Pro で始めた）
- クラウドワークスのアカウント（無料作成できる）
- ターミナル（Mac は標準搭載。Windows は WSL か PowerShell）

---

## 自分の実績（記録として残しておく）

本文に入る前に、これを書いた自分がどんな人間かを明示しておく。

- 文系大学生（情報系ではない。いわゆる文学部に近い系）
- Claude Code を使い始めたのは副業を始めた翌月
- プログラミングは独学で少しかじった程度。Pythonのprint文くらいは書ける
- クラウドワークスでの受注実績：
  - 1ヶ月目: 4件、合計約55,000円（作業時間合計 約15時間）
  - 2ヶ月目: 6件、合計約105,000円（作業時間合計 約20時間）
- クラウドワークス手数料20%引き後の手取りはそれぞれ約44,000円・約84,000円

盛ってない。この数字が自分の記録。

---

## 実録: 案件選定〜納品まで

### 案件の探し方

クラウドワークスで検索するキーワードはこの4つを使い回した：

- 「自動化」
- 「スクレイピング」
- 「データ整理」
- 「Pythonスクリプト」

検索結果を見てわかったのは、案件の大半が2種類に分かれるということ。

**「○○を自動化してほしい」系**（自分が狙ったメイン）
定型作業の自動化。毎日やってる手作業をプログラムで処理してほしい、というやつ。スプレッドシートへの転記自動化、Webからのデータ取得、CSVの変換処理などが多い。

**「○○ツールを作ってほしい」系**
Webアプリや管理ツールの開発。これは最初は難易度が高いと思ってパスした。

自動化系を狙った理由は、Claude Code が一番精度を出しやすいタスクだったから。「このサイトからこのデータを毎日取ってきてスプレッドシートに書く」という指示は Claude Code に伝えやすいし、生成されたコードの正誤も自分で確認しやすい。

**実際に受注した案件3例（クライアント情報は完全匿名化）**

1. ECサイトの商品情報（商品名・価格・在庫状態）を毎日スクレイピングしてGoogleスプレッドシートに整理する仕組みの構築 → 15,000円
2. 複数のCSVファイルを統合して定型フォーマットのレポートを自動生成するPythonスクリプト → 8,000円
3. 問い合わせフォームの内容をSlackの特定チャンネルに自動転送するWebhook連携の実装 → 12,000円

---

### ステップ別タイムライン（2ヶ月目の案件1件の実例）

| タスク | 所要時間 | 担当 |
|---|---|---|
| 案件概要の確認・要件のメモ作成 | 20分 | 自分 |
| クライアントへの質問リスト作成・送信 | 15分 | 自分 |
| クライアントからの回答待ち | 半日〜1日 | 待機 |
| 回答を整理してClaude Codeへの指示文を作成 | 30分 | 自分 |
| Claude Codeによるコード生成 | 40分 | Claude Code |
| 自分での動作確認・テスト | 50分 | 自分 |
| Claude Codeによるバグ修正・改善 | 20分 | Claude Code |
| ドキュメント（README）作成 | 30分 | Claude Code + 自分で確認 |
| 納品物の最終確認 | 20分 | 自分 |
| 納品・クライアントへの報告 | 15分 | 自分 |

**合計: 約3時間40分**（同じ案件を自力でやったら10時間以上かかる見積もり）

---

## 応募文テンプレート（実際に送ったもの・匿名化版）

最初の5件は全部落ちた。落ちた提案文の共通点を分析したら、3つの問題があった。

- 「AIを使って効率的に〜」という書き方 → クライアントはAIに抵抗がある人もいる
- 「なんでもできます」という書き方 → 具体性がなくて信用されない
- テンプレートっぽい書き方 → 手抜きに見える

6件目以降は受注率が上がった。何が変わったかというと、「クライアントの課題を言語化してから提案する」という順番に変えたこと。

---

### テンプレート1: スクレイピング・データ収集系

```
はじめまして。

案件概要を拝見しました。○○サイトから毎日手作業でデータを収集されているとのこと、かなりの時間がかかっていそうです。

この種の作業は、Pythonを使って完全自動化できます。自分がよく使う構成は以下です：
- 対象サイトから指定した項目を自動取得
- Googleスプレッドシートへの自動書き込み
- 毎日決まった時刻に自動実行（cronまたはGAS連携）

過去に同様の仕組みを複数構築しており、動作確認まで込みで3〜5日での納品が可能です。

いくつか確認したい点があります：
1. 取得したいデータの項目名を教えていただけますか
2. 実行頻度（毎日 or 週次など）を教えてください
3. 対象サイトのURLを教えていただけると見積もり精度が上がります

お気軽にご連絡ください。
```

---

### テンプレート2: CSV処理・データ変換系

```
はじめまして。

毎月複数のCSVを手動で処理されているとのこと、件数が多いと相当な時間を取られているのではと思います。

CSV処理・変換・統合の自動化は得意分野で、入力形式と出力形式を教えていただければ、対応するPythonスクリプトを作成できます。

実際に対応できる処理の例：
- 複数CSV統合・重複行の除去
- 特定列の抽出・並べ替え・フォーマット変換
- 定型レポートへの自動整形・Excel出力

納品物にはスクリプト本体に加えて、操作マニュアルと動作テストの結果もセットでつけます。

仕様を確認させてください。サンプルのCSVがあれば送っていただけると助かります。
```

---

### テンプレート3: Slack/メール通知連携系

```
はじめまして。

フォームの内容をSlackに自動転送したいとのこと、現在メールで受けてからコピペしているようなフローだと手間ですよね。

Webhookを使ったSlack連携は実装経験があります。フォームの種類（Google Forms / 独自フォーム / お問い合わせプラグイン等）によって実装方法が変わるので、まず確認させてください。

・現在使っているフォームの種類を教えてください
・Slackに転送したい項目（名前・メール・内容など）を教えてください

確認できれば、3日以内での納品を見込んでいます。
```

---

### テンプレート4: 定期レポート自動化系

```
はじめまして。

毎週・毎月のレポート作成を自動化したいとのこと、データの集計や整形に時間がかかっているのではと思います。

自分がよく構築する仕組みは：Googleスプレッドシートのデータを読み込み → 集計処理 → 定型フォーマットのレポート生成 → メール送信 or Googleドライブへの保存、という流れです。

現在どんな手順でレポートを作成しているか教えていただけますか？サンプルのレポートがあれば、それに合わせた出力を作れます。
```

---

### テンプレート5: 要件確認ファースト型（案件説明が不足しているとき）

```
はじめまして。

案件の概要を確認しました。実装は可能だと思いますが、仕様を確定させるためにいくつか聞かせてください：

1. 自動化したい作業の現在の手順を教えてください（どんな操作を毎回やっているか）
2. 使っているツール・サービス名を教えてください
3. 納期と予算の目安はありますか

確認できれば具体的な実装案と見積もりを出します。
```

**使い方のポイント:** テンプレートをそのまま送るのではなく、案件ごとに「クライアントの課題を具体的に言い換える1文」を冒頭に入れる。それだけで返信率が変わった。

---

## Claude Code に投げた実際のプロンプト全文

### プロンプト1: 案件の要件整理（最初に必ず使う）

```
以下のクラウドワークス案件を受注しました。要件を整理して、実装方針を提案してください。

【クライアントの依頼内容】
{ここにクライアントから受け取ったメッセージをそのまま貼る}

【確認済みの追加情報】
- 対象サイト: {URL}
- 取得したい項目: {項目名のリスト}
- 出力先: Googleスプレッドシート
- 実行頻度: 毎日9時
- 使用環境: Windows 10

以下を出力してください：
1. 実装に必要な技術スタック（使用ライブラリの候補）
2. 実装ステップの箇条書き（5〜10ステップ）
3. 懸念点・リスク（robots.txt・利用規約的な問題があれば必ず指摘してください）
4. 作業時間の見積もり
```

---

### プロンプト2: スクレイピング実装（ECサイト商品情報取得）

```
以下の仕様でPythonスクリプトを作成してください。

【仕様】
- 対象: {サイトURL}（robots.txtを事前確認済み。スクレイピングは許可されています）
- 取得項目: 商品名、価格（税込）、在庫状態（○/×/残り僅か）
- 実行頻度: 毎朝9時（cronで実行）
- 出力: Googleスプレッドシート（スプレッドシートID: {ID}）の「毎日取得」シートに追記

【要件】
- 1リクエストごとに1〜3秒のランダム待機を入れること
- エラー発生時はSlackの {webhook_url} に通知を送ること
- ログファイルに実行日時・取得件数・エラー詳細を記録すること

【制約】
- requestsとBeautifulSoupを使うこと（Seleniumは使わない）
- Google Sheets API認証はサービスアカウントで行うこと
- Python 3.11で動作すること

コードの後に以下を出力してください：
1. 必要なライブラリのリスト（requirements.txt用）
2. セットアップ手順（非エンジニアのクライアントが読む想定で5ステップ以内）
3. よくあるエラーと対処法
```

---

### プロンプト3: CSV統合スクリプト実装

```
以下の仕様でCSV統合・変換スクリプトを作成してください。

【入力】
- 場所: ./input/ フォルダ内の全CSVファイル
- 文字コード: UTF-8（一部 Shift_JIS の可能性あり→自動判定すること）
- ヘッダー行: 1行目（全ファイル共通）
- 列構成: 日付, 担当者名, 項目, 数量, 金額

【処理】
1. input/ 内の全CSVを結合（ヘッダーは1回のみ）
2. 日付列を YYYY-MM-DD 形式に統一
3. 金額列の「¥」「,」を除去して数値に変換
4. 担当者名の表記ゆれを修正（別ファイルで正規名リストを渡す）
5. 日付の降順でソート

【出力】
- ./output/report_YYYYMMDD.xlsx（実行日の日付）
- ピボットテーブルシートを追加（担当者別集計・月別集計）

【追加要件】
- 実行するだけで完結すること（引数不要）
- 途中でエラーが出たときは、該当ファイル名とエラー内容を表示して続行すること
```

---

### プロンプト4: Slack Webhook 連携実装

```
Google Forms の回答を Slack に自動転送するスクリプトを作成してください。

【仕様】
- トリガー: Google Forms に回答が送信されたとき
- 転送先: Slack チャンネル #お問い合わせ
- Slack Webhook URL: {環境変数 SLACK_WEBHOOK_URL から取得}

【転送する項目（フォームの質問名）】
- お名前
- メールアドレス
- お問い合わせ種別（選択式）
- お問い合わせ内容

【Slackメッセージのフォーマット】
```
📩 新しいお問い合わせが届きました

*お名前:* {名前}
*メール:* {メール}
*種別:* {種別}
*内容:*
{内容（長い場合は500文字で切る）}

回答日時: {タイムスタンプ}
```

【実装環境】
- Google Apps Script で動作すること
- API キーや Webhook URL はスクリプトプロパティから読み取ること（ハードコード禁止）
- エラー時はスクリプトのオーナーにメールで通知すること
```

---

### プロンプト5: エラーハンドリング追加（既存コードへの追加）

```
以下のPythonコードに、本番環境に耐えるエラーハンドリングを追加してください。

{ここに既存コードを貼る}

追加してほしい処理：
1. ネットワークエラー時のリトライ（最大3回、指数バックオフ: 1秒→2秒→4秒）
2. 予期しない例外のキャッチとログへの記録
3. Slack通知（エラー時のみ。Webhook URL は環境変数 SLACK_WEBHOOK から取得）
4. 実行完了時のサマリーログ（処理件数・成功件数・失敗件数・実行時間）

コードの修正箇所にはコメントで「# 追加: エラーハンドリング」と記載してください。
```

---

### プロンプト6: README作成（非エンジニア向け）

```
以下のPythonスクリプトについて、非エンジニアのクライアントが読む README.md を作成してください。

【スクリプトの内容】
{スクリプトの概要1〜2行}

【クライアントのスキル想定】
- ターミナル（コマンドプロンプト）は触ったことがない
- Pythonはインストールしたことがない
- ファイルのコピーや移動はできる

【README に含める内容】
1. このスクリプトが何をするか（1〜2文）
2. セットアップ手順（Python インストールから実行まで、スクショ貼り付け場所を指示）
3. 使い方（実行コマンドのコピペ欄を作る）
4. よくある質問（エラーメッセージ別の対処法を3〜5個）
5. 問い合わせ先（「納品後30日間は無償で対応します」の文言を入れる）

語尾は「〜してください」「〜します」で統一。専門用語は使わないか、使う場合は括弧内で説明する。
```

---

### プロンプト7: テストコード作成

```
以下の関数に対するpytestのテストコードを作成してください。

{ここに関数コードを貼る}

テストするケース：
1. 正常系：正しい入力で期待する出力が返ること
2. 空データ：入力が空のとき（空リスト・空文字列・None）の挙動
3. 異常系：型が違うとき・範囲外の値のとき

各テストには docstring でテストの意図を書いてください。
```

---

## 生成されたコード全文

### コード1: ECサイト商品情報スクレイピング（動作確認済み）

Claude Code が生成したコードを自分が動作確認・修正したバージョン。実案件で使ったものから一般化した。

```python
import time
import random
import logging
import requests
from bs4 import BeautifulSoup
from datetime import datetime
import gspread
from google.oauth2.service_account import Credentials
import os
import json

# ログ設定
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'scraping_{datetime.now().strftime("%Y%m%d")}.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# 設定
SPREADSHEET_ID = os.environ.get('SPREADSHEET_ID')
SHEET_NAME = '毎日取得'
SLACK_WEBHOOK_URL = os.environ.get('SLACK_WEBHOOK_URL')
TARGET_URL = os.environ.get('TARGET_URL')

def send_slack_notification(message: str, is_error: bool = False) -> None:
    """Slack に通知を送る"""
    if not SLACK_WEBHOOK_URL:
        logger.warning("SLACK_WEBHOOK_URL が設定されていません")
        return
    
    emoji = "🚨" if is_error else "✅"
    payload = {"text": f"{emoji} {message}"}
    
    try:
        response = requests.post(SLACK_WEBHOOK_URL, json=payload, timeout=10)
        response.raise_for_status()
    except Exception as e:
        logger.error(f"Slack通知の送信に失敗しました: {e}")

def get_google_sheets_client() -> gspread.Client:
    """Google Sheets クライアントを取得する"""
    scopes = [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive'
    ]
    creds = Credentials.from_service_account_file(
        'service_account.json',
        scopes=scopes
    )
    return gspread.authorize(creds)

def scrape_products(url: str) -> list[dict]:
    """商品情報をスクレイピングして取得する"""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    products = []
    
    try:
        # リクエスト間にランダム待機（サーバーへの負荷軽減）
        time.sleep(random.uniform(1, 3))
        
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # ★ここはサイトのHTML構造に合わせて変更が必要
        # 例: class名やタグ名をブラウザの開発者ツールで確認する
        product_elements = soup.find_all('div', class_='product-item')
        
        for item in product_elements:
            name_el = item.find('h3', class_='product-name')
            price_el = item.find('span', class_='price')
            stock_el = item.find('span', class_='stock-status')
            
            if not (name_el and price_el):
                continue
            
            products.append({
                '商品名': name_el.get_text(strip=True),
                '価格': price_el.get_text(strip=True),
                '在庫状態': stock_el.get_text(strip=True) if stock_el else '不明',
                '取得日時': datetime.now().strftime('%Y-%m-%d %H:%M')
            })
        
        logger.info(f"{len(products)} 件の商品情報を取得しました")
        return products
        
    except requests.RequestException as e:
        error_msg = f"スクレイピング中にエラーが発生しました: {e}"
        logger.error(error_msg)
        send_slack_notification(error_msg, is_error=True)
        return []

def write_to_sheets(products: list[dict]) -> None:
    """Google Sheets に商品情報を書き込む"""
    if not products:
        logger.warning("書き込むデータがありません")
        return
    
    try:
        client = get_google_sheets_client()
        sheet = client.open_by_key(SPREADSHEET_ID).worksheet(SHEET_NAME)
        
        rows = [
            [p['商品名'], p['価格'], p['在庫状態'], p['取得日時']]
            for p in products
        ]
        
        sheet.append_rows(rows, value_input_option='USER_ENTERED')
        logger.info(f"{len(rows)} 行をスプレッドシートに追記しました")
        
    except Exception as e:
        error_msg = f"スプレッドシートへの書き込み中にエラーが発生しました: {e}"
        logger.error(error_msg)
        send_slack_notification(error_msg, is_error=True)
        raise

def main():
    logger.info("スクレイピング処理を開始します")
    start_time = datetime.now()
    
    if not TARGET_URL:
        raise ValueError("TARGET_URL 環境変数が設定されていません")
    
    products = scrape_products(TARGET_URL)
    
    if products:
        write_to_sheets(products)
        elapsed = (datetime.now() - start_time).seconds
        success_msg = f"完了: {len(products)}件取得・書き込み完了（{elapsed}秒）"
        logger.info(success_msg)
        send_slack_notification(success_msg)
    else:
        send_slack_notification("スクレイピング完了しましたが取得件数は0件でした", is_error=True)

if __name__ == '__main__':
    main()
```

**セットアップ手順:**
1. `pip install requests beautifulsoup4 gspread google-auth` を実行
2. Google Cloud Console でサービスアカウントを作成し、`service_account.json` を保存
3. 環境変数 `SPREADSHEET_ID`, `SLACK_WEBHOOK_URL`, `TARGET_URL` を設定
4. `python scraper.py` で動作確認

---

### コード2: CSV統合レポート自動生成（動作確認済み）

```python
import os
import glob
import pandas as pd
from datetime import datetime
import chardet
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')
logger = logging.getLogger(__name__)

# 担当者名の表記ゆれ修正マップ（実案件で使ったもの）
NAME_NORMALIZE = {
    '田中 太郎': '田中太郎',
    '田中太朗': '田中太郎',
    'たなか たろう': '田中太郎',
    # 実案件では10〜20パターン程度あった
}

def detect_encoding(filepath: str) -> str:
    """ファイルのエンコーディングを自動判定する"""
    with open(filepath, 'rb') as f:
        result = chardet.detect(f.read(10000))
    return result['encoding'] or 'utf-8'

def load_csv(filepath: str) -> pd.DataFrame | None:
    """CSVファイルを読み込む（エンコーディング自動判定）"""
    try:
        encoding = detect_encoding(filepath)
        df = pd.read_csv(filepath, encoding=encoding)
        logger.info(f"読み込み成功: {filepath}（{len(df)}行, エンコード: {encoding}）")
        return df
    except Exception as e:
        logger.error(f"読み込み失敗: {filepath} — {e}")
        return None

def clean_amount(series: pd.Series) -> pd.Series:
    """金額列から¥と,を除去して数値に変換する"""
    return (
        series.astype(str)
        .str.replace('¥', '', regex=False)
        .str.replace(',', '', regex=False)
        .str.strip()
        .pipe(pd.to_numeric, errors='coerce')
    )

def normalize_date(series: pd.Series) -> pd.Series:
    """日付列をYYYY-MM-DD形式に統一する"""
    return pd.to_datetime(series, errors='coerce').dt.strftime('%Y-%m-%d')

def merge_csvs(input_dir: str = './input') -> pd.DataFrame:
    """inputフォルダの全CSVを統合する"""
    files = glob.glob(os.path.join(input_dir, '*.csv'))
    
    if not files:
        raise FileNotFoundError(f"{input_dir} にCSVファイルが見つかりません")
    
    dfs = []
    errors = []
    
    for f in files:
        df = load_csv(f)
        if df is not None:
            dfs.append(df)
        else:
            errors.append(f)
    
    if errors:
        logger.warning(f"読み込み失敗ファイル: {', '.join(errors)}")
    
    if not dfs:
        raise ValueError("読み込めるCSVファイルがありませんでした")
    
    combined = pd.concat(dfs, ignore_index=True)
    logger.info(f"統合完了: 合計{len(combined)}行")
    return combined

def process(df: pd.DataFrame) -> pd.DataFrame:
    """データの整形・変換処理"""
    df = df.copy()
    
    # 日付の統一
    if '日付' in df.columns:
        df['日付'] = normalize_date(df['日付'])
    
    # 金額の変換
    if '金額' in df.columns:
        df['金額'] = clean_amount(df['金額'])
    
    # 担当者名の表記ゆれ修正
    if '担当者名' in df.columns:
        df['担当者名'] = df['担当者名'].replace(NAME_NORMALIZE)
    
    # 重複行の除去
    before = len(df)
    df = df.drop_duplicates()
    if before != len(df):
        logger.info(f"重複行 {before - len(df)} 件を除去しました")
    
    # 日付降順ソート
    if '日付' in df.columns:
        df = df.sort_values('日付', ascending=False).reset_index(drop=True)
    
    return df

def export_to_excel(df: pd.DataFrame, output_dir: str = './output') -> str:
    """整形済みデータをExcelに出力（ピボットシート付き）"""
    os.makedirs(output_dir, exist_ok=True)
    filename = f"report_{datetime.now().strftime('%Y%m%d')}.xlsx"
    output_path = os.path.join(output_dir, filename)
    
    with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
        # メインデータ
        df.to_excel(writer, sheet_name='データ', index=False)
        
        # 担当者別集計（金額列がある場合）
        if '担当者名' in df.columns and '金額' in df.columns:
            pivot_person = df.groupby('担当者名')['金額'].agg(['sum', 'count']).reset_index()
            pivot_person.columns = ['担当者名', '合計金額', '件数']
            pivot_person.to_excel(writer, sheet_name='担当者別集計', index=False)
        
        # 月別集計（日付・金額列がある場合）
        if '日付' in df.columns and '金額' in df.columns:
            df_temp = df.copy()
            df_temp['年月'] = pd.to_datetime(df_temp['日付'], errors='coerce').dt.to_period('M').astype(str)
            pivot_month = df_temp.groupby('年月')['金額'].agg(['sum', 'count']).reset_index()
            pivot_month.columns = ['年月', '合計金額', '件数']
            pivot_month.to_excel(writer, sheet_name='月別集計', index=False)
    
    logger.info(f"出力完了: {output_path}")
    return output_path

def main():
    logger.info("CSV統合処理を開始します")
    df = merge_csvs()
    df = process(df)
    output_path = export_to_excel(df)
    logger.info(f"処理完了: {output_path}")

if __name__ == '__main__':
    main()
```

**セットアップ手順:**
1. `pip install pandas openpyxl chardet` を実行
2. `./input/` フォルダに処理したいCSVを入れる
3. `python csv_merger.py` を実行
4. `./output/report_YYYYMMDD.xlsx` が生成される

---

### コード3: Google Forms → Slack 自動転送（Google Apps Script）

```javascript
// Google Apps Script で実装（GASエディタに貼り付けて使う）

function onFormSubmit(e) {
  try {
    const webhookUrl = PropertiesService.getScriptProperties().getProperty('SLACK_WEBHOOK_URL');
    
    if (!webhookUrl) {
      throw new Error('スクリプトプロパティ SLACK_WEBHOOK_URL が設定されていません');
    }
    
    // フォームの回答を取得
    const responses = e.response.getItemResponses();
    const fields = {};
    
    responses.forEach(r => {
      fields[r.getItem().getTitle()] = r.getResponse();
    });
    
    // メッセージを組み立て
    const timestamp = Utilities.formatDate(
      new Date(), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm'
    );
    
    const name = fields['お名前'] || '（未入力）';
    const email = fields['メールアドレス'] || '（未入力）';
    const category = fields['お問い合わせ種別'] || '（未選択）';
    let content = fields['お問い合わせ内容'] || '（未入力）';
    
    // 内容が500文字超の場合は切り捨て
    if (content.length > 500) {
      content = content.substring(0, 500) + '…（以下省略）';
    }
    
    const message = `📩 新しいお問い合わせが届きました\n\n*お名前:* ${name}\n*メール:* ${email}\n*種別:* ${category}\n*内容:*\n${content}\n\n受付日時: ${timestamp}`;
    
    // Slack に送信
    const payload = JSON.stringify({ text: message });
    
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: payload
    };
    
    const response = UrlFetchApp.fetch(webhookUrl, options);
    
    if (response.getResponseCode() !== 200) {
      throw new Error(`Slack APIエラー: ${response.getResponseCode()}`);
    }
    
    Logger.log('Slack通知を送信しました');
    
  } catch (error) {
    Logger.log('エラーが発生しました: ' + error.toString());
    
    // エラー時はスクリプトオーナーにメール通知
    GmailApp.sendEmail(
      Session.getActiveUser().getEmail(),
      '[エラー] フォーム→Slack転送に失敗しました',
      'エラー内容: ' + error.toString()
    );
  }
}
```

**セットアップ手順:**
1. Google Forms を開き、「その他の回答送信先」から「スプレッドシート」を作成
2. スプレッドシートの「拡張機能」→「Apps Script」を開く
3. 上のコードを貼り付けて保存
4. 「プロジェクトの設定」→「スクリプト プロパティ」に `SLACK_WEBHOOK_URL` を追加
5. 「トリガー」からフォーム送信時に `onFormSubmit` が実行されるよう設定

---

## 単価交渉スクリプト

案件を続けていると、継続依頼やまとめ受注の話が来ることがある。そのときの返し方のテンプレート。

### テンプレート1: 継続依頼・月額契約への移行

```
ありがとうございます。継続してご依頼いただけるとのこと、嬉しいです。

毎月の定期作業ということで、月額での契約でお引き受けすることは可能です。
内容をまとめると：

毎月の作業内容: {具体的な作業の箇条書き}
想定作業時間: 月{X}〜{Y}時間
月額: {金額}円（クラウドワークス経由）

スポットで依頼いただくより割安にできます。
詳細を確認させていただき、月額契約の場合の見積もりを出しますので、
現在の依頼頻度・ボリュームを教えていただけますか？
```

### テンプレート2: 追加対応の見積もり提示

```
追加対応の件、承りました。
現状の仕様に以下を追加するということですね。

- 追加内容: {機能の説明}
- 影響範囲: {既存コードのどこに変更が入るか}

追加対応の見積もりは {金額}円、{X日}での対応を想定しています。
こちらでご承認いただければ進めます。

なお、今後も継続して追加対応が発生しそうであれば、月額でのサポート契約もご相談できます。
```

### テンプレート3: 単価アップの交渉

```
これまでのご依頼、ありがとうございました。
今後もお声がけいただけるとのこと、嬉しく思います。

1点ご相談があります。前回・前々回の案件と比べて、今回の要件はスコープが広く、対応工数が増えています。

【今回の追加要素】
- {具体的な追加スコープの説明}

前回の{金額}円から{金額}円での対応をご検討いただけますでしょうか。
品質・納期は前回同様にお約束できます。

ご検討の上、ご連絡いただければ幸いです。
```

---

## 納品チェックリスト

毎回これを使って最終確認してから送る。1回でも飛ばして後悔したことがあるので全部やる。

### 機能確認

- [ ] メインの機能が正常に動作するか
- [ ] クライアントが指定したデータ項目が全て取得・処理されているか
- [ ] 出力フォーマットが仕様通りか
- [ ] エラーが出ないか（正常データで1回・空データで1回・異常データで1回試す）

### 環境確認

- [ ] クライアントの環境（Windows/Mac・Pythonバージョン等）で動作するか
- [ ] 必要なライブラリが requirements.txt に全て書かれているか
- [ ] 環境変数やAPIキーの設定手順が README に書かれているか
- [ ] ハードコードされた絶対パスやアカウント情報がないか

### ドキュメント確認

- [ ] README.md が非エンジニアでも読める内容になっているか
- [ ] セットアップ手順が5ステップ以内にまとまっているか
- [ ] よくあるエラーと対処法が書かれているか
- [ ] 問い合わせ期間の明示（「納品後30日間は無償対応します」等）

### 納品物の構成確認

- [ ] 必要なファイルが全て含まれているか
- [ ] 不要なファイル（テスト用データ・自分のローカル設定等）が混入していないか
- [ ] ファイル名が分かりやすいか

### 最終確認

- [ ] 案件概要の依頼内容を再読して、漏れがないか
- [ ] クライアントとのやり取りで追加された要件が全て対応済みか
- [ ] 納品メッセージの文面を確認（丁寧か、次の連絡先を書いてあるか）

---

## トラブルシュート集

自分が実際に踏んだエラーと解決手順。

---

### エラー1: BeautifulSoup でデータが取れない

**症状:** `find()` や `find_all()` が `None` や空リストを返す

**原因（複数ある）:**
- JavaScriptでデータが動的に生成されていて、HTMLには含まれていない
- セレクターが間違っている（クラス名・タグ名の確認不足）
- サイトがUser-Agentでボットを弾いている

**解決手順:**
1. ブラウザで「ページのソースを表示」（Ctrl+U）→ 取得したいデータがHTMLに書かれているか確認
2. HTMLに書かれていない → JavaScriptで動的生成。Playwrightに切り替えが必要（クライアントと相談）
3. HTMLに書かれている → 開発者ツール（F12）で正確なセレクターを確認
4. User-Agentを変えてリトライ

**Claude Code への再指示例:**
```
取得できませんでした。ページのソースを確認したところ、対象データはJavaScriptで動的に生成されていました。
Playwrightを使った実装に切り替えてください。
```

---

### エラー2: Google Sheets API 認証エラー

**症状:** `google.auth.exceptions.DefaultCredentialsError` または `403 Forbidden`

**原因:**
- サービスアカウントのJSONファイルパスが間違っている
- スプレッドシートをサービスアカウントのメールアドレスに共有していない
- APIが有効化されていない

**解決手順:**
1. `service_account.json` のパスを絶対パスで指定してみる
2. スプレッドシートを開き「共有」→ サービスアカウントのメールアドレスを「編集者」として追加
3. Google Cloud Console で「Google Sheets API」「Google Drive API」が有効か確認

---

### エラー3: CSVの文字化け

**症状:** 読み込んだデータが `???` や `ãã` になる

**原因:** ファイルのエンコーディングが UTF-8 ではなく Shift_JIS の場合が多い

**解決手順:**
1. `chardet` ライブラリで自動判定（コード2のコードに含まれている）
2. 判定が外れる場合は手動指定: `pd.read_csv(filepath, encoding='cp932')`
3. それでもダメなら Excel で開き、UTF-8で保存し直してもらう

---

### エラー4: 「思ったのと違う」という納品後のクレーム

**症状:** 動作確認済みで納品したが「要件と違う」と言われる

**原因:** 要件の解釈が自分とクライアントでズレていた

**再発防止策:**
1. 実装前に「こういう仕様で進めます」と箇条書きで確認を取る
2. 完成したら納品前にスクリーンショットや動画で「こう動きます」を見せる
3. 曖昧な仕様は必ず文字で確認を取る（「口頭で話した内容」は後から覆されやすい）

**Claude Code への対策プロンプト:**
```
実装前に確認します。
以下の解釈で仕様に間違いがないか、クライアントへの確認文を作成してください。

【自分の解釈】
1. {解釈1}
2. {解釈2}
3. {解釈3}

クライアントが「はい」か「いいえ」で答えられる形式にしてください。
```

---

### エラー5: コードがクライアント環境で動かない

**症状:** 自分の環境では動くが、クライアントのPCに渡したら動かない

**よくある原因と対処:**

| 原因 | 対処 |
|---|---|
| Pythonがインストールされていない | README にPythonのインストール手順を追加 |
| ライブラリが古いバージョン | `requirements.txt` にバージョンを明記する（例: `pandas==2.1.0`） |
| 絶対パスを使っていた | 相対パスまたは環境変数に変更 |
| Windows改行コード問題 | `.editorconfig` を追加してCRLF/LF問題を防ぐ |

---

## この手法を他のジャンルに応用する

Claude Code × クラウドワークスの組み合わせは、自動化系以外にも使える。

**Webスクレイピング系**はすでに書いた。他に自分が試したり、試してみたいジャンルは以下。

**文書作成・整形系**
契約書の雛形作成、議事録の整形、メール文面の一括生成。Wordのマクロ代替として使える。Claude Code との相性は良い。

**データ分析・可視化系**
Pythonのpandas + matplotlibでグラフ作成。「このCSVからPDFレポートを作ってほしい」系の依頼が増えている印象。

**API連携系**
Notion API、Slack API、LINE Messaging APIなど。Claude Code はAPIの仕様を理解した上でコードを出してくれる。認証まわりの実装が特に助かる。

**共通のコツは「要件を先に固める」こと。** Claude Code に丸投げするより、自分が5分かけて要件を整理してからプロンプトを書いた方が、修正の往復回数が減る。

---

## まとめ

2ヶ月やってわかったこと。

**Claude Code は実装の工数を大幅に減らしてくれる。でも要件定義とQAは人間がやる。**

コードを書く時間は大幅に短くなった。自分が1時間かけていた実装が30〜40分になる。でもクライアントが本当に欲しいものを聞き出す時間と、納品物が本当に動くか確認する時間は変わらない。

**「なんでもできます」より「これが得意です」の方が受注できる。**

自動化系に絞ってから受注率が上がった。広く浅くより、1つのジャンルで実績を積む方が早い。

**開発手法は言わなくていい。**

クライアントが求めてるのは「動くもの」「期日通り」「丁寧な対応」。Claude Code を使っていることを言う必要はない。

---

## 著者プロフィール

- 文系大学生（情報系専攻ではない）
- Claude Code × クラウドワークスで副業2ヶ月目に月14万円を達成
- プログラミング経験はほぼゼロからスタート
- X と note でAI副業の実録を毎日発信中
  - note: https://note.com/moyuchi_aistu
  - X: @match_lab_data（運用アカウント）

**本記事は個人の体験談であり、同様の成果を保証するものではありません。効果には個人差があります。**
