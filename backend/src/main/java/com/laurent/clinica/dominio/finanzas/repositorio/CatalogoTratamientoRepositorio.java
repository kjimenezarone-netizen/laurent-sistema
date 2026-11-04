package com.laurent.clinica.dominio.finanzas.repositorio;

import com.laurent.clinica.dominio.finanzas.entidad.CatalogoTratamientoEntidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CatalogoTratamientoRepositorio extends JpaRepository<CatalogoTratamientoEntidad, UUID> {
    Optional<CatalogoTratamientoEntidad> findByCodigo(String codigo);
    List<CatalogoTratamientoEntidad> findByActivoTrueOrderByNombreAsc();
}

