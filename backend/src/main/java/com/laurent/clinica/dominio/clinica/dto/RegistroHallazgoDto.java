package com.laurent.clinica.dominio.clinica.dto;

import lombok.*;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistroHallazgoDto {
    private UUID pacienteId;
    private UUID odontologoId;
    private Integer piezaFdi;
    @Builder.Default
    private String tipoDenticion = "PERMANENTE";
    @Builder.Default
    private String superficie = "GENERAL";
    private String tipoHallazgo;
    @Builder.Default
    private String estadoHallazgo = "PLANIFICADO";
    private String observacion;
}

