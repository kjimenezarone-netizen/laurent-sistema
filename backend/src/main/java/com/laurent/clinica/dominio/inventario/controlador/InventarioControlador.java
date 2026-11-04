package com.laurent.clinica.dominio.inventario.controlador;

import com.laurent.clinica.dominio.inventario.dto.RegistroInsumoDto;
import com.laurent.clinica.dominio.inventario.entidad.InsumoDentalEntidad;
import com.laurent.clinica.dominio.inventario.entidad.LoteInsumoEntidad;
import com.laurent.clinica.dominio.inventario.servicio.InventarioServicio;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inventario")
@Tag(name = "Inventario y Stock", description = "Control de materiales dentales, insumos y lotes")
@RequiredArgsConstructor
public class InventarioControlador {

    private final InventarioServicio inventarioServicio;

    @GetMapping("/insumos")
    @Operation(summary = "Listar insumos", description = "Lista los materiales dentales activos")
    public ResponseEntity<List<InsumoDentalEntidad>> listarInsumos() {
        return ResponseEntity.ok(inventarioServicio.listarInsumos());
    }

    @GetMapping("/lotes")
    @Operation(summary = "Listar lotes por vencer", description = "Lista los lotes y existencias actuales")
    public ResponseEntity<List<LoteInsumoEntidad>> listarLotes() {
        return ResponseEntity.ok(inventarioServicio.listarLotes());
    }

    @PostMapping("/insumos")
    @Operation(summary = "Registrar nuevo insumo", description = "Da de alta un material dental en el inventario")
    public ResponseEntity<InsumoDentalEntidad> registrarInsumo(@RequestBody RegistroInsumoDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(inventarioServicio.registrarInsumo(dto));
    }
}

