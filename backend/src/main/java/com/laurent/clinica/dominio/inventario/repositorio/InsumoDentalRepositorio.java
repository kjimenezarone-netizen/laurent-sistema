package com.laurent.clinica.dominio.inventario.repositorio;

import com.laurent.clinica.dominio.inventario.entidad.InsumoDentalEntidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InsumoDentalRepositorio extends JpaRepository<InsumoDentalEntidad, UUID> {
    List<InsumoDentalEntidad> findByActivoTrueOrderByNombreAsc();
}

