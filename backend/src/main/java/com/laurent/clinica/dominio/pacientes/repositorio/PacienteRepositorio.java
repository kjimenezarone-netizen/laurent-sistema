package com.laurent.clinica.dominio.pacientes.repositorio;

import com.laurent.clinica.dominio.pacientes.entidad.PacienteEntidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PacienteRepositorio extends JpaRepository<PacienteEntidad, UUID> {

    Optional<PacienteEntidad> findByNumeroDocumento(String numeroDocumento);

    boolean existsByNumeroDocumento(String numeroDocumento);

    @Query("SELECT p FROM PacienteEntidad p WHERE p.activo = true AND " +
           "(LOWER(p.nombres) LIKE LOWER(CONCAT('%', :termino, '%')) OR " +
           "LOWER(p.apellidos) LIKE LOWER(CONCAT('%', :termino, '%')) OR " +
           "p.numeroDocumento LIKE CONCAT('%', :termino, '%'))")
    List<PacienteEntidad> buscarPorTermino(@Param("termino") String termino);

    List<PacienteEntidad> findByActivoTrueOrderByApellidosAsc();
}
