export type Rol = 'ADMINISTRADOR'|'MEDICO'|'RECEPCIONISTA';
export function fdiValido(n:number):boolean {const q=Math.floor(n/10),p=n%10;return Number.isInteger(n)&&q>=1&&q<=8&&p>=1&&p<=(q<=4?8:5)}
export function clasePieza(n:number):'INCISIVO'|'CANINO'|'PREMOLAR'|'MOLAR'|'INVALIDO'{
 if(!fdiValido(n))return 'INVALIDO';const p=n%10,q=Math.floor(n/10);
 return p<=2?'INCISIVO':p===3?'CANINO':q<=4&&p<=5?'PREMOLAR':'MOLAR';
}
export function colision(inicioA:number,finA:number,inicioB:number,finB:number){return inicioA<finB&&inicioB<finA}
export const permisos:Record<Rol,readonly string[]>={
 ADMINISTRADOR:['ADMINISTRAR','AGENDA','PACIENTES','CAJA','CMS','INVENTARIO','LABORATORIO','COMUNICACIONES'],
 MEDICO:['AGENDA','PACIENTES_ASIGNADOS','HISTORIA_CLINICA','ODONTOGRAMA','PERIODONTOGRAMA','LABORATORIO_PROPIO'],
 RECEPCIONISTA:['AGENDA','PACIENTES','CAJA','INVENTARIO_CONSULTA','LABORATORIO_CONSULTA','COMUNICACIONES']
};
export function centimos(n:number):number {if(!Number.isFinite(n))throw new Error('Monto invalido');return Math.round(n*100)}
export function saldoMovimientos(movimientos:Array<{cargo:number;abono:number}>):number{return movimientos.reduce((a,m)=>a+centimos(m.cargo)-centimos(m.abono),0)/100}
