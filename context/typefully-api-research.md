# Typefully Pro API 調査結果（2026-04-23）

調査方法: 公式ドキュメント・Support記事・Changelog・GitHub公式リポジトリ（typefully/agent-skills）のソースコード

---

## 料金プラン

| プラン | 月額（年払い） | 特徴 |
|--------|--------------|------|
| Free | $0 | スケジュール投稿1件のみ、アナリティクスなし |
| Starter | $8 | 1アカウント、無制限スケジュール、アナリティクス、動画対応 |
| Creator | $19 | 最大5アカウント、AI執筆支援あり |
| Team | $39 | 無制限アカウント、チーム機能（承認ワークフロー等） |

- 年払いで約20%割引。月払いは上記より高くなる
- 対応プラットフォーム: X / LinkedIn / Bluesky / Mastodon / Threads
- ※Instagram / TikTok / Facebook は非対応
- **API利用の可否**: どのプランから使えるかの明示的な記載はドキュメント未確認。ただし公式の agent-skills や help 記事では特定プランのみ限定という記述は見当たらなかった（実機確認推奨）

---

## 認証

### APIキー発行
- `https://typefully.com/settings/api` にアクセス
- Settings → API で新規キー発行
- v1キーの新規発行は現在無効化済み。**v2キーのみ発行可能**

### ヘッダー形式

```http
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

- **v1との違い**: v1は `x-api-key: Bearer <key>` だったが v2 は `Authorization: Bearer <key>` に変更
- v1キーは v2 エンドポイントでは使用不可

### 開発モードの活用
- Settings → API → Development mode を有効にすると、UIで social_set_id / draft_id / media_id が直接確認できる

---

## API バージョン

| バージョン | ベースURL | 状況 |
|-----------|----------|------|
| v2（推奨） | `https://api.typefully.com/v2` | 現行。2025年12月リリース |
| v1（非推奨） | `https://api.typefully.com/api/v1` | 2026年6月15日廃止予定 |

---

## エンドポイント一覧（v2）

| 機能 | メソッド | エンドポイント |
|------|---------|--------------|
| 自分の情報取得 | GET | `/me` |
| ソーシャルセット一覧 | GET | `/social-sets?limit=50` |
| ソーシャルセット詳細 | GET | `/social-sets/{social_set_id}` |
| LinkedIn組織解決 | GET | `/social-sets/{id}/linkedin/organizations/resolve?organization_url=...` |
| ドラフト一覧 | GET | `/social-sets/{id}/drafts?limit=...&status=...&tag=...&order_by=...` |
| ドラフト取得 | GET | `/social-sets/{id}/drafts/{draft_id}` |
| **ドラフト作成** | POST | `/social-sets/{id}/drafts` |
| ドラフト更新 | PATCH | `/social-sets/{id}/drafts/{draft_id}` |
| ドラフト削除 | DELETE | `/social-sets/{id}/drafts/{draft_id}` |
| キュー取得 | GET | `/social-sets/{id}/queue?start_date=...&end_date=...` |
| キュースケジュール取得 | GET | `/social-sets/{id}/queue/schedule` |
| キュースケジュール更新 | PUT | `/social-sets/{id}/queue/schedule` |
| タグ一覧 | GET | `/social-sets/{id}/tags?limit=50` |
| タグ作成 | POST | `/social-sets/{id}/tags` |
| **メディアアップロード初期化** | POST | `/social-sets/{id}/media/upload` |
| **メディアステータス確認** | GET | `/social-sets/{id}/media/{media_id}` |
| アナリティクス（X投稿） | GET | `/social-sets/{id}/analytics/x/posts?params...` |

---

## ドラフト作成（POST `/v2/social-sets/{social_set_id}/drafts`）

### リクエストボディ（完全な JSON サンプル）

```json
{
  "platforms": {
    "x": {
      "enabled": true,
      "posts": [
        {
          "text": "ツイート本文1（スレッドの1番目）",
          "media_ids": ["uuid-of-media-1", "uuid-of-media-2"]
        },
        {
          "text": "スレッドの2番目",
          "media_ids": []
        }
      ],
      "settings": {
        "reply_to_url": "https://x.com/user/status/123456789",
        "community_id": "コミュニティID（任意）"
      }
    },
    "linkedin": {
      "enabled": true,
      "posts": [
        {
          "text": "LinkedIn用のテキスト（プラットフォーム別に書き分け可）"
        }
      ]
    },
    "bluesky": {
      "enabled": false
    },
    "threads": {
      "enabled": false
    },
    "mastodon": {
      "enabled": false
    }
  },
  "draft_title": "内部管理用タイトル（UIに表示、公開されない）",
  "publish_at": "2026-04-25T09:00:00.000Z",
  "tags": ["タグA", "タグB"],
  "share": false,
  "scratchpad_text": "メモ欄（公開されない）"
}
```

