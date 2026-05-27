# PR作成

Git Flow に沿って Pull Request を作成し、CI 監視と自己修復を行う。

## プロセス

### 1. 現在のブランチと変更内容を確認

```bash
git status
git log develop..HEAD --oneline
git diff develop...HEAD --stat
```

- リモート追跡がない場合は push が必要
- ベースブランチを判定:
  - `feature/*` `feat/*` `refactor/*` `fix/*` `chore/*` `docs/*` `test/*` `style/*` → `develop`
  - `hotfix/*` → `main`
  - `release/*` → `main`

### 2. 既存 PR の有無を確認

```bash
gh pr list --head <current-branch> --json number,state,title
```

既存 PR がある場合は「新規作成」ではなく **タイトル・本文の更新 + 追加コミットの push** で対応する。

### 3. push

```bash
# 初回
git push -u origin <current-branch>

# rebase 後
git push --force-with-lease
```

`--force` は禁止。必ず `--force-with-lease` を使う。

### 4. PR タイトル・本文の提案

タイトル: コミットメッセージ規約に準拠、70 文字以内。

本文テンプレート:

```markdown
## Summary

- 1〜3 行で変更の目的を端的に
- レビュアーが最初に知りたいのは「なぜ」と「何を変えたか」

## 主な実装

- 技術的ポイント（設計判断・層構成）
- 本 PR で解決する Issue / 設計書へのリンク

## 本 PR 対象外（将来対応）

- 明示的に今回やらないこと。レビュアーの期待値調整

## Test plan

- [ ] lint / typecheck / test が通る
- [ ] 動作確認の手順（URL、curl、画面操作）
- [ ] 既存機能の回帰チェック

🤖 Generated with [Claude Code](https://claude.ai/code)
```

ユーザーの承認を得てから PR を作成・更新する。

### 5. CI 監視（自動）

PR 作成・更新後、CI の完了を待つ:

```bash
gh pr checks <PR番号> --watch
```

完了時、終了コードが 0 なら全 pass。非 0 なら 1 つ以上失敗しているので次ステップへ。

### 6. CI 失敗時の自己修復ループ

最新の workflow run ID を取得し、失敗ジョブのログを取得する:

```bash
# 現在のブランチの最新 run-id を取得
RUN_ID=$(gh run list --branch "$(git branch --show-current)" --limit 1 --json databaseId --jq '.[0].databaseId')
gh run view "$RUN_ID" --log-failed | tail -200
```

**定型失敗は自動修復** する:

| 失敗パターン           | 自己修復アクション                                                            |
| ---------------------- | ----------------------------------------------------------------------------- |
| Prettier format 未適用 | `make format` → 差分を `style: Prettier フォーマットを適用` でコミット → push |
| ESLint エラー          | `make lintfix` → 残るエラーは内容を確認して修正 → コミット                    |
| PHP Pint 未適用        | `make pint` → 差分を `style: Pint フォーマットを適用` でコミット → push       |
| TypeScript 型エラー    | 型定義を修正してコミット                                                      |
| PHPUnit / Jest の失敗  | 失敗内容を報告し、**自動修正せず** ユーザーに原因を確認する                   |
| ビルド失敗（原因不明） | ログを報告し、ユーザーに対応方針を確認する                                    |

**ループ終了条件:**

- CI が全てパス
- 同じ失敗が 2 回続く（ループを抜けてユーザーに報告）
- テスト失敗など自動修復対象外

### 7. 完了報告

- PR URL を提示
- CI 状況（pass / fail）を明示
- 次のアクション（レビュー依頼、マージ）を案内

## ルール

- 承認なしに PR を作成しない
- 1 PR = 1 機能
- タイトルは 70 文字以内
- `git push --force` 禁止（`--force-with-lease` のみ）
- CI 失敗時は自動修復 → ダメならユーザー相談、無言で放置しない
- テスト失敗は自動修正しない（原因究明をユーザーと行う）

## Troubleshooting

Error: `gh pr checks --watch` が長時間終わらない
Cause: CI が遅い、または中断
Solution: Bash タイムアウト（最大 600000ms = 10 分）の範囲でリトライ。それでも終わらない場合はループを抜け、`gh run list --branch <branch> --limit 1` で状況を確認してユーザーに報告

Error: 同じ失敗が連続
Cause: 自己修復スクリプトが問題を解決できていない
Solution: ループを抜け、失敗ログをユーザーに報告。手動修正方針を相談
