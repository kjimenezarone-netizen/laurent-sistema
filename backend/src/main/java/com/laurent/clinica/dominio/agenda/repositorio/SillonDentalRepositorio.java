package com.laurent.clinica.dominio.agenda.repositorio;

import com.laurent.clinica.dominio.agenda.entidad.SillonDentalEntidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SillonDentalRepositorio extends JpaRepository<SillonDentalEntidad, UUID> {
    List<SillonDentalEntidad> findByActivoTrue();
}

