package com.laurent.clinica.dominio.pacientes.servicio;

import com.laurent.clinica.dominio.identidad.entidad.SedeEntidad;
import com.laurent.clinica.dominio.identidad.repositorio.SedeRepositorio;
import com.laurent.clinica.dominio.pacientes.dto.RegistroPacienteDto;
import com.laurent.clinica.dominio.pacientes.dto.ResumenPacienteDto;
import com.laurent.clinica.dominio.pacientes.entidad.PacienteEntidad;
import com.laurent.clinica.dominio.pacientes.repositorio.PacienteRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PacienteServicio {

    private final PacienteRepositorio pacienteRepositorio;
    private final SedeRepositorio sedeRepositorio;

    @Transactional(readOnly = true)
    public List<ResumenPacienteDto> listarPacientes(String termino) {
        List<PacienteEntidad> entidades;
        if (termino != null && !termino.trim().isEmpty()) {
            entidades = pacienteRepositorio.buscarPorTermino(termino.trim());
        } else {
            entidades = pacienteRepositorio.findByActivoTrueOrderByApellidosAsc();
        }

        return entidades.stream().map(this::convertirAResumen).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PacienteEntidad obtenerPorId(UUID id) {
        return pacienteRepositorio.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Paciente no encontrado con ID: " + id));
    }

    @Transactional
    public ResumenPacienteDto registrarPaciente(RegistroPacienteDto dto) {
        if (pacienteRepositorio.existsByNumeroDocumento(dto.getNumeroDocumento())) {
            throw new IllegalArgumentException("Ya existe un paciente registrado con el documento: " + dto.getNumeroDocumento());
        }

        SedeEntidad sede = null;
        if (dto.getSedeRegistroId() != null) {
            sede = sedeRepositorio.findById(dto.getSedeRegistroId()).orElse(null);
        }
        if (sede == null) {
            sede = sedeRepositorio.findAll().stream().findFirst()
                    .orElseThrow(() -> new IllegalStateException("No hay sedes registradas en el sistema"));
        }

        PacienteEntidad nuevo = PacienteEntidad.builder()
                .sedeRegistro(sede)
                .tipoDocumento(dto.getTipoDocumento() != null ? dto.getTipoDocumento() : "DNI")
                .numeroDocumento(dto.getNumeroDocumento())
                .nombres(dto.getNombres())
                .apellidos(dto.getApellidos())
                .fechaNacimiento(dto.getFechaNacimiento())
                .sexo(dto.getSexo())
                .telefonoMovil(dto.getTelefonoMovil())
                .correoElectronico(dto.getCorreoElectronico())
                .direccion(dto.getDireccion())
                .ocupacion(dto.getOcupacion())
                .alergias(dto.getAlergias())
                .enfermedadesSistemicas(dto.getEnfermedadesSistemicas())
                .medicacionActual(dto.getMedicacionActual())
                .observacionesMedicas(dto.getObservacionesMedicas())
                .activo(true)
                .build();

        PacienteEntidad guardado = pacienteRepositorio.save(nuevo);
        return convertirAResumen(guardado);
    }

    private ResumenPacienteDto convertirAResumen(PacienteEntidad p) {
        return ResumenPacienteDto.builder()
                .id(p.getId())
                .tipoDocumento(p.getTipoDocumento())
                .numeroDocumento(p.getNumeroDocumento())
                .nombres(p.getNombres())
                .apellidos(p.getApellidos())
                .nombreCompleto(p.getNombres() + " " + p.getApellidos())
                .fechaNacimiento(p.getFechaNacimiento())
                .telefonoMovil(p.getTelefonoMovil())
                .correoElectronico(p.getCorreoElectronico())
                .alergias(p.getAlergias())
                .activo(p.getActivo())
                .saldoDeudor(BigDecimal.ZERO) // Se integra con el libro mayor en Fase 3
                .saldoAFavor(BigDecimal.ZERO)
                .build();
    }
}

