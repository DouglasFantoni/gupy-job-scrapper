#!/bin/sh
set -e

echo "==> Preparando diretorio do banco de dados..."
mkdir -p /app/db_data

echo "==> Aplicando migrations..."
python manage.py migrate --noinput

echo "==> Inicializacao concluida!"
exec "$@"
