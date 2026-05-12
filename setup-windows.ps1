# ALL ROADS — Setup automático para Windows
# Ejecuta este script en PowerShell (botón derecho → Ejecutar con PowerShell)
# Si PowerShell bloquea la ejecución, primero corre:
#   Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

$ErrorActionPreference = "Stop"

function Write-Step($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Write-OK($msg)   { Write-Host "    OK $msg" -ForegroundColor Green }
function Write-Err($msg)  { Write-Host "    ERROR $msg" -ForegroundColor Red }

Write-Host ""
Write-Host "==============================================" -ForegroundColor Magenta
Write-Host "  ALL ROADS - Setup automatico Windows" -ForegroundColor Magenta
Write-Host "==============================================" -ForegroundColor Magenta

# 1. Verificar Node.js
Write-Step "Verificando Node.js..."
try {
  $nodeVersion = node --version
  Write-OK "Node $nodeVersion detectado"
} catch {
  Write-Err "Node.js no esta instalado."
  Write-Host "    Descargalo en https://nodejs.org (version LTS) e intenta de nuevo." -ForegroundColor Yellow
  exit 1
}

# 2. Verificar Git
Write-Step "Verificando Git..."
try {
  git --version | Out-Null
  Write-OK "Git detectado"
} catch {
  Write-Err "Git no esta instalado."
  Write-Host "    Descargalo en https://git-scm.com/download/win" -ForegroundColor Yellow
  exit 1
}

# 3. Verificar PostgreSQL (psql)
Write-Step "Verificando PostgreSQL..."
$psqlExists = $false
try {
  psql --version | Out-Null
  $psqlExists = $true
  Write-OK "psql detectado"
} catch {
  Write-Host "    psql no esta en el PATH." -ForegroundColor Yellow
  Write-Host "    Opciones:" -ForegroundColor Yellow
  Write-Host "      a) Instala PostgreSQL desde https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
  Write-Host "      b) Usa Docker Desktop y ejecuta 'docker compose up -d' en otra terminal" -ForegroundColor Yellow
  $useDocker = Read-Host "    Tienes Postgres corriendo (en localhost:5432) por otro medio? (s/N)"
  if ($useDocker -ne 's' -and $useDocker -ne 'S') {
    Write-Err "Setup interrumpido. Instala Postgres y vuelve a correr este script."
    exit 1
  }
}

# 4. Crear DB y usuario
if ($psqlExists) {
  Write-Step "Creando usuario y base de datos 'allroads'..."
  $env:PGPASSWORD = "postgres"
  $createUser = "CREATE USER allroads WITH PASSWORD 'allroads' SUPERUSER;"
  $createDb   = "CREATE DATABASE allroads OWNER allroads;"
  try {
    psql -U postgres -d postgres -c $createUser 2>&1 | Out-Null
    Write-OK "Usuario 'allroads' creado (o ya existia)"
  } catch {
    Write-Host "    (usuario tal vez ya existe, continuo)" -ForegroundColor Yellow
  }
  try {
    psql -U postgres -d postgres -c $createDb 2>&1 | Out-Null
    Write-OK "Base de datos 'allroads' creada (o ya existia)"
  } catch {
    Write-Host "    (DB tal vez ya existe, continuo)" -ForegroundColor Yellow
  }
}

# 5. Instalar dependencias npm
Write-Step "Instalando dependencias del monorepo (puede tardar 1-2 min)..."
npm install
if ($LASTEXITCODE -ne 0) {
  Write-Err "Fallo npm install"
  exit 1
}
Write-OK "Dependencias instaladas"

# 6. Asegurar .env del API
$envPath = "apps/api/.env"
if (-not (Test-Path $envPath)) {
  Write-Step "Creando apps/api/.env por defecto..."
  @"
DATABASE_URL="postgresql://allroads:allroads@localhost:5432/allroads?schema=public"
JWT_SECRET="dev-secret-change-me-in-prod"
JWT_EXPIRES_IN="7d"
PORT=4000
GOOGLE_MAPS_API_KEY=""
"@ | Set-Content -Path $envPath -Encoding UTF8
  Write-OK ".env creado"
}

# 7. Asegurar .env.local del web
$envWebPath = "apps/web/.env.local"
if (-not (Test-Path $envWebPath)) {
  Write-Step "Creando apps/web/.env.local por defecto..."
  @"
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=""
"@ | Set-Content -Path $envWebPath -Encoding UTF8
  Write-OK ".env.local creado"
}

# 8. Migraciones Prisma
Write-Step "Aplicando schema a la base de datos..."
npm run db:migrate
if ($LASTEXITCODE -ne 0) {
  Write-Err "Fallo prisma db push - revisa que Postgres este corriendo y la DATABASE_URL en apps/api/.env"
  exit 1
}
Write-OK "Schema aplicado"

# 9. Seed
Write-Step "Cargando datos demo..."
npm run db:seed
if ($LASTEXITCODE -ne 0) {
  Write-Err "Fallo el seed"
  exit 1
}
Write-OK "Datos demo cargados"

# 10. Listo
Write-Host ""
Write-Host "==============================================" -ForegroundColor Green
Write-Host "  Setup completado!" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Para arrancar la plataforma:" -ForegroundColor Cyan
Write-Host "  .\start-windows.ps1" -ForegroundColor White
Write-Host "  (o manualmente: npm run dev)" -ForegroundColor Gray
Write-Host ""
Write-Host "Acceso:" -ForegroundColor Cyan
Write-Host "  Web:     http://localhost:3000" -ForegroundColor White
Write-Host "  API:     http://localhost:4000/api" -ForegroundColor White
Write-Host "  Swagger: http://localhost:4000/api/docs" -ForegroundColor White
Write-Host ""
Write-Host "Login:" -ForegroundColor Cyan
Write-Host "  admin@allroads.co / Admin123!" -ForegroundColor White
Write-Host ""
