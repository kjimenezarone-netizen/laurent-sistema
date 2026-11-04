package com.laurent.clinica.dominio.compartido.entidad;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "registros_auditoria")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistroAuditoriaEntidad {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "usuario_id")
    private UUID usuarioId;

    @Column(name = "nombre_usuario", length = 50)
    private String nombreUsuario;

    @Column(nullable = false, length = 50)
    private String modulo; // 'CLINICA', 'FINANZAS', 'AGENDA', 'SEGURIDAD'

    @Column(nullable = false, length = 100)
    private String accion;

    @Column(name = "entidad_afectada", nullable = false, length = 50)
    private String entidadAfectada;

    @Column(name = "registro_id")
    private UUID registroId;

    @Column(name = "ip_cliente", length = 50)
    private String ipCliente;

    @Column(name = "fecha_evento")
    private OffsetDateTime fechaEvento;

    @PrePersist
    protected void antesDeGuardar() {
        if (fechaEvento == null) fechaEvento = OffsetDateTime.now();
    }
}

