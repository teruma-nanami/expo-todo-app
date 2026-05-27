# 🚀 pr — Pull Request 作成

Git Flow に沿って Pull Request を作成し、CI 監視と自己修復を行うスキル。

## 使い方

```
/pr
```

## プロセス

1. 現在のブランチと変更内容を確認
2. ベースブランチを判定（`feature/*` → `develop` / `hotfix/*` → `main`）
3. 既存 PR の有無を確認（あれば新規作成ではなく更新）
4. `git push`（初回は `-u origin`、rebase 後は `--force-with-lease`）
5. PR タイトル・本文を提案 → ユーザー承認
6. `gh pr create` で PR 作成
7. CI を監視（`gh pr checks --watch`）
8. 失敗時は自己修復 → 完了報告

## CI 自己修復

| 失敗パターン | 対応 |
| --- | --- |
| Prettier 未適用 | `make format` → コミット → push |
| ESLint エラー | `make lintfix` → コミット |
| PHP Pint 未適用 | `make pint` → コミット → push |
| TypeScript 型エラー | 型定義を修正してコミット |
| **PHPUnit / Jest 失敗** | **自動修正しない → ユーザーに原因確認** |
| ビルド失敗（原因不明） | ログを報告してユーザーに相談 |

## ルール

- 承認なしに PR を作成しない
- 1 PR = 1 機能
- タイトルは 70 文字以内
- `git push --force` 禁止（`--force-with-lease` のみ）
- 同じ失敗が2回続いたらループを抜けてユーザーに報告
