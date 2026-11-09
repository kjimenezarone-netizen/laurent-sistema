# Clínica Dental Laurent — Entrega de código consolidada v1

> «Más que cuidar dientes, cuidamos sonrisas»

**Estado: implementación técnica integrada y no certificada para producción.** Este paquete contiene un proyecto nuevo y completo en su estructura de archivos (`backend/`, `frontend/`, migraciones, Docker y documentación). No equivale a afirmar que todos los requisitos clínicos, fiscales y de WhatsApp estén completados o validados. **No utilizar datos de pacientes reales hasta terminar las pruebas, validación clínica, controles legales y de seguridad.**

## 1. Origen y relación con el GitHub existente

El repositorio de referencia es `kjimenezarone-netizen/laurent-sistema`, rama `main`. La integración GitHub permitió leerlo, pero rechazó crear una rama con `403 Resource not accessible by integration`, y el contenedor no pudo clonarlo por falta de acceso de red. **Este ZIP es una reconstrucción/consolidación independiente basada en los requisitos acordados y el análisis del código**, no una copia literal ni un reemplazo probado de todas las clases del repositorio original. **No copiar archivos por encima de tu repositorio existente sin revisión de diferencias.**

Las nuevas migraciones V1–V8 representan **un esquema nuevo para una instalación de desarrollo limpia**. No reemplaces las migraciones V1–V7 ya aplicadas en tu PostgreSQL/Supabase: tienen otra estructura, nombres y checksums. Para migrar datos existentes hace falta un plan de transformación con respaldo y pruebas.

## 2. Tecnologías

- Frontend: React 18, TypeScript, Vite, CSS responsive con identidad **Deep Teal `#0E4A4E` y dorado `#C59B27`**.
- Backend: Spring Boot 3.3.x, Java 21, Spring JDBC, Spring Security con JWT HMAC firmado, BCrypt, controles por rol.
- Base de datos: PostgreSQL 16, migraciones Flyway V1–V8, restricciones de exclusión `btree_gist`, índices y registros inmutables.
- Infraestructura: Docker Compose, Nginx como proxy same-origin, volúmenes para base de datos y archivos clínicos.

## 3. Permisos

| Sección | ADMINISTRADOR | MEDICO | RECEPCIONISTA | Visitante |
| --- | --- | --- | --- | --- |
| Web pública | Consulta + CMS | Consulta | Consulta | Consulta |
| Administración, usuarios y sedes | Gestión | — | — | — |
| Agenda, pacientes administrativos | Gestión | Pacientes asignados | Gestión | Solicitud de contacto |
| Historia, odontograma, periodontograma | Sin acceso clínico por defecto | Pacientes asignados | — | — |
| Caja y estado de cuenta | Gestión | Solo resumen clínico por API | Cargos y abonos | — |
| Inventario | Gestión | — | Consulta | — |
| Laboratorio | Consulta | Solicitudes propias | Seguimiento | — |
| Comunicaciones | Supervisión | — | Seguimiento | — |

Solo hay **tres roles internos**. La web de marketing es pública; el portal privado del paciente está fuera de alcance para la v1.

## 4. Instalación de desarrollo con Docker

**Requisitos:** Docker Desktop funcionando con Compose, recursos suficientes, puertos 3000 y 8080 libres, y Python 3 solo para generar secretos (opcional).

```powershell
# Extraer el ZIP en una carpeta NUEVA (no sobre el repositorio GitHub existente).
cd Laurent_Entrega_Consolidada_v1
python scripts/configurar_entorno.py
# Genera .env local y pide una contraseña segura sin mostrarla al teclear.
docker compose up -d --build
docker compose ps
```

- **Web pública:** http://localhost:3000
- **Login personal:** http://localhost:3000/iniciar-sesion
- **API health:** http://localhost:8080/actuator/health

La contraseña administradora es la que introduces en `configurar_entorno.py`; **no existen contraseñas predeterminadas**. PostgreSQL se crea por el contenedor; Flyway aplica el esquema automáticamente. Las instalaciones posteriores conservan los volúmenes y aplican solo migraciones nuevas.

**Nunca ejecutes `docker compose down -v` con información que debas conservar.** Ese comando elimina volúmenes de datos.

## 5. Configuración inicial dentro del panel

1. Ingresar con la cuenta administradora y crear la sede principal.
2. Registrar los sillones de la clínica.
3. Crear usuarios con rol MEDICO o RECEPCIONISTA.
4. Vincular los usuarios médicos a sus perfiles odontológicos y sede.
5. Dar de alta tratamientos, tarifas y duraciones.
6. Registrar un paciente de prueba, reservar cita y vincularlo al profesional.
7. Iniciar sesión con un médico para usar el odontograma y las atenciones.
8. Abrir sesión de caja con recepción y probar cargos y pagos ficticios.
9. Publicar los primeros artículos, eventos, videos por URL, promociones y fotografías autorizadas.

## 6. Flujos funcionales incorporados

### Paciente → Agenda → Atención → Cargo → Abono

