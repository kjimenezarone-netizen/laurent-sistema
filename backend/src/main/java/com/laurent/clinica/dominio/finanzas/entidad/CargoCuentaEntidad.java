package com.laurent.clinica.dominio.finanzas.entidad;

import com.laurent.clinica.dominio.clinica.entidad.AtencionClinicaEntidad;
import com.laurent.clinica.dominio.identidad.entidad.UsuarioEntidad;
import com.laurent.clinica.dominio.pacientes.entidad.PacienteEntidad;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "cargos_cuenta")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CargoCuentaEntidad {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    private PacienteEntidad paciente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "atencion_id")
    private AtencionClinicaEntidad atencion;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tratamiento_id")
    private CatalogoTratamientoEntidad tratamiento;

    @Column(nullable = false, length = 255)
    private String descripcion;

    @Column(nullable = false)
    @Builder.Default
    private Integer cantidad = 1;

    @Column(name = "precio_unitario", nullable = false, precision = 14, scale = 2)
    private BigDecimal precioUnitario;

    @Column(nullable = false, precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal descuento = BigDecimal.ZERO;

    @Column(name = "monto_total", nullable = false, precision = 14, scale = 2)
    private BigDecimal montoTotal;

    @Column(nullable = false, length = 5)
    @Builder.Default
    private String moneda = "PEN";

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String estado = "PENDIENTE"; // 'PENDIENTE', 'PAGADO_PARCIAL', 'PAGADO_TOTAL', 'ANULADO'

    @Column(name = "motivo_anulacion", columnDefinition = "TEXT")
    private String motivoAnulacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_creador_id", nullable = false)
    private UsuarioEntidad usuarioCreador;

    @Column(name = "fecha_emision")
    private OffsetDateTime fechaEmision;

    @PrePersist
    protected void antesDeGuardar() {
        if (fechaEmision == null) fechaEmision = OffsetDateTime.now();
    }
}

