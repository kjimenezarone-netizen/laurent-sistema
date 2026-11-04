-- =============================================================================
-- V3: MÓDULO CLÍNICO, ODONTOGRAMA Y EVOLUCIÓN
-- Hallazgos estructurados por pieza FDI, superficie y trazabilidad auditada
-- =============================================================================

-- 1. Historia Clínica Base del Paciente (Registro único por paciente)
CREATE TABLE expedientes_clinicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID NOT NULL UNIQUE REFERENCES pacientes(id) ON DELETE RESTRICT,
    numero_expediente VARCHAR(50) UNIQUE NOT NULL,
    grupo_sanguineo VARCHAR(10),
    antecedentes_patologicos TEXT,
    antecedentes_quirurgicos TEXT,
    habitos_nocivos TEXT,
    estado VARCHAR(20) DEFAULT 'ABIERTO', -- 'ABIERTO', 'ARCHIVADO'
    fecha_apertura TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Atenciones Clínicas (Sesiones / Actos Médicos)
CREATE TABLE atenciones_clinicas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expediente_id UUID NOT NULL REFERENCES expedientes_clinicos(id) ON DELETE RESTRICT,
    cita_id UUID REFERENCES citas(id) ON DELETE SET NULL,
    odontologo_id UUID NOT NULL REFERENCES odontologos(id) ON DELETE RESTRICT,
    sede_id UUID NOT NULL REFERENCES sedes(id) ON DELETE RESTRICT,
    motivo_consulta TEXT NOT NULL,
    enfermedad_actual TEXT,
    diagnostico_principal VARCHAR(255) NOT NULL,
    diagnostico_cie10 VARCHAR(20),
    notas_evolucion TEXT NOT NULL,
    indicaciones_receta TEXT,
    estado VARCHAR(30) NOT NULL DEFAULT 'BORRADOR', -- 'BORRADOR', 'FIRMADA', 'RECTIFICADA'
    fecha_firma TIMESTAMPTZ,
    odontologo_firma_id UUID REFERENCES odontologos(id),
    fecha_creacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Histórico de Versiones de Evolución (Inmutabilidad de notas firmadas)
CREATE TABLE correcciones_evolucion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    atencion_id UUID NOT NULL REFERENCES atenciones_clinicas(id) ON DELETE CASCADE,
    odontologo_autor_id UUID NOT NULL REFERENCES odontologos(id),
    nota_original TEXT NOT NULL,
    nota_corregida TEXT NOT NULL,
    motivo_justificacion TEXT NOT NULL,
    fecha_correccion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Hallazgos del Odontograma Estructurado
CREATE TABLE hallazgos_dentales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expediente_id UUID NOT NULL REFERENCES expedientes_clinicos(id) ON DELETE RESTRICT,
    atencion_id UUID REFERENCES atenciones_clinicas(id) ON DELETE SET NULL,
    odontologo_id UUID NOT NULL REFERENCES odontologos(id) ON DELETE RESTRICT,
    tipo_denticion VARCHAR(20) NOT NULL DEFAULT 'PERMANENTE', -- 'PERMANENTE' (11-48), 'TEMPORAL' (51-85)
    pieza_fdi INT NOT NULL CHECK ((pieza_fdi BETWEEN 11 AND 48) OR (pieza_fdi BETWEEN 51 AND 85)),
    superficie VARCHAR(20) NOT NULL DEFAULT 'GENERAL', -- 'VESTIBULAR', 'LINGUAL', 'PALATINO', 'OCLUSAL', 'INCISAL', 'MESIAL', 'DISTAL', 'GENERAL'
    tipo_hallazgo VARCHAR(50) NOT NULL, -- 'CARIES', 'RESTAURACION', 'CORONA', 'ENDODONCIA', 'IMPLANTE', 'FRACTURA', 'PIEZA_AUSENTE', 'SELLANTE', 'PROTESIS'
    estado_hallazgo VARCHAR(30) NOT NULL DEFAULT 'PLANIFICADO', -- 'EXISTENTE', 'PLANIFICADO', 'REALIZADO'
    observacion VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    fecha_registro TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Consentimientos Informados y Documentos Digitales
CREATE TABLE consentimientos_informados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expediente_id UUID NOT NULL REFERENCES expedientes_clinicos(id) ON DELETE RESTRICT,
    atencion_id UUID REFERENCES atenciones_clinicas(id) ON DELETE SET NULL,
    titulo VARCHAR(150) NOT NULL,
    contenido_legal TEXT NOT NULL,
    firmado BOOLEAN DEFAULT FALSE,
    fecha_firma TIMESTAMPTZ,
    huella_digital_hash VARCHAR(255),
    revocado BOOLEAN DEFAULT FALSE,
    motivo_revocacion TEXT
);

CREATE INDEX idx_hallazgos_expediente ON hallazgos_dentales(expediente_id, pieza_fdi);
CREATE INDEX idx_atenciones_expediente ON atenciones_clinicas(expediente_id, fecha_creacion);