- Paciente: registro, búsqueda, datos básicos, alergias, representante y contacto.
- Agenda: calendario semanal, odontólogo/sillón, horas, estados; PostgreSQL impide doble reserva concurrente del mismo odontólogo o sillón. **Pendiente:** aprobación real de horarios variables, lista de espera y reprogramación compleja.
- Médico: anamnesis, línea de tiempo, atención en borrador/cierre, correcciones mediante rectificación, odontograma FDI con dibujos diferenciados, periodontograma por seis puntos, plan de tratamiento en borrador, radiografías/fotos/PDF/DICOM reconocidos por firmas de archivo.
- Caja: cargos, pagos con `Idempotency-Key`, distribuidor de abonos por cargos vigentes, reversión auditada por administrador, estado de cuenta con fecha / concepto / cargo / abono / saldo. **Recibo interno, NO comprobante SUNAT.**
- Web: servicios y profesionales, publicaciones de blog, eventos, actividades, videos enlazados y testimonios con autorización; formulario de consultas a recepción y CMS admin.
- Inventario/laboratorio: modelos, listados, insumos, lotes, movimientos y órdenes. **Pendiente:** completar flujos de compra, insumos por procedimiento y esterilización en frontend.

### Odontograma

- Dentición permanente 11–48 y temporal 51–85, 32 y 20 piezas respectivamente.
- Dientes con siluetas originales distintas para incisivos, caninos, premolares y molares.
- Regiones seleccionables y capas de caries/restauración/endodoncia/corona/implante/ausencia, etc.
- Cada hallazgo registra usuario, fecha y pieza en PostgreSQL.
- **Las formas y convenciones gráficas requieren validación de odontólogos y normativa peruana antes de uso clínico.**

## 7. Gestión de secretos y seguridad

- Sin contraseñas ni JWT secret de ejemplo dentro del código fuente.
- `.env` ignorado por Git y generado localmente con secreto aleatorio.
- JWT no se guarda en `localStorage` (vive en memoria; recarga implica iniciar sesión de nuevo).
- Usuarios desactivados y cambios de rol quedan controlados en solicitudes autenticadas mediante verificación en base de datos.
- El médico solo puede consultar datos clínicos de pacientes vinculados a él.
- La recepción no puede acceder a endpoints clínicos y el administrador no edita evoluciones médicas.
- Datos clínicos firmados y operaciones financieras protegidos también por triggers en PostgreSQL.
- Los archivos clínicos se almacenan fuera de la raíz pública; su descarga requiere autenticación y vinculación médica.
- El CMS no admite HTML libre renderizado como marcado; usa texto plano.

**Antes de cualquier despliegue:** rota las credenciales expuestas anteriormente en el repositorio GitHub original, revisa el historial de Git, habilita HTTPS, backups cifrados, control de acceso, retención, gestión de sesiones, rate limiting, verificaciones de firma, cumplimiento de datos personales y monitoreo. **No se ha auditado por terceros.**

## 8. Características pendientes o parciales

**No certificadas/pendientes:** validación odontológica del SVG y simbología; aprobación de presupuestos por paciente y firma verificable; integración WhatsApp Business API real (el botón web usa enlace externo y la base contiene cola de mensajes); facturación electrónica SUNAT; pagos online oficiales; reglas de horarios flexibles/vacaciones/lista de espera; visor DICOM avanzado; gestión documental con firmas digitales certificadas; multisesión y pacientes familiares; reportes BI completos; procesos integrales de inventario, compras y esterilización; recuperación de contraseña y sesiones revocables; pruebas end-to-end, rendimiento, accesibilidad y seguridad clínica, automatización CI/CD y despliegue productivo.

## 9. Pruebas realizadas en el entorno de esta entrega

- `npm run test:domain` con Node: **10 pruebas superadas** (FDI, clases dentales, colisiones, saldo e invariantes de permisos).
- Sintaxis transpilation de TypeScript/TSX: **sin errores de sintaxis** en los archivos verificados.
- **No se pudo ejecutar Maven ni Docker/PostgreSQL**, ni instalar todas las dependencias de React; por tanto NO hay verificación de compilación completa ni prueba real de la API. Es obligatoria antes de usar este sistema.

Al tener Docker disponible, ejecuta `scripts/probar_windows.ps1` o los comandos manuales `npm install && npm run build`, `mvn test`, `docker compose up -d --build` y las pruebas funcionales de los tres perfiles.

## 10. Cómo integrarlo en tu GitHub sin perder trabajo

La vía segura es subirlo **a una rama nueva o repositorio separado de pruebas** y comparar. No reemplaces `main` ni las migraciones si hay una base de datos funcionando.

```powershell
# Desde una carpeta nueva creada al extraer el ZIP
# Para publicar la reconstrucción como una rama separada: crea primero un clon limpio del repo y decide la estrategia de integración.
git clone https://github.com/kjimenezarone-netizen/laurent-sistema.git Laurent_Original
cd Laurent_Original
git switch -c feature/integracion-laurent-v1
# Aquí se revisan/copían archivos, resuelven diferencias de SQL/API y se hacen pruebas ANTES del commit.
```

La conexión GitHub asociada a ChatGPT rechazó crear una rama con 403; por eso esta entrega **no está subida automáticamente a tu repositorio**.

---

**Versión de esta entrega:** 1.0 técnica preliminar, 8 de noviembre de 2026. Los archivos generados son código fuente y documentación para continuar y probar; no un producto sanitario listo para producción sin validaciones.
