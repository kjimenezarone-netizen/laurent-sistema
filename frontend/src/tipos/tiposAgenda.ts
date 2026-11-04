export interface SillonDental {
  id: string;
  codigo: string;
  nombre: string;
  activo: boolean;
}

export interface Cita {
  id: string;
  pacienteId: string;
  pacienteNombreCompleto: string;
  pacienteTelefono: string;
  odontologoId: string;
  odontologoNombreCompleto: string;
  odontologoEspecialidad: string;
  sillonId: string;
  sillonNombre: string;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  duracionMinutos: number;
  motivo: string;
  estadoCodigo: 'PROGRAMADA' | 'CONFIRMADA' | 'PRESENTE' | 'EN_ATENCION' | 'COMPLETADA' | 'CANCELADA' | 'NO_ASISTIO';
  observaciones?: string;
}

export interface ReservaCitaFormulario {
  pacienteId: string;
  odontologoId: string;
  sillonId: string;
  fechaHoraInicio: string;
  duracionMinutos: number;
  motivo: string;
  observaciones?: string;
}

