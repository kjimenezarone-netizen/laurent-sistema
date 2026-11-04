import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
  Alert,
  Stack,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { clienteHttp } from '../../api/clienteHttp';
import { usarAutenticacion } from '../../api/ContextoAutenticacion';

export const PaginaIniciarSesion: React.FC = () => {
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const { iniciarSesion } = usarAutenticacion();
  const navigate = useNavigate();

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      const resp = await clienteHttp.post('/autenticacion/iniciar-sesion', {
        nombreUsuario,
        contrasena,
      });

      const datos = resp.data;
      iniciarSesion(
        {
          id: datos.id,
          nombreUsuario: datos.nombreUsuario,
          correoElectronico: datos.correoElectronico,
          nombreCompleto: datos.nombreCompleto,
          roles: datos.roles,
          odontologoId: datos.odontologoId,
        },
        datos.token
      );

      // Redirección inteligente por rol
      if (datos.roles.includes('ADMINISTRADOR')) {
        navigate('/admin');
      } else if (datos.roles.includes('ODONTOLOGO')) {
        navigate('/medico/historias');
      } else {
        navigate('/agenda');
      }
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Credenciales inválidas. Verifica tu usuario y contraseña.');
    } finally {
      setCargando(false);
    }
  };

  const rellenarCredencialDemo = (usuarioDemo: string, claveDemo: string) => {
    setNombreUsuario(usuarioDemo);
    setContrasena(claveDemo);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#071e1d',
        backgroundImage: 'radial-gradient(circle at 50% 20%, #0d4a46 0%, #061e1d 80%)',
        p: 2,
      }}
    >
      <Container maxWidth="xs">
        <Card sx={{ borderRadius: 4, boxShadow: '0 10px 40px rgba(0,0,0,0.5)', bgcolor: '#ffffff' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f2c2b', letterSpacing: '1px' }}>
                CLÍNICA LAURENT
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sistema de Gestión Dental & Historia Clínica
              </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <form onSubmit={manejarEnvio}>
              <TextField
                label="Usuario o DNI"
                value={nombreUsuario}
                onChange={(e) => setNombreUsuario(e.target.value)}
                fullWidth
                required
                sx={{ mb: 2 }}
              />

              <TextField
                label="Contraseña"
                type="password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                fullWidth
                required
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={cargando}
                sx={{
                  bgcolor: '#0d9488',
                  py: 1.4,
                  fontWeight: 'bold',
                  '&:hover': { bgcolor: '#0f766e' },
                }}
              >
                {cargando ? 'Iniciando Sesión Segura...' : 'Ingresar al Sistema'}
              </Button>
            </form>

            <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Acceso Rápido para Pruebas:
              </Typography>
              <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap>
                <Chip
                  label="Admin"
                  size="small"
                  onClick={() => rellenarCredencialDemo('admin', 'admin123')}
                  clickable
                />
                <Chip
                  label="Dr. Laurent"
                  size="small"
                  color="primary"
                  onClick={() => rellenarCredencialDemo('dr.laurent', 'medico123')}
                  clickable
                />
                <Chip
                  label="Recepción"
                  size="small"
                  color="secondary"
                  onClick={() => rellenarCredencialDemo('recepcion', 'recepcion123')}
                  clickable
                />
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

