import React, { useState } from 'react';
import {
  Box,
  Fab,
  Paper,
  Typography,
  IconButton,
  Button,
  Stack,
  Avatar,
  Fade,
} from '@mui/material';
import { MessageCircle, X, Send, CheckCheck } from 'lucide-react';

interface Props {
  telefono?: string;
  nombreClinica?: string;
}

export const BotonWhatsAppBot: React.FC<Props> = ({
  telefono = '51999888777',
  nombreClinica = 'Clínica Dental Laurent',
}) => {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState<Array<{ remitente: 'bot' | 'usuario'; texto: string }>>([
    { remitente: 'bot', texto: `¡Hola! 👋 Bienvenido a ${nombreClinica}.` },
    { remitente: 'bot', texto: '¿En qué te podemos ayudar hoy? Elige una opción rápida:' },
  ]);

  const opciones = [
    { etiqueta: '🗓️ Agendar una cita', consulta: 'Hola, deseo agendar una consulta odontológica en Clínica Laurent.' },
    { etiqueta: '🦷 Tratamientos y precios', consulta: 'Hola, quisiera información sobre los tratamientos y tarifas.' },
    { etiqueta: '📍 Ubicación y horarios', consulta: 'Hola, ¿cuál es la dirección exacta y horario de atención?' },
    { etiqueta: '💬 Hablar con una asesora', consulta: 'Hola, necesito comunicarme con una asesora de la clínica.' },
  ];

  const seleccionarOpcion = (consulta: string, etiqueta: string) => {
    setMensajes((prev) => [
      ...prev,
      { remitente: 'usuario', texto: etiqueta },
      { remitente: 'bot', texto: '¡Excelente! Te estoy redirigiendo a nuestro WhatsApp oficial para atenderte de inmediato...' },
    ]);

    setTimeout(() => {
      const url = `https://wa.me/${telefono}?text=${encodeURIComponent(consulta)}`;
      window.open(url, '_blank');
    }, 1200);
  };

  const abrirWhatsAppDirecto = () => {
    const url = `https://wa.me/${telefono}?text=${encodeURIComponent('Hola, me comunico desde la web de Clínica Laurent.')}`;
    window.open(url, '_blank');
  };

  return (
    <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
      {/* Ventana del Bot de WhatsApp */}
      <Fade in={abierto}>
        <Paper
          elevation={8}
          sx={{
            display: abierto ? 'flex' : 'none',
            flexDirection: 'column',
            width: { xs: 320, sm: 360 },
            height: 480,
            borderRadius: 4,
            overflow: 'hidden',
            mb: 2,
            boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
          }}
        >
          {/* Cabecera estilo WhatsApp */}
          <Box
            sx={{
              bgcolor: '#075e54',
              color: '#ffffff',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                sx={{ bgcolor: '#25d366', color: '#ffffff', width: 42, height: 42, fontWeight: 'bold' }}
              >
                L
              </Avatar>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                  {nombreClinica}
                </Typography>
                <Typography variant="caption" sx={{ color: '#86efac', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 8, height: 8, bgcolor: '#22c55e', borderRadius: '50%' }} /> En línea
                </Typography>
              </Box>
            </Box>
            <IconButton size="small" onClick={() => setAbierto(false)} sx={{ color: '#ffffff' }}>
              <X size={20} />
            </IconButton>
          </Box>

          {/* Área de Mensajes */}
          <Box
            sx={{
              flex: 1,
              p: 2,
              bgcolor: '#efeae2',
              backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
              backgroundSize: '16px 16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
            }}
          >
            {mensajes.map((m, idx) => (
              <Box
                key={idx}
                sx={{
                  alignSelf: m.remitente === 'usuario' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  bgcolor: m.remitente === 'usuario' ? '#dcf8c6' : '#ffffff',
                  p: 1.5,
                  borderRadius: 2,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                }}
              >
                <Typography variant="body2" sx={{ color: '#1f2937', fontSize: 13.5 }}>
                  {m.texto}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
                  <CheckCheck size={14} color="#3b82f6" />
                </Box>
              </Box>
            ))}

            {/* Opciones de respuesta rápida */}
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 'bold', mt: 1 }}>
              Opciones disponibles:
            </Typography>
            <Stack spacing={1}>
              {opciones.map((op, i) => (
                <Button
                  key={i}
                  variant="outlined"
                  size="small"
                  onClick={() => seleccionarOpcion(op.consulta, op.etiqueta)}
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    bgcolor: '#ffffff',
                    borderColor: '#25d366',
                    color: '#075e54',
                    fontWeight: 600,
                    borderRadius: 2,
                    fontSize: 12.5,
                    py: 0.8,
                    '&:hover': { bgcolor: '#f0fdf4', borderColor: '#16a34a' },
                  }}
                >
                  {op.etiqueta}
                </Button>
              ))}
            </Stack>
          </Box>

          {/* Pie / Entrada */}
          <Box sx={{ p: 1.5, bgcolor: '#f0f2f5', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<Send size={16} />}
              onClick={abrirWhatsAppDirecto}
              sx={{
                bgcolor: '#25d366',
                color: '#ffffff',
                fontWeight: 'bold',
                textTransform: 'none',
                borderRadius: 3,
                '&:hover': { bgcolor: '#16a34a' },
              }}
            >
              Abrir chat en WhatsApp
            </Button>
          </Box>
        </Paper>
      </Fade>

      {/* Botón Flotante */}
      <Fab
        onClick={() => setAbierto(!abierto)}
        sx={{
          bgcolor: '#25d366',
          color: '#ffffff',
          width: 60,
          height: 60,
          boxShadow: '0 6px 20px rgba(37,211,102,0.4)',
          '&:hover': { bgcolor: '#16a34a' },
        }}
        aria-label="whatsapp"
      >
        {abierto ? <X size={28} /> : <MessageCircle size={32} />}
      </Fab>
    </Box>
  );
};

