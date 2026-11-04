package com.laurent.clinica.dominio.agenda.servicio;

import com.laurent.clinica.dominio.agenda.dto.CambioEstadoCitaDto;
import com.laurent.clinica.dominio.agenda.dto.ReservaCitaDto;
import com.laurent.clinica.dominio.agenda.dto.ResumenCitaDto;
import com.laurent.clinica.dominio.agenda.entidad.CitaEntidad;
import com.laurent.clinica.dominio.agenda.entidad.SillonDentalEntidad;
import com.laurent.clinica.dominio.agenda.repositorio.CitaRepositorio;
import com.laurent.clinica.dominio.agenda.repositorio.SillonDentalRepositorio;
import com.laurent.clinica.dominio.compartido.excepcion.ConflictoHorarioExcepcion;
import com.laurent.clinica.dominio.identidad.entidad.OdontologoEntidad;
import com.laurent.clinica.dominio.identidad.entidad.SedeEntidad;
import com.laurent.clinica.dominio.identidad.repositorio.OdontologoRepositorio;
import com.laurent.clinica.dominio.identidad.repositorio.SedeRepositorio;
import com.laurent.clinica.dominio.pacientes.entidad.PacienteEntidad;
import com.laurent.clinica.dominio.pacientes.repositorio.PacienteRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AgendaServicio {

    private final CitaRepositorio citaRepositorio;
    private final PacienteRepositorio pacienteRepositorio;
    private final OdontologoRepositorio odontologoRepositorio;
    private final SillonDentalRepositorio sillonDentalRepositorio;
    private final SedeRepositorio sedeRepositorio;

    @Transactional(readOnly = true)
    public List<ResumenCitaDto> listarCitasPorRango(OffsetDateTime inicio, OffsetDateTime fin) {
        return citaRepositorio.buscarPorRangoFechas(inicio, fin).stream()
                .map(this::convertirAResumen)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ResumenCitaDto> listarCitasPorOdontologo(UUID odontologoId, OffsetDateTime inicio, OffsetDateTime fin) {
        return citaRepositorio.buscarPorOdontologoYRango(odontologoId, inicio, fin).stream()
                .map(this::convertirAResumen)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SillonDentalEntidad> listarSillones() {
        return sillonDentalRepositorio.findByActivoTrue();
    }

    @Transactional
    public ResumenCitaDto reservarCita(ReservaCitaDto dto) {
        int duracion = (dto.getDuracionMinutos() != null && dto.getDuracionMinutos() > 0) ? dto.getDuracionMinutos() : 30;
        OffsetDateTime fin = dto.getFechaHoraInicio().plusMinutes(duracion);

        // 1. Verificación preventiva de colisiones
        if (citaRepositorio.existeSolapamientoSillon(dto.getSillonId(), dto.getFechaHoraInicio(), fin)) {
            throw new ConflictoHorarioExcepcion("El sillón seleccionado ya cuenta con una cita en el horario indicado.");
        }
        if (citaRepositorio.existeSolapamientoOdontologo(dto.getOdontologoId(), dto.getFechaHoraInicio(), fin)) {
            throw new ConflictoHorarioExcepcion("El odontólogo seleccionado ya tiene una cita asignada en ese intervalo.");
        }

        PacienteEntidad paciente = pacienteRepositorio.findById(dto.getPacienteId())
                .orElseThrow(() -> new IllegalArgumentException("Paciente no encontrado"));
        OdontologoEntidad odontologo = odontologoRepositorio.findById(dto.getOdontologoId())
                .orElseThrow(() -> new IllegalArgumentException("Odontólogo no encontrado"));
        SillonDentalEntidad sillon = sillonDentalRepositorio.findById(dto.getSillonId())
                .orElseThrow(() -> new IllegalArgumentException("Sillón no encontrado"));

        SedeEntidad sede = null;
        if (dto.getSedeId() != null) {
            sede = sedeRepositorio.findById(dto.getSedeId()).orElse(null);
        }
        if (sede == null) {
            sede = sedeRepositorio.findAll().stream().findFirst().orElseThrow();
        }

        CitaEntidad cita = CitaEntidad.builder()
                .sede(sede)
                .paciente(paciente)
                .odontologo(odontologo)
                .sillon(sillon)
                .fechaHoraInicio(dto.getFechaHoraInicio())
                .fechaHoraFin(fin)
                .duracionMinutos(duracion)
                .motivo(dto.getMotivo())
                .observaciones(dto.getObservaciones())
                .estadoCodigo("PROGRAMADA")
                .build();

        CitaEntidad guardada = citaRepositorio.save(cita);
        return convertirAResumen(guardada);
    }

    @Transactional
    public ResumenCitaDto cambiarEstadoCita(UUID citaId, CambioEstadoCitaDto dto) {
        CitaEntidad cita = citaRepositorio.findById(citaId)
                .orElseThrow(() -> new IllegalArgumentException("Cita no encontrada con ID: " + citaId));

        cita.setEstadoCodigo(dto.getNuevoEstado());
        if (dto.getMotivoCancelacion() != null && !dto.getMotivoCancelacion().isEmpty()) {
            cita.setObservaciones(cita.getObservaciones() != null
                    ? cita.getObservaciones() + " | Cancelación: " + dto.getMotivoCancelacion()
                    : "Cancelación: " + dto.getMotivoCancelacion());
        }

        return convertirAResumen(citaRepositorio.save(cita));
    }

    private ResumenCitaDto convertirAResumen(CitaEntidad c) {
        String pacNombre = c.getPaciente() != null
                ? c.getPaciente().getNombres() + " " + c.getPaciente().getApellidos() : "";
        String odNombre = (c.getOdontologo() != null && c.getOdontologo().getUsuario() != null)
                ? "Dr. " + c.getOdontologo().getUsuario().getNombres() + " " + c.getOdontologo().getUsuario().getApellidos() : "";

        return ResumenCitaDto.builder()
                .id(c.getId())
                .pacienteId(c.getPaciente() != null ? c.getPaciente().getId() : null)
                .pacienteNombreCompleto(pacNombre)
                .pacienteTelefono(c.getPaciente() != null ? c.getPaciente().getTelefonoMovil() : "")
                .odontologoId(c.getOdontologo() != null ? c.getOdontologo().getId() : null)
                .odontologoNombreCompleto(odNombre)
                .odontologoEspecialidad(c.getOdontologo() != null ? c.getOdontologo().getEspecialidad() : "")
                .sillonId(c.getSillon() != null ? c.getSillon().getId() : null)
                .sillonNombre(c.getSillon() != null ? c.getSillon().getNombre() : "")
                .fechaHoraInicio(c.getFechaHoraInicio())
                .fechaHoraFin(c.getFechaHoraFin())
                .duracionMinutos(c.getDuracionMinutos())
                .motivo(c.getMotivo())
                .estadoCodigo(c.getEstadoCodigo())
                .observaciones(c.getObservaciones())
                .build();
    }
}

