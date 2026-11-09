# Laurent: comparativa funcional original → V5

**Fuente de referencia:** `laurent-sistema-main.zip` entregado por el usuario (204 archivos reales). V5 no contiene `legado/`; la copia histórica permanece en ese ZIP original, que debe guardarse por separado. El archivo `INVENTARIO_ORIGINAL_A_DESTINO.csv` documenta el destino o la sustitución de **cada uno de los 204 archivos**. **Sustituir un archivo no demuestra equivalencia completa de comportamiento.**

| Dominio | Original | V5 activo | Evaluación pendiente |
|---|---|---|---|
| Seguridad | Login JWT, roles en código original | Tres roles; backend protegido por anotaciones y consulta por paciente | Pentest y cambio/recuperación de contraseña, expiración de sesiones |
| Pacientes | Registro y búsqueda, formularios MUI | Registro, consulta y **edición administrativa** | Duplicados, tutores, menores y pruebas con datos reales anonimizados |
| Agenda | Citas, sillones y estados | Agenda semanal; filtros; exclusión GiST; propuestas de horarios y bloqueos | Concurrencia en PostgreSQL, lista de espera, urgencias, retrasos, reprogramación avanzada |
| Historia clínica | Atención, expediente y evoluciones | Diez secciones; borrador/firma interna/rectificación; timeline | Firma acreditada, validación clínica, anexos y recetas estructuradas |
| Odontograma | Dibujos geométricos de piezas | SVG con clases anatómicas y cinco superficies, permanentes/temporales | Revisión odontológica de anatomía/simbología; accesibilidad y exportaciones |
| Periodontograma | Componente FDI seis sitios | API y formulario seis sitios por pieza | Vista longitudinal comparativa por medición |
| Documentos | Consentimientos y archivos en modelo | Adjuntos clínicos y borrador de consentimiento | Firma verificable, permisos de difusión, visor DICOM avanzado |
| Planes | Catálogo de tratamiento | Plan con ítems y presupuesto consultable | Aprobación parcial verificable, versiones y modificaciones autorizadas |
| Caja | Cargos, abonos, vista estado | Sesiones de caja, abonos idempotentes, reversos admin, cuenta por paciente | SUNAT, conciliación bancaria, cuotas avanzadas y reportes de cierre |
| Inventario | Modelo y pantalla básica | Insumos, lotes, entradas/salidas, alertas de stock y vencimiento | Compras completas, proveedores, autorizaciones |
| Laboratorio | Órdenes de trabajo | Solicitud clínica y transiciones de estado por recepción/administración | Recepción con validación profesional e integración externa |
| Esterilización | Tabla y API | Interfaz de registro y revisión de ciclos | Inventario individual de instrumental y validación de procesos |
| BI | Dashboard MUI/Recharts con algunos datos simulados | KPIs reales, evolución diaria y tratamientos facturados desde PostgreSQL | Indicadores avanzados, rendimiento y costos multi-sede |
| Marketing | Landing con servicios/testimonios | Web pública, CMS, eventos, actividades, videos y testimonios autorizados | SEO y analítica verificable, publicación programada robusta |
| LaurentBot | Botón wa.me y FAQ | FAQ público, derivación manual y módulo de supervisión | API oficial WhatsApp Business y confirmaciones automatizadas |
| Portal del paciente | Previsión de portal | **Fuera de la primera entrega** | Planificado para versión 2 |

## Criterios de cierre obligatorio

1. Compilar frontend mediante `npm run build` y backend mediante `mvn test package`.
2. Levantar PostgreSQL 16 limpio, aplicar Flyway V1–V8 y comprobar `flyway_schema_history`.
3. Ejecutar `python pruebas/smoke_integracion.py` con credenciales de **entorno aislado**.
4. Ejecutar pruebas cruzadas: médico nunca cobra; recepción nunca crea una historia clínica; admin no firma actos médicos.
5. Verificar agenda con dos reservas simultáneas, pagos idempotentes, rectificación clínica y documentos protegidos.
6. Validar odontograma/simbología con odontólogo y consentimientos con responsable legal antes del uso clínico.

**No se considera terminada al 100 % ninguna función con pruebas de ejecución aún pendientes.**
