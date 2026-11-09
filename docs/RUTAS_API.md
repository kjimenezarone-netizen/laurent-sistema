# Principales rutas REST de Laurent v1

Prefijo `/api`. Excepto `autenticacion/iniciar-sesion` y `/publico/**`, todas requieren `Authorization: Bearer <JWT>`.

| Método | Ruta | Perfil |
| --- | --- | --- |
| POST | `/autenticacion/iniciar-sesion` | Público |
| GET | `/autenticacion/yo` | Todos los internos |
| GET | `/publico/servicios`, `/odontologos`, `/testimonios`, `/publicaciones` | Público |
| GET | `/publico/publicaciones/{slug}`, `/publico/media/{id}` | Público |
| POST | `/publico/solicitudes` | Público; consentimiento de contacto |
| GET/POST | `/pacientes` | ADMIN/RECEPCIONISTA; MEDICO solo GET de asignados |
| GET | `/pacientes/{id}` | Según acceso |
| GET | `/agenda/citas?desde=...&hasta=...` | Todos internos; médico sus citas |
| GET | `/agenda/sillones`, `/agenda/odontologos` | Todos internos |
| POST | `/agenda/citas` | ADMIN/RECEPCIONISTA |
| PATCH | `/agenda/citas/{id}/estado` | Todos internos con reglas |
| GET | `/clinica/pacientes/{id}/timeline`, `/anamnesis`, `/odontograma`, `/atenciones`, `/periodontograma`, `/planes` | MEDICO asignado |
| POST | `/clinica/anamnesis`, `/odontograma`, `/atenciones`, `/periodontograma`, `/planes` | MEDICO asignado |
| POST | `/clinica/atenciones/{id}/rectificaciones`, `/atenciones/{id}/cerrar` | Autor clínico autorizado |
| GET/POST | `/clinica/pacientes/{id}/archivos` | MEDICO asignado |
| GET | `/clinica/archivos/{id}/descargar` | MEDICO asignado |
| GET | `/clinica/pacientes/{id}/saldo-consulta` | MEDICO asignado |
| GET | `/caja/pacientes/{id}/estado` | ADMIN/RECEPCIONISTA |
| POST | `/caja/sesiones/abrir`, `/sesiones/cerrar`, `/cargos`, `/pagos` | ADMIN/RECEPCIONISTA |
| POST | `/caja/pagos/{id}/revertir`, `/cargos/{id}/anular` | ADMIN |
| GET/POST/PUT | `/cms/publicaciones`, `/cms/publicaciones/{id}` | ADMIN |
| GET/POST | `/cms/testimonios`, `/cms/multimedia` | ADMIN |
| GET/POST | `/administracion/usuarios`, `/tratamientos`, `/sedes`, `/sillones`, `/odontologos` | ADMIN |
| GET/POST | `/operaciones/inventario`, `/laboratorio`, `/inventario/lotes`, `/inventario/movimientos` | Según perfil y acción |
| GET | `/operaciones/comunicaciones`, `/auditoria`, `/esterilizacion` | Según perfil |

**Nota:** recibos emitidos son internos, no comprobantes SUNAT. Las rutas de firma/consentimiento están limitadas a borradores y registro de archivos; no afirmar validez legal de firma electrónica avanzada.
