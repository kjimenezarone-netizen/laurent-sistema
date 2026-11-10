CREATE TABLE IF NOT EXISTS multimedia_web (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 titulo VARCHAR(180),
 tipo VARCHAR(30) NOT NULL DEFAULT 'IMAGEN',
 url TEXT NOT NULL DEFAULT '',
 descripcion TEXT,
 visible BOOLEAN NOT NULL DEFAULT FALSE,
 subido_por UUID REFERENCES usuarios(id),
 creado_en TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE multimedia_web ADD COLUMN IF NOT EXISTS evidencia_derechos TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'medios_publicados_evidencia'
  ) THEN
    ALTER TABLE multimedia_web ADD CONSTRAINT medios_publicados_evidencia 
    CHECK(NOT visible OR (evidencia_derechos IS NOT NULL AND length(trim(evidencia_derechos))>5));
  END IF;
END $$;
