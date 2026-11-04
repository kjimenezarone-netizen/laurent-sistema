export interface CatalogoTratamiento {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  precioBase: number;
  duracionEstimadaMinutos: number;
  categoria: string;
}

export interface ItemMovimientoCuenta {
  id: string;
  tipo: 'CARGO' | 'ABONO';
  descripcion: string;
  cargo: number;
  abono: number;
  medioPago?: string;
  estado: string;
  fecha: string;
}

export interface EstadoCuentaPaciente {
  pacienteId: string;
  pacienteNombreCompleto: string;
  pacienteDocumento: string;
  totalFacturado: number;
  totalAbonado: number;
  saldoDeudor: number;
  saldoAFavor: number;
  movimientos: ItemMovimientoCuenta[];
}

export interface RegistroAbonoFormulario {
  pacienteId: string;
  monto: number;
  medioPago: 'EFECTIVO' | 'TARJETA_CREDITO' | 'TARJETA_DEBITO' | 'TRANSFERENCIA' | 'YAPE' | 'PLIN';
  numeroOperacion?: string;
  claveIdempotencia: string;
  cajeroId: string;
}

