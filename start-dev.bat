@echo off
setlocal
cd /d "%~dp0"
if not exist ".env" (
  echo Falta archivo .env. Ejecuta: python scripts\configurar_entorno.py
  exit /b 1
)
docker compose up --build -d
if errorlevel 1 (
  echo Error al iniciar los servicios. Comprueba Docker Desktop y los logs.
  exit /b 1
)
docker compose ps
echo Web publica: http://localhost:3000
echo Acceso del personal: http://localhost:3000/iniciar-sesion
endlocal
