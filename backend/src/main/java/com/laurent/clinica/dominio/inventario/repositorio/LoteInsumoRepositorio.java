package com.laurent.clinica.dominio.inventario.repositorio;

import com.laurent.clinica.dominio.inventario.entidad.LoteInsumoEntidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LoteInsumoRepositorio extends JpaRepository<LoteInsumoEntidad, UUID> {
    List<LoteInsumoEntidad> findByInsumoIdAndActivoTrue(UUID insumoId);
    List<LoteInsumoEntidad> findByActivoTrueOrderByFechaVencimientoAsc();
}

