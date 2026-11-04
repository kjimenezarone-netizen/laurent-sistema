package com.laurent.clinica.dominio.identidad.repositorio;

import com.laurent.clinica.dominio.identidad.entidad.OdontologoEntidad;
import com.laurent.clinica.dominio.identidad.entidad.UsuarioEntidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OdontologoRepositorio extends JpaRepository<OdontologoEntidad, UUID> {
    Optional<OdontologoEntidad> findByUsuario(UsuarioEntidad usuario);
    List<OdontologoEntidad> findByActivoTrue();
}

