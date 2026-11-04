package com.laurent.clinica.dominio.clinica.repositorio;

import com.laurent.clinica.dominio.clinica.entidad.HallazgoDentalEntidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface HallazgoDentalRepositorio extends JpaRepository<HallazgoDentalEntidad, UUID> {
    List<HallazgoDentalEntidad> findByExpedienteIdAndActivoTrueOrderByPiezaFdiAsc(UUID expedienteId);
    List<HallazgoDentalEntidad> findByExpedienteIdAndPiezaFdiAndActivoTrue(UUID expedienteId, Integer piezaFdi);
}

