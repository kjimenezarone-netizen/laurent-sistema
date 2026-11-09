# Pruebas e instalación V5

## Prerrequisitos
Docker Desktop (contenedores Linux), Docker Compose, Python 3.12 y, para desarrollo local, Java 21 + Maven y Node 22. Se requiere conexión para descargar dependencias o imágenes oficiales.

## Instalación en una **base vacía de pruebas**
```powershell
# PowerShell, desde la carpeta laurent-sistema
python scripts/configurar_entorno.py
docker compose up -d --build
docker compose ps
```
La web responde en http://localhost:3000 y el backend en http://localhost:8080/actuator/health, **si la instalación termina correctamente**. No hay credenciales de demostración: el usuario administrador inicial se crea desde `.env`.

## Pruebas de código y de integración
```powershell
python scripts/verificar_integracion.py
cd frontend
npm install
npm run test:domain
npm run build
cd ..
cd backend
mvn test package
cd ..
# Solo con servidor y BD de pruebas, NUNCA en producción
$env:LAURENT_API_URL='http://localhost:8080'
# configurar ADMIN_USERNAME / ADMIN_PASSWORD con los valores locales
python pruebas/smoke_integracion.py
```
En GitHub Actions (`.github/workflows/validar.yml`) existe un pipeline de PostgreSQL efímero que compila, levanta el backend y ejecuta el flujo con datos ficticios. **La presencia del pipeline no significa que haya sido ejecutado todavía.**

## Aceptación manual
- Probar login 3 roles; acceso API 403 cruzado.
- Alta/edición paciente y detección duplicados.
- Agendar, conflictos con mismo sillón/médico, propuesta de horario y bloqueo.
- Anamnesis, hallazgo FDI, atención, periodontograma, archivos, plan y borrador de consentimiento.
- Caja: cargo S/180, abono S/100, abono S/50, saldo S/30 y mismo Idempotency-Key sin duplicar.
- Inventario: lotes, entradas, salidas, stock bajo y vencimiento.
- Laboratorio: solicitud → en proceso → recibido → entregado.
- CMS: publicar texto/video/evento con autorización de imágenes; formulario de consultas público.
- Revisión médica del SVG y ergonomía tablet/móvil; revisiones de seguridad y rendimiento.

## Riesgos/limitaciones actuales
- No conectes a una base existente con migraciones V1–V7 anteriores; crear plan de migración de datos antes.
- Falta integración oficial WhatsApp, facturación SUNAT y firma verificable de consentimientos.
- Radiografía DICOM admitida como archivo en formato reconocido, pero no existe un visor avanzado DICOM.
- El sistema no está certificado para tratar pacientes reales sin pruebas E2E y revisión profesional.
- Rotar credenciales anteriormente expuestas en repositorio público y su historial.
