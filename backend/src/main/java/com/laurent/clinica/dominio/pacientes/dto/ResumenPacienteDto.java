package com.laurent.clinica.dominio.pacientes.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumenPacienteDto {
    private UUID id;
    private String tipoDocumento;
    private String numeroDocumento;
    private String nombres;
    private String apellidos;
    private String nombreCompleto;
    private LocalDate fechaNacimiento;
    private String telefonoMovil;
    private String correoElectronico;
    private String alergias;
    private Boolean activo;
    private BigDecimal saldoDeudor;
    private BigDecimal saldoAFavor;
}

