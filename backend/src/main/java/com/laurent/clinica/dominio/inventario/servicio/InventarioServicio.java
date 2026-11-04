package com.laurent.clinica.dominio.inventario.servicio;

import com.laurent.clinica.dominio.inventario.dto.RegistroInsumoDto;
import com.laurent.clinica.dominio.inventario.entidad.InsumoDentalEntidad;
import com.laurent.clinica.dominio.inventario.entidad.LoteInsumoEntidad;
import com.laurent.clinica.dominio.inventario.repositorio.InsumoDentalRepositorio;
import com.laurent.clinica.dominio.inventario.repositorio.LoteInsumoRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InventarioServicio {

    private final InsumoDentalRepositorio insumoRepositorio;
    private final LoteInsumoRepositorio loteRepositorio;

    @Transactional(readOnly = true)
    public List<InsumoDentalEntidad> listarInsumos() {
        return insumoRepositorio.findByActivoTrueOrderByNombreAsc();
    }

    @Transactional(readOnly = true)
    public List<LoteInsumoEntidad> listarLotes() {
        return loteRepositorio.findByActivoTrueOrderByFechaVencimientoAsc();
    }

    @Transactional
    public InsumoDentalEntidad registrarInsumo(RegistroInsumoDto dto) {
        InsumoDentalEntidad nuevo = InsumoDentalEntidad.builder()
                .codigoBarras(dto.getCodigoBarras())
                .nombre(dto.getNombre())
                .descripcion(dto.getDescripcion())
                .unidadMedida(dto.getUnidadMedida() != null ? dto.getUnidadMedida() : "UNIDAD")
                .stockMinimoAlerta(dto.getStockMinimoAlerta() != null ? dto.getStockMinimoAlerta() : new BigDecimal("5.000"))
                .activo(true)
                .build();
        return insumoRepositorio.save(nuevo);
    }
}

