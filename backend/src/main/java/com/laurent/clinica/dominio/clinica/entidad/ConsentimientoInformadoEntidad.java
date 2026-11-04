package com.laurent.clinica.dominio.clinica.entidad;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "consentimientos_informados")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsentimientoInformadoEntidad {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expediente_id", nullable = false)
    private ExpedienteClinicoEntidad expediente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "atencion_id")
    private AtencionClinicaEntidad atencion;

    @Column(nullable = false, length = 150)
    private String titulo;

    @Column(name = "contenido_legal", nullable = false, columnDefinition = "TEXT")
    private String contenidoLegal;

    @Builder.Default
    private Boolean firmado = false;

    @Column(name = "fecha_firma")
    private OffsetDateTime fechaFirma;

    @Column(name = "huella_digital_hash")
    private String huellaDigitalHash;

    @Builder.Default
    private Boolean revocado = false;

    @Column(name = "motivo_revocacion", columnDefinition = "TEXT")
    private String motivoRevocacion;
}

