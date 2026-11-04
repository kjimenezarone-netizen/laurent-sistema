package com.laurent.clinica.dominio.compartido.entidad;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "testimonios_pacientes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestimonioPacienteEntidad {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "nombre_paciente", nullable = false, length = 100)
    private String nombrePaciente;

    @Column(name = "tratamiento_realizado", nullable = false, length = 100)
    private String tratamientoRealizado;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String comentario;

    @Column(name = "calificacion_estrellas", nullable = false)
    @Builder.Default
    private Integer calificacionEstrellas = 5;

    @Column(name = "foto_url", length = 255)
    private String fotoUrl;

    @Builder.Default
    private Boolean activo = true;

    @Column(name = "fecha_publicacion")
    private LocalDate fechaPublicacion;
}

