-- =============================================================================
-- V7: MÓDULO DE PERIODONTOGRAMA (6 SITIOS POR PIEZA FDI)
-- Medición milimétrica de bolsas periodontales, margen gingival y sangrado
-- =============================================================================

CREATE TABLE registros_periodontales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expediente_id UUID NOT NULL REFERENCES expedientes_clinicos(id) ON DELETE RESTRICT,
    atencion_id UUID REFERENCES atenciones_clinicas(id) ON DELETE SET NULL,
    odontologo_id UUID NOT NULL REFERENCES odontologos(id) ON DELETE RESTRICT,
    pieza_fdi INT NOT NULL CHECK (pieza_fdi BETWEEN 11 AND 48),
    
    -- Sitio Vestibular: Mesial, Central, Distal (en milímetros)
    profundidad_sondaje_vestibular_mesial INT DEFAULT 2 CHECK (profundidad_sondaje_vestibular_mesial >= 0),
    profundidad_sondaje_vestibular_medio INT DEFAULT 2 CHECK (profundidad_sondaje_vestibular_medio >= 0),
    profundidad_sondaje_vestibular_distal INT DEFAULT 2 CHECK (profundidad_sondaje_vestibular_distal >= 0),
    
    margen_gingival_vestibular_mesial INT DEFAULT 0,
    margen_gingival_vestibular_medio INT DEFAULT 0,
    margen_gingival_vestibular_distal INT DEFAULT 0,
    
    sangrado_vestibular_mesial BOOLEAN DEFAULT FALSE,
    sangrado_vestibular_medio BOOLEAN DEFAULT FALSE,
    sangrado_vestibular_distal BOOLEAN DEFAULT FALSE,

    -- Sitio Lingual / Palatino: Mesial, Central, Distal (en milímetros)
    profundidad_sondaje_lingual_mesial INT DEFAULT 2 CHECK (profundidad_sondaje_lingual_mesial >= 0),
    profundidad_sondaje_lingual_medio INT DEFAULT 2 CHECK (profundidad_sondaje_lingual_medio >= 0),
    profundidad_sondaje_lingual_distal INT DEFAULT 2 CHECK (profundidad_sondaje_lingual_distal >= 0),
    
    margen_gingival_lingual_mesial INT DEFAULT 0,
    margen_gingival_lingual_medio INT DEFAULT 0,
    margen_gingival_lingual_distal INT DEFAULT 0,
    
    sangrado_lingual_mesial BOOLEAN DEFAULT FALSE,
    sangrado_lingual_medio BOOLEAN DEFAULT FALSE,
    sangrado_lingual_distal BOOLEAN DEFAULT FALSE,

    -- Indicadores generales de la pieza
    movilidad_grado INT DEFAULT 0 CHECK (movilidad_grado BETWEEN 0 AND 3),
    furca_grado INT DEFAULT 0 CHECK (furca_grado BETWEEN 0 AND 3),
    supuracion BOOLEAN DEFAULT FALSE,
    placa_bacteriana BOOLEAN DEFAULT FALSE,

    fecha_registro TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_periodontal_expediente ON registros_periodontales(expediente_id, pieza_fdi);

