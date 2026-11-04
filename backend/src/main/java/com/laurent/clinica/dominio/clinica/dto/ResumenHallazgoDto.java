package com.laurent.clinica.dominio.clinica.dto;

import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumenHallazgoDto {
    private UUID id;
    private Integer piezaFdi;
    private String tipoDenticion;
    private String superficie;
    private String tipoHallazgo;
    private String estadoHallazgo;
    private String observacion;
    private OffsetDateTime fechaRegistro;
}

