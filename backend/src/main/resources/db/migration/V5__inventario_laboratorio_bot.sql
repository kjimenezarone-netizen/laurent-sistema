CREATE TABLE insumos (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), codigo VARCHAR(60) NOT NULL UNIQUE,
 nombre VARCHAR(200) NOT NULL, unidad VARCHAR(30) NOT NULL DEFAULT 'UNIDAD',
 minimo NUMERIC(14,3) NOT NULL DEFAULT 0 CHECK(minimo>=0), activo BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE TABLE lotes_insumos (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), insumo_id UUID NOT NULL REFERENCES insumos(id),
 numero_lote VARCHAR(100), vencimiento DATE, cantidad NUMERIC(14,3) NOT NULL CHECK(cantidad>=0),
 costo_unitario NUMERIC(14,2) CHECK(costo_unitario>=0), sede_id UUID REFERENCES sedes(id)
);
CREATE TABLE movimientos_inventario (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), lote_id UUID NOT NULL REFERENCES lotes_insumos(id),
 tipo VARCHAR(20) NOT NULL CHECK(tipo IN ('ENTRADA','SALIDA','AJUSTE')),
 cantidad NUMERIC(14,3) NOT NULL CHECK(cantidad>0), motivo TEXT,
 autor_id UUID NOT NULL REFERENCES usuarios(id), creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE ordenes_laboratorio (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), paciente_id UUID NOT NULL REFERENCES pacientes(id),
 odontologo_usuario_id UUID NOT NULL REFERENCES usuarios(id), laboratorio VARCHAR(180),
 trabajo VARCHAR(255) NOT NULL, pieza_fdi SMALLINT, fecha_entrega DATE,
 estado VARCHAR(25) NOT NULL DEFAULT 'SOLICITADO' CHECK(estado IN ('SOLICITADO','EN_PROCESO','RECIBIDO','ENTREGADO','CANCELADO')),
 observacion TEXT, creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE ciclos_esterilizacion (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), equipo VARCHAR(120) NOT NULL,
 inicio TIMESTAMPTZ NOT NULL, fin TIMESTAMPTZ,
 resultado VARCHAR(30) NOT NULL CHECK(resultado IN ('PENDIENTE','APROBADO','RECHAZADO')),
 responsable_id UUID NOT NULL REFERENCES usuarios(id), observaciones TEXT
);
CREATE TABLE mensajes_salida (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), paciente_id UUID REFERENCES pacientes(id),
 cita_id UUID REFERENCES citas(id), canal VARCHAR(25) NOT NULL CHECK(canal IN ('WHATSAPP','EMAIL')),
 destinatario VARCHAR(150) NOT NULL, plantilla VARCHAR(80) NOT NULL, contenido TEXT NOT NULL,
 estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE' CHECK(estado IN ('PENDIENTE','ENVIADO','ERROR','CANCELADO')),
 proveedor_id VARCHAR(200), creado_en TIMESTAMPTZ DEFAULT now(), enviado_en TIMESTAMPTZ
);
