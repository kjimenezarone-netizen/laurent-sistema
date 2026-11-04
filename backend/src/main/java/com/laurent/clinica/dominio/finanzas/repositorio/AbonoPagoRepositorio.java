package com.laurent.clinica.dominio.finanzas.repositorio;

import com.laurent.clinica.dominio.finanzas.entidad.AbonoPagoEntidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AbonoPagoRepositorio extends JpaRepository<AbonoPagoEntidad, UUID> {
    Optional<AbonoPagoEntidad> findByClaveIdempotencia(String claveIdempotencia);
    List<AbonoPagoEntidad> findByPacienteIdOrderByFechaPagoDesc(UUID pacienteId);
    List<AbonoPagoEntidad> findBySesionCajaIdOrderByFechaPagoDesc(UUID sesionCajaId);

    @Query("SELECT COALESCE(SUM(a.monto), 0) FROM AbonoPagoEntidad a WHERE a.paciente.id = :pacienteId AND a.estado = 'CONFIRMADO'")
    BigDecimal sumarTotalAbonosConfirmados(@Param("pacienteId") UUID pacienteId);
}

