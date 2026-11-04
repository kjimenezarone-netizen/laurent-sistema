package com.laurent.clinica.dominio.finanzas.entidad;

import com.laurent.clinica.dominio.identidad.entidad.SedeEntidad;
import com.laurent.clinica.dominio.identidad.entidad.UsuarioEntidad;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "sesiones_caja")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SesionCajaEntidad {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sede_id", nullable = false)
    private SedeEntidad sede;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cajero_id", nullable = false)
    private UsuarioEntidad cajero;

    @Column(name = "fecha_apertura", nullable = false)
    private OffsetDateTime fechaApertura;

    @Column(name = "monto_inicial_apertura", nullable = false, precision = 14, scale = 2)
    private BigDecimal montoInicialApertura;

    @Column(name = "fecha_cierre")
    private OffsetDateTime fechaCierre;

    @Column(name = "monto_final_sistema", precision = 14, scale = 2)
    private BigDecimal montoFinalSistema;

    @Column(name = "monto_final_real", precision = 14, scale = 2)
    private BigDecimal montoFinalReal;

    @Column(precision = 14, scale = 2)
    private BigDecimal diferencia;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String estado = "ABIERTA"; // 'ABIERTA', 'CERRADA'

    @Column(columnDefinition = "TEXT")
    private String observaciones;
}

