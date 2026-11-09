$ErrorActionPreference='Stop'
Set-Location (Resolve-Path (Join-Path $PSScriptRoot '..'))
Write-Host '1) Pruebas de reglas de negocio'
Push-Location frontend
npm run test:domain
if ($LASTEXITCODE -ne 0) { exit 1 }
Write-Host '2) Compilación frontend'
npm install
npm run build
if ($LASTEXITCODE -ne 0) { exit 1 }
Pop-Location
Write-Host '3) Backend (requiere Maven/Java 21)'
Push-Location backend
mvn test
if ($LASTEXITCODE -ne 0) { exit 1 }
Pop-Location
Write-Host '4) Verificación local de API'
Invoke-RestMethod 'http://localhost:8080/actuator/health'
