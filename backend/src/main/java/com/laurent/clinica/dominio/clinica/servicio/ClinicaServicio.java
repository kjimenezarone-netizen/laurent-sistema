package com.laurent.clinica.dominio.clinica.servicio;

import com.laurent.clinica.dominio.agenda.entidad.CitaEntidad;
import com.laurent.clinica.dominio.agenda.repositorio.CitaRepositorio;
import com.laurent.clinica.dominio.clinica.dto.*;
import com.laurent.clinica.dominio.clinica.entidad.*;
import com.laurent.clinica.dominio.clinica.repositorio.*;
import com.laurent.clinica.dominio.identidad.entidad.OdontologoEntidad;
import com.laurent.clinica.dominio.identidad.repositorio.OdontologoRepositorio;
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
public class ClinicaServicio {

    private final ExpedienteClinicoRepositorio expedienteRepositorio;
    private final AtencionClinicaRepositorio atencionRepositorio;
    private final HallazgoDentalRepositorio hallazgoRepositorio;
    private final RegistroPeriodontalRepositorio periodontoRepositorio;
    private final ConsentimientoInformadoRepositorio consentimientoRepositorio;
    private final PacienteRepositorio pacienteRepositorio;
    private final OdontologoRepositorio odontologoRepositorio;
    private final CitaRepositorio citaRepositorio;

    @Transactional
    public ExpedienteClinicoEntidad obtenerOCrearExpediente(UUID pacienteId) {
        return expedienteRepositorio.findByPacienteId(pacienteId).orElseGet(() -> {
            PacienteEntidad paciente = pacienteRepositorio.findById(pacienteId)
                    .orElseThrow(() -> new IllegalArgumentException("Paciente no encontrado"));
            ExpedienteClinicoEntidad nuevo = ExpedienteClinicoEntidad.builder()
                    .paciente(paciente)
                    .numeroExpediente("EXP-" + paciente.getNumeroDocumento())
                    .estado("ABIERTO")
                    .fechaApertura(OffsetDateTime.now())
                    .build();
            return expedienteRepositorio.save(nuevo);
        });
    }

