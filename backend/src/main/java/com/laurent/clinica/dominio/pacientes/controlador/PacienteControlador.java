package com.laurent.clinica.dominio.pacientes.controlador;

import com.laurent.clinica.dominio.pacientes.dto.RegistroPacienteDto;
import com.laurent.clinica.dominio.pacientes.dto.ResumenPacienteDto;
import com.laurent.clinica.dominio.pacientes.entidad.PacienteEntidad;
import com.laurent.clinica.dominio.pacientes.servicio.PacienteServicio;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/pacientes")
@Tag(name = "Pacientes", description = "Gestión del padrón y expedientes de pacientes")
@RequiredArgsConstructor
public class PacienteControlador {

    private final PacienteServicio pacienteServicio;

    @GetMapping
    @Operation(summary = "Listar pacientes", description = "Búsqueda y listado general de pacientes activos")
    public ResponseEntity<List<ResumenPacienteDto>> listarPacientes(
            @RequestParam(name = "busqueda", required = false) String busqueda) {
        return ResponseEntity.ok(pacienteServicio.listarPacientes(busqueda));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener paciente por ID", description = "Consulta los detalles completos del paciente")
    public ResponseEntity<PacienteEntidad> obtenerPorId(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(pacienteServicio.obtenerPorId(id));
    }

    @PostMapping
    @Operation(summary = "Registrar nuevo paciente", description = "Da de alta a un paciente en el sistema")
    public ResponseEntity<ResumenPacienteDto> registrarPaciente(@RequestBody RegistroPacienteDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pacienteServicio.registrarPaciente(dto));
    }
}

