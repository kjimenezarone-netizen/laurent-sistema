package com.laurent.clinica.dominio.finanzas.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemMovimientoCuentaDto {
    private UUID id;
    private String tipo; // 'CARGO' o 'ABONO'
    private String descripcion;
    private BigDecimal cargo;
    private BigDecimal abono;
    private String medioPago;
    private String estado;
    private OffsetDateTime fecha;
}

