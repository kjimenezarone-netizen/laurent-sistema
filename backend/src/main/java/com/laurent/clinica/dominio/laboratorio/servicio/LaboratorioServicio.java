package com.laurent.clinica.dominio.laboratorio.servicio;

import com.laurent.clinica.dominio.identidad.entidad.OdontologoEntidad;
import com.laurent.clinica.dominio.identidad.repositorio.OdontologoRepositorio;
import com.laurent.clinica.dominio.laboratorio.dto.RegistroOrdenLaboratorioDto;
import com.laurent.clinica.dominio.laboratorio.entidad.LaboratorioExternoEntidad;
import com.laurent.clinica.dominio.laboratorio.entidad.OrdenLaboratorioEntidad;
import com.laurent.clinica.dominio.laboratorio.repositorio.LaboratorioExternoRepositorio;
import com.laurent.clinica.dominio.laboratorio.repositorio.OrdenLaboratorioRepositorio;
import com.laurent.clinica.dominio.pacientes.entidad.PacienteEntidad;
import com.laurent.clinica.dominio.pacientes.repositorio.PacienteRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LaboratorioServicio {

    private final OrdenLaboratorioRepositorio ordenRepositorio;
    private final LaboratorioExternoRepositorio laboratorioRepositorio;
    private final PacienteRepositorio pacienteRepositorio;
    private final OdontologoRepositorio odontologoRepositorio;

    @Transactional(readOnly = true)
    public List<OrdenLaboratorioEntidad> listarOrdenes() {
        return ordenRepositorio.findByOrderByFechaCreacionDesc();
    }

    @Transactional(readOnly = true)
    public List<LaboratorioExternoEntidad> listarLaboratorios() {
        return laboratorioRepositorio.findByActivoTrueOrderByRazonSocialAsc();
    }

    @Transactional
    public OrdenLaboratorioEntidad registrarOrden(RegistroOrdenLaboratorioDto dto) {
        PacienteEntidad paciente = pacienteRepositorio.findById(dto.getPacienteId())
                .orElseThrow(() -> new IllegalArgumentException("Paciente no encontrado"));
        OdontologoEntidad odontologo = odontologoRepositorio.findById(dto.getOdontologoId())
                .orElseThrow(() -> new IllegalArgumentException("Odontólogo no encontrado"));
        
        LaboratorioExternoEntidad laboratorio = null;
        if (dto.getLaboratorioId() != null) {
            laboratorio = laboratorioRepositorio.findById(dto.getLaboratorioId()).orElse(null);
        }
        if (laboratorio == null) {
            laboratorio = laboratorioRepositorio.findAll().stream().findFirst()
                    .orElseGet(() -> laboratorioRepositorio.save(LaboratorioExternoEntidad.builder()
                            .razonSocial("Laboratorio Dental Especializado Lima")
                            .ruc("20601234567")
                            .telefonoContacto("987654321")
                            .contactoNombre("Téc. Carlos Morales")
                            .activo(true)
                            .build()));
        }

        OrdenLaboratorioEntidad orden = OrdenLaboratorioEntidad.builder()
                .paciente(paciente)
                .odontologo(odontologo)
                .laboratorio(laboratorio)
                .tipoTrabajo(dto.getTipoTrabajo())
                .colorGuia(dto.getColorGuia() != null ? dto.getColorGuia() : "A2")
                .piezaFdi(dto.getPiezaFdi())
                .fechaEnvio(LocalDate.now())
                .fechaEntregaEsperada(dto.getFechaEntregaEsperada() != null ? dto.getFechaEntregaEsperada() : LocalDate.now().plusDays(7))
                .costoLaboratorio(dto.getCostoLaboratorio() != null ? dto.getCostoLaboratorio() : BigDecimal.ZERO)
                .estado("ENVIADO")
                .observaciones(dto.getObservaciones())
                .build();

        return ordenRepositorio.save(orden);
    }

    @Transactional
    public OrdenLaboratorioEntidad actualizarEstado(UUID ordenId, String nuevoEstado) {
        OrdenLaboratorioEntidad orden = ordenRepositorio.findById(ordenId)
                .orElseThrow(() -> new IllegalArgumentException("Orden no encontrada"));
        orden.setEstado(nuevoEstado);
        if ("RECIBIDO".equalsIgnoreCase(nuevoEstado)) {
            orden.setFechaEntregaReal(LocalDate.now());
        }
        return ordenRepositorio.save(orden);
    }
}

