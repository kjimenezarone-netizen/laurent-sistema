package com.laurent.clinica.dominio.finanzas.repositorio;

import com.laurent.clinica.dominio.finanzas.entidad.AsignacionPagoEntidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.UUID;

@Repository
public interface AsignacionPagoRepositorio extends JpaRepository<AsignacionPagoEntidad, UUID> {

    @Query("SELECT COALESCE(SUM(ap.montoAplicado), 0) FROM AsignacionPagoEntidad ap WHERE ap.cargo.paciente.id = :pacienteId AND ap.cargo.estado != 'ANULADO'")
    BigDecimal sumarTotalAplicadoAPaciente(@Param("pacienteId") UUID pacienteId);

    @Query("SELECT COALESCE(SUM(ap.montoAplicado), 0) FROM AsignacionPagoEntidad ap WHERE ap.cargo.id = :cargoId")
    BigDecimal sumarTotalAplicadoACargo(@Param("cargoId") UUID cargoId);
}

