$ErrorActionPreference='Stop'
Set-Location (Resolve-Path (Join-Path $PSScriptRoot '..'))
if (!(Test-Path '.env')) { Write-Host 'Falta .env. Ejecuta: python scripts/configurar_entorno.py' -ForegroundColor Red; exit 1 }
docker compose up --build -d
if ($LASTEXITCODE -ne 0) { Write-Host 'Fallo docker compose; consulta los registros.' -ForegroundColor Red; exit 1 }
docker compose ps
Write-Host 'Sitio público: http://localhost:3000' -ForegroundColor Green
Write-Host 'Acceso personal: http://localhost:3000/iniciar-sesion' -ForegroundColor Green
