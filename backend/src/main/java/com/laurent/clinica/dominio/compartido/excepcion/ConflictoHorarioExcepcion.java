package com.laurent.clinica.dominio.compartido.excepcion;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class ConflictoHorarioExcepcion extends RuntimeException {
    public ConflictoHorarioExcepcion(String mensaje) {
        super(mensaje);
    }
}

