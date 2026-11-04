import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Rating,
  AppBar,
  Toolbar,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { clienteHttp } from '../../api/clienteHttp';
import { Shield, Sparkles, Award, Clock, ArrowRight, Stethoscope } from 'lucide-react';

export const PaginaInicioWeb: React.FC = () => {
  const navigate = useNavigate();
  const serviciosPorDefecto = [
    { id: '1', nombre: 'Profilaxis y Destartraje', descripcion: 'Limpieza profunda con retiro de cálculo dental y pulido', precioBase: 120.00 },
    { id: '2', nombre: 'Restauraciones Estéticas', descripcion: 'Resinas fotocurables de alta estética y durabilidad', precioBase: 90.00 },
    { id: '3', nombre: 'Blanqueamiento Dental LED', descripcion: 'Aclaramiento dental seguro en consultorio', precioBase: 350.00 },
    { id: '4', nombre: 'Implantes Dentales', descripcion: 'Rehabilitación fija con titanio osteointegrado', precioBase: 1500.00 }
  ];

  const odontologosPorDefecto = [
    { id: '1', usuario: { nombres: 'Sebastián', apellidos: 'Laurent' }, especialidad: 'Rehabilitación Oral e Implantes', numeroColegiatura: 'COP-24510' },
    { id: '2', usuario: { nombres: 'Valeria', apellidos: 'Mendoza Quispe' }, especialidad: 'Ortodoncia y Estética Dental', numeroColegiatura: 'COP-31892' }
  ];

  const testimoniosPorDefecto = [
    { id: '1', nombrePaciente: 'Mariana Paredes', tratamientoRealizado: 'Diseño de Sonrisa', comentario: 'La atención del Dr. Laurent fue impecable, me devolvieron la seguridad al sonreír.', calificacionEstrellas: 5 },
    { id: '2', nombrePaciente: 'Jorge Villanueva', tratamientoRealizado: 'Implante Dental', comentario: 'Cero dolor durante todo el procedimiento. El equipamiento y la higiene son de primer nivel.', calificacionEstrellas: 5 },
    { id: '3', nombrePaciente: 'Claudia Morales', tratamientoRealizado: 'Ortodoncia Invisible', comentario: 'Excelente trato de todo el equipo de recepción y la Dra. Mendoza muy profesional.', calificacionEstrellas: 5 }
  ];

  const [servicios, setServicios] = useState<any[]>(serviciosPorDefecto);
  const [odontologos, setOdontologos] = useState<any[]>(odontologosPorDefecto);
  const [testimonios, setTestimonios] = useState<any[]>(testimoniosPorDefecto);

  useEffect(() => {
    const cargarDatosWeb = async () => {
      try {
        const [respServicios, respOdontologos, respTestimonios] = await Promise.all([
          clienteHttp.get('/publico/servicios'),
          clienteHttp.get('/publico/odontologos'),
          clienteHttp.get('/publico/testimonios'),
        ]);
        if (Array.isArray(respServicios?.data) && respServicios.data.length > 0) {
          setServicios(respServicios.data.slice(0, 4));
        }
        if (Array.isArray(respOdontologos?.data) && respOdontologos.data.length > 0) {
          setOdontologos(respOdontologos.data);
        }
        if (Array.isArray(respTestimonios?.data) && respTestimonios.data.length > 0) {
          setTestimonios(respTestimonios.data);
        }
      } catch (err) {
        console.error('Portal usando datos base de contingencia:', err);
      }
    };
    cargarDatosWeb();
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', color: '#0f2c2b' }}>
      {/* Barra de Navegación Pública */}
      <AppBar position="static" sx={{ bgcolor: '#0f2c2b', boxShadow: 'none' }}>
        <Container maxWidth="lg">
          <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 0 } }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '1px', color: '#fef08a' }}>
                CLÍNICA LAURENT
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                Excelencia en Estética y Salud Bucal
              </Typography>
            </Box>

            <Button
              variant="contained"
              onClick={() => navigate('/iniciar-sesion')}
              sx={{
                bgcolor: '#0d9488',
                fontWeight: 'bold',
                textTransform: 'none',
                '&:hover': { bgcolor: '#0f766e' },
              }}
            >
              Intranet & Portal Staff
            </Button>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: '#071e1d',
          backgroundImage: 'radial-gradient(circle at 50% 30%, #0e4c48 0%, #051a19 90%)',
          color: '#ffffff',
          py: { xs: 8, md: 12 },
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="overline" sx={{ color: '#fef08a', letterSpacing: '2px', fontWeight: 'bold' }}>
            MÁS QUE CUIDAR DIENTES, CUIDAMOS SONRISAS
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, mt: 1, mb: 3, lineHeight: 1.2 }}>
            Tecnología y Precisión Dental al Servicio de tu Salud
          </Typography>
          <Typography variant="h6" sx={{ color: '#cbd5e1', mb: 4, fontWeight: 300 }}>
            Odontología integral, implantes guiados, rehabilitación oral y diseño de sonrisa con los más altos estándares clínicos del país.
          </Typography>
          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowRight size={18} />}
            onClick={() => navigate('/iniciar-sesion')}
            sx={{
              bgcolor: '#0d9488',
              px: 4,
              py: 1.6,
              fontSize: '16px',
              fontWeight: 'bold',
              borderRadius: 3,
              '&:hover': { bgcolor: '#0f766e' },
            }}
          >
            Reservar Consulta Médica
          </Button>
        </Container>
      </Box>

      {/* Servicios Destacados */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f2c2b' }}>
            Nuestras Especialidades
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Tratamientos modernos realizados por especialistas certificados
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {servicios.map((s) => (
            <Grid item xs={12} sm={6} md={3} key={s.id}>
              <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 4px 18px rgba(0,0,0,0.06)' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0d9488', mb: 1 }}>
                    {s.nombre}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {s.descripcion}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#0f2c2b' }}>
                    Desde S/ {Number(s.precioBase || 0).toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Staff Odontológico */}
      <Box sx={{ bgcolor: '#f8fafc', py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f2c2b' }}>
              Equipo Médico de Especialistas
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Liderado por profesionales del Colegio Odontológico del Perú
            </Typography>
          </Box>

          <Grid container spacing={4} justifyContent="center">
            {odontologos.map((od) => (
              <Grid item xs={12} sm={6} md={4} key={od.id}>
                <Card sx={{ borderRadius: 3, textAlign: 'center', p: 3, boxShadow: '0 4px 18px rgba(0,0,0,0.06)' }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: '#f0fdfa',
                      color: '#0d9488',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    <Stethoscope size={36} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0f2c2b' }}>
                    Dr. {od.usuario?.nombres} {od.usuario?.apellidos}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#0d9488', fontWeight: 600, mb: 1 }}>
                    {od.especialidad}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Colegiatura: {od.numeroColegiatura}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonios */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f2c2b' }}>
            Lo Que Dicen Nuestros Pacientes
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {testimonios.map((t) => (
            <Grid item xs={12} md={4} key={t.id}>
              <Card sx={{ p: 2, borderRadius: 3, bgcolor: '#ffffff', boxShadow: '0 4px 18px rgba(0,0,0,0.06)' }}>
                <CardContent>
                  <Rating value={t.calificacionEstrellas} readOnly size="small" sx={{ mb: 1 }} />
                  <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 2, color: '#334155' }}>
                    "{t.comentario}"
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#0f2c2b' }}>
                    {t.nombrePaciente}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Tratamiento: {t.tratamientoRealizado}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

