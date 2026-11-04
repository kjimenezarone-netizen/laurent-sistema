package com.laurent.clinica.dominio.laboratorio.repositorio;

import com.laurent.clinica.dominio.laboratorio.entidad.OrdenLaboratorioEntidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrdenLaboratorioRepositorio extends JpaRepository<OrdenLaboratorioEntidad, UUID> {
    List<OrdenLaboratorioEntidad> findByOrderByFechaCreacionDesc();
    List<OrdenLaboratorioEntidad> findByPacienteIdOrderByFechaCreacionDesc(UUID pacienteId);
}

