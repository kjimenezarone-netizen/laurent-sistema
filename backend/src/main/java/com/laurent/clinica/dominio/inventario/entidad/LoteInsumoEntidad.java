package com.laurent.clinica.dominio.inventario.entidad;

import com.laurent.clinica.dominio.identidad.entidad.SedeEntidad;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "lotes_insumos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoteInsumoEntidad {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "insumo_id", nullable = false)
    private InsumoDentalEntidad insumo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sede_id", nullable = false)
    private SedeEntidad sede;

    @Column(name = "numero_lote", nullable = false, length = 50)
    private String numeroLote;

    @Column(name = "fecha_vencimiento")
    private LocalDate fechaVencimiento;

    @Column(name = "cantidad_actual", nullable = false, precision = 14, scale = 3)
    private BigDecimal cantidadActual;

    @Column(name = "costo_unitario_compra", precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal costoUnitarioCompra = BigDecimal.ZERO;

    @Builder.Default
    private Boolean activo = true;
}

