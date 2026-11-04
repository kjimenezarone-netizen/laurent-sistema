package com.laurent.clinica.dominio.clinica.dto;

import lombok.*;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistroAtencionDto {
    private UUID pacienteId;
    private UUID citaId;
    private UUID odontologoId;
    private String motivoConsulta;
    private String enfermedadActual;
    private String diagnosticoPrincipal;
    private String diagnosticoCie10;
    private String notasEvolucion;
    private String indicacionesReceta;
    private Boolean firmar;
}

