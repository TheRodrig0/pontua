#!/bin/bash
set -e

echo "🚀 Iniciando deploy do Pontua..."

# 1. Puxa as novidades na raiz do repositório
cd /var/www/pontua
git pull origin main

# 2. Entra na pasta do server e executa comandos do Laravel
cd server
composer install --no-dev --prefer-dist -a --no-interaction
# 3. Executa migrations pendentes sem confirmação interativa
php artisan migrate --force

# 4. Cache para API (configurações, rotas e eventos, sem buscar Blade views)
php artisan config:cache
php artisan route:cache
php artisan event:cache

# 5. Recarrega o PHP 8.5 para atualizar o cache de código em memória
sudo systemctl reload php8.5-fpm

echo "✅ Deploy concluído com sucesso!"
