package com.laurent.clinica.dominio.finanzas.repositorio;

import com.laurent.clinica.dominio.finanzas.entidad.CargoCuentaEntidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface CargoCuentaRepositorio extends JpaRepository<CargoCuentaEntidad, UUID> {
    List<CargoCuentaEntidad> findByPacienteIdOrderByFechaEmisionDesc(UUID pacienteId);
    List<CargoCuentaEntidad> findByPacienteIdAndEstadoNotOrderByFechaEmisionAsc(UUID pacienteId, String estado);

    @Query("SELECT COALESCE(SUM(c.montoTotal), 0) FROM CargoCuentaEntidad c WHERE c.paciente.id = :pacienteId AND c.estado != 'ANULADO'")
    BigDecimal sumarTotalCargosActivos(@Param("pacienteId") UUID pacienteId);
}

