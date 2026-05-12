#!/bin/sh
# Script de arranque para Render / Railway / cualquier PaaS

# Garantizar que estamos en el directorio correcto
cd /app/apps/api

echo "==> Working directory: $(pwd)"
echo "==> Contenido de dist/:"
ls -la dist/ 2>&1 || echo "ADVERTENCIA: dist/ no existe"

echo "==> Sincronizando schema con la base de datos..."
npx prisma db push --accept-data-loss
if [ $? -ne 0 ]; then
  echo "ERROR: prisma db push falló. Verifica DATABASE_URL."
  exit 1
fi

echo "==> Verificando si la DB necesita seed..."
USER_COUNT=$(node -e "const{PrismaClient}=require('@prisma/client');const p=new PrismaClient();p.user.count().then(c=>{console.log(c)}).catch(()=>{console.log(0)}).finally(()=>p.\$disconnect())" 2>/dev/null || echo "0")

if [ "$USER_COUNT" = "0" ]; then
  echo "==> DB vacía. Ejecutando seed..."
  npx ts-node prisma/seed.ts || echo "WARN: seed falló, continúo."
else
  echo "==> DB ya tiene $USER_COUNT usuarios. Saltando seed."
fi

echo "==> Iniciando servidor NestJS en puerto ${PORT:-4000}..."
exec node /app/apps/api/dist/main.js
