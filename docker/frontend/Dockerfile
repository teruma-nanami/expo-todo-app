FROM node:22-alpine

ARG UID=1000
ARG GID=1000

WORKDIR /app

# ホスト UID/GID に対応する app ユーザーを作成する。
# 既存 UID/GID（node:22-alpine の node、dialout 等）と衝突する場合は削除するが、
# ビルドログに警告を出して副作用に気づけるようにする。
RUN set -e; \
    existing_user="$(getent passwd "${UID}" 2>/dev/null | cut -d: -f1 || true)"; \
    existing_group="$(getent group "${GID}" 2>/dev/null | cut -d: -f1 || true)"; \
    if [ -n "${existing_user}" ]; then \
      echo "⚠️  UID ${UID} は既存の '${existing_user}' に割り当て済み。app に再割当します。"; \
      deluser "${existing_user}"; \
    fi; \
    if [ -n "${existing_group}" ]; then \
      echo "⚠️  GID ${GID} は既存の '${existing_group}' に割り当て済み。app に再割当します。"; \
      delgroup "${existing_group}" 2>/dev/null || true; \
    fi; \
    addgroup -g "${GID}" app && \
    adduser -u "${UID}" -G app -s /bin/sh -D app

# node_modules は名前付きボリュームにマウントされるため、
# マウント時点で app 所有のディレクトリが存在しないと EACCES になる。
# 事前に作成して chown することで、ボリューム初期化時に所有権が引き継がれる。
RUN mkdir -p /app/node_modules && chown -R app:app /app

COPY docker/frontend/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

USER app

EXPOSE 3000

ENTRYPOINT ["entrypoint.sh"]
CMD ["npm", "run", "dev"]
