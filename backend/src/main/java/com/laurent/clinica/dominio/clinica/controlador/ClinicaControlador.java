package com.laurent.clinica.dominio.clinica.controlador;

import com.laurent.clinica.dominio.clinica.dto.RegistroAtencionDto;
import com.laurent.clinica.dominio.clinica.dto.RegistroHallazgoDto;
import com.laurent.clinica.dominio.clinica.dto.ResumenAtencionDto;
import com.laurent.clinica.dominio.clinica.dto.ResumenHallazgoDto;
import com.laurent.clinica.dominio.clinica.servicio.ClinicaServicio;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/clinica")
@Tag(name = "Clínica y Odontograma", description = "Atención médica, evoluciones y hallazgos dentales estructurados")
@RequiredArgsConstructor
public class ClinicaControlador {

    private final ClinicaServicio clinicaServicio;

    @GetMapping("/pacientes/{pacienteId}/atenciones")
    @Operation(summary = "Historial de atenciones", description = "Lista todas las atenciones médicas y evoluciones del paciente")
    public ResponseEntity<List<ResumenAtencionDto>> listarAtenciones(@PathVariable("pacienteId") UUID pacienteId) {
        return ResponseEntity.ok(clinicaServicio.listarAtencionesPorPaciente(pacienteId));
    }

    @PostMapping("/atenciones")
    @Operation(summary = "Registrar atención clínica", description = "Crea una nueva atención médica con opción de firma inmutable")
    public ResponseEntity<ResumenAtencionDto> registrarAtencion(@RequestBody RegistroAtencionDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(clinicaServicio.registrarAtencion(dto));
    }

    @GetMapping("/pacientes/{pacienteId}/odontograma")
    @Operation(summary = "Obtener odontograma estructurado", description = "Lista los hallazgos dentales por pieza FDI y superficie")
    public ResponseEntity<List<ResumenHallazgoDto>> obtenerOdontograma(@PathVariable("pacienteId") UUID pacienteId) {
        return ResponseEntity.ok(clinicaServicio.listarOdontogramaPorPaciente(pacienteId));
    }

    @PostMapping("/odontograma/hallazgos")
    @Operation(summary = "Registrar hallazgo dental", description = "Añade un diagnóstico dental vinculado a pieza y superficie")
    public ResponseEntity<ResumenHallazgoDto> registrarHallazgo(@RequestBody RegistroHallazgoDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(clinicaServicio.registrarHallazgo(dto));
    }

    @GetMapping("/pacientes/{pacienteId}/periodontograma")
    @Operation(summary = "Obtener periodontograma", description = "Lista las mediciones de los 6 sitios periodontales por pieza dental")
    public ResponseEntity<List<com.laurent.clinica.dominio.clinica.entidad.RegistroPeriodontalEntidad>> obtenerPeriodontograma(
            @PathVariable("pacienteId") UUID pacienteId) {
        return ResponseEntity.ok(clinicaServicio.listarPeriodontogramaPorPaciente(pacienteId));
    }

    @PostMapping("/periodontograma")
    @Operation(summary = "Guardar medición periodontal", description = "Registra profundidad de sondaje, margen gingival y sangrado en los 6 sitios de la pieza")
    public ResponseEntity<com.laurent.clinica.dominio.clinica.entidad.RegistroPeriodontalEntidad> guardarPeriodontograma(
            @RequestBody com.laurent.clinica.dominio.clinica.dto.RegistroPeriodontalDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(clinicaServicio.guardarRegistroPeriodontal(dto));
    }
}

