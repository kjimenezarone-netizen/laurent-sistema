import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { laurentTheme } from './theme/theme';
import { ProveedorAutenticacion, usarAutenticacion } from './api/ContextoAutenticacion';
import { DisenoPrincipal } from './componentes/diseno/DisenoPrincipal';

// Páginas en Español
import { PaginaInicioWeb } from './paginas/publico/PaginaInicioWeb';
import { PaginaIniciarSesion } from './paginas/autenticacion/PaginaIniciarSesion';
import { PaginaAgenda } from './paginas/recepcion/PaginaAgenda';
import { PaginaPacientes } from './paginas/recepcion/PaginaPacientes';
import { PaginaCajaFacturacion } from './paginas/recepcion/PaginaCajaFacturacion';
import { PaginaHistoriasClinicas } from './paginas/medico/PaginaHistoriasClinicas';
import { PaginaTableroControl } from './paginas/admin/PaginaTableroControl';
import { PaginaCatalogoTratamientos } from './paginas/admin/PaginaCatalogoTratamientos';
import { PaginaGestionUsuarios } from './paginas/admin/PaginaGestionUsuarios';
import { PaginaInventario } from './paginas/inventario/PaginaInventario';
import { PaginaLaboratorio } from './paginas/laboratorio/PaginaLaboratorio';

const RutaProtegida: React.FC<{ children: React.ReactNode; rolesPermitidos?: string[] }> = ({
  children,
  rolesPermitidos,
}) => {
  const { usuario, estaAutenticado } = usarAutenticacion();

  if (!estaAutenticado || !usuario) {
    return <Navigate to="/iniciar-sesion" replace />;
  }

  if (rolesPermitidos && !rolesPermitidos.some((r) => usuario.roles?.includes(r))) {
    return <Navigate to="/agenda" replace />;
  }

  return <DisenoPrincipal>{children}</DisenoPrincipal>;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider theme={laurentTheme}>
      <CssBaseline />
      <ProveedorAutenticacion>
        <BrowserRouter>
          <Routes>
            {/* 1. Portal Público */}
            <Route path="/" element={<PaginaInicioWeb />} />

            {/* 2. Autenticación */}
            <Route path="/iniciar-sesion" element={<PaginaIniciarSesion />} />
            <Route path="/login" element={<Navigate to="/iniciar-sesion" replace />} />

            {/* 3. Agenda y Turnos */}
            <Route
              path="/agenda"
              element={
                <RutaProtegida>
                  <PaginaAgenda />
                </RutaProtegida>
              }
            />
            <Route path="/recepcion" element={<Navigate to="/agenda" replace />} />

            {/* 4. Pacientes */}
            <Route
              path="/pacientes"
              element={
                <RutaProtegida>
                  <PaginaPacientes />
                </RutaProtegida>
              }
            />
            <Route path="/recepcion/pacientes" element={<Navigate to="/pacientes" replace />} />

            {/* 5. Caja y Facturación */}
            <Route
              path="/caja"
              element={
                <RutaProtegida rolesPermitidos={['ADMINISTRADOR', 'RECEPCIONISTA', 'CAJERO']}>
                  <PaginaCajaFacturacion />
                </RutaProtegida>
              }
            />
            <Route path="/recepcion/facturacion" element={<Navigate to="/caja" replace />} />

            {/* 6. Historias Clínicas y Odontograma FDI */}
            <Route
              path="/medico/historias"
              element={
                <RutaProtegida rolesPermitidos={['ODONTOLOGO', 'ADMINISTRADOR']}>
                  <PaginaHistoriasClinicas />
                </RutaProtegida>
              }
            />
            <Route path="/medico" element={<Navigate to="/medico/historias" replace />} />

            {/* 7. Inventario y Control de Lotes */}
            <Route
              path="/inventario"
              element={
                <RutaProtegida rolesPermitidos={['ADMINISTRADOR', 'RECEPCIONISTA', 'CAJERO']}>
                  <PaginaInventario />
                </RutaProtegida>
              }
            />

            {/* 8. Órdenes de Laboratorio Dental */}
            <Route
              path="/laboratorio"
              element={
                <RutaProtegida rolesPermitidos={['ADMINISTRADOR', 'ODONTOLOGO']}>
                  <PaginaLaboratorio />
                </RutaProtegida>
              }
            />

            {/* 9. Panel Administrativo & BI */}
            <Route
              path="/admin"
              element={
                <RutaProtegida rolesPermitidos={['ADMINISTRADOR']}>
                  <PaginaTableroControl />
                </RutaProtegida>
              }
            />
            <Route
              path="/admin/tratamientos"
              element={
                <RutaProtegida rolesPermitidos={['ADMINISTRADOR']}>
                  <PaginaCatalogoTratamientos />
                </RutaProtegida>
              }
            />
            <Route
              path="/admin/usuarios"
              element={
                <RutaProtegida rolesPermitidos={['ADMINISTRADOR']}>
                  <PaginaGestionUsuarios />
                </RutaProtegida>
              }
            />

            {/* Ruta por defecto */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ProveedorAutenticacion>
    </ThemeProvider>
  );
};

export default App;
