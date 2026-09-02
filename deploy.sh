#!/bin/bash
set -e

echo "🚀 Iniciando deploy do Pontua..."

# 1. Puxa as novidades na raiz do repositório
cd /var/www/pontua
git pull origin main

# 2. Entra na pasta do server e executa comandos do Laravel
cd server
composer install --no-dev --prefer-dist -a --no-interaction
php artisan migrate --force
php artisan optimize
sudo systemctl reload php8.5-fpm

echo "✅ Deploy concluído com sucesso!"
