-- =============================================================================
-- V4: MÓDULO FINANCIERO, CAJA Y LIBRO MAYOR INMUTABLE
-- El saldo nunca es editable: se deriva matemáticamente de cargos y abonos
-- =============================================================================

-- 1. Catálogo de Tratamientos y Precios
CREATE TABLE catalogo_tratamientos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio_base NUMERIC(14,2) NOT NULL CHECK (precio_base >= 0),
    duracion_estimada_minutos INT NOT NULL DEFAULT 30,
    categoria VARCHAR(50) DEFAULT 'GENERAL', -- 'RESTAURADORA', 'ENDODONCIA', 'ESTETICA', 'CIRUGIA', 'PREVENTIVA'
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Sesiones de Caja (Turnos diarios de apertura y cierre)
CREATE TABLE sesiones_caja (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sede_id UUID NOT NULL REFERENCES sedes(id) ON DELETE RESTRICT,
    cajero_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    fecha_apertura TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    monto_inicial_apertura NUMERIC(14,2) NOT NULL CHECK (monto_inicial_apertura >= 0),
    fecha_cierre TIMESTAMPTZ,
    monto_final_sistema NUMERIC(14,2),
    monto_final_real NUMERIC(14,2),
    diferencia NUMERIC(14,2),
    estado VARCHAR(20) NOT NULL DEFAULT 'ABIERTA', -- 'ABIERTA', 'CERRADA'
    observaciones TEXT
);

-- 3. Cargos a la cuenta del paciente (Cargos Devengados)
CREATE TABLE cargos_cuenta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE RESTRICT,
    atencion_id UUID REFERENCES atenciones_clinicas(id) ON DELETE SET NULL,
    tratamiento_id UUID REFERENCES catalogo_tratamientos(id) ON DELETE RESTRICT,
    descripcion VARCHAR(255) NOT NULL,
    cantidad INT NOT NULL DEFAULT 1 CHECK (cantidad > 0),
    precio_unitario NUMERIC(14,2) NOT NULL CHECK (precio_unitario >= 0),
    descuento NUMERIC(14,2) NOT NULL DEFAULT 0.00 CHECK (descuento >= 0),
    monto_total NUMERIC(14,2) NOT NULL CHECK (monto_total >= 0),
    moneda VARCHAR(5) NOT NULL DEFAULT 'PEN',
    estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE', -- 'PENDIENTE', 'PAGADO_PARCIAL', 'PAGADO_TOTAL', 'ANULADO'
    motivo_anulacion TEXT,
    usuario_creador_id UUID NOT NULL REFERENCES usuarios(id),
    fecha_emision TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Abonos y Pagos Recibidos (Inmutables con protección de idempotencia)
CREATE TABLE abonos_pago (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE RESTRICT,
    sesion_caja_id UUID NOT NULL REFERENCES sesiones_caja(id) ON DELETE RESTRICT,
    monto NUMERIC(14,2) NOT NULL CHECK (monto > 0),
    moneda VARCHAR(5) NOT NULL DEFAULT 'PEN',
    medio_pago VARCHAR(30) NOT NULL, -- 'EFECTIVO', 'TARJETA_CREDITO', 'TARJETA_DEBITO', 'TRANSFERENCIA', 'YAPE', 'PLIN'
    numero_operacion VARCHAR(100),
    clave_idempotencia VARCHAR(100) UNIQUE NOT NULL, -- Evita cobros dobles por clics repetidos
    estado VARCHAR(20) NOT NULL DEFAULT 'CONFIRMADO', -- 'CONFIRMADO', 'REVERTIDO'
    cajero_id UUID NOT NULL REFERENCES usuarios(id),
    motivo_reversion TEXT,
    fecha_reversion TIMESTAMPTZ,
    fecha_pago TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Aplicación / Asignación de Pagos a Cargos Específicos
CREATE TABLE asignaciones_pago (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    abono_id UUID NOT NULL REFERENCES abonos_pago(id) ON DELETE RESTRICT,
    cargo_id UUID NOT NULL REFERENCES cargos_cuenta(id) ON DELETE RESTRICT,
    monto_aplicado NUMERIC(14,2) NOT NULL CHECK (monto_aplicado > 0),
    fecha_asignacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Vista Materializada/Calculada de Saldo Real por Paciente
CREATE OR REPLACE VIEW v_saldo_paciente AS
WITH total_cargos AS (
    SELECT 
        paciente_id,
        COALESCE(SUM(monto_total), 0) AS suma_cargos
    FROM cargos_cuenta
    WHERE estado != 'ANULADO'
    GROUP BY paciente_id
),
total_abonos AS (
    SELECT 
        paciente_id,
        COALESCE(SUM(monto), 0) AS suma_abonos
    FROM abonos_pago
    WHERE estado = 'CONFIRMADO'
    GROUP BY paciente_id
),
total_aplicado AS (
    SELECT 
        c.paciente_id,
        COALESCE(SUM(a.monto_aplicado), 0) AS suma_aplicada
    FROM asignaciones_pago a
    JOIN cargos_cuenta c ON a.cargo_id = c.id
    WHERE c.estado != 'ANULADO'
    GROUP BY c.paciente_id
)
SELECT 
    p.id AS paciente_id,
    p.numero_documento,
    p.nombres,
    p.apellidos,
    COALESCE(tc.suma_cargos, 0.00) AS total_facturado,
    COALESCE(ta.suma_abonos, 0.00) AS total_abonado,
    COALESCE(ap.suma_aplicada, 0.00) AS total_aplicado_a_deuda,
    -- Deuda pendiente = Cargos menos lo que ya se aplicó
    GREATEST(COALESCE(tc.suma_cargos, 0.00) - COALESCE(ap.suma_aplicada, 0.00), 0.00) AS saldo_deudor,
    -- Saldo a favor = Abonos confirmados que aún no se han aplicado a ningún cargo
    GREATEST(COALESCE(ta.suma_abonos, 0.00) - COALESCE(ap.suma_aplicada, 0.00), 0.00) AS saldo_a_favor
FROM pacientes p
LEFT JOIN total_cargos tc ON p.id = tc.paciente_id
LEFT JOIN total_abonos ta ON p.id = ta.paciente_id
LEFT JOIN total_aplicado ap ON p.id = ap.paciente_id;

CREATE INDEX idx_cargos_paciente ON cargos_cuenta(paciente_id, estado);
CREATE INDEX idx_abonos_paciente ON abonos_pago(paciente_id, estado);
CREATE INDEX idx_abonos_idempotencia ON abonos_pago(clave_idempotencia);

