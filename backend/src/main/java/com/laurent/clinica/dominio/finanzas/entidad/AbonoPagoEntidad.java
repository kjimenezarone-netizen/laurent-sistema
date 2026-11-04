package com.laurent.clinica.dominio.finanzas.entidad;

import com.laurent.clinica.dominio.identidad.entidad.UsuarioEntidad;
import com.laurent.clinica.dominio.pacientes.entidad.PacienteEntidad;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "abonos_pago")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AbonoPagoEntidad {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    private PacienteEntidad paciente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sesion_caja_id", nullable = false)
    private SesionCajaEntidad sesionCaja;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal monto;

    @Column(nullable = false, length = 5)
    @Builder.Default
    private String moneda = "PEN";

    @Column(name = "medio_pago", nullable = false, length = 30)
    private String medioPago; // 'EFECTIVO', 'TARJETA_CREDITO', 'TARJETA_DEBITO', 'TRANSFERENCIA', 'YAPE', 'PLIN'

    @Column(name = "numero_operacion", length = 100)
    private String numeroOperacion;

    @Column(name = "clave_idempotencia", nullable = false, unique = true, length = 100)
    private String claveIdempotencia;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String estado = "CONFIRMADO"; // 'CONFIRMADO', 'REVERTIDO'

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cajero_id", nullable = false)
    private UsuarioEntidad cajero;

    @Column(name = "motivo_reversion", columnDefinition = "TEXT")
    private String motivoReversion;

    @Column(name = "fecha_reversion")
    private OffsetDateTime fechaReversion;

    @Column(name = "fecha_pago")
    private OffsetDateTime fechaPago;

    @PrePersist
    protected void antesDeGuardar() {
        if (fechaPago == null) fechaPago = OffsetDateTime.now();
    }
}

