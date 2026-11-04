package com.laurent.clinica.dominio.clinica.repositorio;

import com.laurent.clinica.dominio.clinica.entidad.RegistroPeriodontalEntidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RegistroPeriodontalRepositorio extends JpaRepository<RegistroPeriodontalEntidad, UUID> {
    List<RegistroPeriodontalEntidad> findByExpedienteIdOrderByPiezaFdiAsc(UUID expedienteId);
    Optional<RegistroPeriodontalEntidad> findByExpedienteIdAndPiezaFdi(UUID expedienteId, Integer piezaFdi);
}

