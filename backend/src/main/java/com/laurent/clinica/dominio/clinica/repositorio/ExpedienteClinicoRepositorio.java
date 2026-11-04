package com.laurent.clinica.dominio.clinica.repositorio;

import com.laurent.clinica.dominio.clinica.entidad.ExpedienteClinicoEntidad;
import com.laurent.clinica.dominio.pacientes.entidad.PacienteEntidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ExpedienteClinicoRepositorio extends JpaRepository<ExpedienteClinicoEntidad, UUID> {
    Optional<ExpedienteClinicoEntidad> findByPaciente(PacienteEntidad paciente);
    Optional<ExpedienteClinicoEntidad> findByPacienteId(UUID pacienteId);
    Optional<ExpedienteClinicoEntidad> findByNumeroExpediente(String numeroExpediente);
}

