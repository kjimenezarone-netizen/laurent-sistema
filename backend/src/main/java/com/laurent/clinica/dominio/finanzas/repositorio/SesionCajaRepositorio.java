package com.laurent.clinica.dominio.finanzas.repositorio;

import com.laurent.clinica.dominio.finanzas.entidad.SesionCajaEntidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SesionCajaRepositorio extends JpaRepository<SesionCajaEntidad, UUID> {
    Optional<SesionCajaEntidad> findByCajeroIdAndEstado(UUID cajeroId, String estado);
    Optional<SesionCajaEntidad> findFirstByEstadoOrderByFechaAperturaDesc(String estado);
}

