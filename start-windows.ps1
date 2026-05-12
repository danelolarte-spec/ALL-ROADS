# ALL ROADS — Iniciar API + Web en Windows
# Abre dos ventanas de PowerShell: una para la API y otra para el frontend.

Write-Host "==> Iniciando API (NestJS) en nueva ventana..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm --workspace apps/api run start:dev"

Start-Sleep -Seconds 3

Write-Host "==> Iniciando Web (Next.js) en nueva ventana..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm --workspace apps/web run dev"

Start-Sleep -Seconds 5

Write-Host ""
Write-Host "==============================================" -ForegroundColor Green
Write-Host "  ALL ROADS corriendo!" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Abre en tu navegador: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Para detenerlo: cierra las dos ventanas de PowerShell" -ForegroundColor Gray
Write-Host ""

# Abrir el navegador automáticamente tras 8s
Start-Sleep -Seconds 8
Start-Process "http://localhost:3000"
