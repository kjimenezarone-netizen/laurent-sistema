package com.laurent.clinica.dominio.finanzas.controlador;

import com.laurent.clinica.dominio.finanzas.dto.EmisionCargoDto;
import com.laurent.clinica.dominio.finanzas.dto.EstadoCuentaPacienteDto;
import com.laurent.clinica.dominio.finanzas.dto.RegistroAbonoDto;
import com.laurent.clinica.dominio.finanzas.entidad.AbonoPagoEntidad;
import com.laurent.clinica.dominio.finanzas.entidad.CargoCuentaEntidad;
import com.laurent.clinica.dominio.finanzas.entidad.CatalogoTratamientoEntidad;
import com.laurent.clinica.dominio.finanzas.servicio.FinanzasServicio;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/finanzas")
@Tag(name = "Finanzas y Facturación", description = "Catálogo de precios, emisión de cargos y estados de cuenta inmutables")
@RequiredArgsConstructor
public class FinanzasControlador {

    private final FinanzasServicio finanzasServicio;

    @GetMapping("/tratamientos")
    @Operation(summary = "Catálogo de tratamientos", description = "Lista los procedimientos clínicos con precios vigentes")
    public ResponseEntity<List<CatalogoTratamientoEntidad>> listarTratamientos() {
        return ResponseEntity.ok(finanzasServicio.listarCatalogoTratamientos());
    }

    @PostMapping("/cargos")
    @Operation(summary = "Emitir cargo a paciente", description = "Registra un tratamiento o procedimiento devengado a la cuenta del paciente")
    public ResponseEntity<CargoCuentaEntidad> emitirCargo(@RequestBody EmisionCargoDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(finanzasServicio.emitirCargo(dto));
    }

    @PostMapping("/abonos")
    @Operation(summary = "Registrar abono / pago", description = "Registra un pago con clave de idempotencia y lo aplica al libro mayor")
    public ResponseEntity<AbonoPagoEntidad> registrarAbono(
            @RequestHeader(value = "Idempotency-Key", required = false) String headerIdempotencia,
            @RequestBody RegistroAbonoDto dto) {
        if (headerIdempotencia != null && !headerIdempotencia.isEmpty()) {
            dto.setClaveIdempotencia(headerIdempotencia);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(finanzasServicio.registrarAbono(dto));
    }

    @GetMapping("/pacientes/{pacienteId}/estado-cuenta")
    @Operation(summary = "Estado de cuenta inmutable", description = "Calcula matemáticamente el saldo real, deuda y movimientos de cargos y pagos")
    public ResponseEntity<EstadoCuentaPacienteDto> obtenerEstadoCuenta(@PathVariable("pacienteId") UUID pacienteId) {
        return ResponseEntity.ok(finanzasServicio.obtenerEstadoCuenta(pacienteId));
    }

    @GetMapping("/abonos/{id}/comprobante")
    @Operation(summary = "Emitir comprobante fiscal", description = "Genera la Boleta o Factura electrónica con desglose de IGV 18% y hash")
    public ResponseEntity<com.laurent.clinica.dominio.finanzas.dto.ComprobantePagoDto> emitirComprobante(
            @PathVariable("id") UUID id,
            @RequestParam(name = "tipo", defaultValue = "BOLETA_ELECTRONICA") String tipo) {
        return ResponseEntity.ok(finanzasServicio.emitirComprobantePago(id, tipo));
    }
}

