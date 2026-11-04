package com.laurent.clinica.dominio.pacientes.dto;

import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistroPacienteDto {
    private UUID sedeRegistroId;
    @Builder.Default
    private String tipoDocumento = "DNI";
    private String numeroDocumento;
    private String nombres;
    private String apellidos;
    private LocalDate fechaNacimiento;
    private String sexo;
    private String telefonoMovil;
    private String correoElectronico;
    private String direccion;
    private String ocupacion;
    private String alergias;
    private String enfermedadesSistemicas;
    private String medicacionActual;
    private String observacionesMedicas;
}

