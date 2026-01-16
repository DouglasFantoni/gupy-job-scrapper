#!/bin/sh
set -e

echo "==> Instalando dependências..."
pnpm install

echo "==> Iniciando servidor de desenvolvimento..."
exec "$@"
