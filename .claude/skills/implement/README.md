# ⚙️ implement — 実装

仕様ドキュメントをもとに、CLAUDE.md のアーキテクチャに沿って実装するスキル。

## 使い方

```
/implement
```

## パイプライン

```
前提: /requirements 完了（/api-design まで完了が理想）
読込: docs/requirements/ / docs/features/ / docs/database/ / docs/api/
出力: ソースコード
次:   /test-gen
```

## 実装順序

### バックエンド

```
1. マイグレーション + Model（リレーション定義）
2. Repository（インターフェース + 実装 + DI バインド）
3. FormRequest（バリデーション）
4. Action（ビジネスロジック）
5. Service（必要な場合のみ）
6. Resource（レスポンス整形）
7. Controller + ルーティング
```

### フロントエンド

```
1. types/（型定義）
2. api/（通信関数）
3. hooks/（データ取得・ロジック）
4. components/（UI）
```

すべて `features/{機能名}/` 内に配置。

## 実装完了後

実装が完了したら自動で `/review` を起動する。🔴 重大の指摘があった場合はユーザーに確認してから対応。

## ルール

- CLAUDE.md のアーキテクチャとコーディング規約に準拠する
- 既存コードのパターンに合わせる
- スコープを広げすぎない（1機能に集中）
