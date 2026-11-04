package com.laurent.clinica.dominio.agenda.dto;

import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumenCitaDto {
    private UUID id;
    private UUID pacienteId;
    private String pacienteNombreCompleto;
    private String pacienteTelefono;
    private UUID odontologoId;
    private String odontologoNombreCompleto;
    private String odontologoEspecialidad;
    private UUID sillonId;
    private String sillonNombre;
    private OffsetDateTime fechaHoraInicio;
    private OffsetDateTime fechaHoraFin;
    private Integer duracionMinutos;
    private String motivo;
    private String estadoCodigo;
    private String observaciones;
}

