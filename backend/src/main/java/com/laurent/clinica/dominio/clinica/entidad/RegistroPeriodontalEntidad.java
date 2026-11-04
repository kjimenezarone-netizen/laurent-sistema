package com.laurent.clinica.dominio.clinica.entidad;

import com.laurent.clinica.dominio.identidad.entidad.OdontologoEntidad;
import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "registros_periodontales")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistroPeriodontalEntidad {

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

    @Column(name = "pieza_fdi", nullable = false)
    private Integer piezaFdi;

    // Vestibular (Mesial, Medio, Distal)
    @Column(name = "profundidad_sondaje_vestibular_mesial")
    @Builder.Default
    private Integer profundidadSondajeVestibularMesial = 2;

    @Column(name = "profundidad_sondaje_vestibular_medio")
    @Builder.Default
    private Integer profundidadSondajeVestibularMedio = 2;

    @Column(name = "profundidad_sondaje_vestibular_distal")
    @Builder.Default
    private Integer profundidadSondajeVestibularDistal = 2;

    @Column(name = "margen_gingival_vestibular_mesial")
    @Builder.Default
    private Integer margenGingivalVestibularMesial = 0;

    @Column(name = "margen_gingival_vestibular_medio")
    @Builder.Default
    private Integer margenGingivalVestibularMedio = 0;

    @Column(name = "margen_gingival_vestibular_distal")
    @Builder.Default
    private Integer margenGingivalVestibularDistal = 0;

    @Column(name = "sangrado_vestibular_mesial")
    @Builder.Default
    private Boolean sangradoVestibularMesial = false;

    @Column(name = "sangrado_vestibular_medio")
    @Builder.Default
    private Boolean sangradoVestibularMedio = false;

    @Column(name = "sangrado_vestibular_distal")
    @Builder.Default
    private Boolean sangradoVestibularDistal = false;

    // Lingual / Palatino (Mesial, Medio, Distal)
    @Column(name = "profundidad_sondaje_lingual_mesial")
    @Builder.Default
    private Integer profundidadSondajeLingualMesial = 2;

    @Column(name = "profundidad_sondaje_lingual_medio")
    @Builder.Default
    private Integer profundidadSondajeLingualMedio = 2;

    @Column(name = "profundidad_sondaje_lingual_distal")
    @Builder.Default
    private Integer profundidadSondajeLingualDistal = 2;

    @Column(name = "margen_gingival_lingual_mesial")
    @Builder.Default
    private Integer margenGingivalLingualMesial = 0;

    @Column(name = "margen_gingival_lingual_medio")
    @Builder.Default
    private Integer margenGingivalLingualMedio = 0;

    @Column(name = "margen_gingival_lingual_distal")
    @Builder.Default
    private Integer margenGingivalLingualDistal = 0;

    @Column(name = "sangrado_lingual_mesial")
    @Builder.Default
    private Boolean sangradoLingualMesial = false;

    @Column(name = "sangrado_lingual_medio")
    @Builder.Default
    private Boolean sangradoLingualMedio = false;

    @Column(name = "sangrado_lingual_distal")
    @Builder.Default
    private Boolean sangradoLingualDistal = false;

    // Movilidad y Furca
    @Column(name = "movilidad_grado")
    @Builder.Default
    private Integer movilidadGrado = 0;

    @Column(name = "furca_grado")
    @Builder.Default
    private Integer furcaGrado = 0;

    @Builder.Default
    private Boolean supuracion = false;

    @Column(name = "placa_bacteriana")
    @Builder.Default
    private Boolean placaBacteriana = false;

    @Column(name = "fecha_registro")
    private OffsetDateTime fechaRegistro;

    @PrePersist
    protected void antesDeGuardar() {
        if (fechaRegistro == null) fechaRegistro = OffsetDateTime.now();
    }
}

