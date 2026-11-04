package com.laurent.clinica.dominio.finanzas.servicio;

import com.laurent.clinica.dominio.clinica.entidad.AtencionClinicaEntidad;
import com.laurent.clinica.dominio.clinica.repositorio.AtencionClinicaRepositorio;
import com.laurent.clinica.dominio.finanzas.dto.*;
import com.laurent.clinica.dominio.finanzas.entidad.*;
import com.laurent.clinica.dominio.finanzas.repositorio.*;
import com.laurent.clinica.dominio.identidad.entidad.SedeEntidad;
import com.laurent.clinica.dominio.identidad.entidad.UsuarioEntidad;
import com.laurent.clinica.dominio.identidad.repositorio.SedeRepositorio;
import com.laurent.clinica.dominio.identidad.repositorio.UsuarioRepositorio;
import com.laurent.clinica.dominio.pacientes.entidad.PacienteEntidad;
import com.laurent.clinica.dominio.pacientes.repositorio.PacienteRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class FinanzasServicio {

    private final CatalogoTratamientoRepositorio catalogoRepositorio;
    private final SesionCajaRepositorio sesionCajaRepositorio;
    private final CargoCuentaRepositorio cargoRepositorio;
    private final AbonoPagoRepositorio abonoRepositorio;
    private final AsignacionPagoRepositorio asignacionRepositorio;
    private final PacienteRepositorio pacienteRepositorio;
    private final UsuarioRepositorio usuarioRepositorio;
    private final AtencionClinicaRepositorio atencionRepositorio;
    private final SedeRepositorio sedeRepositorio;

    @Transactional(readOnly = true)
    public List<CatalogoTratamientoEntidad> listarCatalogoTratamientos() {
        return catalogoRepositorio.findByActivoTrueOrderByNombreAsc();
    }

    @Transactional
    public CargoCuentaEntidad emitirCargo(EmisionCargoDto dto) {
        PacienteEntidad paciente = pacienteRepositorio.findById(dto.getPacienteId())
                .orElseThrow(() -> new IllegalArgumentException("Paciente no encontrado"));
        UsuarioEntidad usuario = usuarioRepositorio.findById(dto.getUsuarioCreadorId())
                .orElseThrow(() -> new IllegalArgumentException("Usuario emisor no encontrado"));

        CatalogoTratamientoEntidad tratamiento = null;
        if (dto.getTratamientoId() != null) {
            tratamiento = catalogoRepositorio.findById(dto.getTratamientoId()).orElse(null);
        }

        AtencionClinicaEntidad atencion = null;
        if (dto.getAtencionId() != null) {
            atencion = atencionRepositorio.findById(dto.getAtencionId()).orElse(null);
        }

        int cantidad = (dto.getCantidad() != null && dto.getCantidad() > 0) ? dto.getCantidad() : 1;
        BigDecimal precioUnitario = dto.getPrecioUnitario() != null ? dto.getPrecioUnitario()
                : (tratamiento != null ? tratamiento.getPrecioBase() : BigDecimal.ZERO);
        BigDecimal descuento = dto.getDescuento() != null ? dto.getDescuento() : BigDecimal.ZERO;

        BigDecimal subtotal = precioUnitario.multiply(BigDecimal.valueOf(cantidad));
        BigDecimal montoTotal = subtotal.subtract(descuento).max(BigDecimal.ZERO);

        String descripcion = dto.getDescripcion();
        if ((descripcion == null || descripcion.isEmpty()) && tratamiento != null) {
            descripcion = tratamiento.getNombre();
        }

        CargoCuentaEntidad cargo = CargoCuentaEntidad.builder()
                .paciente(paciente)
                .atencion(atencion)
                .tratamiento(tratamiento)
                .descripcion(descripcion != null ? descripcion : "Procedimiento Clínico")
                .cantidad(cantidad)
                .precioUnitario(precioUnitario)
                .descuento(descuento)
                .montoTotal(montoTotal)
                .moneda("PEN")
                .estado("PENDIENTE")
                .usuarioCreador(usuario)
                .fechaEmision(OffsetDateTime.now())
                .build();

        return cargoRepositorio.save(cargo);
    }

    @Transactional
    public AbonoPagoEntidad registrarAbono(RegistroAbonoDto dto) {
        // Control de Idempotencia: Si ya se procesó con esta clave, se retorna el pago ya guardado
        if (dto.getClaveIdempotencia() != null && !dto.getClaveIdempotencia().isEmpty()) {
            Optional<AbonoPagoEntidad> existente = abonoRepositorio.findByClaveIdempotencia(dto.getClaveIdempotencia());
            if (existente.isPresent()) {
                return existente.get();
            }
        }

        PacienteEntidad paciente = pacienteRepositorio.findById(dto.getPacienteId())
                .orElseThrow(() -> new IllegalArgumentException("Paciente no encontrado"));
        UsuarioEntidad cajero = usuarioRepositorio.findById(dto.getCajeroId())
                .orElseThrow(() -> new IllegalArgumentException("Cajero no encontrado"));

        SesionCajaEntidad sesionCaja = null;
        if (dto.getSesionCajaId() != null) {
            sesionCaja = sesionCajaRepositorio.findById(dto.getSesionCajaId()).orElse(null);
        }
        if (sesionCaja == null) {
            sesionCaja = sesionCajaRepositorio.findFirstByEstadoOrderByFechaAperturaDesc("ABIERTA")
                    .orElseGet(() -> {
                        SedeEntidad sede = sedeRepositorio.findAll().stream().findFirst().orElseThrow();
                        SesionCajaEntidad auto = SesionCajaEntidad.builder()
                                .sede(sede)
                                .cajero(cajero)
                                .fechaApertura(OffsetDateTime.now())
                                .montoInicialApertura(BigDecimal.ZERO)
                                .estado("ABIERTA")
                                .observaciones("Sesión automática generada por sistema")
                                .build();
                        return sesionCajaRepositorio.save(auto);
                    });
        }

        String clave = (dto.getClaveIdempotencia() != null && !dto.getClaveIdempotencia().isEmpty())
                ? dto.getClaveIdempotencia() : UUID.randomUUID().toString();

        AbonoPagoEntidad abono = AbonoPagoEntidad.builder()
                .paciente(paciente)
                .sesionCaja(sesionCaja)
                .monto(dto.getMonto())
                .moneda("PEN")
                .medioPago(dto.getMedioPago() != null ? dto.getMedioPago() : "EFECTIVO")
                .numeroOperacion(dto.getNumeroOperacion())
                .claveIdempotencia(clave)
                .estado("CONFIRMADO")
                .cajero(cajero)
                .fechaPago(OffsetDateTime.now())
                .build();

        AbonoPagoEntidad guardado = abonoRepositorio.save(abono);

        // Aplicación contable inmutable a los cargos abiertos
        BigDecimal restante = dto.getMonto();
        List<CargoCuentaEntidad> cargosPendientes = cargoRepositorio.findByPacienteIdAndEstadoNotOrderByFechaEmisionAsc(paciente.getId(), "ANULADO");

        for (CargoCuentaEntidad c : cargosPendientes) {
            if (restante.compareTo(BigDecimal.ZERO) <= 0) break;

            BigDecimal yaAplicado = asignacionRepositorio.sumarTotalAplicadoACargo(c.getId());
            BigDecimal pendienteCargo = c.getMontoTotal().subtract(yaAplicado);

            if (pendienteCargo.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal aplicar = restante.min(pendienteCargo);

                AsignacionPagoEntidad asignacion = AsignacionPagoEntidad.builder()
                        .abono(guardado)
                        .cargo(c)
                        .montoAplicado(aplicar)
                        .fechaAsignacion(OffsetDateTime.now())
                        .build();
                asignacionRepositorio.save(asignacion);

                restante = restante.subtract(aplicar);

                if (aplicar.compareTo(pendienteCargo) >= 0) {
                    c.setEstado("PAGADO_TOTAL");
                } else {
                    c.setEstado("PAGADO_PARCIAL");
                }
                cargoRepositorio.save(c);
            }
        }

        return guardado;
    }

    @Transactional(readOnly = true)
    public EstadoCuentaPacienteDto obtenerEstadoCuenta(UUID pacienteId) {
        PacienteEntidad pac = pacienteRepositorio.findById(pacienteId)
                .orElseThrow(() -> new IllegalArgumentException("Paciente no encontrado"));

        BigDecimal totalCargos = cargoRepositorio.sumarTotalCargosActivos(pacienteId);
        BigDecimal totalAbonos = abonoRepositorio.sumarTotalAbonosConfirmados(pacienteId);
        BigDecimal totalAplicado = asignacionRepositorio.sumarTotalAplicadoAPaciente(pacienteId);

        BigDecimal saldoDeudor = totalCargos.subtract(totalAplicado).max(BigDecimal.ZERO);
        BigDecimal saldoAFavor = totalAbonos.subtract(totalAplicado).max(BigDecimal.ZERO);

        List<CargoCuentaEntidad> cargos = cargoRepositorio.findByPacienteIdOrderByFechaEmisionDesc(pacienteId);
        List<AbonoPagoEntidad> abonos = abonoRepositorio.findByPacienteIdOrderByFechaPagoDesc(pacienteId);

        List<ItemMovimientoCuentaDto> movimientos = new ArrayList<>();
        for (CargoCuentaEntidad c : cargos) {
            movimientos.add(ItemMovimientoCuentaDto.builder()
                    .id(c.getId())
                    .tipo("CARGO")
                    .descripcion(c.getDescripcion())
                    .cargo(c.getMontoTotal())
                    .abono(BigDecimal.ZERO)
                    .estado(c.getEstado())
                    .fecha(c.getFechaEmision())
                    .build());
        }
        for (AbonoPagoEntidad a : abonos) {
            movimientos.add(ItemMovimientoCuentaDto.builder()
                    .id(a.getId())
                    .tipo("ABONO")
                    .descripcion("Pago recibido - " + a.getMedioPago())
                    .cargo(BigDecimal.ZERO)
                    .abono(a.getMonto())
                    .medioPago(a.getMedioPago())
                    .estado(a.getEstado())
                    .fecha(a.getFechaPago())
                    .build());
        }

        movimientos.sort((m1, m2) -> m2.getFecha().compareTo(m1.getFecha()));

        return EstadoCuentaPacienteDto.builder()
                .pacienteId(pac.getId())
                .pacienteNombreCompleto(pac.getNombres() + " " + pac.getApellidos())
                .pacienteDocumento(pac.getNumeroDocumento())
                .totalFacturado(totalCargos)
                .totalAbonado(totalAbonos)
                .saldoDeudor(saldoDeudor)
                .saldoAFavor(saldoAFavor)
                .movimientos(movimientos)
                .build();
    }

    @Transactional(readOnly = true)
    public ComprobantePagoDto emitirComprobantePago(UUID abonoId, String tipoComprobante) {
        AbonoPagoEntidad abono = abonoRepositorio.findById(abonoId)
                .orElseThrow(() -> new IllegalArgumentException("Abono no encontrado con ID: " + abonoId));

        BigDecimal total = abono.getMonto();
        // Cálculo contable peruano de IGV (18%)
        BigDecimal subtotal = total.divide(new BigDecimal("1.18"), 2, java.math.RoundingMode.HALF_UP);
        BigDecimal igv = total.subtract(subtotal);

        String prefijo = "FACTURA_ELECTRONICA".equalsIgnoreCase(tipoComprobante) ? "F001-" : "B001-";
        String correlativo = prefijo + String.format("%08d", Math.abs(abono.getId().hashCode() % 100000000));
        String hashSeguridad = UUID.randomUUID().toString().replace("-", "").substring(0, 24).toUpperCase();

        return ComprobantePagoDto.builder()
                .serieCorrelativo(correlativo)
                .tipoComprobante(tipoComprobante != null ? tipoComprobante : "BOLETA_ELECTRONICA")
                .razonSocialEmisor("CLÍNICA DENTAL LAURENT S.A.C.")
                .rucEmisor("20609876541")
                .direccionEmisor("Av. José Larco 850, Miraflores, Lima")
                .pacienteNombre(abono.getPaciente().getNombres() + " " + abono.getPaciente().getApellidos())
                .pacienteDocumento(abono.getPaciente().getTipoDocumento() + ": " + abono.getPaciente().getNumeroDocumento())
                .medioPago(abono.getMedioPago())
                .numeroOperacion(abono.getNumeroOperacion())
                .subtotal(subtotal)
                .igv(igv)
                .total(total)
                .codigoHashSeguridad(hashSeguridad)
                .fechaEmision(abono.getFechaPago())
                .build();
    }
}

