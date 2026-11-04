package com.laurent.clinica.dominio.laboratorio.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistroOrdenLaboratorioDto {
    private UUID pacienteId;
    private UUID odontologoId;
    private UUID laboratorioId;
    private String tipoTrabajo;
    private String colorGuia;
    private Integer piezaFdi;
    private LocalDate fechaEntregaEsperada;
    private BigDecimal costoLaboratorio;
    private String observaciones;
}

