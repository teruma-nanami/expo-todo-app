# CLAUDE.md

応答・コード内コメント・コミットメッセージはすべて日本語で記述する。

各サブディレクトリの CLAUDE.md も自動でロードされる。

- `backend/` 作業時は `backend/CLAUDE.md` を参照
- `frontend/` 作業時は `frontend/CLAUDE.md` を参照

---

## マーキング定義

```text
[MUST]   例外が一切想定できないルール。
[SHOULD] 原則従う。合理的な理由がありレビュアーが合意した場合のみ例外可。
[FYI]    ルールではなく背景情報。「なぜそう決めたか」の補足。
```

---

## プロジェクト定義

| 項目                 | 値                                                                                                                                     |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 構成                 | モノレポ（`frontend/` + `backend/`）                                                                                                   |
| フロントエンド       | TypeScript 5, Next.js 16 (App Router), React 19, Tailwind CSS 4, Radix UI                                                              |
| バックエンド         | PHP 8.4, Laravel 12                                                                                                                    |
| DB                   | MySQL 8.4 LTS                                                                                                                          |
| インフラ             | Docker, Terraform (AWS)                                                                                                                |
| パッケージマネージャ | npm (frontend), Composer (backend)                                                                                                     |
| タスクランナー       | Makefile                                                                                                                               |
| 認証                 | 管理者: Google OAuth（Laravel Socialite）+ メアドホワイトリスト + Sanctum セッション。ユーザー: Laravel Sanctum（メアド + パスワード） |

---

## リポジトリ構造

```
project/
├── CLAUDE.md                    # アーキテクチャ・規約・ルール（常時ロード）
├── README.md                    # プロジェクト概要（人間向け）
├── .claude/
│   ├── settings.json            # 権限・hooks 設定
│   ├── settings.local.json      # ローカル設定（.gitignore 対象）
│   ├── agents/                  # 特化型AIエージェント
│   └── skills/                  # 再利用可能なAIワークフロー（スラッシュコマンド）
├── .mcp.json                    # GitHub MCP 設定
├── docs/                        # 仕様・設計ドキュメント
│   ├── README.md                # オンボーディング起点（新規参画者の入口）
│   ├── requirements/            # 要件定義書
│   ├── features/                # 機能設計書（機能一覧・画面フロー・状態遷移）
│   ├── decisions/               # ADR（アーキテクチャ決定記録）
│   ├── api/                     # API仕様（自サービスが提供する正本）
│   ├── database/                # DB設計
│   ├── runbooks/                # 運用手順書（setup / deployment / incident-response 等）
│   ├── reference/               # 既知の罠・Enum 一覧などのリファレンス
│   ├── integrations/            # 連携開発の基本ルール
│   └── maintenance/             # 進行中の連携案件（{連携先}/ 配下に進行中ドキュ）
├── backend/                     # Laravel
├── frontend/                    # Next.js
├── infra/                       # Terraform
├── docker-compose.yml
├── Makefile
├── .gitignore
└── .claudeignore
```

### 仕様ドキュメント（docs/）

仕様駆動開発（SDD）に基づき、**仕様を先に書き、仕様に対して実装する。**

```
1. 仕様作成（/requirements → /feature-design → /db-design → /api-design）
2. 仕様レビュー
3. 実装（/implement：仕様を入力として）
4. テスト（/test-gen：仕様との整合性を検証）
```

---

## Git 運用

### Issue 管理（タスク・改善・バグの起票ルール）

エンハンス・改善・バグ・調査タスクは **GitHub Issue で管理する**。docs には「現状の仕様・運用手順」のみ記載し、`[ ]` 形式の TODO リストは原則残さない。気付き次第 Issue に登録すること。

- 起票には `.github/ISSUE_TEMPLATE/` のテンプレートを使う
  - **bug_report**: 既存機能が期待通りに動かない
  - **feature_request**: 新機能の追加
  - **improvement**: 既存機能の改善・リファクタ・性能改善・UX 改善
  - **task**: 調査・ドキュメント・運用準備など、コード変更を伴わない作業
- ブランチ命名は `<type>/#<Issue番号>-<内容>`。Issue 番号と type を揃える（`feat` Issue なら `feat/` ブランチ）
- docs に「将来やること」を書きたくなった時は、まず Issue を立てて docs からはリンクのみ貼る

### ブランチ

```
main       ← 本番。直接コミット禁止
develop    ← ステージング。機能ブランチのマージ先
  ├── feat/#123-user-registration       ← 新機能
  ├── fix/#456-csv-export-bug           ← バグ修正（緊急修正含む）
  └── refactor/#789-auth-logic          ← リファクタリング
# 命名規則: <type>/#<Issue番号>-<内容の kebab-case>
# すべてのブランチは develop から作成する（緊急修正も例外なし、`hotfix` type は廃止）
# 緊急バグ修正も fix/ を使う。緊急性は GitHub のラベル等で表現する
```