### 主要パラメータ詳細

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| `platforms` | object | 対象プラットフォームごとの設定 |
| `platforms.x.enabled` | boolean | X への投稿を有効化 |
| `platforms.x.posts` | array | 投稿コンテンツ配列（複数要素でスレッドになる） |
| `posts[].text` | string | 投稿テキスト |
| `posts[].media_ids` | array | メディアID配列（事前アップロードで取得） |
| `posts[].quote_post_url` | string | 引用RT先のX投稿URL（後述） |
| `platforms.x.settings.reply_to_url` | string | リプライ先の投稿URL |
| `platforms.x.settings.community_id` | string | Xコミュニティへの投稿時のID |
| `draft_title` | string | 内部タイトル（公開されない） |
| `publish_at` | string | 公開日時（下記参照） |
| `tags` | array | タグ配列 |
| `share` | boolean | true で公開用 share_url を生成 |
| `scratchpad_text` | string | 内部メモ（ドラフトに紐付く、公開されない） |

---

## スレッド構造

- `posts` 配列に複数オブジェクトを入れることでスレッドを表現
- CLIでは `\n---\n` または `\r\n---\r\n` でテキストを分割するとAPIが自動的に複数 posts に変換する

```json
"posts": [
  { "text": "1ツイート目のテキスト" },
  { "text": "2ツイート目のテキスト" },
  { "text": "3ツイート目（締めのCTA）" }
]
```

---

## 画像/メディア添付

### 仕様
- 方式: **Presigned URL（S3）方式**。Base64不可・URL直接指定不可
- 対応ファイル: 画像（JPEG/PNG等）、動画、GIF、PDF
- 複数メディア: `media_ids` に複数IDを配列で渡せる（Xの制限4枚はTypefully側でバリデーション）
- Content-Typeヘッダー: S3 PUT 時は **設定しない**

### アップロードフロー（3ステップ）

**Step 1: Presigned URL を取得**

```http
POST /v2/social-sets/{social_set_id}/media/upload
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{"file_name": "photo.jpg"}
```

レスポンス:
```json
{
  "media_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "upload_url": "https://s3.amazonaws.com/..."
}
```

**Step 2: S3 に直接 PUT**

```http
PUT {upload_url からの URL}
（Content-Type ヘッダーなし）

[バイナリファイルデータ]
```

**Step 3: 処理完了を待つ**

```http
GET /v2/social-sets/{social_set_id}/media/{media_id}
Authorization: Bearer YOUR_API_KEY
```

レスポンス:
```json
{
  "status": "ready",
  "media_id": "xxxxxxxx-..."
}
```

`status` が `processing` の間はポーリングが必要。`ready` になったら draft 作成時の `media_ids` に指定可。

### ドラフト作成時の添付

```json
"posts": [
  {
    "text": "画像付きツイート",
    "media_ids": ["uuid-1", "uuid-2"]
  }
]
```

---

## 引用 RT（Quote Tweet）

### パラメータ
- `posts[].quote_post_url` に X 投稿の URL を指定する
- （確認済み）changelogs に「create quote-post-style tweets via API, MCP, and Agent Skill using `quote_post_url`」と明記あり

```json
"posts": [
  {
    "text": "引用コメント本文",
    "quote_post_url": "https://x.com/someuser/status/1234567890123456789"
  }
]
```

- `quote_post_url` はツイートIDではなく **URL形式**で指定する

---

## スケジュール（publish_at）

### 値の形式

| 値 | 動作 |
|----|------|
| `"now"` | 即時公開 |
| `"next-free-slot"` | キュー内の次の空きスロットに自動スケジュール |
| ISO 8601 日時文字列 | 指定日時に公開（例: `"2026-04-25T09:00:00.000Z"`） |

### タイムゾーン
- ISO 8601 文字列の末尾に `Z`（UTC）を付ける。または `+09:00` 形式でオフセット指定
- 例: `"2026-04-25T18:00:00+09:00"` → 日本時間 18:00

### キュースケジュール設定（PUT）

```json
{
  "rules": [
    {"h": 9, "m": 30, "days": ["mon", "wed", "fri"]},
    {"h": 18, "m": 0, "days": ["tue", "thu"]}
  ]
}
```

### ドラフト状態で保存（未投稿）
- `publish_at` を省略するか、スケジュールを設定しない → ドラフトとしてキューに入る
- `share: false` にすることで公開URLも生成しない

---

## Auto-RT / Auto-Plug / Thread Finisher

