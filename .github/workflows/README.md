# ⚙️ workflows フォルダについて

## 概要

このフォルダは **GitHub Actions のワークフロー定義**を管理しています。

ここに配置した `.yml` ファイルは、プッシュ・PR 作成・手動実行などのトリガーに応じて GitHub 上で自動実行されます。CI/CD パイプラインやリリース自動化など、開発運用の定型作業を自動化するために使用します。

---

## 📂 ファイル一覧

| ファイル名 | ワークフロー名 | トリガー | 状態 |
| --- | --- | --- | --- |
| `release-pr.yml` | Create Release PR (develop → main) | 手動実行（`workflow_dispatch`） | ✅ 実装済み |
| `ci.yml` | CI | 未定 | 🚧 準備中 |

---

## 📝 各ワークフロー詳細

### 🚀 release-pr.yml — リリース PR 作成・更新

`develop` → `main` のリリース PR を **自動作成・更新** するワークフロー。  
リリース PR の作成は必ずこのワークフロー経由で行います（手動 `gh pr create` 禁止）。

#### トリガー

GitHub の **Actions タブ → 「Create Release PR」→「Run workflow」** から手動実行。

#### 処理の流れ

```
1. デプロイ予定日を算出（JST 基準で直近の火曜 or 木曜）
     ↓
2. main..develop の差分から含まれる PR 一覧を収集
     ↓
3. PR 本文を組み立て（デプロイ予定日・実行者・含まれる変更）
     ↓
4. 既存 PR があれば更新、なければ新規作成
     ↓
5. Job Summary に PR URL とデプロイ日を出力
```

#### デプロイ予定日ロジック

実行日（JST）をもとに、直近の**火曜 or 木曜**を自動算出します。

| 実行日 | デプロイ予定日 |
| --- | --- |
| 月曜 | 翌火曜 |
| 火曜 | 当日 |
| 水曜 | 翌木曜 |
| 木曜 | 当日 |
| 金曜 | 翌火曜 |
| 土曜 | 翌火曜 |
| 日曜 | 翌火曜 |

#### PR 本文の構成

自動生成される PR 本文には以下が含まれます。

```markdown
## デプロイ予定日
YYYY/MM/DD (火 or 木) 22:00 以降

## 実行者
@<GitHub ユーザー名>

## 含まれる変更
- #123 PR タイトル (@author)
- #124 PR タイトル (@author)
...
```

#### 注意事項

- `main..develop` のコミット履歴から **merge commit** と **squash merge** の両形式に対応して PR 番号を抽出します
- PR タイトルの Markdown 特殊文字（`@` `[` `]` `<` `>` など）は自動エスケープされ、意図しないメンション通知やリンク化を防止します
- `base:main / head:develop` の open PR が複数ある場合は最初の1件のみを更新し、警告を出します

#### 必要な権限

```yaml
permissions:
  contents: read
  pull-requests: write
```

---

### 🔄 ci.yml — CI（準備中）

現在は空のプレースホルダーです。今後、以下のような CI チェックを追加予定です。

- PHP: Pint（フォーマット）/ PHPStan（静的解析）/ PHPUnit（テスト）
- TypeScript: ESLint / TypeCheck / Jest
- PR 作成・プッシュをトリガーに自動実行

---

## 🛠️ 新規ワークフローの追加方法

1. このフォルダに `.yml` ファイルを作成する
2. 本 `README.md` のファイル一覧・詳細セクションを更新する

```yaml
# ワークフローの基本構造
name: ワークフロー名
on:
  push:
    branches: [develop]
  pull_request:
    branches: [develop, main]
  workflow_dispatch:  # 手動実行

jobs:
  job-name:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: ステップ名
        run: |
          コマンド
```
