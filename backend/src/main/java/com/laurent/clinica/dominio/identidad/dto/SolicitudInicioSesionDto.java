package com.laurent.clinica.dominio.identidad.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SolicitudInicioSesionDto {
    private String nombreUsuario;
    private String contrasena;
}

