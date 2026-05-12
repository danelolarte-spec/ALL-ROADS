# Dockerfile robusto para Render Free / Railway / cualquier PaaS
# Build context = raíz del monorepo

FROM node:20-alpine

# Prisma necesita openssl, libc6-compat. bash para el script de arranque.
RUN apk add --no-cache openssl libc6-compat bash

WORKDIR /app

# Copiar todo el monorepo (respeta .dockerignore en raíz)
COPY . .

# Importante: forzar instalación de devDependencies para poder compilar
# Algunos PaaS setean NODE_ENV=production lo cual hace que npm omita devDeps
ENV NODE_ENV=development
RUN npm install --no-audit --no-fund --include=dev

# Generar Prisma Client y compilar NestJS
WORKDIR /app/apps/api
RUN npx prisma generate

# Compilar con nest CLI directamente (no via npm run para evitar problemas de PATH)
RUN npx nest build

# Verificar que el output existe — si no, falla el build con error claro
RUN test -f dist/main.js || (echo "ERROR: dist/main.js NO se genero. Contenido de dist/:" && ls -la dist/ 2>/dev/null; echo "Contenido de apps/api:" && ls -la . && exit 1)
RUN echo "✓ Build OK. dist/main.js existe."

# Permisos para el script de arranque
RUN chmod +x scripts/start.sh

# Listo para producción
ENV NODE_ENV=production
EXPOSE 4000

# CMD con ruta absoluta para evitar problemas de cwd
CMD ["/app/apps/api/scripts/start.sh"]
