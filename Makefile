.PHONY: help install ensure-env up down clean restart build \
       fresh migrate seed test test-coverage \
       pint stan lint lintfix format typecheck \
       api-export run-daily-batches run-monthly-batches \
       shell-backend shell-frontend logs logs-frontend \
       e2e report

# デフォルト
help: ## ヘルプ表示
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# --- セットアップ ---
install: ensure-env ## 初期セットアップ（クローン直後の初回のみ実行）
	docker compose build --no-cache
	docker compose up -d
	docker compose exec -T backend composer install
	docker compose exec -T backend sh -c '[ -f .env ] || cp .env.example .env'
	docker compose exec -T backend php artisan key:generate
	docker compose exec -T backend php artisan migrate:fresh --seed
	@echo ""
	@echo "==================================================================="
	@echo " セットアップ完了"
	@echo "-------------------------------------------------------------------"
	@echo "  backend:    http://localhost:8000"
	@echo "  frontend:   http://localhost:3000"
	@echo "  phpMyAdmin: http://localhost:8080"
	@echo "  MailHog:    http://localhost:8025"
	@echo ""
	@echo " frontend は entrypoint が npm install を実行するため、初回起動時"
	@echo " のみ数分かかります。進行状況は make logs-frontend で確認可能。"
	@echo "==================================================================="

ensure-env: ## .env を生成し HOST_UID/HOST_GID を補完（既存 .env も対象）
	@test -f .env || ( cp .env.example .env && echo ".env を .env.example から生成しました" )
	@grep -q "^HOST_UID=" .env || ( echo "HOST_UID=$$(id -u)" >> .env && echo "HOST_UID を .env に追記しました" )
	@grep -q "^HOST_GID=" .env || ( echo "HOST_GID=$$(id -g)" >> .env && echo "HOST_GID を .env に追記しました" )

# --- コンテナ管理 ---
up: ## コンテナ起動
	docker compose up -d

down: ## コンテナ停止（volume は保持）
	docker compose down

clean: ## コンテナ・volume を全削除（環境のクリーンリセット用）
	docker compose down -v

restart: ## コンテナ再起動
	docker compose restart

build: ## コンテナビルド
	docker compose build

logs: ## 全コンテナのログ表示
	@docker compose logs -f || true

logs-frontend: ## frontend のログ表示（npm install の進行確認に使う）
	@docker compose logs -f frontend || true

# --- DB ---
fresh: ## DB初期化 + シード
	docker compose exec backend php artisan migrate:fresh --seed

migrate: ## マイグレーション実行
	docker compose exec backend php artisan migrate

seed: ## シーディング実行
	docker compose exec backend php artisan db:seed

# --- テスト ---
test: ## PHPUnit実行
	docker compose exec backend php artisan test

test-coverage: ## PHPUnit実行（カバレッジ計測。CI と同じ。pcov 必須）
	docker compose exec backend ./vendor/bin/phpunit --coverage-clover=coverage.xml

# --- フォーマット・リント（バックエンド）---
pint: ## PHP フォーマット（Laravel Pint）
	docker compose exec backend ./vendor/bin/pint

stan: ## PHP 静的解析（PHPStan / larastan）
	docker compose exec backend ./vendor/bin/phpstan analyse --memory-limit=2G --no-progress

# --- フォーマット・リント（フロントエンド）---
lint: ## Next.js リント
	docker compose exec frontend npm run lint

lintfix: ## Next.js リント（自動修正）
	docker compose exec frontend npm run lint -- --fix

format: ## Next.js フォーマット（Prettier）
	docker compose exec frontend npx prettier --write "src/**/*.{ts,tsx,js,jsx,json,css}"

typecheck: ## Next.js 型チェック（tsc --noEmit）
	docker compose exec -T frontend npx tsc --noEmit

# --- シェル ---
shell-backend: ## バックエンドコンテナにログイン
	docker compose exec backend bash

shell-frontend: ## フロントエンドコンテナにログイン
	docker compose exec frontend sh

# --- Playwright（E2E はホスト Node 実行。事前に frontend で npm install + npx playwright install chromium が必要）---
e2e: ## E2E テスト実行（ホスト Node）
	cd frontend && npm run e2e

report: ## E2E テスト結果のレポート表示（ホスト Node）
	cd frontend && npx playwright show-report
