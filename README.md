# 🤖 ai-driven-workspace-base

Claude Code（AI）とチームが協調して開発を進めるための**AI駆動型モノレポスケルトン**です。  
要件定義からコミット・PRまでの開発ライフサイクル全体を、スキル・エージェント・ドキュメント規約で自動化・標準化します。

---

## 📁 ディレクトリ構成

```
.
├── .claude/                # Claude Code カスタム設定（スキル・エージェント）
├── .github/                # GitHub Actions・Issue/PR テンプレート
├── backend/                # バックエンド（Laravel）
├── docs/                   # プロジェクトドキュメント（Single Source of Truth）
├── docker/                 # Docker 設定ファイル
├── frontend/               # フロントエンド（Next.js）
├── CLAUDE.md               # Claude Code へのプロジェクト指示書
├── .claudeignore           # Claude Code が読み込まないファイルの指定
├── .clau                   # Claude Code のローカル設定メモ
├── .mcp.json               # MCP サーバー設定
├── .octocov.yml            # カバレッジ計測・レポート設定
├── .env.example            # 環境変数のサンプル
├── .gitignore              # Git 管理対象外ファイルの定義
├── docker-compose.yml      # Docker コンテナ定義
└── Makefile                # よく使うコマンドのショートカット
```

---

## 📂 各ディレクトリ・ファイルの役割と記載内容

### 🤖 `.claude/`

Claude Code がプロジェクト内で動作するための**カスタム定義**を格納します。

| サブディレクトリ | 役割 | 何を書くか |
| --- | --- | --- |
| `agents/` | 特定の専門家ペルソナとして自律稼働するエージェント定義 | `name` / `model` / `tools` のフロントマター＋動作仕様（例: `steering-planner`・`code-reviewer`） |
| `skills/` | `/コマンド` で呼び出せるカスタムスキル定義 | `SKILL.md` にフロントマター＋プロセス・ルール（例: `/review`・`/commit`） |
| `settings.local.json` | Claude Code のローカル権限設定 | 許可する Bash コマンドの allowlist（`permissions.allow`）。機密情報は書かない |

> 詳細は `.claude/README.md` を参照。

---

### 🏛️ `CLAUDE.md`

Claude Code が**毎回自動的に読み込む**プロジェクト指示書です。  
ここに書いた内容が、このリポジトリ上でのすべての AI の行動規範になります。

**書くべき内容:**

| セクション | 内容 |
| --- | --- |
| プロジェクト概要 | 何を作っているか・技術スタック・モノレポ構成 |
| アーキテクチャ | 層の責務（Controller / Action / Repository / Service）・フロント設計原則（Server/Client 境界） |
| コード配置の判断フロー | 新しいロジックをどこに置くかの決定木 |
| コーディング規約 | 命名・禁止パターン・インポートルールなど |
| SDD 実装順序 | DB → バックエンド → フロントエンドの順序を強制 |
| Git 規約 | ブランチ命名・コミットメッセージ形式 |

> ⚠️ 実装コードを変更して設計と乖離が生じた場合は、コードと同時にこのファイルも更新すること。

---

### 🚫 `.claudeignore`

Claude Code がコンテキストとして**読み込まないファイル・ディレクトリ**を指定します。  
`.gitignore` と同じ書式（glob パターン）です。

**書くべき内容:**

```
# 生成物・キャッシュ（コンテキスト汚染防止）
vendor/
node_modules/
.next/
build/
dist/

# 機密情報
.env
.env.*
!.env.example

# ログ・一時ファイル
*.log
storage/logs/

# バイナリ・メディア
*.png
*.jpg
*.pdf
```

> コンテキストウィンドウを効率的に使うため、AI が読む必要のないファイルはここで除外します。

---

### 📝 `.clau`

Claude Code のセッションをまたいで保持したい**ローカルメモ・スクラッチパッド**として使用します。  
`.gitignore` に追加してリポジトリには含めないことを推奨します。

**書くべき内容の例:**

```
# 現在進行中のタスク
- Issue #42 の実装中（api-design まで完了）

# 一時的な作業メモ
- DB の users テーブルに role カラムを追加予定
- octocov のカバレッジ閾値を 80% → 85% に変更予定

# 次回 Claude に伝えること
- staging で〇〇のエラーが出ている
```

---

### 🔌 `.mcp.json`

Claude Code が使用する **MCP（Model Context Protocol）サーバー**の接続設定を定義します。  
Figma・Notion・GitHub などの外部ツールを Claude Code から直接操作できるようになります。

**書くべき内容:**

```json
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": ["-y", "@figma/mcp"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "${FIGMA_ACCESS_TOKEN}"
      }
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

> 接続するサービスごとにエントリを追加します。トークンは環境変数経由で渡し、直接書かないこと。

---

### 📊 `.octocov.yml`

CI でのカバレッジ計測・レポートを制御する **octocov** の設定ファイルです。  
PHPUnit が出力した `coverage.xml` を読み取り、PR へのコメントやバッジ生成を行います。

**書くべき内容:**

```yaml
coverage:
  paths:
    - backend/coverage.xml    # PHPUnit のカバレッジレポートパス

