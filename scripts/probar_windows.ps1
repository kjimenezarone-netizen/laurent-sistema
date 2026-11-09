$ErrorActionPreference = 'Stop'
Set-Location (Resolve-Path (Join-Path $PSScriptRoot '..'))
Write-Host '1/5: Verificación estructural' -ForegroundColor Cyan
python scripts/verificar_integracion.py
if ($LASTEXITCODE -ne 0) { throw 'La estructura de Laurent no supera las comprobaciones.' }
Write-Host '2/5: Instalación de dependencias y tests frontend' -ForegroundColor Cyan
Push-Location frontend
try {
  npm install --no-audit --no-fund
  if ($LASTEXITCODE -ne 0) { throw 'Fallo npm install' }
  npm run test:domain
  if ($LASTEXITCODE -ne 0) { throw 'Fallaron tests de reglas' }
  node ../pruebas/revisar_sintaxis_ts.cjs
  if ($LASTEXITCODE -ne 0) { throw 'Sintaxis TS inválida' }
  npm run build
  if ($LASTEXITCODE -ne 0) { throw 'Falló la compilación de React' }
} finally { Pop-Location }
Write-Host '3/5: Compilación y pruebas backend' -ForegroundColor Cyan
Push-Location backend
try {
  mvn test package
  if ($LASTEXITCODE -ne 0) { throw 'Falló Maven' }
} finally { Pop-Location }
Write-Host '4/5: Estado del servidor (si Docker está iniciado)' -ForegroundColor Cyan
try { Invoke-RestMethod 'http://localhost:8080/actuator/health' } catch { Write-Host 'No hay API activa; inicia Docker Compose para probar.' -ForegroundColor Yellow }
Write-Host '5/5: Las pruebas E2E con datos ficticios requieren ejecución explícita:' -ForegroundColor Cyan
Write-Host '  Establece LAURENT_API_URL, ADMIN_USERNAME, ADMIN_PASSWORD y ejecuta:'
Write-Host '  python pruebas/smoke_integracion.py'
Write-Host 'La prueba E2E CREA datos ficticios: úsala SOLO en una base aislada.' -ForegroundColor Yellow
