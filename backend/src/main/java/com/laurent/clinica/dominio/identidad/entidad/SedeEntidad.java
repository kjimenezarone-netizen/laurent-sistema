package com.laurent.clinica.dominio.identidad.entidad;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "sedes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SedeEntidad {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, length = 255)
    private String direccion;

    @Column(length = 20)
    private String telefono;

    @Column(length = 50)
    @Builder.Default
    private String ciudad = "Lima";

    @Builder.Default
    private Boolean activa = true;

    @Column(name = "fecha_creacion")
    private OffsetDateTime fechaCreacion;
}

