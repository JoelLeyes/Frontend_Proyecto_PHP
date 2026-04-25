FROM php:8.2-cli

RUN apt-get update && apt-get install -y \
        libzip-dev \
        unzip \
        git \
        curl \
    && docker-php-ext-install zip \
    && rm -rf /var/lib/apt/lists/*

# Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY composer.json composer.lock* ./
RUN composer install --no-scripts --no-autoloader --ignore-platform-reqs

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN composer dump-autoload --optimize

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