- これらの機能は UI から設定する「アカウントデフォルト設定」として機能する
- **v2 API のドラフト作成リクエストに `auto_rt` / `auto_plug` / `threadfinisher` 等のパラメータは確認できなかった**（ドキュメント未確認）
- v1 Help Center には「Auto retweet」「Auto plug」は記載されているが、APIパラメータとして明示されている記述は見つからず
- 実際の動作: アカウント設定で Auto-RT を有効にした状態でスケジュール投稿すると、設定に従って自動 RT が実行されると思われる（※推測）
- 確認方法: `typefully.com/docs/api` の API Playground で実際のレスポンス構造を確認するのが確実

---

## アカウント接続・管理（Social Sets）

### 概念
- 「Social Set」= 複数プラットフォームをまとめたグループ
- 1つの Social Set に X / LinkedIn / Bluesky 等のアカウントを紐付ける

### 複数Xアカウントの扱い
- Creator プラン: 最大5アカウント対応
- Team プラン: 無制限
- 複数Xアカウントを別々の Social Set として管理し、`social_set_id` を切り替えることで投稿先を指定する

### Social Set の取得

```http
GET /v2/social-sets?limit=50
Authorization: Bearer YOUR_API_KEY
```

レスポンスに含まれる `id` が `social_set_id`。

---

## アナリティクス API

### エンドポイント

```http
GET /v2/social-sets/{social_set_id}/analytics/x/posts?{params}
Authorization: Bearer YOUR_API_KEY
```

- 取得できるメトリクス: impressions / likes / retweets / 日付範囲フィルタ対応
- 詳細なパラメータ仕様はドキュメント未確認（実機またはAPI Playground で確認要）

---

## Webhook

- ドラフトが公開されたタイミング等でのWebhook通知をサポート
- v1 にあった通知エンドポイントは 2026年6月15日に廃止予定
- v2 での Webhook 設定方法はドキュメント未確認

---

## サンプルコード

### Node.js: 画像付きツイート予約投稿

```javascript
const fs = require('fs');

const API_KEY = process.env.TYPEFULLY_API_KEY;
const SOCIAL_SET_ID = 'your-social-set-id';
const BASE = 'https://api.typefully.com/v2';

const headers = {
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
};

// Step 1: Presigned URL 取得
async function uploadMedia(filePath) {
  const fileName = filePath.split('/').pop();

  const initRes = await fetch(`${BASE}/social-sets/${SOCIAL_SET_ID}/media/upload`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ file_name: fileName }),
  });
  const { media_id, upload_url } = await initRes.json();

  // Step 2: S3 に PUT（Content-Type は設定しない）
  const fileData = fs.readFileSync(filePath);
  await fetch(upload_url, {
    method: 'PUT',
    body: fileData,
  });

  // Step 3: ready になるまでポーリング
  while (true) {
    const statusRes = await fetch(`${BASE}/social-sets/${SOCIAL_SET_ID}/media/${media_id}`, { headers });
    const { status } = await statusRes.json();
    if (status === 'ready') return media_id;
    if (status === 'failed') throw new Error('Media processing failed');
    await new Promise(r => setTimeout(r, 2000)); // 2秒待機
  }
}

// Step 4: ドラフト作成（画像付き・スケジュール）
async function createScheduledTweet(text, imagePath, scheduleAt) {
  const mediaId = await uploadMedia(imagePath);

  const body = {
    platforms: {
      x: {
        enabled: true,
        posts: [
          { text, media_ids: [mediaId] }
        ],
      },
    },
    publish_at: scheduleAt, // 例: '2026-04-25T09:00:00+09:00' or 'next-free-slot'
    share: false,
  };

  const res = await fetch(`${BASE}/social-sets/${SOCIAL_SET_ID}/drafts`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  return await res.json();
}

// 実行例
createScheduledTweet(
  'テキスト本文。#hashtag',
  './image.jpg',
  '2026-04-25T18:00:00+09:00'
).then(console.log);
```

### Python: 画像付きツイート予約投稿

```python
import os
import time
import json
import requests

API_KEY = os.environ['TYPEFULLY_API_KEY']
SOCIAL_SET_ID = 'your-social-set-id'
BASE = 'https://api.typefully.com/v2'
HEADERS = {
    'Authorization': f'Bearer {API_KEY}',
    'Content-Type': 'application/json',
}


def upload_media(file_path: str) -> str:
    file_name = os.path.basename(file_path)

    # Step 1: Presigned URL 取得
    res = requests.post(
        f'{BASE}/social-sets/{SOCIAL_SET_ID}/media/upload',
        headers=HEADERS,
        json={'file_name': file_name},
    )
    res.raise_for_status()
    data = res.json()
    media_id = data['media_id']
    upload_url = data['upload_url']

    # Step 2: S3 PUT（Content-Type なし）
    with open(file_path, 'rb') as f:
        put_res = requests.put(upload_url, data=f)
    put_res.raise_for_status()

    # Step 3: ready になるまでポーリング
    while True:
        status_res = requests.get(
            f'{BASE}/social-sets/{SOCIAL_SET_ID}/media/{media_id}',
            headers=HEADERS,
        )
        status = status_res.json().get('status')
        if status == 'ready':
            return media_id
        if status == 'failed':
            raise RuntimeError('Media processing failed')
        time.sleep(2)


def create_scheduled_tweet(text: str, image_path: str, publish_at: str) -> dict:
    media_id = upload_media(image_path)

    body = {
        'platforms': {
            'x': {
                'enabled': True,
                'posts': [{'text': text, 'media_ids': [media_id]}],
            }
        },
        'publish_at': publish_at,
        'share': False,
    }

    res = requests.post(
        f'{BASE}/social-sets/{SOCIAL_SET_ID}/drafts',
        headers=HEADERS,
        json=body,
    )
    res.raise_for_status()
    return res.json()


# 実行例
result = create_scheduled_tweet(
    text='テキスト本文。#hashtag',
    image_path='./image.jpg',
    publish_at='2026-04-25T18:00:00+09:00',
)
print(json.dumps(result, indent=2, ensure_ascii=False))
```

