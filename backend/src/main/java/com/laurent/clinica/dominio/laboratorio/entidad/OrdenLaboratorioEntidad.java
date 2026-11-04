package com.laurent.clinica.dominio.laboratorio.entidad;

import com.laurent.clinica.dominio.identidad.entidad.OdontologoEntidad;
import com.laurent.clinica.dominio.pacientes.entidad.PacienteEntidad;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "ordenes_laboratorio")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrdenLaboratorioEntidad {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "paciente_id", nullable = false)
    private PacienteEntidad paciente;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "odontologo_id", nullable = false)
    private OdontologoEntidad odontologo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "laboratorio_id", nullable = false)
    private LaboratorioExternoEntidad laboratorio;

    @Column(name = "tipo_trabajo", nullable = false, length = 100)
    private String tipoTrabajo; // 'CORONA_ZIRCONIO', 'PROTESIS_TOTAL', 'INCRUSTACION', 'FERULA'

    @Column(name = "color_guia", length = 20)
    private String colorGuia;

    @Column(name = "pieza_fdi")
    private Integer piezaFdi;

    @Column(name = "fecha_envio", nullable = false)
    private LocalDate fechaEnvio;

    @Column(name = "fecha_entrega_esperada", nullable = false)
    private LocalDate fechaEntregaEsperada;

    @Column(name = "fecha_entrega_real")
    private LocalDate fechaEntregaReal;

    @Column(name = "costo_laboratorio", nullable = false, precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal costoLaboratorio = BigDecimal.ZERO;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String estado = "ENVIADO"; // 'ENVIADO', 'EN_PROCESO', 'RECIBIDO', 'INSTALADO', 'RECHAZADO'

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "fecha_creacion")
    private OffsetDateTime fechaCreacion;

    @PrePersist
    protected void antesDeGuardar() {
        if (fechaCreacion == null) fechaCreacion = OffsetDateTime.now();
        if (fechaEnvio == null) fechaEnvio = LocalDate.now();
    }
}

