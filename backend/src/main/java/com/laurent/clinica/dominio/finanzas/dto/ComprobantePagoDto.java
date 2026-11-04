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
public class ComprobantePagoDto {
    private String serieCorrelativo; // ej. B001-00004521 o F001-00001092
    private String tipoComprobante; // 'BOLETA_ELECTRONICA', 'FACTURA_ELECTRONICA', 'RECIBO_INTERNO'
    private String razonSocialEmisor;
    private String rucEmisor;
    private String direccionEmisor;
    private String pacienteNombre;
    private String pacienteDocumento;
    private String medioPago;
    private String numeroOperacion;
    private BigDecimal subtotal; // Monto sin IGV
    private BigDecimal igv; // 18% IGV
    private BigDecimal total;
    private String codigoHashSeguridad;
    private OffsetDateTime fechaEmision;
}

