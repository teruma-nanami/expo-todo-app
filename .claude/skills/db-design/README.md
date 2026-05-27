# 🗄️ db-design — DB設計

要件・機能設計をもとに ER 図とテーブル定義を設計するスキル。

## 使い方

```
/db-design
```

## パイプライン

```
前提: /requirements 完了
読込: docs/requirements/ / docs/features/
出力: docs/database/
次:   /api-design
```

## DB規約（CLAUDE.md 準拠）

- テーブル名: 複数形 `snake_case`
- カラム名: `snake_case`
- 必須カラム: `id`, `created_at`, `updated_at`
- 論理削除: `deleted_at`（SoftDeletes）
- 外部キー: `{単数形テーブル名}_id`

## プロセス

1. ドキュメント読込
2. ヒアリング（主要エンティティ・リレーション・検索項目・拡張性）
3. ER図（Mermaid erDiagram）→ 承認
4. テーブル詳細（カラム・型・NULL・デフォルト）→ テーブルごとに承認
5. インデックス・マイグレーション順序 → 承認
6. `docs/database/` に出力

## ルール

- 各ステップで確認を取る
- 承認なしにファイル出力しない
- 第3正規形を基本。パフォーマンス上必要な場合のみ非正規化
