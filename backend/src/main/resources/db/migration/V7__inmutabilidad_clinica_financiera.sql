-- Protección defensiva adicional: nunca sobrescribir datos clínicos o económicos originales.
CREATE OR REPLACE FUNCTION laurent_immutable_row() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Operación no permitida: registro histórico inmutable (%)', TG_TABLE_NAME;
END $$;
CREATE TRIGGER tg_hallazgos_immutable BEFORE UPDATE OR DELETE ON hallazgos_odontograma
 FOR EACH ROW EXECUTE FUNCTION laurent_immutable_row();
CREATE TRIGGER tg_anamnesis_immutable BEFORE UPDATE OR DELETE ON anamnesis
 FOR EACH ROW EXECUTE FUNCTION laurent_immutable_row();
CREATE TRIGGER tg_periodonto_immutable BEFORE UPDATE OR DELETE ON periodontogramas
 FOR EACH ROW EXECUTE FUNCTION laurent_immutable_row();
CREATE TRIGGER tg_sitios_periodonto_immutable BEFORE UPDATE OR DELETE ON periodontograma_sitios
 FOR EACH ROW EXECUTE FUNCTION laurent_immutable_row();
CREATE TRIGGER tg_aplicaciones_immutable BEFORE UPDATE OR DELETE ON aplicaciones_pago
 FOR EACH ROW EXECUTE FUNCTION laurent_immutable_row();
CREATE TRIGGER tg_auditoria_immutable BEFORE UPDATE OR DELETE ON auditoria_eventos
 FOR EACH ROW EXECUTE FUNCTION laurent_immutable_row();
CREATE OR REPLACE FUNCTION laurent_check_atencion() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_OP='DELETE' THEN RAISE EXCEPTION 'Las atenciones no pueden eliminarse'; END IF;
 IF OLD.estado IN ('FIRMADA','RECTIFICADA') AND (
  NEW.motivo_consulta IS DISTINCT FROM OLD.motivo_consulta OR
  NEW.diagnostico IS DISTINCT FROM OLD.diagnostico OR
  NEW.diagnostico_cie10 IS DISTINCT FROM OLD.diagnostico_cie10 OR
  NEW.procedimiento IS DISTINCT FROM OLD.procedimiento OR
  NEW.indicaciones IS DISTINCT FROM OLD.indicaciones OR
  NEW.firma_hash IS DISTINCT FROM OLD.firma_hash OR
  NEW.firmada_en IS DISTINCT FROM OLD.firmada_en)
 THEN RAISE EXCEPTION 'Atención firmada: debe usarse rectificación'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER tg_atenciones_protegidas BEFORE UPDATE OR DELETE ON atenciones_clinicas
 FOR EACH ROW EXECUTE FUNCTION laurent_check_atencion();
CREATE OR REPLACE FUNCTION laurent_check_pago() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_OP='DELETE' THEN RAISE EXCEPTION 'No se pueden eliminar pagos'; END IF;
 IF NEW.paciente_id IS DISTINCT FROM OLD.paciente_id OR NEW.monto IS DISTINCT FROM OLD.monto OR
 NEW.metodo IS DISTINCT FROM OLD.metodo OR NEW.idempotencia IS DISTINCT FROM OLD.idempotencia OR
 NEW.registrado_por IS DISTINCT FROM OLD.registrado_por OR NEW.pagado_en IS DISTINCT FROM OLD.pagado_en OR
 (OLD.estado='REVERTIDO' AND NEW.estado<>'REVERTIDO')
 THEN RAISE EXCEPTION 'Pago inmutable; solo se permite reversión'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER tg_pagos_protegidos BEFORE UPDATE OR DELETE ON pagos
 FOR EACH ROW EXECUTE FUNCTION laurent_check_pago();
CREATE OR REPLACE FUNCTION laurent_check_cargo() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_OP='DELETE' THEN RAISE EXCEPTION 'No se pueden eliminar cargos'; END IF;
 IF NEW.paciente_id IS DISTINCT FROM OLD.paciente_id OR NEW.importe IS DISTINCT FROM OLD.importe OR
 NEW.descripcion IS DISTINCT FROM OLD.descripcion OR NEW.atencion_id IS DISTINCT FROM OLD.atencion_id OR
 (OLD.estado='ANULADO' AND NEW.estado<>'ANULADO')
 THEN RAISE EXCEPTION 'Cargo inmutable; solo se permite anulación'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER tg_cargos_protegidos BEFORE UPDATE OR DELETE ON cargos_cuenta
 FOR EACH ROW EXECUTE FUNCTION laurent_check_cargo();
