package com.laurent.clinica.config;

import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.ResponseEntity;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import java.util.Map;

@RestControllerAdvice
public class ErroresApi {

  @ExceptionHandler(ResponseStatusException.class)
  public ResponseEntity<?> status(ResponseStatusException e) {
    return ResponseEntity.status(e.getStatusCode()).body(
        Map.of("error", e.getReason() == null ? "Operación no autorizada o rechazada" : e.getReason())
    );
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<?> invalid(MethodArgumentNotValidException e) {
    return ResponseEntity.badRequest().body(
        Map.of("error", "Verifique los datos obligatorios y formatos enviados.")
    );
  }

  @ExceptionHandler(DataIntegrityViolationException.class)
  public ResponseEntity<?> constraint(DataIntegrityViolationException e) {
    return ResponseEntity.status(409).body(
        Map.of("error", "Conflicto con registros existentes; revise duplicados y disponibilidad de horario o sillón.")
    );
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<?> general(Exception e) {
    String msg = e.getMessage() != null ? e.getMessage() : "Ocurrió un error inesperado en el servidor";
    return ResponseEntity.status(500).body(Map.of("error", msg));
  }
}
