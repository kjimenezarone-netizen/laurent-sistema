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
 ResponseEntity<?> status(ResponseStatusException e){return ResponseEntity.status(e.getStatusCode()).body(Map.of("error",e.getReason()==null?"Operacion rechazada":e.getReason()));}
 @ExceptionHandler(MethodArgumentNotValidException.class)
 ResponseEntity<?> invalid(MethodArgumentNotValidException e){return ResponseEntity.badRequest().body(Map.of("error","Verifique los datos obligatorios y formatos"));}
 @ExceptionHandler(DataIntegrityViolationException.class)
 ResponseEntity<?> constraint(DataIntegrityViolationException e){return ResponseEntity.status(409).body(Map.of("error","Conflicto con registros o reglas de integridad; revise disponibilidad y duplicados"));}
}
