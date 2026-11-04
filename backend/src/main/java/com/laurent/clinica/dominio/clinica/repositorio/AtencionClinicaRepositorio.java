package com.laurent.clinica.dominio.clinica.repositorio;

import com.laurent.clinica.dominio.clinica.entidad.AtencionClinicaEntidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AtencionClinicaRepositorio extends JpaRepository<AtencionClinicaEntidad, UUID> {
    List<AtencionClinicaEntidad> findByExpedienteIdOrderByFechaCreacionDesc(UUID expedienteId);
    List<AtencionClinicaEntidad> findByOdontologoIdOrderByFechaCreacionDesc(UUID odontologoId);
}

