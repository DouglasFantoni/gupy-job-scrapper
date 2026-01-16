# Dockerfile para frontend Next.js (desenvolvimento)
# Next.js 16 requires Node.js 20.9 or higher
FROM node:20-slim

# Instalar pnpm globalmente
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copiar entrypoint
COPY scripts/entrypoint-frontend.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/entrypoint.sh"]
CMD ["pnpm", "run", "dev"]

