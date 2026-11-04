package com.laurent.clinica.dominio.identidad.repositorio;

import com.laurent.clinica.dominio.identidad.entidad.RolEntidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RolRepositorio extends JpaRepository<RolEntidad, UUID> {
    Optional<RolEntidad> findByCodigo(String codigo);
}