# PR へのカバレッジコメント
comment:
  on_pull_request: true       # PR にカバレッジ差分コメントを投稿

# カバレッジ閾値（下回ると CI が fail）
coverage_badge:
  path: docs/coverage_badge.svg

# 閾値設定
threshold:
  file: 80                    # ファイル単位のカバレッジ最低値（%）
```

---

### 🔐 `.env.example`

環境変数の**サンプルファイル**です。実際の値は書かず、キー名とダミー値・コメントだけを記載します。  
新しい開発者がローカル環境を構築する際の雛形として使います。

**書くべき内容:**

```bash
# アプリケーション
APP_NAME=ProjectName
APP_ENV=local
APP_KEY=                        # php artisan key:generate で生成

# データベース
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=project_db
DB_USERNAME=app
DB_PASSWORD=password

# 外部サービス（実際のキーはチームの秘密管理ツールで共有）
STRIPE_SECRET_KEY=sk_test_xxxx
FIREBASE_PROJECT_ID=
```

> `.env` 本体は `.gitignore` に必ず追加し、リポジトリに含めないこと。

---

### 🐳 `docker-compose.yml`

ローカル開発環境の**Dockerコンテナ定義**です。  
`make up` 一発でバックエンド・フロントエンド・DBが起動する環境を定義します。

**書くべき内容:**

```yaml
services:
  app:           # バックエンド（PHP/Laravel）
  frontend:      # フロントエンド（Next.js）
  mysql:         # データベース
  redis:         # キャッシュ・セッション（必要な場合）
  mailpit:       # メール受信確認（開発用）
```

---

### 🛠️ `Makefile`

よく使うコマンドを**短いエイリアス**で実行できるようにするファイルです。  
`docker compose exec` の長いコマンドを `make xxx` に短縮します。

**書くべき内容の例:**

```makefile
up:        ## コンテナ起動
down:      ## コンテナ停止
bash:      ## バックエンドコンテナに入る
migrate:   ## マイグレーション実行
seed:      ## シーダー実行
pint:      ## PHP フォーマット（Laravel Pint）
phpstan:   ## 静的解析（PHPStan）
test:      ## テスト実行
format:    ## フロント フォーマット（Prettier）
lint:      ## フロント 静的解析（ESLint）
lintfix:   ## フロント 自動修正
typecheck: ## フロント 型チェック（tsc）
```

---

### 🐙 `.github/`

GitHub の動作を制御する設定を格納します。

| ファイル/フォルダ | 何を書くか |
| --- | --- |
| `workflows/ci.yml` | PR・push 時の品質ゲート（Pint / PHPStan / PHPUnit / ESLint / tsc） |
| `workflows/release-pr.yml` | `develop → main` のリリース PR 自動作成 |
| `ISSUE_TEMPLATE/` | バグ報告・新機能・改善・タスクの Issue テンプレート |
| `PULL_REQUEST_TEMPLATE.md` | PR 作成時のデフォルト本文テンプレート |

> 詳細は `.github/README.md` を参照。

---

### 📚 `docs/`

プロジェクトの **Single Source of Truth（唯一の事実の源泉）** となるドキュメントを格納します。

| サブディレクトリ | 何を書くか |
| --- | --- |
| `requirements/` | 機能の要件定義書（ユーザーストーリー・受け入れ条件） |
| `features/` | 機能設計書（画面フロー・ビジネスルール・サーバー境界図） |
| `database/` | ER図・テーブル定義・インデックス設計 |
| `api/` | RESTful API 仕様（エンドポイント・リクエスト/レスポンス） |
| `maintenance/` | バグ修正・エンハンスの保守運用ドキュメント |
| `decisions/` | アーキテクチャ決定記録（ADR）|
| `runbooks/` | デプロイ・障害対応などの運用手順書 |
| `integrations/` | 外部サービス連携仕様（認証・API仕様・エラー対応） |
| `reference/` | 技術調査・用語集・参照資料 |

> ⚠️ 実装コードと設計書が乖離した場合は、必ず両方を同時に更新すること。

---

## 🚀 開発の始め方

```bash
# 1. 環境変数を設定
cp .env.example .env

# 2. コンテナを起動
make up

# 3. バックエンドのセットアップ
make migrate
make seed

# 4. ブラウザで確認
# フロントエンド: http://localhost:3000
# バックエンド API: http://localhost:8000
```

---

## 🤖 AI との協調開発フロー

```
/requirements   # 要件定義
/feature-design # 機能設計
/db-design      # DB設計
/api-design     # API仕様設計
/issue          # GitHub Issue 作成
/branch         # ブランチ作成
/implement      # 実装（完了後に自動で /review）
/figma-diff     # Figmaデザインとの突き合わせ（任意）
/test-gen       # テスト生成
/commit         # コミット（format/lint/typecheck 自動実行）
/pr             # PR 作成 + CI 監視・自己修復
```
