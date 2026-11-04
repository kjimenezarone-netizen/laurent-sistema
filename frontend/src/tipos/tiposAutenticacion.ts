export interface UsuarioSesion {
  id: string;
  nombreUsuario: string;
  correoElectronico: string;
  nombreCompleto: string;
  roles: string[];
  odontologoId?: string;
}

export interface ContextoAutenticacionTipo {
  usuario: UsuarioSesion | null;
  token: string | null;
  iniciarSesion: (datosUsuario: UsuarioSesion, tokenTexto: string) => void;
  cerrarSesion: () => void;
  estaAutenticado: boolean;
}

