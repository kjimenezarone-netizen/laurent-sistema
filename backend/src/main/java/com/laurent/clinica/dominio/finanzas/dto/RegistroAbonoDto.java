package com.laurent.clinica.dominio.finanzas.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistroAbonoDto {
    private UUID pacienteId;
    private UUID sesionCajaId;
    private BigDecimal monto;
    private String medioPago; // 'EFECTIVO', 'TARJETA_CREDITO', 'TARJETA_DEBITO', 'TRANSFERENCIA', 'YAPE', 'PLIN'
    private String numeroOperacion;
    private String claveIdempotencia; // Clave única para evitar doble cobro
    private UUID cajeroId;
    private UUID cargoEspecificoId; // Opcional: si desea pagar un cargo puntual
}

