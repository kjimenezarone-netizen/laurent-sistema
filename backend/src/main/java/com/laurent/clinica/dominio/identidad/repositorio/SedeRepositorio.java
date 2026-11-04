package com.laurent.clinica.dominio.identidad.repositorio;

import com.laurent.clinica.dominio.identidad.entidad.SedeEntidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SedeRepositorio extends JpaRepository<SedeEntidad, UUID> {
    List<SedeEntidad> findByActivaTrue();
}

