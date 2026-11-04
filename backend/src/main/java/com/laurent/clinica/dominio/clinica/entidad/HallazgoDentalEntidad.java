package com.laurent.clinica.dominio.clinica.entidad;

import com.laurent.clinica.dominio.identidad.entidad.OdontologoEntidad;
import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "hallazgos_dentales")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HallazgoDentalEntidad {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expediente_id", nullable = false)
    private ExpedienteClinicoEntidad expediente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "atencion_id")
    private AtencionClinicaEntidad atencion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "odontologo_id", nullable = false)
    private OdontologoEntidad odontologo;

    @Column(name = "tipo_denticion", nullable = false, length = 20)
    @Builder.Default
    private String tipoDenticion = "PERMANENTE"; // 'PERMANENTE', 'TEMPORAL'

    @Column(name = "pieza_fdi", nullable = false)
    private Integer piezaFdi; // 11-48, 51-85

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String superficie = "GENERAL"; // 'VESTIBULAR', 'LINGUAL', 'PALATINO', 'OCLUSAL', 'INCISAL', 'MESIAL', 'DISTAL', 'GENERAL'

    @Column(name = "tipo_hallazgo", nullable = false, length = 50)
    private String tipoHallazgo; // 'CARIES', 'RESTAURACION', 'CORONA', 'ENDODONCIA', 'IMPLANTE', 'FRACTURA', 'PIEZA_AUSENTE', 'SELLANTE', 'PROTESIS'

    @Column(name = "estado_hallazgo", nullable = false, length = 30)
    @Builder.Default
    private String estadoHallazgo = "PLANIFICADO"; // 'EXISTENTE', 'PLANIFICADO', 'REALIZADO'

    @Column(length = 255)
    private String observacion;

    @Builder.Default
    private Boolean activo = true;

    @Column(name = "fecha_registro")
    private OffsetDateTime fechaRegistro;

    @PrePersist
    protected void antesDeGuardar() {
        if (fechaRegistro == null) fechaRegistro = OffsetDateTime.now();
    }
}

