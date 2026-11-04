import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  TextField,
  Typography,
  Alert,
  IconButton,
} from '@mui/material';
import { clienteHttp } from '../../api/clienteHttp';
import { Cita, ReservaCitaFormulario, SillonDental } from '../../tipos/tiposAgenda';
import { Paciente } from '../../tipos/tiposPaciente';
import { Calendar, Plus, Clock, User, CheckCircle, XCircle, AlertCircle, MessageCircle } from 'lucide-react';

export const PaginaAgenda: React.FC = () => {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [sillones, setSillones] = useState<SillonDental[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [odontologos, setOdontologos] = useState<any[]>([]);

  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const [abrirModal, setAbrirModal] = useState(false);
  const [errorCita, setErrorCita] = useState<string | null>(null);

  const [formulario, setFormulario] = useState<ReservaCitaFormulario>({
    pacienteId: '',
    odontologoId: '',
    sillonId: '',
    fechaHoraInicio: `${new Date().toISOString().split('T')[0]}T09:00:00`,
    duracionMinutos: 30,
    motivo: 'Consulta de Evaluación y Diagnóstico',
  });

  const cargarDatos = async () => {
    try {
      const inicio = `${fechaSeleccionada}T00:00:00Z`;
      const fin = `${fechaSeleccionada}T23:59:59Z`;

      const [respCitas, respSillones, respPacientes, respOdontologos] = await Promise.all([
        clienteHttp.get('/citas', { params: { inicio, fin } }),
        clienteHttp.get('/citas/sillones'),
        clienteHttp.get('/pacientes'),
        clienteHttp.get('/publico/odontologos'),
      ]);

      setCitas(respCitas.data);
      setSillones(respSillones.data);
      setPacientes(respPacientes.data);
      setOdontologos(respOdontologos.data);
    } catch (err) {
      console.error('Error al cargar agenda:', err);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [fechaSeleccionada]);

  const guardarCita = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorCita(null);

    try {
      await clienteHttp.post('/citas/reservar', {
        ...formulario,
        fechaHoraInicio: `${formulario.fechaHoraInicio}:00Z`,
      });
      setAbrirModal(false);
      cargarDatos();
    } catch (err: any) {
      setErrorCita(
        err.response?.data?.mensaje ||
        'Conflicto de horario: El sillón u odontólogo ya se encuentran ocupados.'
      );
    }
  };

  const cambiarEstado = async (citaId: string, nuevoEstado: string) => {
    try {
      await clienteHttp.patch(`/citas/${citaId}/estado`, {
        nuevoEstado,
      });
      cargarDatos();
    } catch (err) {
      console.error('Error cambiando estado:', err);
    }
  };

  const enviarRecordatorioWhatsApp = (cita: Cita) => {
    const paciente = pacientes.find((p) => p.id === cita.pacienteId);
    const telefono = paciente?.telefonoMovil ? paciente.telefonoMovil.replace(/\D/g, '') : '';
    const numFinal = telefono.length > 0 ? (telefono.startsWith('51') ? telefono : `51${telefono}`) : '51999888777';
    const fechaHora = new Date(cita.fechaHoraInicio);
    const fecha = fechaHora.toLocaleDateString();
    const hora = fechaHora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const mensaje = `Hola ${cita.pacienteNombreCompleto}, le recordamos su cita odontológica en Clínica Dental Laurent para el día ${fecha} a las ${hora} con el ${cita.odontologoNombreCompleto}. Por favor confirme su asistencia respondiendo a este mensaje. ¡Muchas gracias!`;
    window.open(`https://wa.me/${numFinal}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  const obtenerColorEstado = (codigo: string) => {
    switch (codigo) {
      case 'PROGRAMADA': return 'primary';
      case 'CONFIRMADA': return 'info';
      case 'PRESENTE': return 'warning';
      case 'EN_ATENCION': return 'secondary';
      case 'COMPLETADA': return 'success';
      case 'CANCELADA': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <div>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0f2c2b' }}>
            Agenda Diaria de Turnos & Citas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Programación de pacientes con validación estricta anti-colisión
          </Typography>
        </div>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            type="date"
            value={fechaSeleccionada}
            onChange={(e) => setFechaSeleccionada(e.target.value)}
            size="small"
          />
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => setAbrirModal(true)}
            sx={{ bgcolor: '#0d9488', '&:hover': { bgcolor: '#0f766e' } }}
          >
            Nueva Cita
          </Button>
        </Box>
      </Box>

      {/* Tarjetas de Citas del Día */}
      <Grid container spacing={2}>
        {citas.length === 0 ? (
          <Grid item xs={12}>
            <Card sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
              <Calendar size={40} color="#94a3b8" style={{ marginBottom: 12 }} />
              <Typography variant="h6" color="text.secondary">
                No hay citas programadas para el {fechaSeleccionada}
              </Typography>
            </Card>
          </Grid>
        ) : (
          citas.map((cita) => (
            <Grid item xs={12} md={6} lg={4} key={cita.id}>
              <Card sx={{ borderRadius: 3, borderLeft: '5px solid #0d9488', boxShadow: '0 3px 12px rgba(0,0,0,0.06)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <Clock size={16} color="#0d9488" />
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {new Date(cita.fechaHoraInicio).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })} - {new Date(cita.fechaHoraFin).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Box>
                    <Chip
                      label={cita.estadoCodigo}
                      color={obtenerColorEstado(cita.estadoCodigo)}
                      size="small"
                    />
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f2c2b' }}>
                    {cita.pacienteNombreCompleto}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Motivo: <strong>{cita.motivo}</strong>
                  </Typography>

                  <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, mb: 2 }}>
                    <Typography variant="caption" sx={{ display: 'block', color: '#475569' }}>
                      Odontólogo: <strong>{cita.odontologoNombreCompleto}</strong>
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', color: '#475569' }}>
                      Sillón: <strong>{cita.sillonNombre}</strong>
                    </Typography>
                  </Box>

                  {/* Acciones de Transición de Estados */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {cita.estadoCodigo === 'PROGRAMADA' && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="warning"
                        onClick={() => cambiarEstado(cita.id, 'PRESENTE')}
                      >
                        Marcar Presente
                      </Button>
                    )}
                    {cita.estadoCodigo === 'PRESENTE' && (
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={() => cambiarEstado(cita.id, 'EN_ATENCION')}
                      >
                        Pasar al Sillón
                      </Button>
                    )}
                    {cita.estadoCodigo === 'EN_ATENCION' && (
                      <Button
                        size="small"
                        variant="contained"
                        sx={{ bgcolor: '#0d9488' }}
                        onClick={() => cambiarEstado(cita.id, 'COMPLETADA')}
                      >
                        Finalizar Atención
                      </Button>
                    )}
                    {cita.estadoCodigo !== 'CANCELADA' && cita.estadoCodigo !== 'COMPLETADA' && (
                      <Button
                        size="small"
                        color="error"
                        onClick={() => cambiarEstado(cita.id, 'CANCELADA')}
                      >
                        Cancelar
                      </Button>
                    )}
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{ color: '#16a34a', borderColor: '#22c55e', '&:hover': { bgcolor: '#f0fdf4' } }}
                      startIcon={<MessageCircle size={14} />}
                      onClick={() => enviarRecordatorioWhatsApp(cita)}
                    >
                      WhatsApp
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Modal para Agendar Cita */}
      <Dialog open={abrirModal} onClose={() => setAbrirModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', color: '#0f2c2b' }}>
          Reservar Cita Dental
        </DialogTitle>
        <DialogContent dividers>
          {errorCita && <Alert severity="error" sx={{ mb: 2 }}>{errorCita}</Alert>}

          <form onSubmit={guardarCita}>
            <TextField
              select
              label="Paciente"
              value={formulario.pacienteId}
              onChange={(e) => setFormulario({ ...formulario, pacienteId: e.target.value })}
              fullWidth
              required
              size="small"
              sx={{ mb: 2 }}
            >
              {pacientes.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.nombreCompleto} ({p.numeroDocumento})
                </MenuItem>
              ))}
            </TextField>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
              <TextField
                select
                label="Odontólogo"
                value={formulario.odontologoId}
                onChange={(e) => setFormulario({ ...formulario, odontologoId: e.target.value })}
                required
                size="small"
              >
                {odontologos.map((o) => (
                  <MenuItem key={o.id} value={o.id}>
                    Dr. {o.usuario?.nombres} {o.usuario?.apellidos}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Sillón Dental"
                value={formulario.sillonId}
                onChange={(e) => setFormulario({ ...formulario, sillonId: e.target.value })}
                required
                size="small"
              >
                {sillones.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.nombre} ({s.codigo})
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 2, mb: 2 }}>
              <TextField
                label="Fecha y Hora de Inicio"
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                value={formulario.fechaHoraInicio}
                onChange={(e) => setFormulario({ ...formulario, fechaHoraInicio: e.target.value })}
                required
                size="small"
              />

              <TextField
                select
                label="Duración"
                value={formulario.duracionMinutos}
                onChange={(e) => setFormulario({ ...formulario, duracionMinutos: Number(e.target.value) })}
                size="small"
              >
                <MenuItem value={30}>30 min</MenuItem>
                <MenuItem value={45}>45 min</MenuItem>
                <MenuItem value={60}>60 min</MenuItem>
                <MenuItem value={90}>90 min</MenuItem>
              </TextField>
            </Box>

            <TextField
              label="Motivo de la Cita"
              value={formulario.motivo}
              onChange={(e) => setFormulario({ ...formulario, motivo: e.target.value })}
              fullWidth
              required
              size="small"
              sx={{ mb: 3 }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={() => setAbrirModal(false)}>Cancelar</Button>
              <Button type="submit" variant="contained" sx={{ bgcolor: '#0d9488' }}>
                Confirmar Reserva
              </Button>
            </Box>
          </form>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

