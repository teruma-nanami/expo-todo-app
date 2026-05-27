# ⚙️ workflows フォルダについて

## 概要

このフォルダは **GitHub Actions のワークフロー定義**を管理しています。

ここに配置した `.yml` ファイルは、プッシュ・PR 作成・手動実行などのトリガーに応じて GitHub 上で自動実行されます。CI/CD パイプラインやリリース自動化など、開発運用の定型作業を自動化するために使用します。

---

## 📂 ファイル一覧

| ファイル名 | ワークフロー名 | トリガー | 状態 |
| --- | --- | --- | --- |
| `release-pr.yml` | Create Release PR (develop → main) | 手動実行（`workflow_dispatch`） | ✅ 実装済み |
| `ci.yml` | CI | PR（develop・main）/ push（develop） | ✅ 実装済み |

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

### 🔄 ci.yml — CI（品質ゲート）

PR で発火する品質ゲートワークフロー。整形・静的解析・カバレッジに違反した PR はマージ不可（ブランチ保護で required に設定する想定）。

#### トリガー

- `pull_request`: `develop` / `main` への PR 作成・更新時
- `push`: `develop` ブランチへのプッシュ時

#### ジョブ構成

| ジョブ | 内容 |
| --- | --- |
| **backend** | Pint（整形チェック）/ PHPStan（静的解析）/ PHPUnit（カバレッジ計測）/ octocov（PR コメント・80% 閾値判定） |
| **frontend** | ESLint（warnings 含めて 0 必須）/ Prettier（整形チェック）/ tsc（型チェック） |

#### backend ジョブの詳細

- **PHP バージョン**: 8.4（pcov によるカバレッジ計測を有効化）
- **MySQL**: 8.4 をサービスコンテナで起動
- **Pint**: `--test` モードで差分検出時に exit 1（整形漏れの PR を弾く）
- **PHPStan**: baseline で抑制済みの既存エラーは無視し、新規エラーのみ fail
- **PHPUnit**: `--coverage-clover=coverage.xml` でカバレッジを計測
- **octocov**: カバレッジ 80% 未満の PR を fail・結果を PR にコメント

#### frontend ジョブの詳細

- **Node.js バージョン**: 22
- **ESLint**: `--max-warnings 0` で warning も fail 扱い
- **Prettier**: `--check` モードで差分検出時に exit 1
- **tsc**: `--noEmit` で型エラーを検出

#### 必要な権限

```yaml
permissions:
  contents: read
  pull-requests: write
```

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
