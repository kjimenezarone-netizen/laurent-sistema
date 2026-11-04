package com.laurent.clinica.dominio.clinica.dto;

import lombok.*;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistroPeriodontalDto {
    private UUID pacienteId;
    private UUID odontologoId;
    private Integer piezaFdi;

    // Vestibular
    private Integer profundidadSondajeVestibularMesial;
    private Integer profundidadSondajeVestibularMedio;
    private Integer profundidadSondajeVestibularDistal;
    private Integer margenGingivalVestibularMesial;
    private Integer margenGingivalVestibularMedio;
    private Integer margenGingivalVestibularDistal;
    private Boolean sangradoVestibularMesial;
    private Boolean sangradoVestibularMedio;
    private Boolean sangradoVestibularDistal;

    // Lingual / Palatino
    private Integer profundidadSondajeLingualMesial;
    private Integer profundidadSondajeLingualMedio;
    private Integer profundidadSondajeLingualDistal;
    private Integer margenGingivalLingualMesial;
    private Integer margenGingivalLingualMedio;
    private Integer margenGingivalLingualDistal;
    private Boolean sangradoLingualMesial;
    private Boolean sangradoLingualMedio;
    private Boolean sangradoLingualDistal;

    private Integer movilidadGrado;
    private Integer furcaGrado;
    private Boolean supuracion;
    private Boolean placaBacteriana;
}

