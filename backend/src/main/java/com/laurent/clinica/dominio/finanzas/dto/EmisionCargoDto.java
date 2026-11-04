package com.laurent.clinica.dominio.finanzas.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmisionCargoDto {
    private UUID pacienteId;
    private UUID atencionId;
    private UUID tratamientoId;
    private String descripcion;
    private Integer cantidad;
    private BigDecimal precioUnitario;
    private BigDecimal descuento;
    private UUID usuarioCreadorId;
}

