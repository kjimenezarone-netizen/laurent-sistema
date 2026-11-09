# Guía de migración segura desde el repositorio anterior

No ejecutar el nuevo Flyway V1–V8 sobre una BD con V1–V7 antiguas, ni sobre pacientes reales. No cambiar la numeración de migraciones ya registradas. Para migrar es obligatorio: respaldo de PostgreSQL verificable; inventario de tablas/columnas; mapping de IDs; transformación ensayada en entorno aislado; conciliación de cargos/pagos; validación de historias clínicas, firmantes y archivos; pruebas de rollback; acta de corte.

El código anterior está preservado **fuera del proyecto activo** en el archivo `laurent-sistema-main.zip` que entregó el usuario, no en una carpeta `legado/`. Para nuevas funciones a partir de esta versión, añadir migraciones V9, V10, etc., sin editar las V1–V8 ya aplicadas.

Para subir a GitHub: clonar el repo, crear una rama `feature/laurent-v5-integracion`, copiar el contenido de este ZIP a esa rama con revisión de `git status` y pruebas, abrir Pull Request y no fusionar a `main` hasta superar el pipeline. El repositorio GitHub NO ha sido modificado desde esta entrega.
