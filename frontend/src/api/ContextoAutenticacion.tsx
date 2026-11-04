import React, { createContext, useContext, useState } from 'react';
import { UsuarioSesion, ContextoAutenticacionTipo } from '../tipos/tiposAutenticacion';

const ContextoAutenticacion = createContext<ContextoAutenticacionTipo | undefined>(undefined);

export const ProveedorAutenticacion: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(() => {
    const guardado = localStorage.getItem('laurent_user');
    return guardado ? JSON.parse(guardado) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('laurent_token');
  });

  const iniciarSesion = (datosUsuario: UsuarioSesion, tokenTexto: string) => {
    setUsuario(datosUsuario);
    setToken(tokenTexto);
    localStorage.setItem('laurent_user', JSON.stringify(datosUsuario));
    localStorage.setItem('laurent_token', tokenTexto);
  };

  const cerrarSesion = () => {
    setUsuario(null);
    setToken(null);
    localStorage.removeItem('laurent_user');
    localStorage.removeItem('laurent_token');
    window.location.href = '/iniciar-sesion';
  };

  return (
    <ContextoAutenticacion.Provider
      value={{
        usuario,
        token,
        iniciarSesion,
        cerrarSesion,
        estaAutenticado: !!token,
      }}
    >
      {children}
    </ContextoAutenticacion.Provider>
  );
};

export const usarAutenticacion = () => {
  const contexto = useContext(ContextoAutenticacion);
  if (!contexto) {
    throw new Error('usarAutenticacion debe usarse dentro de un ProveedorAutenticacion');
  }
  return contexto;
};

