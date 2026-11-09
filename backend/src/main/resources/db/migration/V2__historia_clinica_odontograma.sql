-- Datos clínicos versionados; sus firmas requieren revisión jurídico-clínica antes de producción.
CREATE TABLE historias_clinicas (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), paciente_id UUID NOT NULL UNIQUE REFERENCES pacientes(id),
 motivo_apertura TEXT, creada_en TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE anamnesis (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), paciente_id UUID NOT NULL REFERENCES pacientes(id),
 registrada_por UUID NOT NULL REFERENCES usuarios(id), enfermedades TEXT, medicamentos TEXT,
 alergias TEXT, antecedentes_familiares TEXT, observaciones TEXT, validada BOOLEAN NOT NULL DEFAULT FALSE,
 registrada_en TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE atenciones_clinicas (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), paciente_id UUID NOT NULL REFERENCES pacientes(id),
 cita_id UUID REFERENCES citas(id), odontologo_usuario_id UUID NOT NULL REFERENCES usuarios(id),
 motivo_consulta TEXT NOT NULL, diagnostico TEXT, diagnostico_cie10 VARCHAR(20),
 procedimiento TEXT NOT NULL, indicaciones TEXT, estado VARCHAR(20) NOT NULL DEFAULT 'BORRADOR'
 CHECK(estado IN ('BORRADOR','FIRMADA','RECTIFICADA')),
 creada_en TIMESTAMPTZ NOT NULL DEFAULT now(), firmada_en TIMESTAMPTZ,
 firma_hash VARCHAR(64), CHECK((estado='BORRADOR' AND firmada_en IS NULL) OR
 (estado IN ('FIRMADA','RECTIFICADA') AND firmada_en IS NOT NULL))
);
CREATE TABLE rectificaciones_clinicas (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), atencion_id UUID NOT NULL REFERENCES atenciones_clinicas(id),
 autor_id UUID NOT NULL REFERENCES usuarios(id), motivo TEXT NOT NULL, texto_rectificacion TEXT NOT NULL,
 creada_en TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE hallazgos_odontograma (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), paciente_id UUID NOT NULL REFERENCES pacientes(id),
 atencion_id UUID REFERENCES atenciones_clinicas(id), odontologo_usuario_id UUID NOT NULL REFERENCES usuarios(id),
 pieza_fdi SMALLINT NOT NULL CHECK(
 (pieza_fdi BETWEEN 11 AND 18) OR (pieza_fdi BETWEEN 21 AND 28) OR
 (pieza_fdi BETWEEN 31 AND 38) OR (pieza_fdi BETWEEN 41 AND 48) OR
 (pieza_fdi BETWEEN 51 AND 55) OR (pieza_fdi BETWEEN 61 AND 65) OR
 (pieza_fdi BETWEEN 71 AND 75) OR (pieza_fdi BETWEEN 81 AND 85)),
 superficie VARCHAR(20) NOT NULL CHECK(superficie IN
 ('GENERAL','VESTIBULAR','LINGUAL','PALATINO','INCISAL','OCLUSAL','MESIAL','DISTAL')),
 tipo VARCHAR(30) NOT NULL CHECK(tipo IN
 ('CARIES','RESTAURACION','SELLANTE','CORONA','ENDODONCIA','IMPLANTE','FRACTURA','PIEZA_AUSENTE','PROTESIS')),
 estado VARCHAR(20) NOT NULL CHECK(estado IN ('EXISTENTE','PLANIFICADO','REALIZADO')),
 observacion TEXT, registrado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
 rectifica_a UUID REFERENCES hallazgos_odontograma(id)
);
CREATE INDEX idx_odontograma_paciente ON hallazgos_odontograma(paciente_id,registrado_en);
CREATE TABLE periodontogramas (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), paciente_id UUID NOT NULL REFERENCES pacientes(id),
 odontologo_usuario_id UUID NOT NULL REFERENCES usuarios(id), registrado_en TIMESTAMPTZ NOT NULL DEFAULT now(), observacion TEXT
);
CREATE TABLE periodontograma_sitios (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), examen_id UUID NOT NULL REFERENCES periodontogramas(id),
 pieza_fdi SMALLINT NOT NULL, sitio VARCHAR(5) NOT NULL CHECK(sitio IN ('MV','V','DV','ML','L','DL')),
 sondaje_mm SMALLINT CHECK(sondaje_mm BETWEEN 0 AND 20), recesion_mm SMALLINT CHECK(recesion_mm BETWEEN -10 AND 20),
 sangrado BOOLEAN NOT NULL DEFAULT FALSE, placa BOOLEAN NOT NULL DEFAULT FALSE, supuracion BOOLEAN NOT NULL DEFAULT FALSE,
 UNIQUE(examen_id,pieza_fdi,sitio)
);
CREATE TABLE planes_tratamiento (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), paciente_id UUID NOT NULL REFERENCES pacientes(id),
 odontologo_usuario_id UUID NOT NULL REFERENCES usuarios(id), version INTEGER NOT NULL DEFAULT 1,
 estado VARCHAR(30) NOT NULL DEFAULT 'BORRADOR' CHECK(estado IN ('BORRADOR','PROPUESTO','ACEPTADO','PARCIAL','RECHAZADO','ANULADO')),
 observaciones TEXT, creado_en TIMESTAMPTZ NOT NULL DEFAULT now(), aprobado_en TIMESTAMPTZ
);
CREATE TABLE plan_items (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), plan_id UUID NOT NULL REFERENCES planes_tratamiento(id),
 tratamiento_id UUID NOT NULL REFERENCES catalogo_tratamientos(id), pieza_fdi SMALLINT, cantidad INTEGER NOT NULL DEFAULT 1 CHECK(cantidad>0),
 precio_unitario NUMERIC(14,2) NOT NULL CHECK(precio_unitario>=0), aprobado BOOLEAN, ejecutado BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE TABLE consentimientos (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), paciente_id UUID NOT NULL REFERENCES pacientes(id),
 atencion_id UUID REFERENCES atenciones_clinicas(id), plantilla_codigo VARCHAR(60) NOT NULL,
 version_documento INTEGER NOT NULL DEFAULT 1, documento_sha256 VARCHAR(64),
 firma_modalidad VARCHAR(40), firmante_nombre VARCHAR(200), representante_documento VARCHAR(50),
 firmado_en TIMESTAMPTZ, creado_por UUID NOT NULL REFERENCES usuarios(id), creado_en TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE archivos_clinicos (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), paciente_id UUID NOT NULL REFERENCES pacientes(id),
 atencion_id UUID REFERENCES atenciones_clinicas(id), tipo VARCHAR(30) NOT NULL,
 nombre_original VARCHAR(220) NOT NULL, mime VARCHAR(100) NOT NULL, almacenamiento_clave TEXT NOT NULL,
 sha256 VARCHAR(64) NOT NULL, creado_por UUID NOT NULL REFERENCES usuarios(id), creado_en TIMESTAMPTZ DEFAULT now()
);
