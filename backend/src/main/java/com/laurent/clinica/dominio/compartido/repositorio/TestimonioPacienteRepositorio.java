package com.laurent.clinica.dominio.compartido.repositorio;

import com.laurent.clinica.dominio.compartido.entidad.TestimonioPacienteEntidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TestimonioPacienteRepositorio extends JpaRepository<TestimonioPacienteEntidad, UUID> {
    List<TestimonioPacienteEntidad> findByActivoTrueOrderByFechaPublicacionDesc();
}

