#!/bin/bash
set -e

echo "🚀 Iniciando deploy do Pontua..."

# 1. Puxa as novidades na raiz do repositório
cd /var/www/pontua
git pull origin main

# 2. Executa comandos do Laravel na raiz
composer install --no-dev --prefer-dist -a --no-interaction
# 3. Executa migrations pendentes sem confirmação interativa
php artisan migrate --force

# 4. Cache da aplicação
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# 5. Recarrega o PHP 8.5 para atualizar o cache de código em memória
sudo systemctl reload php8.5-fpm

echo "✅ Deploy concluído com sucesso!"
