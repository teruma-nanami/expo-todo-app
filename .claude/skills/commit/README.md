# 📝 commit — コミット

CLAUDE.md の Git 規約に沿ってコミットを作成するスキル。format / lint / typecheck を自動実行してから提案する。

## 使い方

```
/commit
```

## プロセス

1. `git status` / `git diff --stat` で変更内容を確認
2. 現在のブランチが `main` / `develop` でないことを確認（保護ブランチなら `/branch` を案内）
3. 変更ファイルに応じたチェックを**自動実行**
4. コミットメッセージを提案 → ユーザー承認
5. 承認後にコミット実行（末尾に `Co-Authored-By: Claude` を付与）

## 自動チェック

| 差分 | 実行コマンド | 失敗時 |
| --- | --- | --- |
| `backend/**/*.php` | `make pint` | 自動整形してステージに含める |
| `frontend/**/*.{ts,tsx,...}` | `make format` → `make lint` | 整形後、lint エラーは `make lintfix` で自動修正。残るエラーはユーザーに通知してコミット中断 |
| `frontend/**/*.{ts,tsx}` | `make typecheck` | 型エラーは必ず通知してコミット中断 |

## コミットメッセージ形式

```
<type>: <概要（日本語）>
```

type: `feat` / `fix` / `refactor` / `docs` / `style` / `test` / `chore` / `hotfix`

## ルール

- 承認なしにコミットしない
- lint エラー・型エラーが残った状態でコミットしない
- 機密ファイル（.env, .pem, .key）をステージしない
- 複数の論理的変更が混ざっている場合は分割コミットを提案
