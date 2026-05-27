#!/bin/sh
set -e

# ホスト（macOS 等）でインストールされたネイティブバイナリは Linux コンテナで動作しないため、
# プラットフォームマーカー（platform-arch）で判定して必要なら npm install を実行する。
# arch まで見るのは Apple Silicon ↔ Intel 跨ぎの named volume 残留を検知するため。
PLATFORM_MARKER="node_modules/.container-platform"
CURRENT_PLATFORM="$(node -p 'process.platform + "-" + process.arch' 2>/dev/null || echo 'unknown')"

if [ ! -d "node_modules" ] || [ -z "$(ls -A node_modules 2>/dev/null)" ]; then
  echo "node_modules が見つかりません。npm install を実行します..."
  npm install
  echo "${CURRENT_PLATFORM}" > "${PLATFORM_MARKER}"
elif [ ! -f "${PLATFORM_MARKER}" ] || [ "$(cat "${PLATFORM_MARKER}" 2>/dev/null)" != "${CURRENT_PLATFORM}" ]; then
  RECORDED="$(cat "${PLATFORM_MARKER}" 2>/dev/null || echo 'unknown')"
  echo "プラットフォーム不一致（${RECORDED} → ${CURRENT_PLATFORM}）。npm install を実行します..."
  npm install
  echo "${CURRENT_PLATFORM}" > "${PLATFORM_MARKER}"
fi

exec "$@"
