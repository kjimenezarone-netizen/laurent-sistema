# Sistema Web Integral - Clínica Dental Laurent
> *"Más que cuidar dientes, cuidamos sonrisas"*

Plataforma empresarial de grado médico y financiero desarrollada con arquitectura desacoplada moderna (**Spring Boot 3 + Java 21 + React 18 + TypeScript + PostgreSQL 16 + Flyway**).

Todos los nombres de archivos, módulos, clases, atributos, métodos, rutas de API REST y tablas de base de datos se encuentran normalizados **100% en Español** conforme a la especificación técnica.

---

## 🏛️ Estructura del Ecosistema

1. **Sitio Web Público (Marketing)**: Landing page con diseño Laurent (Deep Teal + Dorado), staff médico colegiado (COP), catálogo de tratamientos y testimonios en vivo.
2. **Panel de Gestión & Business Intelligence (BI)**: Dashboard gerencial con métricas de productividad, evolución de ingresos semestrales y distribución por especialidad.
3. **Panel Clínico & Odontograma Anatómico**:
   - Registro de atenciones médicas y evoluciones firmadas digitalmente (inmutables).
   - **Odontograma Anatómico SVG (Norma FDI)**: Mapeo de piezas dentales (11 a 48 y temporales 51 a 85) con 5 superficies interactivas (Vestibular, Lingual, Oclusal, Mesial, Distal) y capas de *overlays* para endodoncias, implantes, coronas y ausencias.
4. **Agenda y Turnos con Exclusión Física Anti-colisión**:
   - Validación estricta a nivel de base de datos con PostgreSQL (`btree_gist` + rangos `tstzrange`).
   - Imposibilidad matemática de solapamiento de sillón dental u odontólogo en citas concurrentes.
5. **Caja Registradora & Libro Mayor Inmutable**:
   - Emisión de cargos devengados a partir de atenciones o catálogo.
   - Registro de abonos con clave de idempotencia (`Idempotency-Key`) que protege contra cobros dobles por clics repetidos.
   - **Calculadora de vuelto en tiempo real** para cobros en efectivo.
   - Saldo deudor y saldo a favor calculados dinámicamente (`v_saldo_paciente`), sin almacenamiento de saldos editables vulnerables.

---

## 🚀 Puesta en Marcha

### 1. Iniciar Base de Datos (PostgreSQL 16)
Levanta el contenedor oficial de PostgreSQL 16 con las extensiones `uuid-ossp` y `btree_gist`:
```bash
docker-compose up -d
```

### 2. Iniciar el Backend (Spring Boot 3)
Flyway ejecutará de forma automática y versionada las 7 migraciones SQL (`V1` a `V7`):
```bash
cd backend
mvn spring-boot:run
```
- **Documentación Swagger / OpenAPI**: `http://localhost:8080/swagger-ui.html`
- **Rutas Principales**:
  - `POST /api/v1/autenticacion/iniciar-sesion`
  - `GET /api/v1/pacientes`
  - `POST /api/v1/citas/reservar`
  - `GET /api/v1/clinica/pacientes/{id}/odontograma`
  - `GET /api/v1/clinica/pacientes/{id}/periodontograma`
  - `POST /api/v1/finanzas/abonos` (con soporte para header `Idempotency-Key`)

### 3. Iniciar el Frontend (React 18 + Vite)
```bash
cd frontend
npm install
npm run dev
```
- **Aplicación Web**: `http://localhost:3000` o `http://localhost:5173`

---

## 🔐 Credenciales Base Precargadas (Vía Flyway V6)

| Rol | Usuario | Contraseña | Acceso |
|---|---|---|---|
| **Administrador** | `admin` | `admin123` | Tablero BI, Tarifario, Personal y Usuarios |
| **Odontólogo** | `dr.laurent` | `medico123` | Historias Clínicas, Odontograma FDI, Agenda |
| **Odontóloga** | `dra.mendoza` | `medico123` | Historias Clínicas, Odontograma FDI, Agenda |
| **Recepción / Caja** | `recepcion` | `recepcion123` | Agenda Diaria, Caja Registradora, Padrón Pacientes |

---

## 📂 Organización de Dominios (Backend)

```text
com/laurent/clinica/
├── ClinicaApplication.java
└── dominio/
    ├── identidad/    -> Usuarios, roles granulares, sedes y autenticación JWT
    ├── pacientes/    -> Padrón general, datos biométricos y contactos
    ├── agenda/       -> Sillones dentales, turnos y citas anti-colisión
    ├── clinica/      -> Atenciones médicas, evolución, odontograma y periodontograma FDI
    ├── finanzas/     -> Libro mayor, catálogo, sesiones de caja, cargos y abonos
    ├── inventario/   -> Insumos dentales, lotes y control de caducidades
    ├── laboratorio/  -> Laboratorios dentales y órdenes de trabajo protésicas
    └── compartido/   -> Auditoría (SEC-04), contenidos públicos y excepciones
```
