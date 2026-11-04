package com.laurent.clinica.dominio.laboratorio.controlador;

import com.laurent.clinica.dominio.laboratorio.dto.RegistroOrdenLaboratorioDto;
import com.laurent.clinica.dominio.laboratorio.entidad.LaboratorioExternoEntidad;
import com.laurent.clinica.dominio.laboratorio.entidad.OrdenLaboratorioEntidad;
import com.laurent.clinica.dominio.laboratorio.servicio.LaboratorioServicio;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/laboratorio")
@Tag(name = "Laboratorio Dental", description = "Seguimiento de prótesis, incrustaciones y órdenes externas")
@RequiredArgsConstructor
public class LaboratorioControlador {

    private final LaboratorioServicio laboratorioServicio;

    @GetMapping("/ordenes")
    @Operation(summary = "Listar órdenes de laboratorio", description = "Lista todas las órdenes y su estado de entrega")
    public ResponseEntity<List<OrdenLaboratorioEntidad>> listarOrdenes() {
        return ResponseEntity.ok(laboratorioServicio.listarOrdenes());
    }

    @GetMapping("/talleres")
    @Operation(summary = "Listar laboratorios externos", description = "Lista los talleres dentales aliados")
    public ResponseEntity<List<LaboratorioExternoEntidad>> listarLaboratorios() {
        return ResponseEntity.ok(laboratorioServicio.listarLaboratorios());
    }

    @PostMapping("/ordenes")
    @Operation(summary = "Crear orden de trabajo", description = "Emite una orden de confección protésica")
    public ResponseEntity<OrdenLaboratorioEntidad> registrarOrden(@RequestBody RegistroOrdenLaboratorioDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(laboratorioServicio.registrarOrden(dto));
    }

    @PatchMapping("/ordenes/{id}/estado")
    @Operation(summary = "Actualizar estado de orden", description = "Transiciona de ENVIADO a EN_PROCESO, RECIBIDO, INSTALADO")
    public ResponseEntity<OrdenLaboratorioEntidad> actualizarEstado(
            @PathVariable("id") UUID id,
            @RequestParam("nuevoEstado") String nuevoEstado) {
        return ResponseEntity.ok(laboratorioServicio.actualizarEstado(id, nuevoEstado));
    }
}

