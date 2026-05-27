# ブランチ作成

Git Flow に沿ってブランチを作成する。

## プロセス

1. ブランチの種類を確認:
   - `feature/{タスク名}` ← develop から作成（新機能）
   - `hotfix/{内容}` ← main から作成（本番緊急修正）
   - `release/{x.x.x}` ← develop から作成（リリース準備）
2. ブランチ名を提案し、ユーザーの承認を得る
3. 適切なベースブランチから新ブランチを作成

## ルール

- ブランチ名は英語 kebab-case（例: `feature/user-registration`）
- 承認なしにブランチを作成しない
