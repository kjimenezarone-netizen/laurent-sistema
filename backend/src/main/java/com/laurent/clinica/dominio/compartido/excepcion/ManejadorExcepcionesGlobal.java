package com.laurent.clinica.dominio.compartido.excepcion;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class ManejadorExcepcionesGlobal {

    @ExceptionHandler(ConflictoHorarioExcepcion.class)
    public ResponseEntity<Map<String, Object>> manejarConflictoHorario(ConflictoHorarioExcepcion ex) {
        Map<String, Object> cuerpo = new HashMap<>();
        cuerpo.put("marcaTemporal", LocalDateTime.now());
        cuerpo.put("estado", HttpStatus.CONFLICT.value());
        cuerpo.put("error", "Conflicto de disponibilidad");
        cuerpo.put("mensaje", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(cuerpo);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> manejarArgumentoInvalido(IllegalArgumentException ex) {
        Map<String, Object> cuerpo = new HashMap<>();
        cuerpo.put("marcaTemporal", LocalDateTime.now());
        cuerpo.put("estado", HttpStatus.BAD_REQUEST.value());
        cuerpo.put("error", "Solicitud inválida");
        cuerpo.put("mensaje", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(cuerpo);
    }

    @ExceptionHandler({org.springframework.security.authentication.BadCredentialsException.class, org.springframework.security.core.userdetails.UsernameNotFoundException.class})
    public ResponseEntity<Map<String, Object>> manejarCredencialesInvalidas(Exception ex) {
        Map<String, Object> cuerpo = new HashMap<>();
        cuerpo.put("marcaTemporal", LocalDateTime.now());
        cuerpo.put("estado", HttpStatus.UNAUTHORIZED.value());
        cuerpo.put("error", "No autorizado");
        cuerpo.put("mensaje", "Usuario o contraseña incorrectos");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(cuerpo);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> manejarExcepcionGeneral(Exception ex) {
        Map<String, Object> cuerpo = new HashMap<>();
        cuerpo.put("marcaTemporal", LocalDateTime.now());
        cuerpo.put("estado", HttpStatus.INTERNAL_SERVER_ERROR.value());
        cuerpo.put("error", "Error interno del servidor");
        cuerpo.put("mensaje", ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(cuerpo);
    }
}

