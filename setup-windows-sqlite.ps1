# ALL ROADS - Setup en Windows usando SQLite (sin Postgres)
# Para correr: .\setup-windows-sqlite.ps1
# Si PowerShell bloquea: Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force

$ErrorActionPreference = "Stop"

function Step($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function OK($msg)   { Write-Host "    OK $msg" -ForegroundColor Green }
function Err($msg)  { Write-Host "    ERROR $msg" -ForegroundColor Red }

Write-Host ""
Write-Host "==============================================" -ForegroundColor Magenta
Write-Host "  ALL ROADS - Setup Windows (modo SQLite)" -ForegroundColor Magenta
Write-Host "==============================================" -ForegroundColor Magenta

# 1. Verificar que estamos en la carpeta correcta
if (-not (Test-Path "apps\api\prisma\schema.prisma")) {
  Err "Este script debe ejecutarse desde la carpeta raiz de ALL-ROADS"
  Write-Host "    Asegurate de haber hecho 'cd ALL-ROADS' antes." -ForegroundColor Yellow
  exit 1
}
OK "Carpeta correcta detectada"

# 2. Verificar Node y npm
Step "Verificando Node.js..."
try {
  $nv = node --version
  OK "Node $nv"
} catch {
  Err "Node.js no esta instalado. Descargalo en https://nodejs.org"
  exit 1
}

# 3. Cambiar provider a SQLite en schema.prisma
Step "Configurando schema.prisma para SQLite..."
$schemaPath = "apps\api\prisma\schema.prisma"
(Get-Content $schemaPath -Raw) -replace 'provider = "postgresql"', 'provider = "sqlite"' | Set-Content $schemaPath -Encoding UTF8 -NoNewline
OK "Schema configurado"

# 4. Crear apps\api\.env
Step "Creando apps\api\.env..."
$apiEnv = @"
DATABASE_URL="file:./dev.db"
JWT_SECRET="dev-secret-local-allroads-cambiar-en-prod"
JWT_EXPIRES_IN="7d"
PORT=4000
GOOGLE_MAPS_API_KEY=""
"@
$apiEnv | Set-Content -Path "apps\api\.env" -Encoding UTF8
OK "apps\api\.env creado"

# 5. Crear apps\web\.env.local
Step "Creando apps\web\.env.local..."
$webEnv = @"
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=""
"@
$webEnv | Set-Content -Path "apps\web\.env.local" -Encoding UTF8
OK "apps\web\.env.local creado"

# 6. Instalar dependencias
Step "Instalando dependencias (puede tardar 1-2 min)..."
npm install
if ($LASTEXITCODE -ne 0) {
  Err "Fallo npm install"
  exit 1
}
OK "Dependencias instaladas"

# 7. Aplicar schema (crea la DB SQLite)
Step "Creando base de datos SQLite..."
npm run db:migrate
if ($LASTEXITCODE -ne 0) {
  Err "Fallo prisma db push"
  exit 1
}
OK "Base de datos creada (apps\api\prisma\dev.db)"

# 8. Cargar datos demo
Step "Cargando datos demo..."
npm run db:seed
if ($LASTEXITCODE -ne 0) {
  Err "Fallo el seed"
  exit 1
}
OK "Datos demo cargados"

# 9. Listo
Write-Host ""
Write-Host "==============================================" -ForegroundColor Green
Write-Host "  Setup completado!" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Para arrancar la plataforma ahora:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Luego abre tu navegador en:" -ForegroundColor Cyan
Write-Host "  http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Login:" -ForegroundColor Cyan
Write-Host "  Email:    admin@allroads.co" -ForegroundColor White
Write-Host "  Password: Admin123!" -ForegroundColor White
Write-Host ""
Write-Host "Para detener: en la terminal donde corre, presiona Ctrl+C" -ForegroundColor Gray
Write-Host ""
