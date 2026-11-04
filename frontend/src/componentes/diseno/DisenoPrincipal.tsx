import React from 'react';
import {
  Box,
  Drawer,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { usarAutenticacion } from '../../api/ContextoAutenticacion';
import {
  Home,
  FileText,
  Calendar,
  Users,
  Stethoscope,
  UserCog,
  LogOut,
  Receipt,
  Package,
  Boxes,
} from 'lucide-react';

const ANCHO_BARRA_LATERAL = 240;

interface DisenoPrincipalProps {
  children: React.ReactNode;
}

export const DisenoPrincipal: React.FC<DisenoPrincipalProps> = ({ children }) => {
  const { usuario, cerrarSesion } = usarAutenticacion();
  const navigate = useNavigate();
  const ubicacion = useLocation();

  const obtenerElementosMenu = () => {
    if (!usuario) return [];

    const tieneRol = (rol: string) => usuario.roles?.includes(rol);

    if (tieneRol('ADMINISTRADOR')) {
      return [
        { texto: 'Tablero BI & Métricas', icono: <Home size={18} />, ruta: '/admin' },
        { texto: 'Historias Clínicas', icono: <FileText size={18} />, ruta: '/medico/historias' },
        { texto: 'Catálogo de Precios', icono: <FileText size={18} />, ruta: '/admin/tratamientos' },
        { texto: 'Agenda y Citas', icono: <Calendar size={18} />, ruta: '/agenda' },
        { texto: 'Padrón de Pacientes', icono: <Users size={18} />, ruta: '/pacientes' },
        { texto: 'Caja y Facturación', icono: <Receipt size={18} />, ruta: '/caja' },
        { texto: 'Inventario & Lotes', icono: <Package size={18} />, ruta: '/inventario' },
        { texto: 'Laboratorio Dental', icono: <Boxes size={18} />, ruta: '/laboratorio' },
        { texto: 'Gestión de Usuarios', icono: <UserCog size={18} />, ruta: '/admin/usuarios' },
      ];
    } else if (tieneRol('ODONTOLOGO')) {
      return [
        { texto: 'Mi Agenda de Citas', icono: <Calendar size={18} />, ruta: '/agenda' },
        { texto: 'Historias Clínicas & Odontograma', icono: <FileText size={18} />, ruta: '/medico/historias' },
        { texto: 'Órdenes de Laboratorio', icono: <Boxes size={18} />, ruta: '/laboratorio' },
        { texto: 'Padrón de Pacientes', icono: <Users size={18} />, ruta: '/pacientes' },
      ];
    } else {
      // RECEPCIONISTA / CAJERO
      return [
        { texto: 'Agenda del Día', icono: <Calendar size={18} />, ruta: '/agenda' },
        { texto: 'Caja Registradora', icono: <Receipt size={18} />, ruta: '/caja' },
        { texto: 'Padrón de Pacientes', icono: <Users size={18} />, ruta: '/pacientes' },
        { texto: 'Stock de Insumos', icono: <Package size={18} />, ruta: '/inventario' },
      ];
    }
  };

  const elementosMenu = obtenerElementosMenu();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: ANCHO_BARRA_LATERAL,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: ANCHO_BARRA_LATERAL,
            boxSizing: 'border-box',
            backgroundColor: '#0f2c2b',
            color: '#ffffff',
            borderRight: '1px solid rgba(212, 175, 55, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          },
        }}
      >
        <Box>
          {/* Cabecera / Marca Laurent */}
          <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '1px', color: '#fef08a' }}>
              LAURENT
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
              Clínica Dental & Estética
            </Typography>
          </Box>

          {/* Menú de Opciones */}
          <List sx={{ px: 1.5, py: 2 }}>
            {elementosMenu.map((item) => {
              const estaActivo = ubicacion.pathname === item.ruta;
              return (
                <ListItem key={item.texto} disablePadding sx={{ mb: 0.8 }}>
                  <ListItemButton
                    onClick={() => navigate(item.ruta)}
                    sx={{
                      borderRadius: 2,
                      bgcolor: estaActivo ? '#0d9488' : 'transparent',
                      color: estaActivo ? '#ffffff' : '#cbd5e1',
                      '&:hover': {
                        bgcolor: estaActivo ? '#0f766e' : 'rgba(255,255,255,0.06)',
                        color: '#ffffff',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: estaActivo ? '#ffffff' : '#94a3b8', minWidth: 36 }}>
                      {item.icono}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.texto}
                      primaryTypographyProps={{ fontSize: '13.5px', fontWeight: estaActivo ? 600 : 400 }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>

        {/* Pie de Barra Lateral: Perfil y Cierre de Sesión */}
        <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#f1f5f9' }} noWrap>
            {usuario?.nombreCompleto || usuario?.nombreUsuario}
          </Typography>
          <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 1.5 }}>
            Rol: {usuario?.roles?.[0] || 'Personal'}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            onClick={cerrarSesion}
            startIcon={<LogOut size={14} />}
            sx={{
              color: '#f87171',
              borderColor: 'rgba(248, 113, 113, 0.4)',
              textTransform: 'none',
              '&:hover': {
                borderColor: '#ef4444',
                bgcolor: 'rgba(239, 68, 68, 0.1)',
              },
            }}
          >
            Cerrar Sesión
          </Button>
        </Box>
      </Drawer>

      {/* Área Principal de Contenido */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, overflowY: 'auto' }}>
        {children}
      </Box>
    </Box>
  );
};

