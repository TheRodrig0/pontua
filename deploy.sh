#!/bin/bash
set -e

echo "🚀 Iniciando deploy do Pontua..."

# 1. Puxa as novidades na raiz do repositório
cd /var/www/pontua
git pull origin main

# 2. Executa comandos do Laravel na raiz
composer install --no-dev --prefer-dist -a --no-interaction

# 3. Baixa dependências e compila os assets do Vite para produção
npm ci --no-audit --prefer-offline
npm run build

# 4. Executa migrations pendentes sem confirmação interativa
php artisan migrate --force

# 5. Otimização e cache (configurações, rotas, eventos e views Blade)
php artisan config:cache
php artisan route:cache
php artisan event:cache
php artisan view:cache

# 6. Recarrega o PHP 8.5 para atualizar o cache de código em memória
sudo systemctl reload php8.5-fpm

echo "✅ Deploy concluído com sucesso!"
