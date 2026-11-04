package com.laurent.clinica.dominio.agenda.controlador;

import com.laurent.clinica.dominio.agenda.dto.CambioEstadoCitaDto;
import com.laurent.clinica.dominio.agenda.dto.ReservaCitaDto;
import com.laurent.clinica.dominio.agenda.dto.ResumenCitaDto;
import com.laurent.clinica.dominio.agenda.entidad.SillonDentalEntidad;
import com.laurent.clinica.dominio.agenda.servicio.AgendaServicio;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/citas")
@Tag(name = "Agenda y Citas", description = "Control de turnos, reserva de citas y gestión de sillones")
@RequiredArgsConstructor
public class AgendaControlador {

    private final AgendaServicio agendaServicio;

    @GetMapping
    @Operation(summary = "Listar citas por rango", description = "Obtiene las citas dentro de un rango de fechas")
    public ResponseEntity<List<ResumenCitaDto>> listarCitas(
            @RequestParam(name = "inicio") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime inicio,
            @RequestParam(name = "fin") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime fin,
            @RequestParam(name = "odontologoId", required = false) UUID odontologoId) {
        if (odontologoId != null) {
            return ResponseEntity.ok(agendaServicio.listarCitasPorOdontologo(odontologoId, inicio, fin));
        }
        return ResponseEntity.ok(agendaServicio.listarCitasPorRango(inicio, fin));
    }

    @GetMapping("/sillones")
    @Operation(summary = "Listar sillones dentales", description = "Obtiene la lista de sillones disponibles")
    public ResponseEntity<List<SillonDentalEntidad>> listarSillones() {
        return ResponseEntity.ok(agendaServicio.listarSillones());
    }

    @PostMapping("/reservar")
    @Operation(summary = "Reservar nueva cita", description = "Verifica disponibilidad anti-colisión y reserva turno")
    public ResponseEntity<ResumenCitaDto> reservarCita(@RequestBody ReservaCitaDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(agendaServicio.reservarCita(dto));
    }

    @PatchMapping("/{id}/estado")
    @Operation(summary = "Actualizar estado de cita", description = "Permite transicionar de PROGRAMADA a PRESENTE, EN_ATENCION, COMPLETADA o CANCELADA")
    public ResponseEntity<ResumenCitaDto> cambiarEstado(
            @PathVariable("id") UUID id,
            @RequestBody CambioEstadoCitaDto dto) {
        return ResponseEntity.ok(agendaServicio.cambiarEstadoCita(id, dto));
    }
}

