FROM php:8.4-fpm

ARG UID=1000
ARG GID=1000

# システム依存パッケージ
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    libicu-dev \
    zip \
    unzip \
    default-mysql-client \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install \
        pdo_mysql \
        mbstring \
        exif \
        pcntl \
        bcmath \
        gd \
        zip \
        intl \
    && pecl install pcov \
    && docker-php-ext-enable pcov \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Composer（バージョン固定で再現性確保）
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

# php.ini（開発用: nginx の client_max_body_size=32M と整合させる）
RUN cp /usr/local/etc/php/php.ini-development /usr/local/etc/php/php.ini && \
    { \
      echo 'upload_max_filesize = 32M'; \
      echo 'post_max_size = 32M'; \
      echo 'memory_limit = 256M'; \
      echo 'date.timezone = Asia/Tokyo'; \
    } > /usr/local/etc/php/conf.d/zz-app.ini

WORKDIR /var/www/html

# ホスト UID/GID に対応する app ユーザーを作成する。
# 既存 UID/GID（www-data、dialout 等）と衝突する場合は削除するが、
# ビルドログに警告を出して副作用に気づけるようにする。
RUN set -e; \
    existing_user="$(getent passwd "${UID}" 2>/dev/null | cut -d: -f1 || true)"; \
    existing_group="$(getent group "${GID}" 2>/dev/null | cut -d: -f1 || true)"; \
    if [ -n "${existing_user}" ]; then \
      echo "⚠️  UID ${UID} は既存の '${existing_user}' に割り当て済み。app に再割当します。"; \
      userdel "${existing_user}"; \
    fi; \
    if [ -n "${existing_group}" ]; then \
      echo "⚠️  GID ${GID} は既存の '${existing_group}' に割り当て済み。app に再割当します。"; \
      groupdel "${existing_group}" 2>/dev/null || true; \
    fi; \
    groupadd -g "${GID}" app && \
    useradd -u "${UID}" -g app -m app && \
    chown -R app:app /var/www/html

USER app

EXPOSE 9000
CMD ["php-fpm"]
