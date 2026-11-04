package com.laurent.clinica.dominio.finanzas.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EstadoCuentaPacienteDto {
    private UUID pacienteId;
    private String pacienteNombreCompleto;
    private String pacienteDocumento;
    private BigDecimal totalFacturado;
    private BigDecimal totalAbonado;
    private BigDecimal saldoDeudor;
    private BigDecimal saldoAFavor;
    private List<ItemMovimientoCuentaDto> movimientos;
}

