# Contributing Guide

## 開発フロー

```
1. Issue を確認する
2. develop からブランチを切る
3. 実装してコミット
4. PRを develop に向けて作成
5. CIが通ったらSquash mergeする
```

---

## ブランチ命名規則

```
<type>/#<Issue番号>-<内容のkebab-case>
```

| type | 用途 |
| ---- | ---- |
| `feat` | 新機能 |
| `fix` | バグ修正 |
| `docs` | ドキュメント |
| `refactor` | リファクタリング |
| `chore` | ビルド・設定 |

**例:**
```
feat/#6-todo-list-layout
fix/#456-async-storage-bug
docs/#2-readme
```

---

## コミットメッセージ

```
<type>: <概要>（#<Issue番号>）
```

**例:**
```
feat: Todoリストの画面レイアウトを実装（#6）
fix: AsyncStorageの保存が失敗する問題を修正（#9）
docs: README.mdをexpo-todo-app用に更新（#2）
```

---

## PR のルール

- **1 PR = 1 Issue**
- マージ先は必ず `develop`
- マージ方法は **Squash and merge**
- CIが通っていることを確認してからマージ

---

## ブランチ保護

| ブランチ | ルール |
| -------- | ------ |
| `main` | 直接コミット禁止。`develop` からのみマージ |
| `develop` | 直接コミット禁止。機能ブランチからのみマージ |

---

## rebase 運用

作業ブランチに `develop` の変更を取り込む場合は `merge` ではなく `rebase` を使う。

```bash
# developの最新を取り込む
git fetch origin
git rebase origin/develop

# force pushは --force-with-lease を使う
git push --force-with-lease
```
