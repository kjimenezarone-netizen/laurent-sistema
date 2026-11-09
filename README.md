# Clínica Dental Laurent — Integración V5 (código de desarrollo)

**«Más que cuidar dientes, cuidamos sonrisas».**

Proyecto unificado **React 18 + TypeScript + Spring Boot 3/Java 21 + PostgreSQL 16/Flyway**. Esta entrega toma como referencia el ZIP original enviado por el usuario y las correcciones acordadas; **no contiene `legado/` y no reemplaza automáticamente el repositorio GitHub ni su BD**.

## Organización
```
laurent-sistema/
├── backend/src/main/       # APIs Java, lógica de negocio y migraciones Flyway
├── frontend/src/
│   ├── componentes/        # Odontograma SVG, documentos, UI, LaurentBot
│   ├── paginas/            # Sitio público y paneles de administrador/médico/recepción
│   ├── servicios/          # Cliente de API HTTP
│   └── estilos/            # Identidad Laurent Deep Teal + Gold
├── docker/                  # Configuración inicial PostgreSQL
├── docs/                    # Inventario original, matriz de equivalencia y diagramas
├── pruebas/                 # Tests Java, smoke E2E y validación de reglas
├── scripts/                 # Instalación y diagnóstico
└── docker-compose.yml
```

## Módulos activos
Administrador (dashboard BI, usuarios, horarios, CMS, inventario, esterilización, caja y laboratorio), Médico (citas asignadas, historia clínica con 10 secciones, FDI permanente y temporal, periodontograma 6 sitios, planes y documentos, órdenes laboratorio) y Recepcionista (pacientes, agenda semanal, caja y abonos, seguimiento laboratorio). Web pública de marketing sin login: servicios, equipo, reseñas autorizadas, eventos, actividades, videos educativos y LaurentBot informativo.

## Arranque con Docker **en base nueva sin datos**
```powershell
python scripts/configurar_entorno.py
docker compose up -d --build
docker compose ps
```
Sitio: `http://localhost:3000`. Panel: `http://localhost:3000/iniciar-sesion`. Salud API: `http://localhost:8080/actuator/health`.

## Pruebas
```powershell
python scripts/verificar_integracion.py
cd frontend
npm install
npm run test:domain
npm run build
cd ..
cd backend
mvn test package
```
El archivo `pruebas/smoke_integracion.py` ejecuta el flujo paciente → cita → atención → cargo → pago sobre una base de datos aislada; consulta `docs/PRUEBAS_E_INSTALACION.md`.

## Precauciones
- **No es un producto certificado ni probado al 100 %**: en el entorno donde se preparó el ZIP solo se ejecutaron pruebas puras Java/Node y análisis estático; no se dispone de Maven, Docker, PostgreSQL o registro npm conectado para compilar el stack completo. GitHub Actions incorpora un pipeline para ejecutar esa validación en un entorno con dependencias.
- Faltan integraciones oficiales de WhatsApp Business, facturación SUNAT y firma electrónica/verificable completa; funciones clínicas avanzadas y validación de odontograma aún requieren desarrollo y revisión odontológica.
- La migración desde la base anterior no es automática. Las V1–V8 son para instalación nueva; lee `docs/MIGRACION_SEGURO.md`.
- Rota inmediatamente credenciales y claves JWT que estuvieron expuestas en GitHub público; no publiques `.env` ni archivos de pacientes.
- La copia original de 204 archivos debe conservarse en su ZIP externo, no dentro del proyecto activo. El destino de cada archivo se documenta en `docs/INVENTARIO_ORIGINAL_A_DESTINO.csv`; equivale a una matriz de rastreo, **no** a certificación de paridad funcional.

Lee la matriz en `docs/MATRIZ_EQUIVALENCIA_FUNCIONAL.md` y las pruebas en `docs/PRUEBAS_E_INSTALACION.md` antes de publicar o desplegar.
