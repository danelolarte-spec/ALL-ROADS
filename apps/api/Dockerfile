# Dockerfile simple y robusto para Render Free / Railway / cualquier PaaS
# Build context = raíz del monorepo

FROM node:20-alpine

# Prisma necesita openssl en Alpine
RUN apk add --no-cache openssl libc6-compat bash

WORKDIR /app

# Copiar todo el monorepo (respeta .dockerignore)
COPY . .

# Instalar dependencias del monorepo completo
RUN npm install --no-audit --no-fund

# Generar Prisma Client y compilar NestJS
WORKDIR /app/apps/api
RUN npx prisma generate
RUN npm run build

# Hacer ejecutable el script de arranque
RUN chmod +x scripts/start.sh

ENV NODE_ENV=production
EXPOSE 4000

CMD ["./scripts/start.sh"]
