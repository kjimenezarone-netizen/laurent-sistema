export type TipoDenticion = 'PERMANENTE'|'TEMPORAL';
export type SuperficieDental = 'GENERAL'|'VESTIBULAR'|'LINGUAL'|'PALATINO'|'OCLUSAL'|'INCISAL'|'MESIAL'|'DISTAL';
export type TipoHallazgo = 'CARIES'|'RESTAURACION'|'SELLANTE'|'CORONA'|'ENDODONCIA'|'IMPLANTE'|'FRACTURA'|'PIEZA_AUSENTE'|'PROTESIS';
export type EstadoHallazgo = 'EXISTENTE'|'PLANIFICADO'|'REALIZADO';
export interface HallazgoDental {
  id?:string; piezaFdi:number;tipoDenticion:TipoDenticion; superficie:SuperficieDental;
  tipoHallazgo:TipoHallazgo;estadoHallazgo:EstadoHallazgo; observacion?:string;fechaRegistro?:string;
}
