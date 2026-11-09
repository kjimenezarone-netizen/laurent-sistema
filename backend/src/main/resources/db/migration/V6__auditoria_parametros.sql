CREATE TABLE auditoria_eventos (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), usuario_id UUID REFERENCES usuarios(id),
 modulo VARCHAR(60) NOT NULL, accion VARCHAR(100) NOT NULL, entidad VARCHAR(80),
 registro_id UUID, detalles JSONB, ip VARCHAR(64), creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_auditoria_orden ON auditoria_eventos(creado_en DESC);
CREATE TABLE parametros_clinica (
 clave VARCHAR(100) PRIMARY KEY, valor TEXT NOT NULL,
 modificado_por UUID REFERENCES usuarios(id), actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- El instalador registra el administrador inicial mediante variables de entorno; no hay contraseñas semilla.
