ALTER TABLE multimedia_web ADD COLUMN IF NOT EXISTS evidencia_derechos TEXT;
ALTER TABLE multimedia_web ADD CONSTRAINT medios_publicados_evidencia CHECK(NOT visible OR (evidencia_derechos IS NOT NULL AND length(trim(evidencia_derechos))>5));
