package com.laurent.clinica.dominio.finanzas.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AperturaCajaDto {
    private UUID sedeId;
    private UUID cajeroId;
    private BigDecimal montoInicial;
    private String observaciones;
}

