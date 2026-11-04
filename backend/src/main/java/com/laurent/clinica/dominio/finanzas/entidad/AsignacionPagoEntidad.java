package com.laurent.clinica.dominio.finanzas.entidad;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "asignaciones_pago")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AsignacionPagoEntidad {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "abono_id", nullable = false)
    private AbonoPagoEntidad abono;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cargo_id", nullable = false)
    private CargoCuentaEntidad cargo;

    @Column(name = "monto_aplicado", nullable = false, precision = 14, scale = 2)
    private BigDecimal montoAplicado;

    @Column(name = "fecha_asignacion")
    private OffsetDateTime fechaAsignacion;

    @PrePersist
    protected void antesDeGuardar() {
        if (fechaAsignacion == null) fechaAsignacion = OffsetDateTime.now();
    }
}

