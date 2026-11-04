package com.laurent.clinica.dominio.identidad.dto;

import lombok.*;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistroUsuarioDto {
    private String nombreUsuario;
    private String correoElectronico;
    private String contrasena;
    private String nombres;
    private String apellidos;
    private String numeroDocumento;
    private String telefonoMovil;
    private String rolCodigo;
    private UUID sedeId;
}

