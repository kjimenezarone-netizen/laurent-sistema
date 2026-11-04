package com.laurent.clinica.dominio.identidad.dto;

import lombok.*;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RespuestaInicioSesionDto {
    private String token;
    @Builder.Default
    private String tipo = "Bearer";
    private UUID id;
    private String nombreUsuario;
    private String correoElectronico;
    private String nombreCompleto;
    private Set<String> roles;
    private UUID odontologoId;
}

