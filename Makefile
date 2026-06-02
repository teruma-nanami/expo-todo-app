.PHONY: help install start ios android typecheck

help: ## ヘルプ表示
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## 依存関係インストール
	npm install

start: ## Expo開発サーバー起動
	npx expo start

ios: ## iOSシミュレーター起動
	npx expo start --ios

android: ## Androidエミュレーター起動
	npx expo start --android

typecheck: ## 型チェック
	npx tsc --noEmit
