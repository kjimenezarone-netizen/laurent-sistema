package com.laurent.clinica.dominio.compartido.repositorio;

import com.laurent.clinica.dominio.compartido.entidad.RegistroAuditoriaEntidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RegistroAuditoriaRepositorio extends JpaRepository<RegistroAuditoriaEntidad, UUID> {
    List<RegistroAuditoriaEntidad> findTop50ByOrderByFechaEventoDesc();
}

