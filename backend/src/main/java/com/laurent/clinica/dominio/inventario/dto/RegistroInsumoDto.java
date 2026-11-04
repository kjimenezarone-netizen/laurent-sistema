package com.laurent.clinica.dominio.inventario.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistroInsumoDto {
    private String codigoBarras;
    private String nombre;
    private String descripcion;
    private String unidadMedida;
    private BigDecimal stockMinimoAlerta;
}

