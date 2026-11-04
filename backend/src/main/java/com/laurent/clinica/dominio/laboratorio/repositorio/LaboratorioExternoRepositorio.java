package com.laurent.clinica.dominio.laboratorio.repositorio;

import com.laurent.clinica.dominio.laboratorio.entidad.LaboratorioExternoEntidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LaboratorioExternoRepositorio extends JpaRepository<LaboratorioExternoEntidad, UUID> {
    List<LaboratorioExternoEntidad> findByActivoTrueOrderByRazonSocialAsc();
}

