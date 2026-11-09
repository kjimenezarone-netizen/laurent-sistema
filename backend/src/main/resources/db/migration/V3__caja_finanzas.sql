CREATE TABLE sesiones_caja (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), recepcion_usuario_id UUID NOT NULL REFERENCES usuarios(id),
 sede_id UUID REFERENCES sedes(id), apertura TIMESTAMPTZ NOT NULL DEFAULT now(), cierre TIMESTAMPTZ,
 monto_apertura NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK(monto_apertura>=0), monto_cierre NUMERIC(14,2), observacion TEXT
);
CREATE TABLE cargos_cuenta (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), paciente_id UUID NOT NULL REFERENCES pacientes(id),
 atencion_id UUID REFERENCES atenciones_clinicas(id), tratamiento_id UUID REFERENCES catalogo_tratamientos(id),
 descripcion VARCHAR(255) NOT NULL, importe NUMERIC(14,2) NOT NULL CHECK(importe>0),
 estado VARCHAR(20) NOT NULL DEFAULT 'VIGENTE' CHECK(estado IN ('VIGENTE','ANULADO')),
 motivo_anulacion TEXT, registrado_por UUID NOT NULL REFERENCES usuarios(id), creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE pagos (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), paciente_id UUID NOT NULL REFERENCES pacientes(id),
 sesion_caja_id UUID REFERENCES sesiones_caja(id), monto NUMERIC(14,2) NOT NULL CHECK(monto>0),
 metodo VARCHAR(20) NOT NULL CHECK(metodo IN ('EFECTIVO','YAPE','PLIN','TRANSFERENCIA','TARJETA')),
 referencia VARCHAR(160), idempotencia VARCHAR(100) NOT NULL UNIQUE, estado VARCHAR(20) NOT NULL DEFAULT 'CONFIRMADO'
 CHECK(estado IN ('CONFIRMADO','REVERTIDO')),
 motivo_reversion TEXT, registrado_por UUID NOT NULL REFERENCES usuarios(id), pagado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE aplicaciones_pago (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), pago_id UUID NOT NULL REFERENCES pagos(id),
 cargo_id UUID NOT NULL REFERENCES cargos_cuenta(id), monto NUMERIC(14,2) NOT NULL CHECK(monto>0),
 UNIQUE(pago_id,cargo_id)
);
CREATE VIEW v_cuenta_paciente AS
SELECT p.id paciente_id,
 COALESCE((SELECT sum(c.importe) FROM cargos_cuenta c WHERE c.paciente_id=p.id AND c.estado='VIGENTE'),0)::NUMERIC(14,2) total_cargos,
 COALESCE((SELECT sum(a.monto) FROM aplicaciones_pago a JOIN pagos pg ON pg.id=a.pago_id
      JOIN cargos_cuenta c ON c.id=a.cargo_id WHERE c.paciente_id=p.id AND c.estado='VIGENTE' AND pg.estado='CONFIRMADO'),0)::NUMERIC(14,2) total_aplicado,
 COALESCE((SELECT sum(pg.monto) FROM pagos pg WHERE pg.paciente_id=p.id AND pg.estado='CONFIRMADO'),0)::NUMERIC(14,2) total_pagado,
 GREATEST(COALESCE((SELECT sum(c.importe) FROM cargos_cuenta c WHERE c.paciente_id=p.id AND c.estado='VIGENTE'),0)
 - COALESCE((SELECT sum(a.monto) FROM aplicaciones_pago a JOIN pagos pg ON pg.id=a.pago_id
 JOIN cargos_cuenta c ON c.id=a.cargo_id WHERE c.paciente_id=p.id AND c.estado='VIGENTE' AND pg.estado='CONFIRMADO'),0),0)::NUMERIC(14,2) deuda,
 GREATEST(COALESCE((SELECT sum(pg.monto) FROM pagos pg WHERE pg.paciente_id=p.id AND pg.estado='CONFIRMADO'),0)
 - COALESCE((SELECT sum(a.monto) FROM aplicaciones_pago a JOIN pagos pg ON pg.id=a.pago_id
 JOIN cargos_cuenta c ON c.id=a.cargo_id WHERE c.paciente_id=p.id AND c.estado='VIGENTE' AND pg.estado='CONFIRMADO'),0),0)::NUMERIC(14,2) saldo_a_favor
FROM pacientes p;
CREATE INDEX idx_cargos_paciente ON cargos_cuenta(paciente_id,creado_en DESC);
CREATE INDEX idx_pagos_paciente ON pagos(paciente_id,pagado_en DESC);
