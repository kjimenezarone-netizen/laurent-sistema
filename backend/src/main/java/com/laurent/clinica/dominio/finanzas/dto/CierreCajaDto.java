package com.laurent.clinica.dominio.finanzas.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CierreCajaDto {
    private UUID sesionCajaId;
    private BigDecimal montoFinalReal;
    private String observaciones;
}

