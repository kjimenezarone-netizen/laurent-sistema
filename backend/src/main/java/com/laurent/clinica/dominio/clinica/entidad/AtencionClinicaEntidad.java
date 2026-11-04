package com.laurent.clinica.dominio.clinica.entidad;

import com.laurent.clinica.dominio.agenda.entidad.CitaEntidad;
import com.laurent.clinica.dominio.identidad.entidad.OdontologoEntidad;
import com.laurent.clinica.dominio.identidad.entidad.SedeEntidad;
import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "atenciones_clinicas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtencionClinicaEntidad {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expediente_id", nullable = false)
    private ExpedienteClinicoEntidad expediente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cita_id")
    private CitaEntidad cita;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "odontologo_id", nullable = false)
    private OdontologoEntidad odontologo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sede_id", nullable = false)
    private SedeEntidad sede;

    @Column(name = "motivo_consulta", nullable = false, columnDefinition = "TEXT")
    private String motivoConsulta;

    @Column(name = "enfermedad_actual", columnDefinition = "TEXT")
    private String enfermedadActual;

    @Column(name = "diagnostico_principal", nullable = false, length = 255)
    private String diagnosticoPrincipal;

    @Column(name = "diagnostico_cie10", length = 20)
    private String diagnosticoCie10;

    @Column(name = "notas_evolucion", nullable = false, columnDefinition = "TEXT")
    private String notasEvolucion;

    @Column(name = "indicaciones_receta", columnDefinition = "TEXT")
    private String indicacionesReceta;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String estado = "BORRADOR"; // 'BORRADOR', 'FIRMADA', 'RECTIFICADA'

    @Column(name = "fecha_firma")
    private OffsetDateTime fechaFirma;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "odontologo_firma_id")
    private OdontologoEntidad odontologoFirma;

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

