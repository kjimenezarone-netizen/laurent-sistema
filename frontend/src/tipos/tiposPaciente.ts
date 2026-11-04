export interface Paciente {
  id: string;
  tipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  fechaNacimiento: string;
  telefonoMovil: string;
  correoElectronico?: string;
  alergias?: string;
  enfermedadesSistemicas?: string;
  medicacionActual?: string;
  observacionesMedicas?: string;
  activo: boolean;
  saldoDeudor: number;
  saldoAFavor: number;
}

export interface RegistroPacienteFormulario {
  tipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  sexo?: string;
  telefonoMovil: string;
  correoElectronico?: string;
  direccion?: string;
  ocupacion?: string;
  alergias?: string;
  enfermedadesSistemicas?: string;
  medicacionActual?: string;
  observacionesMedicas?: string;
}

