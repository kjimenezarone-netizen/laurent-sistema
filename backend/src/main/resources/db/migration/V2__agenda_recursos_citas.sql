-- =============================================================================
-- V2: MÓDULO DE AGENDA, RECURSOS Y CITAS
-- Restricción estricta de exclusión para evitar colisiones y doble reserva
-- =============================================================================

-- 1. Horarios de atención configurados por Odontólogo
CREATE TABLE horarios_odontologos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    odontologo_id UUID NOT NULL REFERENCES odontologos(id) ON DELETE CASCADE,
    sede_id UUID NOT NULL REFERENCES sedes(id) ON DELETE CASCADE,
    dia_semana INT NOT NULL CHECK (dia_semana BETWEEN 1 AND 7), -- 1=Lunes, 7=Domingo
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    CHECK (hora_inicio < hora_fin)
);

-- 2. Estados de Citas
CREATE TABLE estados_cita (
    codigo VARCHAR(30) PRIMARY KEY, -- 'PROGRAMADA', 'CONFIRMADA', 'PRESENTE', 'EN_ATENCION', 'COMPLETADA', 'CANCELADA', 'NO_ASISTIO'
    nombre VARCHAR(50) NOT NULL,
    color_hex VARCHAR(20) NOT NULL
);

INSERT INTO estados_cita (codigo, nombre, color_hex) VALUES
('PROGRAMADA', 'Programada', '#3b82f6'),
('CONFIRMADA', 'Confirmada por Paciente', '#06b6d4'),
('PRESENTE', 'Paciente en Sala de Espera', '#f59e0b'),
('EN_ATENCION', 'En Sillón Odontológico', '#10b981'),
('COMPLETADA', 'Atención Finalizada', '#059669'),
('CANCELADA', 'Cita Cancelada', '#ef4444'),
('NO_ASISTIO', 'No se presentó', '#6b7280');

-- 3. Citas de la Clínica
CREATE TABLE citas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sede_id UUID NOT NULL REFERENCES sedes(id) ON DELETE RESTRICT,
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE RESTRICT,
    odontologo_id UUID NOT NULL REFERENCES odontologos(id) ON DELETE RESTRICT,
    sillon_id UUID NOT NULL REFERENCES sillones_dentales(id) ON DELETE RESTRICT,
    fecha_hora_inicio TIMESTAMPTZ NOT NULL,
    fecha_hora_fin TIMESTAMPTZ NOT NULL,
    duracion_minutos INT NOT NULL DEFAULT 30,
    motivo VARCHAR(255) NOT NULL,
    estado_codigo VARCHAR(30) NOT NULL DEFAULT 'PROGRAMADA' REFERENCES estados_cita(codigo),
    observaciones TEXT,
    usuario_creador_id UUID REFERENCES usuarios(id),
    fecha_creacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CHECK (fecha_hora_inicio < fecha_hora_fin)
);

-- Rango de tiempo para cálculo de exclusión
ALTER TABLE citas ADD COLUMN rango_horario tstzrange 
    GENERATED ALWAYS AS (tstzrange(fecha_hora_inicio, fecha_hora_fin)) STORED;

-- Restricción anti-colisión física: Un sillón dental NO puede albergar 2 citas simultáneas activas
ALTER TABLE citas ADD CONSTRAINT uq_colision_sillon_horario
    EXCLUDE USING gist (
        sillon_id WITH =,
        rango_horario WITH &&
    ) WHERE (estado_codigo NOT IN ('CANCELADA'));

-- Restricción anti-colisión física: Un odontólogo NO puede atender 2 citas a la misma hora si están activas
ALTER TABLE citas ADD CONSTRAINT uq_colision_odontologo_horario
    EXCLUDE USING gist (
        odontologo_id WITH =,
        rango_horario WITH &&
    ) WHERE (estado_codigo NOT IN ('CANCELADA'));

CREATE INDEX idx_citas_fecha_sede ON citas(sede_id, fecha_hora_inicio);
CREATE INDEX idx_citas_paciente ON citas(paciente_id);
CREATE INDEX idx_citas_odontologo ON citas(odontologo_id, fecha_hora_inicio);