### Node.js: 引用RT予約投稿

```javascript
const API_KEY = process.env.TYPEFULLY_API_KEY;
const SOCIAL_SET_ID = 'your-social-set-id';
const BASE = 'https://api.typefully.com/v2';

const headers = {
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
};

async function createQuoteTweet(commentText, quoteUrl, scheduleAt) {
  const body = {
    platforms: {
      x: {
        enabled: true,
        posts: [
          {
            text: commentText,
            quote_post_url: quoteUrl,  // 引用先ツイートのURL
          }
        ],
      },
    },
    publish_at: scheduleAt,
    share: false,
  };

  const res = await fetch(`${BASE}/social-sets/${SOCIAL_SET_ID}/drafts`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  return await res.json();
}

// 実行例
createQuoteTweet(
  'この投稿に同意。特に後半の部分が参考になった。',
  'https://x.com/someuser/status/1234567890123456789',
  'next-free-slot',  // キューの次の空きスロット
).then(console.log);
```

### Python: 引用RT予約投稿

```python
import os
import json
import requests

API_KEY = os.environ['TYPEFULLY_API_KEY']
SOCIAL_SET_ID = 'your-social-set-id'
BASE = 'https://api.typefully.com/v2'
HEADERS = {
    'Authorization': f'Bearer {API_KEY}',
    'Content-Type': 'application/json',
}


def create_quote_tweet(comment_text: str, quote_url: str, publish_at: str) -> dict:
    body = {
        'platforms': {
            'x': {
                'enabled': True,
                'posts': [
                    {
                        'text': comment_text,
                        'quote_post_url': quote_url,
                    }
                ],
            }
        },
        'publish_at': publish_at,
        'share': False,
    }

    res = requests.post(
        f'{BASE}/social-sets/{SOCIAL_SET_ID}/drafts',
        headers=HEADERS,
        json=body,
    )
    res.raise_for_status()
    return res.json()


# 実行例
result = create_quote_tweet(
    comment_text='この投稿に同意。特に後半の部分が参考になった。',
    quote_url='https://x.com/someuser/status/1234567890123456789',
    publish_at='next-free-slot',
)
print(json.dumps(result, indent=2, ensure_ascii=False))
```

---

## レート制限

- 公式ドキュメントに具体的なレート制限数値の記載なし（ドキュメント未確認）

---

## 不明点・未検証

| 項目 | 状況 |
|------|------|
| API 利用は何プランから？ | ドキュメント未確認。実機確認推奨 |
| 具体的なレート制限（req/min 等） | ドキュメント未確認 |
| `auto_rt` / `auto_plug` API パラメータ | v2 のリクエストボディには確認できず。UI 設定で制御する可能性あり |
| Thread Finisher API パラメータ | ドキュメント未確認 |
| Webhook v2 の設定方法 | ドキュメント未確認 |
| アナリティクスの詳細パラメータ | エンドポイントは確認済みだが、レスポンス構造の詳細は未確認 |
| 動画・GIF のサイズ上限 | ドキュメント未確認（Xの仕様に準拠すると思われる ※推測） |
| X の最大4枚画像制限の扱い | Typefully 側でバリデーションが入ると思われる（※推測） |
| Pro プランという名称 | 現在の公式プラン名は「Creator」と「Team」。調査時点で「Pro」という名称は確認されず |

---

## 参照ソース

- 公式 API ドキュメント: https://typefully.com/docs/api（ログイン必要で内部取得不可）
- Support: https://support.typefully.com/en/articles/8718287-typefully-api
- v1→v2 移行ガイド: https://support.typefully.com/en/articles/13133296-typefully-api-v1-v2-migration-guide
- 公式 GitHub: https://github.com/typefully/agent-skills（ソースコードから実装確認）
- Changelog: https://typefully.com/changelog