    @Transactional(readOnly = true)
    public List<ResumenAtencionDto> listarAtencionesPorPaciente(UUID pacienteId) {
        ExpedienteClinicoEntidad exp = obtenerOCrearExpediente(pacienteId);
        return atencionRepositorio.findByExpedienteIdOrderByFechaCreacionDesc(exp.getId()).stream()
                .map(this::convertirAResumenAtencion)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ResumenHallazgoDto> listarOdontogramaPorPaciente(UUID pacienteId) {
        ExpedienteClinicoEntidad exp = obtenerOCrearExpediente(pacienteId);
        return hallazgoRepositorio.findByExpedienteIdAndActivoTrueOrderByPiezaFdiAsc(exp.getId()).stream()
                .map(this::convertirAResumenHallazgo)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RegistroPeriodontalEntidad> listarPeriodontogramaPorPaciente(UUID pacienteId) {
        ExpedienteClinicoEntidad exp = obtenerOCrearExpediente(pacienteId);
        return periodontoRepositorio.findByExpedienteIdOrderByPiezaFdiAsc(exp.getId());
    }

    @Transactional
    public RegistroPeriodontalEntidad guardarRegistroPeriodontal(RegistroPeriodontalDto dto) {
        ExpedienteClinicoEntidad exp = obtenerOCrearExpediente(dto.getPacienteId());
        OdontologoEntidad odontologo = odontologoRepositorio.findById(dto.getOdontologoId())
                .orElseThrow(() -> new IllegalArgumentException("Odontólogo no encontrado"));

        RegistroPeriodontalEntidad registro = periodontoRepositorio
                .findByExpedienteIdAndPiezaFdi(exp.getId(), dto.getPiezaFdi())
                .orElseGet(() -> RegistroPeriodontalEntidad.builder()
                        .expediente(exp)
                        .odontologo(odontologo)
                        .piezaFdi(dto.getPiezaFdi())
                        .build());

        registro.setProfundidadSondajeVestibularMesial(dto.getProfundidadSondajeVestibularMesial());
        registro.setProfundidadSondajeVestibularMedio(dto.getProfundidadSondajeVestibularMedio());
        registro.setProfundidadSondajeVestibularDistal(dto.getProfundidadSondajeVestibularDistal());
        registro.setMargenGingivalVestibularMesial(dto.getMargenGingivalVestibularMesial());
        registro.setMargenGingivalVestibularMedio(dto.getMargenGingivalVestibularMedio());
        registro.setMargenGingivalVestibularDistal(dto.getMargenGingivalVestibularDistal());
        registro.setSangradoVestibularMesial(dto.getSangradoVestibularMesial());
        registro.setSangradoVestibularMedio(dto.getSangradoVestibularMedio());
        registro.setSangradoVestibularDistal(dto.getSangradoVestibularDistal());

        registro.setProfundidadSondajeLingualMesial(dto.getProfundidadSondajeLingualMesial());
        registro.setProfundidadSondajeLingualMedio(dto.getProfundidadSondajeLingualMedio());
        registro.setProfundidadSondajeLingualDistal(dto.getProfundidadSondajeLingualDistal());
        registro.setMargenGingivalLingualMesial(dto.getMargenGingivalLingualMesial());
        registro.setMargenGingivalLingualMedio(dto.getMargenGingivalLingualMedio());
        registro.setMargenGingivalLingualDistal(dto.getMargenGingivalLingualDistal());
        registro.setSangradoLingualMesial(dto.getSangradoLingualMesial());
        registro.setSangradoLingualMedio(dto.getSangradoLingualMedio());
        registro.setSangradoLingualDistal(dto.getSangradoLingualDistal());

        registro.setMovilidadGrado(dto.getMovilidadGrado());
        registro.setFurcaGrado(dto.getFurcaGrado());
        registro.setSupuracion(dto.getSupuracion());
        registro.setPlacaBacteriana(dto.getPlacaBacteriana());

        return periodontoRepositorio.save(registro);
    }

    @Transactional
    public ResumenAtencionDto registrarAtencion(RegistroAtencionDto dto) {
        ExpedienteClinicoEntidad exp = obtenerOCrearExpediente(dto.getPacienteId());
        OdontologoEntidad odontologo = odontologoRepositorio.findById(dto.getOdontologoId())
                .orElseThrow(() -> new IllegalArgumentException("Odontólogo no encontrado"));

        CitaEntidad cita = null;
        if (dto.getCitaId() != null) {
            cita = citaRepositorio.findById(dto.getCitaId()).orElse(null);
            if (cita != null) {
                cita.setEstadoCodigo("COMPLETADA");
                citaRepositorio.save(cita);
            }
        }

        boolean firmar = Boolean.TRUE.equals(dto.getFirmar());

        AtencionClinicaEntidad atencion = AtencionClinicaEntidad.builder()
                .expediente(exp)
                .cita(cita)
                .odontologo(odontologo)
                .sede(exp.getPaciente().getSedeRegistro())
                .motivoConsulta(dto.getMotivoConsulta())
                .enfermedadActual(dto.getEnfermedadActual())
                .diagnosticoPrincipal(dto.getDiagnosticoPrincipal())
                .diagnosticoCie10(dto.getDiagnosticoCie10())
                .notasEvolucion(dto.getNotasEvolucion())
                .indicacionesReceta(dto.getIndicacionesReceta())
                .estado(firmar ? "FIRMADA" : "BORRADOR")
                .fechaFirma(firmar ? OffsetDateTime.now() : null)
                .odontologoFirma(firmar ? odontologo : null)
                .build();

        AtencionClinicaEntidad guardada = atencionRepositorio.save(atencion);
        return convertirAResumenAtencion(guardada);
    }

    @Transactional
    public ResumenHallazgoDto registrarHallazgo(RegistroHallazgoDto dto) {
        ExpedienteClinicoEntidad exp = obtenerOCrearExpediente(dto.getPacienteId());
        OdontologoEntidad odontologo = odontologoRepositorio.findById(dto.getOdontologoId())
                .orElseThrow(() -> new IllegalArgumentException("Odontólogo no encontrado"));

        HallazgoDentalEntidad hallazgo = HallazgoDentalEntidad.builder()
                .expediente(exp)
                .odontologo(odontologo)
                .piezaFdi(dto.getPiezaFdi())
                .tipoDenticion(dto.getTipoDenticion() != null ? dto.getTipoDenticion() : "PERMANENTE")
                .superficie(dto.getSuperficie() != null ? dto.getSuperficie() : "GENERAL")
                .tipoHallazgo(dto.getTipoHallazgo())
                .estadoHallazgo(dto.getEstadoHallazgo() != null ? dto.getEstadoHallazgo() : "PLANIFICADO")
                .observacion(dto.getObservacion())
                .activo(true)
                .build();

        HallazgoDentalEntidad guardado = hallazgoRepositorio.save(hallazgo);
        return convertirAResumenHallazgo(guardado);
    }

    private ResumenAtencionDto convertirAResumenAtencion(AtencionClinicaEntidad a) {
        String pacNombre = a.getExpediente() != null && a.getExpediente().getPaciente() != null
                ? a.getExpediente().getPaciente().getNombres() + " " + a.getExpediente().getPaciente().getApellidos() : "";
        String odNombre = a.getOdontologo() != null && a.getOdontologo().getUsuario() != null
                ? "Dr. " + a.getOdontologo().getUsuario().getNombres() + " " + a.getOdontologo().getUsuario().getApellidos() : "";

        return ResumenAtencionDto.builder()
                .id(a.getId())
                .pacienteId(a.getExpediente() != null && a.getExpediente().getPaciente() != null ? a.getExpediente().getPaciente().getId() : null)
                .pacienteNombre(pacNombre)
                .odontologoId(a.getOdontologo() != null ? a.getOdontologo().getId() : null)
                .odontologoNombre(odNombre)
                .motivoConsulta(a.getMotivoConsulta())
                .diagnosticoPrincipal(a.getDiagnosticoPrincipal())
                .diagnosticoCie10(a.getDiagnosticoCie10())
                .notasEvolucion(a.getNotasEvolucion())
                .indicacionesReceta(a.getIndicacionesReceta())
                .estado(a.getEstado())
                .fechaCreacion(a.getFechaCreacion())
                .fechaFirma(a.getFechaFirma())
                .build();
    }

    private ResumenHallazgoDto convertirAResumenHallazgo(HallazgoDentalEntidad h) {
        return ResumenHallazgoDto.builder()
                .id(h.getId())
                .piezaFdi(h.getPiezaFdi())
                .tipoDenticion(h.getTipoDenticion())
                .superficie(h.getSuperficie())
                .tipoHallazgo(h.getTipoHallazgo())
                .estadoHallazgo(h.getEstadoHallazgo())
                .observacion(h.getObservacion())
                .fechaRegistro(h.getFechaRegistro())
                .build();
    }
}

