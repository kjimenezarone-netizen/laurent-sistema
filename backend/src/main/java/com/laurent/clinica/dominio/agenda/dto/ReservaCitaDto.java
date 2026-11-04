package com.laurent.clinica.dominio.agenda.dto;

import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservaCitaDto {
    private UUID sedeId;
    private UUID pacienteId;
    private UUID odontologoId;
    private UUID sillonId;
    private OffsetDateTime fechaHoraInicio;
    private Integer duracionMinutos;
    private String motivo;
    private String observaciones;
}

