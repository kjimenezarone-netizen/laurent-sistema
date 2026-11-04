package com.laurent.clinica.dominio.agenda.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CambioEstadoCitaDto {
    private String nuevoEstado; // 'PROGRAMADA', 'CONFIRMADA', 'PRESENTE', 'EN_ATENCION', 'COMPLETADA', 'CANCELADA'
    private String motivoCancelacion;
}

