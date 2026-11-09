-- LAURENT V1. Base de datos nueva. No sustituir migraciones ya ejecutadas en producción.
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE usuarios (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 username VARCHAR(80) NOT NULL UNIQUE,
 password_hash VARCHAR(100) NOT NULL,
 nombre VARCHAR(160) NOT NULL,
 correo VARCHAR(254) UNIQUE,
 rol VARCHAR(20) NOT NULL CHECK(rol IN ('ADMINISTRADOR','MEDICO','RECEPCIONISTA')),
 activo BOOLEAN NOT NULL DEFAULT TRUE,
 creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE sedes (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), nombre VARCHAR(180) NOT NULL,
 direccion TEXT, telefono VARCHAR(30), activa BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE TABLE odontologos (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), usuario_id UUID NOT NULL UNIQUE REFERENCES usuarios(id),
 sede_id UUID REFERENCES sedes(id), cop VARCHAR(40), especialidad VARCHAR(160), color_agenda VARCHAR(7),
 mostrar_en_web BOOLEAN NOT NULL DEFAULT FALSE, biografia TEXT, foto_url TEXT
);
CREATE TABLE pacientes (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), tipo_documento VARCHAR(20) NOT NULL DEFAULT 'DNI',
 numero_documento VARCHAR(30), nombres VARCHAR(160) NOT NULL, apellidos VARCHAR(160) NOT NULL,
 fecha_nacimiento DATE, sexo VARCHAR(25), telefono VARCHAR(35), correo VARCHAR(254), direccion TEXT,
 contacto_emergencia VARCHAR(200), representante_nombre VARCHAR(200), representante_documento VARCHAR(30),
 alergias TEXT, antecedentes_alertas TEXT, creado_por UUID REFERENCES usuarios(id),
 creado_en TIMESTAMPTZ NOT NULL DEFAULT now(), actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
 activo BOOLEAN NOT NULL DEFAULT TRUE,
 CONSTRAINT u_paciente_documento UNIQUE(tipo_documento,numero_documento)
);
CREATE INDEX idx_pacientes_nombre ON pacientes(apellidos,nombres);
CREATE TABLE paciente_profesionales (
 paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
 odontologo_usuario_id UUID NOT NULL REFERENCES usuarios(id),
 asignado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
 PRIMARY KEY(paciente_id,odontologo_usuario_id)
);
CREATE TABLE catalogo_tratamientos (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), codigo VARCHAR(40) NOT NULL UNIQUE,
 nombre VARCHAR(180) NOT NULL, descripcion TEXT, especialidad VARCHAR(100),
 precio_base NUMERIC(14,2) NOT NULL CHECK(precio_base>=0),
 duracion_minutos INTEGER NOT NULL DEFAULT 30 CHECK(duracion_minutos BETWEEN 5 AND 600),
 publico BOOLEAN NOT NULL DEFAULT TRUE, activo BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE TABLE sillones (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), sede_id UUID NOT NULL REFERENCES sedes(id),
 codigo VARCHAR(50) NOT NULL, nombre VARCHAR(100) NOT NULL, activo BOOLEAN NOT NULL DEFAULT TRUE,
 UNIQUE(sede_id,codigo)
);
CREATE TABLE disponibilidades_odontologo (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), odontologo_usuario_id UUID NOT NULL REFERENCES usuarios(id),
 dia_semana INTEGER NOT NULL CHECK(dia_semana BETWEEN 1 AND 7),
 desde TIME NOT NULL, hasta TIME NOT NULL, aprobado BOOLEAN NOT NULL DEFAULT FALSE,
 CHECK(desde<hasta)
);
CREATE TABLE bloqueos_agenda (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), odontologo_usuario_id UUID REFERENCES usuarios(id),
 sillon_id UUID REFERENCES sillones(id), inicio TIMESTAMPTZ NOT NULL, fin TIMESTAMPTZ NOT NULL,
 motivo VARCHAR(250), aprobado_por UUID REFERENCES usuarios(id), CHECK(inicio<fin),
 CHECK(odontologo_usuario_id IS NOT NULL OR sillon_id IS NOT NULL)
);
CREATE TABLE citas (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), paciente_id UUID NOT NULL REFERENCES pacientes(id),
 odontologo_usuario_id UUID NOT NULL REFERENCES usuarios(id), sillon_id UUID NOT NULL REFERENCES sillones(id),
 tratamiento_id UUID REFERENCES catalogo_tratamientos(id),
 inicio TIMESTAMPTZ NOT NULL, fin TIMESTAMPTZ NOT NULL,
 estado VARCHAR(30) NOT NULL DEFAULT 'RESERVADA' CHECK(estado IN
 ('RESERVADA','CONFIRMADA','PRESENTE','EN_ATENCION','COMPLETADA','CANCELADA','NO_ASISTIO')),
 confirmada_en TIMESTAMPTZ, observacion TEXT,
 creada_por UUID REFERENCES usuarios(id), creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
 periodo TSTZRANGE GENERATED ALWAYS AS (tstzrange(inicio,fin,'[)')) STORED,
 CHECK(inicio<fin)
);
ALTER TABLE citas ADD CONSTRAINT citas_sillon_sin_solape EXCLUDE USING gist
 (sillon_id WITH =, periodo WITH &&)
 WHERE (estado NOT IN ('CANCELADA','NO_ASISTIO'));
ALTER TABLE citas ADD CONSTRAINT citas_medico_sin_solape EXCLUDE USING gist
 (odontologo_usuario_id WITH =, periodo WITH &&)
 WHERE (estado NOT IN ('CANCELADA','NO_ASISTIO'));
CREATE INDEX idx_citas_fecha ON citas(inicio,fin);
CREATE INDEX idx_citas_paciente ON citas(paciente_id,inicio DESC);
