package com.laurent.clinica.dominio.identidad.repositorio;

import com.laurent.clinica.dominio.identidad.entidad.UsuarioEntidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UsuarioRepositorio extends JpaRepository<UsuarioEntidad, UUID> {
    Optional<UsuarioEntidad> findByNombreUsuario(String nombreUsuario);
    Optional<UsuarioEntidad> findByCorreoElectronico(String correoElectronico);
    boolean existsByNombreUsuario(String nombreUsuario);
    boolean existsByCorreoElectronico(String correoElectronico);
}

