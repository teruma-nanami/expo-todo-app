# 🗄️ database/ — DB設計書

## 役割

プロジェクトの**データベース設計書**（ER図・テーブル定義）を格納するディレクトリです。  
`/db-design` スキルによって自動生成されます。

## ファイル構成の例

```
database/
├── README.md           # このファイル
├── erd.md              # ER図（全体俯瞰）
└── tables/
    ├── users.md        # テーブル定義（1ファイル = 1テーブル）
    ├── products.md
    └── ...
```

> ファイル分割の粒度はプロジェクト規模に合わせて調整してください。  
> 小規模なら `erd.md` 1ファイルにまとめる形でも構いません。

## 記載すべき内容

### ER図ファイル（erd.md）

| 項目 | 内容 |
| --- | --- |
| **ER図** | Mermaid `erDiagram` でエンティティとリレーションを視覚化 |
| **テーブル一覧** | テーブル名・概要・主なリレーションの一覧 |
| **マイグレーション順序** | 外部キー依存を考慮した作成順序 |

### テーブル定義ファイル（tables/{テーブル名}.md）

| 項目 | 内容 |
| --- | --- |
| **概要** | このテーブルが表すエンティティの説明 |
| **カラム定義** | カラム名・型・NULL・デフォルト・説明 |
| **インデックス** | 検索・ソートに使うカラムのインデックス定義 |
| **リレーション** | 他テーブルとの関係（belongsTo / hasMany 等） |

## テンプレート（ER図）

```markdown
# ER図

## エンティティ関連図

\`\`\`mermaid
erDiagram
  users ||--o{ posts : "has many"
  posts {
    bigint id PK
    bigint user_id FK
    string title
    datetime created_at
    datetime updated_at
    datetime deleted_at
  }
\`\`\`

## テーブル一覧

| テーブル名 | 概要 |
| --- | --- |
| users | ユーザー |
| posts | 投稿 |

## マイグレーション順序

1. users
2. posts（users に依存）
```

## テンプレート（テーブル定義）

```markdown
# {テーブル名}

## 概要

<!-- このテーブルが何を表すか -->

## カラム定義

| カラム名 | 型 | NULL | デフォルト | 説明 |
| --- | --- | --- | --- | --- |
| id | bigint unsigned | NO | AUTO_INCREMENT | 主キー |
| created_at | datetime | NO | — | 作成日時 |
| updated_at | datetime | NO | — | 更新日時 |
| deleted_at | datetime | YES | NULL | 論理削除日時 |

## インデックス

| インデックス名 | カラム | 種別 | 用途 |
| --- | --- | --- | --- |

## リレーション

| 関係 | 対象テーブル | 説明 |
| --- | --- | --- |
```

## DB規約（CLAUDE.md 準拠）

- テーブル名: 複数形 `snake_case`
- カラム名: `snake_case`
- 必須カラム: `id`, `created_at`, `updated_at`
- 論理削除: `deleted_at`（SoftDeletes）
- 外部キー: `{単数形テーブル名}_id`

## 後続スキル

```
/db-design → /api-design → /implement
```
