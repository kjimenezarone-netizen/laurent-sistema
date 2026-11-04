export type TipoDenticion = 'PERMANENTE' | 'TEMPORAL';

export type SuperficieDental = 
  | 'VESTIBULAR' 
  | 'LINGUAL' 
  | 'PALATINO' 
  | 'OCLUSAL' 
  | 'INCISAL' 
  | 'MESIAL' 
  | 'DISTAL' 
  | 'GENERAL';

export type TipoHallazgo = 
  | 'CARIES' 
  | 'RESTAURACION' 
  | 'CORONA' 
  | 'ENDODONCIA' 
  | 'IMPLANTE' 
  | 'FRACTURA' 
  | 'PIEZA_AUSENTE' 
  | 'SELLANTE' 
  | 'PROTESIS';

export type EstadoHallazgo = 'EXISTENTE' | 'PLANIFICADO' | 'REALIZADO';

export interface HallazgoDental {
  id?: string;
  piezaFdi: number;
  tipoDenticion: TipoDenticion;
  superficie: SuperficieDental;
  tipoHallazgo: TipoHallazgo;
  estadoHallazgo: EstadoHallazgo;
  observacion?: string;
  fechaRegistro?: string;
}

export interface AtencionClinica {
  id: string;
  pacienteId: string;
  pacienteNombre: string;
  odontologoId: string;
  odontologoNombre: string;
  motivoConsulta: string;
  diagnosticoPrincipal: string;
  diagnosticoCie10?: string;
  notasEvolucion: string;
  indicacionesReceta?: string;
  estado: 'BORRADOR' | 'FIRMADA' | 'RECTIFICADA';
  fechaCreacion: string;
  fechaFirma?: string;
}

export interface RegistroAtencionFormulario {
  pacienteId: string;
  citaId?: string;
  odontologoId: string;
  motivoConsulta: string;
  enfermedadActual?: string;
  diagnosticoPrincipal: string;
  diagnosticoCie10?: string;
  notasEvolucion: string;
  indicacionesReceta?: string;
  firmar: boolean;
}

