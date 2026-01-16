#!/bin/sh
set -e

echo "==> Aplicando migrations..."
python manage.py migrate --noinput

echo "==> Inicializacao concluida!"
exec "$@"
