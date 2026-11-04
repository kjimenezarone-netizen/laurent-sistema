-- =============================================================================
-- V5: MÓDULO DE INVENTARIO, LOTES Y ÓRDENES DE LABORATORIO
-- Control de insumos clínicos, esterilización y prótesis dentales
-- =============================================================================

-- 1. Insumos y Materiales Dentales
CREATE TABLE insumos_dentales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_barras VARCHAR(50) UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    unidad_medida VARCHAR(20) NOT NULL DEFAULT 'UNIDAD', -- 'UNIDAD', 'CAJA', 'KIT', 'GRAMO', 'MILILITRO'
    stock_minimo_alerta NUMERIC(14,3) NOT NULL DEFAULT 5.000,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Lotes e Inventario por Sede
CREATE TABLE lotes_insumos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    insumo_id UUID NOT NULL REFERENCES insumos_dentales(id) ON DELETE RESTRICT,
    sede_id UUID NOT NULL REFERENCES sedes(id) ON DELETE RESTRICT,
    numero_lote VARCHAR(50) NOT NULL,
    fecha_vencimiento DATE,
    cantidad_actual NUMERIC(14,3) NOT NULL CHECK (cantidad_actual >= 0),
    costo_unitario_compra NUMERIC(14,2) DEFAULT 0.00,
    activo BOOLEAN DEFAULT TRUE
);

-- 3. Laboratorios Dentales Externos (Talleres de prótesis y coronas)
CREATE TABLE laboratorios_externos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    razon_social VARCHAR(150) NOT NULL,
    ruc VARCHAR(20) UNIQUE,
    telefono_contacto VARCHAR(20),
    contacto_nombre VARCHAR(100),
    activo BOOLEAN DEFAULT TRUE
);

-- 4. Órdenes de Trabajo para Laboratorio
CREATE TABLE ordenes_laboratorio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE RESTRICT,
    odontologo_id UUID NOT NULL REFERENCES odontologos(id) ON DELETE RESTRICT,
    laboratorio_id UUID NOT NULL REFERENCES laboratorios_externos(id) ON DELETE RESTRICT,
    tipo_trabajo VARCHAR(100) NOT NULL, -- 'CORONA_ZIRCONIO', 'PROTESIS_TOTAL', 'INCRUSTACION', 'FERULA_DESPROGRAMADORA'
    color_guia VARCHAR(20), -- ej. 'A2', 'BL1'
    pieza_fdi INT,
    fecha_envio DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_entrega_esperada DATE NOT NULL,
    fecha_entrega_real DATE,
    costo_laboratorio NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    estado VARCHAR(30) NOT NULL DEFAULT 'ENVIADO', -- 'ENVIADO', 'EN_PROCESO', 'RECIBIDO', 'INSTALADO', 'RECHAZADO'
    observaciones TEXT,
    fecha_creacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lotes_insumo ON lotes_insumos(insumo_id, sede_id);
CREATE INDEX idx_ordenes_paciente ON ordenes_laboratorio(paciente_id, estado);

