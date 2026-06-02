# CLAUDE.md

応答・コード内コメント・コミットメッセージはすべて日本語で記述する。

---

## マーキング定義

```text
[MUST]   例外が一切想定できないルール。
[SHOULD] 原則従う。合理的な理由がありレビュアーが合意した場合のみ例外可。
[FYI]    ルールではなく背景情報。「なぜそう決めたか」の補足。
```

---

## プロジェクト定義

| 項目                 | 値                                              |
| -------------------- | ----------------------------------------------- |
| 構成                 | Expoモノアプリ                                  |
| フレームワーク       | Expo (React Native), TypeScript                 |
| ナビゲーション       | Expo Router                                     |
| スタイリング         | NativeWind (TailwindCSS)                        |
| 永続化               | AsyncStorage                                    |
| パッケージマネージャ | npm                                             |
| タスクランナー       | Makefile                                        |

---

## リポジトリ構造

```
expo-todo-app/
├── CLAUDE.md
├── README.md
├── app.json
├── App.tsx               # エントリーポイント
├── global.css            # NativeWind用CSSエントリー
├── tailwind.config.js
├── metro.config.js
├── babel.config.js
├── tsconfig.json
├── Makefile
├── .claude/
│   ├── settings.local.json
│   └── skills/           # 再利用可能なAIワークフロー
├── docs/
│   ├── requirements/     # 要件定義書
│   ├── decisions/        # ADR（技術選定の記録）
│   └── architecture.md   # アーキテクチャ概要
├── app/                  # Expo Router 画面
│   ├── index.tsx         # List Screen
│   └── add-edit.tsx      # Add/Edit Screen
├── components/           # 再利用コンポーネント
│   └── TodoItem.tsx
├── hooks/                # カスタムフック
│   └── useTodos.ts
└── assets/               # 画像・アイコン
```

---

## Git 運用

### Issue 管理

エンハンス・改善・バグは **GitHub Issue で管理する**。

- ブランチ命名: `<type>/#<Issue番号>-<内容のkebab-case>`
- Issue 番号と type を揃える（`feat` Issue なら `feat/` ブランチ）

### ブランチ

```
main       ← 本番。直接コミット禁止
develop    ← 開発。機能ブランチのマージ先
  ├── feat/#6-todo-list-layout
  ├── fix/#xxx-bug-description
  └── chore/#1-expo-setup
```

### rebase 運用

[MUST] タスクブランチへの develop の取り込みは `git rebase` を使う
[MUST] PR を出す前に `git rebase origin/develop` を実行する
[MUST] force push は `--force-with-lease`。`--force` 禁止

### マージ戦略

| マージ方向               | マージ方法          |
| ------------------------ | ------------------- |
| タスクブランチ → develop | Squash and merge    |
| develop → main           | Create a merge commit |

### コミットメッセージ

```
<type>: <概要>
```

| type     | 用途           |
| -------- | -------------- |
| feat     | 新機能         |
| fix      | バグ修正       |
| refactor | リファクタ     |
| docs     | ドキュメント   |
| style    | フォーマット   |
| test     | テスト         |
| chore    | ビルド・設定   |

---

## 開発環境

### コマンド

```
make install   # 依存関係インストール（npm install）
make start     # Expo開発サーバー起動
make ios       # iOSシミュレーター起動
make android   # Androidエミュレーター起動
make typecheck # 型チェック（tsc --noEmit）
```
