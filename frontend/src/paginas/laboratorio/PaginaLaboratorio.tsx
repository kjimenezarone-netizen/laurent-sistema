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
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { clienteHttp } from '../../api/clienteHttp';
import { usarAutenticacion } from '../../api/ContextoAutenticacion';
import { Plus, CheckCircle, Truck, Clock } from 'lucide-react';

export const PaginaLaboratorio: React.FC = () => {
  const { usuario } = usarAutenticacion();
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [abrirModal, setAbrirModal] = useState(false);

  const [formulario, setFormulario] = useState({
    pacienteId: '',
    tipoTrabajo: 'Corona de Zirconio Monolítico',
    colorGuia: 'A2',
    piezaFdi: 16,
    fechaEntregaEsperada: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    costoLaboratorio: 180,
    observaciones: 'Ajuste marginal preciso y anatomía oclusal marcada',
  });

  const cargarDatos = async () => {
    try {
      const [respOrdenes, respPacientes] = await Promise.all([
        clienteHttp.get('/laboratorio/ordenes'),
        clienteHttp.get('/pacientes'),
      ]);
      setOrdenes(respOrdenes.data);
      setPacientes(respPacientes.data);
    } catch (err) {
      console.error('Error cargando laboratorio:', err);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const guardarOrden = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await clienteHttp.post('/laboratorio/ordenes', {
        ...formulario,
        odontologoId: usuario?.odontologoId || 'e0000000-0000-0000-0000-000000000001',
      });
      setAbrirModal(false);
      cargarDatos();
    } catch (err) {
      console.error('Error creando orden de laboratorio:', err);
    }
  };

  const actualizarEstado = async (ordenId: string, nuevoEstado: string) => {
    try {
      await clienteHttp.patch(`/laboratorio/ordenes/${ordenId}/estado`, null, {
        params: { nuevoEstado },
      });
      cargarDatos();
    } catch (err) {
      console.error('Error actualizando estado:', err);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <div>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0f2c2b' }}>
            Órdenes de Trabajo para Laboratorio Dental
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Seguimiento de prótesis fijas, coronas, incrustaciones y férulas de descarga
          </Typography>
        </div>

        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => setAbrirModal(true)}
          sx={{ bgcolor: '#0d9488', '&:hover': { bgcolor: '#0f766e' } }}
        >
          Nueva Orden Protésica
        </Button>
      </Box>

      <Card sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f1f5f9' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Paciente</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Trabajo Solicitado</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Pieza FDI / Color</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Fecha Esperada</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Estado</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ordenes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, color: '#94a3b8' }}>
                  No hay órdenes de laboratorio activas en este momento.
                </TableCell>
              </TableRow>
            ) : (
              ordenes.map((ord) => (
                <TableRow key={ord.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {ord.paciente?.nombres} {ord.paciente?.apellidos}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      DNI: {ord.paciente?.numeroDocumento}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{ord.tipoTrabajo}</Typography>
                    <Typography variant="caption" color="text.secondary">{ord.laboratorio?.razonSocial}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={`Pieza: ${ord.piezaFdi || '-'}`} size="small" variant="outlined" sx={{ mr: 0.5 }} />
                    <Chip label={`Color: ${ord.colorGuia || '-'}`} size="small" color="warning" variant="outlined" />
                  </TableCell>
                  <TableCell>{ord.fechaEntregaEsperada}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={ord.estado}
                      size="small"
                      color={
                        ord.estado === 'RECIBIDO' ? 'success'
                        : ord.estado === 'EN_PROCESO' ? 'info'
                        : 'warning'
                      }
                    />
                  </TableCell>
                  <TableCell align="center">
                    {ord.estado === 'ENVIADO' && (
                      <Button size="small" onClick={() => actualizarEstado(ord.id, 'EN_PROCESO')}>
                        En Confección
                      </Button>
                    )}
                    {ord.estado === 'EN_PROCESO' && (
                      <Button size="small" color="success" onClick={() => actualizarEstado(ord.id, 'RECIBIDO')}>
                        Marcar Recibido
                      </Button>
                    )}
                    {ord.estado === 'RECIBIDO' && (
                      <Button size="small" color="primary" onClick={() => actualizarEstado(ord.id, 'INSTALADO')}>
                        Instalado en Boca
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Modal para Crear Orden */}
      <Dialog open={abrirModal} onClose={() => setAbrirModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', color: '#0f2c2b' }}>
          Nueva Orden de Trabajo para Laboratorio
        </DialogTitle>
        <DialogContent dividers>
          <form onSubmit={guardarOrden}>
            <TextField
              select
              label="Paciente"
              value={formulario.pacienteId}
              onChange={(e) => setFormulario({ ...formulario, pacienteId: e.target.value })}
              required
              fullWidth
              size="small"
              sx={{ mb: 2 }}
            >
              {pacientes.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.nombreCompleto} ({p.numeroDocumento})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Tipo de Trabajo Solicitado"
              value={formulario.tipoTrabajo}
              onChange={(e) => setFormulario({ ...formulario, tipoTrabajo: e.target.value })}
              required
              fullWidth
              size="small"
              sx={{ mb: 2 }}
              placeholder="Corona Zirconio, Prótesis Total, Férula..."
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, mb: 2 }}>
              <TextField
                label="Pieza FDI"
                type="number"
                value={formulario.piezaFdi}
                onChange={(e) => setFormulario({ ...formulario, piezaFdi: Number(e.target.value) })}
                size="small"
              />
              <TextField
                label="Color Guía VITA"
                value={formulario.colorGuia}
                onChange={(e) => setFormulario({ ...formulario, colorGuia: e.target.value })}
                size="small"
              />
              <TextField
                label="Fecha Entrega"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formulario.fechaEntregaEsperada}
                onChange={(e) => setFormulario({ ...formulario, fechaEntregaEsperada: e.target.value })}
                size="small"
              />
            </Box>

            <TextField
              label="Indicaciones y Observaciones Técnicas"
              multiline
              rows={2}
              value={formulario.observaciones}
              onChange={(e) => setFormulario({ ...formulario, observaciones: e.target.value })}
              fullWidth
              size="small"
              sx={{ mb: 3 }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={() => setAbrirModal(false)}>Cancelar</Button>
              <Button type="submit" variant="contained" sx={{ bgcolor: '#0d9488' }}>
                Emitir Orden al Taller
              </Button>
            </Box>
          </form>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