### rebase 運用

[MUST] タスクブランチへの develop / main の取り込みは `git merge` ではなく `git rebase` を使う
[MUST] PR を出す前に必ず `git rebase origin/develop` を実行する（レビュー開始時点で最新差分を見せるため）
[SHOULD] レビュー期間中はコンフリクト発生時のみ追加で rebase（マージ直前の強制 rebase は不要）

❌ `git merge origin/develop`
✅ `git fetch origin && git rebase origin/develop`

コンフリクト解消後は `git rebase --continue` で再開する。

[MUST] force push は `--force-with-lease`。`--force` 禁止

❌ `git push --force`
✅ `git push --force-with-lease`

[MUST] develop / main ブランチでは rebase 禁止（共有ブランチの歴史を書き換えない）

### マージ戦略

| マージ方向               | マージ方法                              | 理由                                     |
| ------------------------ | --------------------------------------- | ---------------------------------------- |
| タスクブランチ → develop | **Squash and merge**                    | 作業コミットを整理して履歴をきれいに保つ |
| develop → main           | **Create a merge commit（通常マージ）** | 履歴を繋げて次回PRの差分を正しく保つ     |

[FYI] develop → main でスカッシュマージすると、Git が履歴の親子関係を認識できなくなり、次回 PR で過去の全差分が再表示される。必ず通常マージを使うこと。

### コミットメッセージ

```
<type>: <概要>
```

| type     | 用途                     |
| -------- | ------------------------ |
| feat     | 新機能                   |
| fix      | バグ修正（緊急修正含む） |
| refactor | リファクタリング         |
| docs     | ドキュメント             |
| style    | フォーマット             |
| test     | テスト                   |
| chore    | ビルド・設定             |

### PR

**タスクブランチ → develop:**

[MUST] 1 PR = 1 機能
[MUST] タイトルはコミットメッセージ規約に準拠

**develop → main（Release PR）:**

[MUST] タイトル: `Release: YYYY/MM/DD`
[SHOULD] 本文: 含まれる PR の一覧 + 確認状況チェックリスト
[MUST] `.github/workflows/release-pr.yml` の `workflow_dispatch` 経由でのみ作成（手動 `gh pr create` 禁止）

### approve ルール

| PR の種類                    | 必要な approve | 担当   |
| ---------------------------- | -------------- | ------ |
| タスクブランチ → develop     | **最低 1 名**  | **PL** |
| develop → main（Release PR） | **最低 1 名**  | **PM** |

[MUST] approve なしのマージは禁止
[FYI] 自動レビュー（claude-code / codex）は **PG（開発者）自身**が PR 提出前のセルフチェックとして実施するもの。人手レビューの代替にはならない（両方を経る前提）

---

## 開発環境

### コマンド

```
make install              # 初期セットアップ
make up / down / restart  # コンテナ管理
make fresh                # DB初期化 + シード
make migrate              # マイグレーション
make seed                 # シーディング
make test                 # PHPUnit
make pint                 # PHP フォーマット
make lint / lintfix       # Next.js リント
make format               # Next.js フォーマット
make typecheck            # Next.js 型チェック（tsc --noEmit）
make api-export           # OpenAPI YAML エクスポート
make run-daily-batches    # 日次バッチ
make run-monthly-batches  # 月次バッチ
```

### アクセス先

| サービス         | URL                            |
| ---------------- | ------------------------------ |
| フロントエンド   | http://localhost:3000          |
| バックエンド API | http://localhost:8000          |
| API ドキュメント | http://localhost:8000/docs/api |
| Swagger UI       | http://localhost:8082          |
| phpMyAdmin       | http://localhost:8080          |
| MailHog          | http://localhost:8025          |

---

## サービス間連携

詳細は `docs/integrations/` を参照。

[MUST] 他サービスの内部 docs は参照しない。API 仕様等の接点情報は自サービス内に持つ
[MUST] 自サービスが提供する API の仕様は `docs/api/` に正本を置く

[SHOULD] 連携案件の進行中は `docs/maintenance/{連携先}/` で管理し、完了後に正式ドキュメントへ統合する

---

## MCP（GitHub 連携）

- 設定: `.mcp.json`（プロジェクトスコープ）
- 認証: OAuth（初回 `/mcp` でブラウザ認証）

[MUST] push は `git push` で行う（MCP 経由禁止）
[MUST] Issue/PR 作成は必ずユーザーに確認してから実行

| 操作                              | 権限  |
| --------------------------------- | ----- |
| 読み取り（参照・検索）            | allow |
| 書き込み（作成・更新）            | ask   |
| リモート直接変更（push_files 等） | deny  |
