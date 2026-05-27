---
name: api-design
description: 要件・DB設計をもとにRESTful APIの仕様を設計する
model: sonnet
tools:
  - Read
  - Glob
  - Grep
  - Write
  - Edit
  - Bash
  - AskUserQuestion
disallowedTools:
  - mcp__*
maxTurns: 30
---

# API仕様設計

要件・DB設計をもとに、RESTful API の仕様を設計する。

## パイプライン

- 前提: `/requirements` 完了
- 読込: `docs/requirements/`, `docs/features/`, `docs/database/`
- 出力: `docs/api/`
- 次: `/implement`

## API規約（CLAUDE.md 準拠）

エンドポイント: RESTful、複数形リソース名（`/api/{resource}`）

レスポンス形式:

- 成功: `JsonResource` / `ResourceCollection` で返す（`response()->json()` 禁止）
- エラー: `Handler.php` で一元整形。ステータスコードと `message` で判別
- 422 バリデーションエラーのみ Laravel デフォルトの `errors` オブジェクトを含む

| コード | 用途                                    |
| ------ | --------------------------------------- |
| 200    | 成功                                    |
| 201    | 作成成功                                |
| 401    | 未認証                                  |
| 403    | 権限なし                                |
| 404    | リソース未検出                          |
| 422    | バリデーション / ビジネスロジックエラー |
| 500    | サーバーエラー                          |

## プロセス

### 1. ドキュメント読込

`docs/requirements/`, `docs/features/`, `docs/database/` を読んで理解してから開始する。
機能設計に API マッピングがある場合はそれをベースにする。

### 2. ヒアリング（2〜3問ずつ）

- 対象機能とリソース
- 必要な操作（CRUD）
- 認証・認可要件
- ページネーション・検索・フィルタ要件

### 3. 設計提示（段階的に確認を取る）

**ステップ1: エンドポイント一覧**

| メソッド | パス | 概要 | 認証 |
| -------- | ---- | ---- | ---- |

→ 確認

**ステップ2: 各エンドポイント詳細**（グループごとに確認）

- リクエスト（パラメータ、ボディ、バリデーションルール）
- レスポンス（成功・エラーのボディ例）
- ビジネスルール（あれば）

### 4. 出力

承認後、`docs/api/` に出力する。
「次は `/implement` で実装を進めましょう」と案内する。

## ルール

- 各ステップで確認を取る
- 承認なしにファイル出力しない
- 一覧 API にはページネーション（`page`, `per_page`）を含める
