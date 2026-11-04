package com.laurent.clinica.dominio.pacientes.entidad;

import com.laurent.clinica.dominio.identidad.entidad.SedeEntidad;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "pacientes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PacienteEntidad {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sede_registro_id", nullable = false)
    private SedeEntidad sedeRegistro;

    @Column(name = "tipo_documento", nullable = false, length = 20)
    @Builder.Default
    private String tipoDocumento = "DNI";

    @Column(name = "numero_documento", nullable = false, unique = true, length = 20)
    private String numeroDocumento;

    @Column(nullable = false, length = 100)
    private String nombres;

    @Column(nullable = false, length = 100)
    private String apellidos;

    @Column(name = "fecha_nacimiento", nullable = false)
    private LocalDate fechaNacimiento;

    @Column(length = 20)
    private String sexo;

    @Column(name = "telefono_movil", nullable = false, length = 20)
    private String telefonoMovil;

    @Column(name = "correo_electronico", length = 100)
    private String correoElectronico;

    @Column(length = 255)
    private String direccion;

    @Column(length = 100)
    private String ocupacion;

    @Column(columnDefinition = "TEXT")
    private String alergias;

    @Column(name = "enfermedades_sistemicas", columnDefinition = "TEXT")
    private String enfermedadesSistemicas;

    @Column(name = "medicacion_actual", columnDefinition = "TEXT")
    private String medicacionActual;

    @Column(name = "observaciones_medicas", columnDefinition = "TEXT")
    private String observacionesMedicas;

    @Builder.Default
    private Boolean activo = true;

    @Column(name = "fecha_creacion")
    private OffsetDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion")
    private OffsetDateTime fechaActualizacion;

    @PrePersist
    protected void antesDeGuardar() {
        if (fechaCreacion == null) fechaCreacion = OffsetDateTime.now();
        if (fechaActualizacion == null) fechaActualizacion = OffsetDateTime.now();
    }

    @PreUpdate
    protected void antesDeActualizar() {
        fechaActualizacion = OffsetDateTime.now();
    }
}

