package com.laurent.clinica.dominio.agenda.entidad;

import com.laurent.clinica.dominio.identidad.entidad.SedeEntidad;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "sillones_dentales")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SillonDentalEntidad {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sede_id", nullable = false)
    private SedeEntidad sede;

    @Column(nullable = false, length = 20)
    private String codigo;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Builder.Default
    private Boolean activo = true;
}

