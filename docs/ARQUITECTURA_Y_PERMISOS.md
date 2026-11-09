# Arquitectura y permisos Laurent V5

**Frontend:** React 18 + TypeScript, Vite. `src/paginas/` contiene vistas por proceso; `src/componentes/` elementos compartidos; `src/servicios/` cliente HTTP; `src/estilos/` identidad visual. Se eliminan las dependencias MUI antiguas para una sola arquitectura React.

**Backend:** Spring Boot 3 + Java 21 + Spring JDBC. API `/api`, controladores por módulo, JWT y BCrypt. **PostgreSQL 16** con migraciones Flyway V1–V8 para **base nueva**. Monolito modular; no son microservicios.

**Roles internos (solo tres):** `ADMINISTRADOR`, `MEDICO`, `RECEPCIONISTA`. El sitio público no requiere cuenta. El portal privado del paciente queda para V2.

| Recurso | Administrador | Médico | Recepcionista | Público |
|---|---|---|---|---|
| Agenda | Gestión | Citas propias y estado | Gestión | Solicitud de cita |
| Horarios | Aprobar/proponer/bloquear | Proponer y ver aprobados | Ver aprobados | No |
| Pacientes | Datos administrativos | Solo asignados | Gestión administrativa | Sin cuenta |
| Historia clínica/odontograma | Sin firma ni edición médica | Solo asignados | Sin acceso | No |
| Estado de cuenta | Gestión y reversos | Consulta de asignados | Cargos y abonos | No |
| Inventario | Todo | No | Consulta | No |
| Laboratorio | Supervisión/estados | Solicitar órdenes propias | Seguimiento/estados | No |
| Esterilización | Registro y consulta | No | No | No |
| Web y CMS | Publicar | No | No | Ver |
| LaurentBot / mensajes | Supervisar | No | Consultar | FAQ y contacto |

La política se aplica tanto al menú **como en el backend** mediante `@PreAuthorize` y comprobaciones del profesional asignado. No se debe confiar en la ocultación de botones como único mecanismo de seguridad.

**Identidad visual:** Deep Teal `#0E4A4E`, Gold `#C59B27`, fondo `#F8FAFC`, superficies blancas, símbolos odontológicos con colores propios sujetos a validación clínica.
