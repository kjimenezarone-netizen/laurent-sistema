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
  Chip,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  MenuItem,
  Alert,
  IconButton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { clienteHttp } from '../../api/clienteHttp';
import {
  Shield,
  Sparkles,
  Award,
  Clock,
  ArrowRight,
  Stethoscope,
  Percent,
  Play,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ChevronDown,
  Camera,
  Star,
  Instagram,
  Facebook,
  Youtube,
  MessageCircle,
  HelpCircle,
  HeartHandshake,
  Smile,
  BadgeCheck,
} from 'lucide-react';
import { BotonWhatsAppBot } from '../../componentes/whatsapp/BotonWhatsAppBot';

export const PaginaInicioWeb: React.FC = () => {
  const navigate = useNavigate();

  // Estados interactivos
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('TODOS');
  const [modalVideo, setModalVideo] = useState(false);
  const [formularioEnviado, setFormularioEnviado] = useState(false);
  const [datosFormulario, setDatosFormulario] = useState({
    nombre: '',
    telefono: '',
    correo: '',
    tratamiento: 'Diseño de Sonrisa y Estética',
    sede: 'Sede Principal Miraflores',
  });

  // Catálogo completo de tratamientos
  const catalogoCompleto = [
    {
      id: '1',
      categoria: 'ESTETICA',
      nombre: 'Diseño de Sonrisa 3D',
      descripcion: 'Simulación digital computarizada previa, carillas de porcelana o resina estratificada de alta estética.',
      precioBase: 1200.00,
      duracion: '60 min',
      destacado: true,
      oferta: '30% DCTO',
    },
    {
      id: '2',
      categoria: 'ESTETICA',
      nombre: 'Blanqueamiento Dental LED',
      descripcion: 'Aclaramiento dental profesional en 1 sesión en consultorio con tecnología de luz fría sin sensibilidad.',
      precioBase: 350.00,
      duracion: '45 min',
      destacado: true,
      oferta: '40% DCTO',
    },
    {
      id: '3',
      categoria: 'IMPLANTES',
      nombre: 'Implantes Dentales Guiados',
      descripcion: 'Reemplazo anatómico de raíces con titanio osteointegrado premium y cirugía guiada por tomografía.',
      precioBase: 1500.00,
      duracion: '90 min',
      destacado: true,
      oferta: 'EVALUACIÓN 3D GRATIS',
    },
    {
      id: '4',
      categoria: 'ORTODONCIA',
      nombre: 'Ortodoncia Invisible (Alineadores)',
      descripcion: 'Alineación de dientes sin brackets usando férulas transparentes estéticas, removibles y cómodas.',
      precioBase: 2800.00,
      duracion: '45 min',
      destacado: true,
      oferta: 'HASTA 12 CUOTAS',
    },
    {
      id: '5',
      categoria: 'PREVENTIVA',
      nombre: 'Profilaxis Profunda y Destartraje',
      descripcion: 'Limpieza dental con ultrasonido piezoeléctrico, remoción de sarro, pulido de superficies y flúor protector.',
      precioBase: 120.00,
      duracion: '40 min',
      destacado: false,
    },
    {
      id: '6',
      categoria: 'RESTAURADORA',
      nombre: 'Curaciones con Resina Fotocurable',
      descripcion: 'Restauración estética directa que imita el tono natural del diente con adhesión biomimética.',
      precioBase: 90.00,
      duracion: '30 min',
      destacado: false,
    },
    {
      id: '7',
      categoria: 'ENDODONCIA',
      nombre: 'Endodoncia Mecanizada',
      descripcion: 'Tratamiento de conductos radiculares con localizador apical computarizado sin dolor.',
      precioBase: 280.00,
      duracion: '60 min',
      destacado: false,
    },
    {
      id: '8',
      categoria: 'CIRUGIA',
      nombre: 'Extracción de Tercera Molar (Muela de Juicio)',
      descripcion: 'Cirugía menor atraumática realizada por cirujano bucomaxilofacial colegiado.',
      precioBase: 250.00,
      duracion: '45 min',
      destacado: false,
    },
  ];

  const ofertasEspeciales = [
    {
      titulo: 'Campaña Sonrisa Brillante',
      descuento: '40% DE DESCUENTO',
      descripcion: 'Blanqueamiento Dental Láser LED en consultorio + Profilaxis Ultrasonido de cortesía.',
      precioAntes: 'S/ 580',
      precioAhora: 'S/ 350',
      validoHasta: 'Válido este mes',
      tag: '¡MÁS SOLICITADO!',
    },
    {
      titulo: 'Plan Implante y Corona Fija',
      descuento: 'CONSULTA Y SCAN 3D S/ 0',
      descripcion: 'Evaluación tomográfica computarizada + simulación digital sin costo inicial.',
      precioAntes: 'S/ 2,100',
      precioAhora: 'S/ 1,500',
      validoHasta: 'Cupos Limitados',
      tag: 'ALTA COMPLEJIDAD',
    },
    {
      titulo: 'Ortodoncia Invisible Laurent',
      descuento: '12 CUOTAS SIN INTERESES',
      descripcion: 'Alineadores invisibles de última generación. Incluye kit de limpieza y estuche magnético.',
      precioAntes: 'S/ 3,600',
      precioAhora: 'S/ 2,800',
      validoHasta: 'Hasta fin de mes',
      tag: 'ESTÉTICA TOTAL',
    },
  ];

  const staffOdontologos = [
    {
      id: '1',
      nombre: 'Dr. Sebastián Laurent',
      especialidad: 'Especialista en Rehabilitación Oral e Implantología',
      colegiatura: 'COP-24510 / RNE-10452',
      experiencia: '14 años de experiencia en estética dental',
      bio: 'Magíster en Odontología Estética y pionero en rehabilitación con diseño de sonrisa computarizado.',
    },
    {
      id: '2',
      nombre: 'Dra. Valeria Mendoza Quispe',
      especialidad: 'Especialista en Ortodoncia y Ortopedia Maxilofacial',
      colegiatura: 'COP-31892 / RNE-12940',
      experiencia: '10 años alineando sonrisas',
      bio: 'Certificada internacional en alineadores invisibles y ortodoncia interceptiva para niños y adultos.',
    },
    {
      id: '3',
      nombre: 'Dr. Ricardo Paz Soldán',
      especialidad: 'Cirujano Bucal y Maxilofacial',
      colegiatura: 'COP-28741 / RNE-09432',
      experiencia: '12 años en cirugía de alta complejidad',
      bio: 'Especialista en extracciones de terceras molares complejas e implantes óseos inmediatos.',
    },
  ];

  const testimonios = [
    {
      id: '1',
      nombre: 'Mariana Paredes Castro',
      tratamiento: 'Diseño de Sonrisa & Carillas',
      estrellas: 5,
      texto: 'Me daba vergüenza sonreír en mis fotos de graduación. El Dr. Laurent y su equipo fueron súper profesionales y meticulosos. ¡El cambio fue radical y luce completamente natural!',
    },
    {
      id: '2',
      nombre: 'Jorge Villanueva Ruiz',
      tratamiento: 'Implante Dental Inmediato',
      estrellas: 5,
      texto: 'Tenía miedo del dolor, pero con la tecnología de escáner 3D y la anestesia computarizada no sentí absolutamente nada. Cero molestias al día siguiente. Recomendadísimos.',
    },
    {
      id: '3',
      nombre: 'Claudia Morales Benavides',
      tratamiento: 'Alineadores Invisibles',
      estrellas: 5,
      texto: 'No quería usar brackets metálicos por mi trabajo. Los alineadores invisibles fueron la mejor decisión: nadie los nota y mis dientes se acomodaron en menos de 7 meses.',
    },
  ];

  const preguntasFrecuentes = [
    {
      pregunta: '¿Los tratamientos como implantes o extracciones causan dolor?',
      respuesta: 'No. En Clínica Dental Laurent aplicamos protocolos de odontología mínimamente invasiva, anestesia tópica profunda y micro-inyección indolora. Nuestros procedimientos son libres de dolor y con recuperación guiada.',
    },
    {
      pregunta: '¿Qué facilidades y medios de pago tienen disponibles?',
      respuesta: 'Aceptamos todas las tarjetas de crédito y débito (Visa, Mastercard, Amex, Diners), transferencias bancarias, Yape, Plin y convenios de hasta 12 cuotas sin intereses con los principales bancos del país.',
    },
    {
      pregunta: '¿Cómo funciona la primera consulta de evaluación?',
      respuesta: 'La primera consulta incluye un chequeo clínico integral, fotografías de diagnóstico, odontograma digital en tiempo real y el presupuesto detallado con alternativas de tratamiento personalizadas.',
    },
    {
      pregunta: '¿Atienden emergencias y urgencias dentales el mismo día?',
      respuesta: 'Sí. Contamos con sillones dentales reservados y guardia odontológica para alivio inmediato de dolor agudo, fracturas dentales, abscesos o traumatismos bucales.',
    },
    {
      pregunta: '¿Tienen garantía los tratamientos de carillas e implantes?',
      respuesta: 'Absolutamente. Todos nuestros tratamientos protésicos e implantes cuentan con garantía por escrito certificada por el Colegio Odontológico del Perú y marcas biomédicas internacionales reconocidas.',
    },
  ];

  const tratamientosFiltrados =
    categoriaSeleccionada === 'TODOS'
      ? catalogoCompleto
      : catalogoCompleto.filter((t) => t.categoria === categoriaSeleccionada);

  const enviarFormularioReserva = (e: React.FormEvent) => {
    e.preventDefault();
    setFormularioEnviado(true);

    // Abrir WhatsApp con el mensaje preformateado del formulario
    const mensaje = `Hola Clínica Laurent, mi nombre es ${datosFormulario.nombre}. Deseo reservar una cita para: ${datosFormulario.tratamiento} en la ${datosFormulario.sede}. Mi teléfono es ${datosFormulario.telefono}.`;
    const url = `https://wa.me/51999888777?text=${encodeURIComponent(mensaje)}`;
    setTimeout(() => {
      window.open(url, '_blank');
    }, 1500);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff', color: '#0f2c2b', overflowX: 'hidden' }}>
      {/* 1. Cintillo de Campaña / Anuncio Superior */}
      <Box
        sx={{
          bgcolor: '#0a3835',
          color: '#fef08a',
          py: 0.8,
          px: 2,
          textAlign: 'center',
          fontSize: { xs: 11.5, sm: 13 },
          fontWeight: 700,
          letterSpacing: '0.5px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.5,
          borderBottom: '1px solid rgba(254, 240, 138, 0.2)',
        }}
      >
        <Sparkles size={16} color="#facc15" />
        <span>
          <strong>CAMPAÑA SONRISA LAURENT 2026:</strong> 40% DCTO EN BLANQUEAMIENTO LED Y ESCÁNER 3D SIN COSTO | ¡CUPOS LIMITADOS!
        </span>
      </Box>

      {/* 2. Barra de Navegación Principal */}
      <AppBar position="sticky" sx={{ bgcolor: '#071e1d', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: 'space-between', py: 1, px: { xs: 0 } }}>
            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  bgcolor: '#0d9488',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: 22,
                  boxShadow: '0 4px 12px rgba(13,148,136,0.4)',
                }}
              >
                L
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: '1px', color: '#fef08a', lineHeight: 1.1 }}>
                  CLÍNICA LAURENT
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: 11, letterSpacing: '0.5px' }}>
                  ODONTOLOGÍA DIGITAL & ESTÉTICA AVANZADA
                </Typography>
              </Box>
            </Box>

            {/* Enlaces Rápidos de Navegación */}
            <Stack direction="row" spacing={3} sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
              <Button href="#tratamientos" sx={{ color: '#cbd5e1', fontWeight: 600, textTransform: 'none', '&:hover': { color: '#fef08a' } }}>
                Tratamientos
              </Button>
              <Button href="#ofertas" sx={{ color: '#cbd5e1', fontWeight: 600, textTransform: 'none', '&:hover': { color: '#fef08a' } }}>
                Promociones
              </Button>
              <Button href="#tecnologia" sx={{ color: '#cbd5e1', fontWeight: 600, textTransform: 'none', '&:hover': { color: '#fef08a' } }}>
                Tecnología 3D
              </Button>
              <Button href="#doctores" sx={{ color: '#cbd5e1', fontWeight: 600, textTransform: 'none', '&:hover': { color: '#fef08a' } }}>
                Especialistas
              </Button>
              <Button href="#faq" sx={{ color: '#cbd5e1', fontWeight: 600, textTransform: 'none', '&:hover': { color: '#fef08a' } }}>
                Preguntas
              </Button>
            </Stack>

            {/* Botones de Acción */}
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/iniciar-sesion')}
                sx={{
                  borderColor: '#0d9488',
                  color: '#2dd4bf',
                  fontWeight: 700,
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 2,
                  '&:hover': { borderColor: '#14b8a6', bgcolor: 'rgba(13,148,136,0.1)' },
                }}
              >
                Intranet Staff
              </Button>

              <Button
                variant="contained"
                size="small"
                href="#reserva"
                sx={{
                  bgcolor: '#f59e0b',
                  color: '#071e1d',
                  fontWeight: 800,
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 2.5,
                  '&:hover': { bgcolor: '#d97706' },
                }}
              >
                Reservar Cita
              </Button>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      {/* 3. Hero Section Principal */}
      <Box
        sx={{
          bgcolor: '#071e1d',
          backgroundImage: 'radial-gradient(circle at 60% 30%, #0d4a46 0%, #051a19 90%)',
          color: '#ffffff',
          pt: { xs: 8, md: 12 },
          pb: { xs: 10, md: 14 },
          position: 'relative',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            {/* Texto y Llamados a la Acción */}
            <Grid item xs={12} md={7}>
              <Chip
                icon={<Sparkles size={16} color="#071e1d" />}
                label="SEDE MIRAFLORES & SAN ISIDRO"
                sx={{
                  bgcolor: '#fef08a',
                  color: '#071e1d',
                  fontWeight: 800,
                  fontSize: 12,
                  letterSpacing: '1px',
                  mb: 2.5,
                }}
              />
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: '2.4rem', sm: '3.2rem', md: '3.8rem' },
                  lineHeight: 1.15,
                  mb: 2.5,
                  letterSpacing: '-1px',
                }}
              >
                Más que cuidar dientes,{' '}
                <Box component="span" sx={{ color: '#fef08a' }}>
                  cuidamos tu sonrisa.
                </Box>
              </Typography>
              <Typography variant="h6" sx={{ color: '#cbd5e1', fontWeight: 300, mb: 4, lineHeight: 1.6 }}>
                Líderes en odontología digital, diseño de sonrisa 3D, implantes dentales osteointegrados y ortodoncia invisible con los más altos estándares biomédicos del Perú.
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 5 }}>
                <Button
                  variant="contained"
                  size="large"
                  href="#reserva"
                  endIcon={<ArrowRight size={20} />}
                  sx={{
                    bgcolor: '#0d9488',
                    px: 3.5,
                    py: 1.8,
                    fontSize: 16,
                    fontWeight: 800,
                    borderRadius: 3,
                    boxShadow: '0 8px 24px rgba(13,148,136,0.4)',
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#0f766e' },
                  }}
                >
                  Agendar Consulta Médica
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => setModalVideo(true)}
                  startIcon={<Play size={18} />}
                  sx={{
                    borderColor: 'rgba(255,255,255,0.3)',
                    color: '#ffffff',
                    px: 3,
                    py: 1.8,
                    fontSize: 16,
                    fontWeight: 700,
                    borderRadius: 3,
                    textTransform: 'none',
                    '&:hover': { borderColor: '#fef08a', bgcolor: 'rgba(255,255,255,0.05)' },
                  }}
                >
                  Ver Video Institucional
                </Button>
              </Stack>

              {/* Sellos de Confianza */}
              <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap" useFlexGap>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle2 size={18} color="#2dd4bf" />
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                    Staff Colegiado COP
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle2 size={18} color="#2dd4bf" />
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                    Escáner Intraoral 3D
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle2 size={18} color="#2dd4bf" />
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                    100% Bioseguridad Grado Médico
                  </Typography>
                </Box>
              </Stack>
            </Grid>

            {/* Tarjeta Visual de Métricas / Banner */}
            <Grid item xs={12} md={5}>
              <Card
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.04)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(254, 240, 138, 0.25)',
                  borderRadius: 5,
                  p: 3,
                  boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                }}
              >
                <CardContent sx={{ p: 1 }}>
                  <Typography variant="overline" sx={{ color: '#fef08a', fontWeight: 800, letterSpacing: '1px' }}>
                    EXCELENCIA COMPROBADA
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#ffffff', mb: 3 }}>
                    Resultados que transforman vidas
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ p: 2, bgcolor: 'rgba(13,148,136,0.15)', borderRadius: 3, border: '1px solid rgba(13,148,136,0.3)' }}>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: '#2dd4bf' }}>
                          15k+
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#cbd5e1' }}>
                          Pacientes atendidos con éxito
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ p: 2, bgcolor: 'rgba(245,158,11,0.15)', borderRadius: 3, border: '1px solid rgba(245,158,11,0.3)' }}>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: '#fbbf24' }}>
                          99.4%
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#cbd5e1' }}>
                          Satisfacción en estética dental
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.06)', borderRadius: 3, border: '1px solid rgba(255,255,255,0.1)' }}>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: '#ffffff' }}>
                          12+
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#cbd5e1' }}>
                          Años de trayectoria clínica
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.06)', borderRadius: 3, border: '1px solid rgba(255,255,255,0.1)' }}>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: '#ffffff' }}>
                          2 Sedes
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#cbd5e1' }}>
                          Miraflores y San Isidro
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(0,0,0,0.3)', borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Rating value={5} readOnly size="small" />
                    <Typography variant="body2" sx={{ color: '#fef08a', fontWeight: 700 }}>
                      5.0 Estrellas en Google Reviews (+850 opiniones)
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 4. Sección de Ofertas Especiales y Campañas del Mes */}
      <Box id="ofertas" sx={{ py: 10, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 7 }}>
            <Chip
              icon={<Percent size={14} color="#b45309" />}
              label="PROMOCIONES DE TEMPORADA"
              sx={{ bgcolor: '#fef3c7', color: '#92400e', fontWeight: 800, mb: 1.5 }}
            />
            <Typography variant="h3" sx={{ fontWeight: 900, color: '#0f2c2b' }}>
              Ofertas Especiales del Mes
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 650, mx: 'auto', mt: 1 }}>
              Accede a tratamientos odontológicos de nivel internacional con facilidades de pago en cuotas y descuentos por tiempo limitado.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {ofertasEspeciales.map((of, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 4,
                    boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                    border: index === 0 ? '2px solid #0d9488' : '1px solid #e2e8f0',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  {index === 0 && (
                    <Box
                      sx={{
                        bgcolor: '#0d9488',
                        color: '#ffffff',
                        textAlign: 'center',
                        py: 0.5,
                        fontSize: 12,
                        fontWeight: 800,
                        letterSpacing: '1px',
                      }}
                    >
                      {of.tag}
                    </Box>
                  )}
                  <CardContent sx={{ p: 4, flex: 1 }}>
                    <Typography variant="caption" sx={{ color: '#0d9488', fontWeight: 800, letterSpacing: '1px' }}>
                      {of.descuento}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f2c2b', mt: 1, mb: 1.5 }}>
                      {of.titulo}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      {of.descripcion}
                    </Typography>

                    <Box sx={{ p: 2, bgcolor: '#f1f5f9', borderRadius: 3, mb: 3 }}>
                      <Typography variant="caption" sx={{ textDecoration: 'line-through', color: '#64748b', display: 'block' }}>
                        Antes: {of.precioAntes}
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f2c2b' }}>
                        Ahora: {of.precioAhora}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#059669', fontWeight: 700 }}>
                        {of.validoHasta}
                      </Typography>
                    </Box>
                  </CardContent>

                  <Box sx={{ p: 3, pt: 0 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      href="#reserva"
                      sx={{
                        bgcolor: index === 0 ? '#0d9488' : '#0f2c2b',
                        color: '#ffffff',
                        fontWeight: 700,
                        py: 1.2,
                        borderRadius: 2.5,
                        textTransform: 'none',
                        '&:hover': { bgcolor: index === 0 ? '#0f766e' : '#1e3a38' },
                      }}
                    >
                      Solicitar Esta Promoción
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* 5. Catálogo de Tratamientos con Pestañas Interactivas */}
      <Box id="tratamientos" sx={{ py: 10, bgcolor: '#ffffff' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Typography variant="overline" sx={{ color: '#0d9488', fontWeight: 800, letterSpacing: '1.5px' }}>
              ESPECIALIDADES DENTALES INTEGRALES
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, color: '#0f2c2b' }}>
              Nuestros Tratamientos Clínicos
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Selecciona una categoría para ver precios referenciales y detalles de cada atención.
            </Typography>

            {/* Pestañas de Filtro */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Tabs
                value={categoriaSeleccionada}
                onChange={(_, val) => setCategoriaSeleccionada(val)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  bgcolor: '#f1f5f9',
                  p: 0.8,
                  borderRadius: 4,
                  '& .Mui-selected': { bgcolor: '#0d9488', color: '#ffffff !important', borderRadius: 3, fontWeight: 800 },
                  '& .MuiTabs-indicator': { display: 'none' },
                }}
              >
                <Tab label="Todos" value="TODOS" sx={{ textTransform: 'none', fontWeight: 600, minHeight: 40 }} />
                <Tab label="Estética & Sonrisa" value="ESTETICA" sx={{ textTransform: 'none', fontWeight: 600, minHeight: 40 }} />
                <Tab label="Implantes" value="IMPLANTES" sx={{ textTransform: 'none', fontWeight: 600, minHeight: 40 }} />
                <Tab label="Ortodoncia" value="ORTODONCIA" sx={{ textTransform: 'none', fontWeight: 600, minHeight: 40 }} />
                <Tab label="Preventiva" value="PREVENTIVA" sx={{ textTransform: 'none', fontWeight: 600, minHeight: 40 }} />
                <Tab label="Endodoncia" value="ENDODONCIA" sx={{ textTransform: 'none', fontWeight: 600, minHeight: 40 }} />
              </Tabs>
            </Box>
          </Box>

          {/* Grilla de Tratamientos */}
          <Grid container spacing={3}>
            {tratamientosFiltrados.map((t) => (
              <Grid item xs={12} sm={6} md={3} key={t.id}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 3.5,
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: '0 12px 30px rgba(0,0,0,0.1)',
                      borderColor: '#0d9488',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    {t.oferta && (
                      <Chip
                        label={t.oferta}
                        size="small"
                        sx={{ bgcolor: '#fef08a', color: '#854d0e', fontWeight: 800, fontSize: 10.5, mb: 1.5 }}
                      />
                    )}
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f2c2b', mb: 1, lineHeight: 1.3 }}>
                      {t.nombre}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: 13 }}>
                      {t.descripcion}
                    </Typography>
                  </CardContent>

                  <Box sx={{ p: 3, pt: 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 2 }}>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                        Tiempo: {t.duracion}
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0d9488' }}>
                        Desde S/ {t.precioBase.toFixed(2)}
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      fullWidth
                      size="small"
                      href="#reserva"
                      sx={{
                        borderColor: '#cbd5e1',
                        color: '#0f2c2b',
                        fontWeight: 700,
                        textTransform: 'none',
                        borderRadius: 2,
                        '&:hover': { borderColor: '#0d9488', bgcolor: '#f0fdfa' },
                      }}
                    >
                      Consultar Tratamiento
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* 6. Sección Multimedia & Tecnología 3D */}
      <Box id="tecnologia" sx={{ py: 10, bgcolor: '#071e1d', color: '#ffffff' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Chip
                label="TECNOLOGÍA BIOMÉDICA DE VANGUARDIA"
                sx={{ bgcolor: 'rgba(13,148,136,0.2)', color: '#2dd4bf', fontWeight: 800, mb: 2 }}
              />
              <Typography variant="h3" sx={{ fontWeight: 900, mb: 2.5, lineHeight: 1.2 }}>
                Escáner Intraoral 3D & Odontología Sin Moldes Incómodos
              </Typography>
              <Typography variant="body1" sx={{ color: '#cbd5e1', mb: 3.5, lineHeight: 1.6 }}>
                En Clínica Dental Laurent dejamos en el pasado las pastas y cubetas tradicionales. Utilizamos escáneres ópticos 3D que capturan miles de imágenes por segundo para diseñar coronas, carillas y alineadores con precisión milimétrica en minutos.
              </Typography>

              <Stack spacing={2} sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Box sx={{ bgcolor: 'rgba(254,240,138,0.15)', p: 1, borderRadius: 2 }}>
                    <Camera size={22} color="#fef08a" />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#fef08a' }}>
                      Cámara Intraoral de Alta Resolución
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                      Observa en una pantalla HD el estado exacto de cada una de tus piezas dentales antes y después.
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Box sx={{ bgcolor: 'rgba(45,212,191,0.15)', p: 1, borderRadius: 2 }}>
                    <Shield size={22} color="#2dd4bf" />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#2dd4bf' }}>
                      Esterilización de Grado Quirúrgico Autoclave Clase B
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                      Monitoreo biológico de desinfección instrumental con trazabilidad 100% segura para cada paciente.
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Grid>

            {/* Video Preview Card */}
            <Grid item xs={12} md={6}>
              <Box
                onClick={() => setModalVideo(true)}
                sx={{
                  position: 'relative',
                  height: 340,
                  borderRadius: 5,
                  bgcolor: '#0a3835',
                  backgroundImage: 'linear-gradient(135deg, #0e4c48 0%, #051a19 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: '2px solid rgba(254, 240, 138, 0.3)',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
                  overflow: 'hidden',
                  '&:hover .play-btn': { transform: 'scale(1.15)', bgcolor: '#fef08a', color: '#071e1d' },
                }}
              >
                <Box
                  className="play-btn"
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.9)',
                    color: '#0d9488',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 0 30px rgba(254, 240, 138, 0.5)',
                  }}
                >
                  <Play size={36} style={{ marginLeft: 4 }} />
                </Box>
                <Box sx={{ position: 'absolute', bottom: 20, textAlign: 'center', width: '100%' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#fef08a' }}>
                    TOUR VIRTUAL POR CLÍNICA LAURENT
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#cbd5e1' }}>
                    Haz clic para reproducir el recorrido guiado (2 min)
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 7. Staff Médico Colegiado (Doctores) */}
      <Box id="doctores" sx={{ py: 10, bgcolor: '#f8fafc' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 7 }}>
            <Typography variant="overline" sx={{ color: '#0d9488', fontWeight: 800, letterSpacing: '1px' }}>
              EQUIPO MÉDICO DE PRIMER NIVEL
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, color: '#0f2c2b' }}>
              Especialistas en Cada Rama Dental
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Atención personalizada a cargo de profesionales registrados en el Colegio Odontológico del Perú.
            </Typography>
          </Box>

          <Grid container spacing={4} justifyContent="center">
            {staffOdontologos.map((doc) => (
              <Grid item xs={12} sm={6} md={4} key={doc.id}>
                <Card sx={{ height: '100%', borderRadius: 4, p: 3.5, textAlign: 'center', boxShadow: '0 6px 25px rgba(0,0,0,0.06)' }}>
                  <Box
                    sx={{
                      width: 90,
                      height: 90,
                      borderRadius: '50%',
                      bgcolor: '#f0fdfa',
                      color: '#0d9488',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2.5,
                      boxShadow: '0 4px 14px rgba(13,148,136,0.2)',
                    }}
                  >
                    <Stethoscope size={44} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f2c2b' }}>
                    {doc.nombre}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#0d9488', fontWeight: 700, mb: 1 }}>
                    {doc.especialidad}
                  </Typography>
                  <Chip label={doc.colegiatura} size="small" sx={{ bgcolor: '#e2e8f0', color: '#334155', fontWeight: 700, mb: 2 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13, lineHeight: 1.5 }}>
                    {doc.bio}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* 8. Testimonios de Pacientes */}
      <Box sx={{ py: 10, bgcolor: '#ffffff' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 7 }}>
            <Typography variant="overline" sx={{ color: '#f59e0b', fontWeight: 800, letterSpacing: '1px' }}>
              RESEÑAS VERIFICADAS
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, color: '#0f2c2b' }}>
              Sonrisas Reales, Historias Reales
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {testimonios.map((t) => (
              <Grid item xs={12} md={4} key={t.id}>
                <Card sx={{ height: '100%', p: 3, borderRadius: 4, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <CardContent sx={{ p: 1 }}>
                    <Rating value={t.estrellas} readOnly size="small" sx={{ mb: 1.5, color: '#f59e0b' }} />
                    <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 3, color: '#334155', lineHeight: 1.6 }}>
                      "{t.texto}"
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#0d9488', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {t.nombre.charAt(0)}
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f2c2b' }}>
                          {t.nombre}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#0d9488', fontWeight: 600 }}>
                          {t.tratamiento}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* 9. Preguntas Frecuentes (FAQ Interactivo) */}
      <Box id="faq" sx={{ py: 10, bgcolor: '#f8fafc' }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Chip icon={<HelpCircle size={14} />} label="RESOLVEMOS TUS DUDAS" sx={{ bgcolor: '#e0e7ff', color: '#3730a3', fontWeight: 800, mb: 1.5 }} />
            <Typography variant="h3" sx={{ fontWeight: 900, color: '#0f2c2b' }}>
              Preguntas Frecuentes
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Todo lo que necesitas saber antes de tu primera consulta médica dental.
            </Typography>
          </Box>

          <Stack spacing={2}>
            {preguntasFrecuentes.map((faq, i) => (
              <Accordion key={i} sx={{ borderRadius: 3, '&:before': { display: 'none' }, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                <AccordionSummary expandIcon={<ChevronDown size={20} color="#0d9488" />}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f2c2b' }}>
                    {faq.pregunta}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {faq.respuesta}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* 10. Formulario de Reserva Rápida / Cotización */}
      <Box id="reserva" sx={{ py: 10, bgcolor: '#071e1d', color: '#ffffff' }}>
        <Container maxWidth="md">
          <Card sx={{ borderRadius: 5, p: { xs: 3, md: 5 }, bgcolor: '#ffffff', color: '#0f2c2b', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="overline" sx={{ color: '#0d9488', fontWeight: 800, letterSpacing: '1px' }}>
                RESERVA ONLINE PRIORITARIA
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f2c2b' }}>
                Agenda tu Cita o Solicita Cotización
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completa tus datos y un asesor se comunicará contigo de inmediato por WhatsApp para confirmar tu horario.
              </Typography>
            </Box>

            {formularioEnviado && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                ¡Solicitud recibida con éxito! Te estamos redirigiendo a nuestro WhatsApp oficial para atenderte de inmediato.
              </Alert>
            )}

            <form onSubmit={enviarFormularioReserva}>
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Nombre Completo"
                    fullWidth
                    required
                    value={datosFormulario.nombre}
                    onChange={(e) => setDatosFormulario({ ...datosFormulario, nombre: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Teléfono o WhatsApp"
                    fullWidth
                    required
                    placeholder="999888777"
                    value={datosFormulario.telefono}
                    onChange={(e) => setDatosFormulario({ ...datosFormulario, telefono: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label="Tratamiento de Interés"
                    fullWidth
                    value={datosFormulario.tratamiento}
                    onChange={(e) => setDatosFormulario({ ...datosFormulario, tratamiento: e.target.value })}
                  >
                    <MenuItem value="Diseño de Sonrisa y Estética">Diseño de Sonrisa & Carillas</MenuItem>
                    <MenuItem value="Blanqueamiento Dental LED">Blanqueamiento Dental LED (Campaña 40% Dcto)</MenuItem>
                    <MenuItem value="Implante Dental Guiado">Implantes Dentales de Titanio</MenuItem>
                    <MenuItem value="Ortodoncia Invisible">Ortodoncia Invisible (Alineadores)</MenuItem>
                    <MenuItem value="Profilaxis y Limpieza">Profilaxis Dental y Destartraje</MenuItem>
                    <MenuItem value="Consulta General de Evaluación">Consulta General de Evaluación</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label="Sede de Preferencia"
                    fullWidth
                    value={datosFormulario.sede}
                    onChange={(e) => setDatosFormulario({ ...datosFormulario, sede: e.target.value })}
                  >
                    <MenuItem value="Sede Principal Miraflores">Sede Miraflores (Av. José Larco 850)</MenuItem>
                    <MenuItem value="Sede San Isidro">Sede San Isidro (Av. Javier Prado Este 1420)</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    endIcon={<MessageCircle size={20} />}
                    sx={{
                      bgcolor: '#0d9488',
                      py: 1.8,
                      fontSize: 16,
                      fontWeight: 800,
                      borderRadius: 3,
                      textTransform: 'none',
                      '&:hover': { bgcolor: '#0f766e' },
                    }}
                  >
                    Confirmar Reserva Inmediata por WhatsApp
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Card>
        </Container>
      </Box>

      {/* 11. Footer Institucional Completo y Redes Sociales */}
      <Box sx={{ bgcolor: '#041312', color: '#94a3b8', pt: 8, pb: 4, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <Container maxWidth="lg">
          <Grid container spacing={5} sx={{ mb: 6 }}>
            {/* Columna 1: Marca y Redes */}
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ color: '#fef08a', fontWeight: 900, letterSpacing: '1px', mb: 1.5 }}>
                CLÍNICA DENTAL LAURENT
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.6 }}>
                Centro odontológico de alta especialidad médica, estética facial y rehabilitación integral. Tecnología de diagnóstico 3D al alcance de tu salud.
              </Typography>
              <Typography variant="caption" sx={{ color: '#fef08a', fontWeight: 700, display: 'block', mb: 1.5 }}>
                SÍGUENOS EN REDES SOCIALES:
              </Typography>
              <Stack direction="row" spacing={1.5}>
                <IconButton sx={{ bgcolor: 'rgba(255,255,255,0.06)', color: '#ffffff', '&:hover': { bgcolor: '#0d9488' } }} href="https://instagram.com" target="_blank">
                  <Instagram size={18} />
                </IconButton>
                <IconButton sx={{ bgcolor: 'rgba(255,255,255,0.06)', color: '#ffffff', '&:hover': { bgcolor: '#0d9488' } }} href="https://facebook.com" target="_blank">
                  <Facebook size={18} />
                </IconButton>
                <IconButton sx={{ bgcolor: 'rgba(255,255,255,0.06)', color: '#ffffff', '&:hover': { bgcolor: '#0d9488' } }} href="https://youtube.com" target="_blank">
                  <Youtube size={18} />
                </IconButton>
                <IconButton sx={{ bgcolor: 'rgba(255,255,255,0.06)', color: '#25d366', '&:hover': { bgcolor: '#22c55e', color: '#ffffff' } }} href="https://wa.me/51999888777" target="_blank">
                  <MessageCircle size={18} />
                </IconButton>
              </Stack>
            </Grid>

            {/* Columna 2: Sedes y Horarios */}
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" sx={{ color: '#ffffff', fontWeight: 800, mb: 2 }}>
                Nuestras Sedes
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                <MapPin size={20} color="#2dd4bf" />
                <Typography variant="body2">
                  <strong>Sede Miraflores:</strong> Av. José Larco 850, Miraflores, Lima.
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                <MapPin size={20} color="#2dd4bf" />
                <Typography variant="body2">
                  <strong>Sede San Isidro:</strong> Av. Javier Prado Este 1420, San Isidro, Lima.
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Clock size={20} color="#fef08a" />
                <Typography variant="body2">
                  <strong>Horario:</strong> Lun a Sáb de 8:00 AM a 8:00 PM (Emergencias 24/7).
                </Typography>
              </Box>
            </Grid>

            {/* Columna 3: Contacto e Intranet */}
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" sx={{ color: '#ffffff', fontWeight: 800, mb: 2 }}>
                Contacto y Canales Oficiales
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
                <Phone size={18} color="#2dd4bf" />
                <Typography variant="body2">+51 (01) 445-8920 / +51 999 888 777</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
                <Mail size={18} color="#2dd4bf" />
                <Typography variant="body2">contacto@clinicalaurent.pe</Typography>
              </Box>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/iniciar-sesion')}
                sx={{
                  borderColor: 'rgba(255,255,255,0.2)',
                  color: '#ffffff',
                  fontWeight: 700,
                  textTransform: 'none',
                  borderRadius: 2.5,
                  '&:hover': { borderColor: '#0d9488', bgcolor: 'rgba(13,148,136,0.1)' },
                }}
              >
                Acceso al Sistema Clínico (Intranet)
              </Button>
            </Grid>
          </Grid>

          <Box sx={{ pt: 3, borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center', fontSize: 12 }}>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              © 2026 Clínica Dental Laurent. Todos los derechos reservados. RUC 20601234567. Registro Nacional de Centros de Salud (SUSALUD). Libro de Reclamaciones Digital disponible.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Modal para Video Institucional / Tour */}
      <Dialog open={modalVideo} onClose={() => setModalVideo(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#071e1d', color: '#fef08a', fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Tour Virtual & Tecnología Clínica Laurent</span>
          <Button size="small" onClick={() => setModalVideo(false)} sx={{ color: '#ffffff' }}>Cerrar</Button>
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#071e1d', p: 0, textAlign: 'center' }}>
          <Box
            sx={{
              p: 6,
              color: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 380,
              backgroundImage: 'radial-gradient(circle, #0e4c48 0%, #071e1d 90%)',
            }}
          >
            <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
              <Camera size={40} color="#fef08a" />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#fef08a', mb: 1 }}>
              Instalaciones Médicas de Alta Tecnología
            </Typography>
            <Typography variant="body1" sx={{ color: '#cbd5e1', maxWidth: 500, mb: 3 }}>
              Equipamiento con tomografía digital Cone Beam 3D, sillones ergonómicos quirúrgicos y sala de esterilización con monitoreo biológico en tiempo real.
            </Typography>
            <Button
              variant="contained"
              href="#reserva"
              onClick={() => setModalVideo(false)}
              sx={{ bgcolor: '#f59e0b', color: '#071e1d', fontWeight: 800, textTransform: 'none' }}
            >
              Conocer Nuestras Sedes en Persona
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Botón Flotante Asistente WhatsApp */}
      <BotonWhatsAppBot telefono="51999888777" nombreClinica="Clínica Dental Laurent" />
    </Box>
  );
};
