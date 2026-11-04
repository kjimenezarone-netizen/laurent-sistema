package com.laurent.clinica.dominio.clinica.dto;

import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumenAtencionDto {
    private UUID id;
    private UUID pacienteId;
    private String pacienteNombre;
    private UUID odontologoId;
    private String odontologoNombre;
    private String motivoConsulta;
    private String diagnosticoPrincipal;
    private String diagnosticoCie10;
    private String notasEvolucion;
    private String indicacionesReceta;
    private String estado;
    private OffsetDateTime fechaCreacion;
    private OffsetDateTime fechaFirma;
}

