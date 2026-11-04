package com.laurent.clinica.dominio.identidad.controlador;

import com.laurent.clinica.dominio.identidad.dto.RespuestaInicioSesionDto;
import com.laurent.clinica.dominio.identidad.dto.SolicitudInicioSesionDto;
import com.laurent.clinica.dominio.identidad.servicio.AutenticacionServicio;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/autenticacion")
@Tag(name = "Autenticación", description = "Gestión de inicio de sesión y credenciales")
@RequiredArgsConstructor
public class AutenticacionControlador {

    private final AutenticacionServicio autenticacionServicio;

    @PostMapping("/iniciar-sesion")
    @Operation(summary = "Iniciar sesión", description = "Valida credenciales y genera token de seguridad")
    public ResponseEntity<RespuestaInicioSesionDto> iniciarSesion(@RequestBody SolicitudInicioSesionDto solicitud) {
        return ResponseEntity.ok(autenticacionServicio.iniciarSesion(solicitud));
    }
}

