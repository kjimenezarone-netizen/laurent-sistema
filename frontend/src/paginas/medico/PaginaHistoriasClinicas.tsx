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
  Divider,
  Grid,
  MenuItem,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { clienteHttp } from '../../api/clienteHttp';
import { Paciente } from '../../tipos/tiposPaciente';
import { AtencionClinica, HallazgoDental, RegistroAtencionFormulario } from '../../tipos/tiposClinica';
import { OdontogramaFdi } from '../../componentes/odontograma/OdontogramaFdi';
import { PeriodontogramaFdi } from '../../componentes/periodontograma/PeriodontogramaFdi';
import { usarAutenticacion } from '../../api/ContextoAutenticacion';
import { FilePlus, ShieldCheck, Printer } from 'lucide-react';
import { Tabs, Tab } from '@mui/material';

export const PaginaHistoriasClinicas: React.FC = () => {
  const [parametros] = useSearchParams();
  const pacienteIdUrl = parametros.get('pacienteId');

  const { usuario } = usarAutenticacion();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [pacienteId, setPacienteId] = useState<string>(pacienteIdUrl || '');
  const [hallazgos, setHallazgos] = useState<HallazgoDental[]>([]);
  const [atenciones, setAtenciones] = useState<AtencionClinica[]>([]);
  const [registrosPeriodontales, setRegistrosPeriodontales] = useState<any[]>([]);
  const [pestañaActiva, setPestañaActiva] = useState<number>(0);

  const [abrirModalAtencion, setAbrirModalAtencion] = useState(false);
  const [formularioAtencion, setFormularioAtencion] = useState<RegistroAtencionFormulario>({
    pacienteId: '',
    odontologoId: usuario?.odontologoId || '',
    motivoConsulta: '',
    enfermedadActual: '',
    diagnosticoPrincipal: '',
    diagnosticoCie10: 'K02.1',
    notasEvolucion: '',
    indicacionesReceta: '',
    firmar: true,
  });

  const cargarPacientes = async () => {
    try {
      const resp = await clienteHttp.get('/pacientes');
      setPacientes(resp.data);
      if (!pacienteId && resp.data.length > 0) {
        setPacienteId(resp.data[0].id);
      }
    } catch (err) {
      console.error('Error cargando pacientes:', err);
    }
  };

  const cargarClinica = async (pacId: string) => {
    if (!pacId) return;
    try {
      const [respHallazgos, respAtenciones, respPeriodonto] = await Promise.all([
        clienteHttp.get(`/clinica/pacientes/${pacId}/odontograma`),
        clienteHttp.get(`/clinica/pacientes/${pacId}/atenciones`),
        clienteHttp.get(`/clinica/pacientes/${pacId}/periodontograma`),
      ]);
      setHallazgos(respHallazgos.data);
      setAtenciones(respAtenciones.data);
      setRegistrosPeriodontales(respPeriodonto.data);
    } catch (err) {
      console.error('Error cargando datos clínicos:', err);
    }
  };

  useEffect(() => {
    cargarPacientes();
  }, []);

  useEffect(() => {
    if (pacienteId) {
      cargarClinica(pacienteId);
    }
  }, [pacienteId]);

  const manejarGuardarHallazgo = async (nuevoHallazgo: HallazgoDental) => {
    if (!pacienteId) return;
    try {
      await clienteHttp.post('/clinica/odontograma/hallazgos', {
        ...nuevoHallazgo,
        pacienteId,
        odontologoId: usuario?.odontologoId || 'e0000000-0000-0000-0000-000000000001',
      });
      cargarClinica(pacienteId);
    } catch (err) {
      console.error('Error guardando hallazgo dental:', err);
    }
  };

  const guardarAtencionClinica = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await clienteHttp.post('/clinica/atenciones', {
        ...formularioAtencion,
        pacienteId,
        odontologoId: usuario?.odontologoId || 'e0000000-0000-0000-0000-000000000001',
      });
      setAbrirModalAtencion(false);
      setFormularioAtencion({
        pacienteId: '',
        odontologoId: usuario?.odontologoId || '',
        motivoConsulta: '',
        enfermedadActual: '',
        diagnosticoPrincipal: '',
        diagnosticoCie10: 'K02.1',
        notasEvolucion: '',
        indicacionesReceta: '',
        firmar: true,
      });
      cargarClinica(pacienteId);
    } catch (err) {
      console.error('Error registrando atención clínica:', err);
    }
  };

  const pacienteSeleccionado = pacientes.find((p) => p.id === pacienteId);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <div>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0f2c2b' }}>
            Historia Clínica & Odontograma Anatómico
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Registro estructurado de hallazgos por pieza y evolución clínica firmada
          </Typography>
        </div>

        <Button
          variant="contained"
          startIcon={<FilePlus size={18} />}
          onClick={() => setAbrirModalAtencion(true)}
          disabled={!pacienteId}
          sx={{ bgcolor: '#0d9488', '&:hover': { bgcolor: '#0f766e' } }}
        >
          Nueva Atención Médica
        </Button>
      </Box>

      {/* Selector de Paciente */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent sx={{ py: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            select
            label="Selecciona la Historia Clínica del Paciente"
            value={pacienteId}
            onChange={(e) => setPacienteId(e.target.value)}
            fullWidth
            size="small"
          >
            {pacientes.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.nombreCompleto} — DNI: {p.numeroDocumento} {p.alergias ? `(Alergias: ${p.alergias})` : ''}
              </MenuItem>
            ))}
          </TextField>

          <Button
            variant="outlined"
            startIcon={<Printer size={18} />}
            onClick={() => window.print()}
            sx={{ minWidth: 140, height: 40 }}
          >
            Imprimir
          </Button>
        </CardContent>
      </Card>

      {/* Pestañas Clínicas */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={pestañaActiva} onChange={(_, val) => setPestañaActiva(val)}>
          <Tab label="1. Odontograma Anatómico FDI" sx={{ fontWeight: 'bold' }} />
          <Tab label="2. Periodontograma (6 Sitios)" sx={{ fontWeight: 'bold' }} />
          <Tab label="3. Evolución & Atenciones Clínicas" sx={{ fontWeight: 'bold' }} />
        </Tabs>
      </Box>

      {/* Pestaña 0: Odontograma FDI Interactivo */}
      {pestañaActiva === 0 && (
        <Box sx={{ mb: 4 }}>
          <OdontogramaFdi
            hallazgos={hallazgos}
            alRegistrarHallazgo={manejarGuardarHallazgo}
          />
        </Box>
      )}

      {/* Pestaña 1: Periodontograma */}
      {pestañaActiva === 1 && (
        <Box sx={{ mb: 4 }}>
          <PeriodontogramaFdi
            pacienteId={pacienteId}
            registrosExistentes={registrosPeriodontales}
            alGuardarExitoso={() => cargarClinica(pacienteId)}
          />
        </Box>
      )}

      {/* Pestaña 2: Historial de Atenciones Clínicas */}
      {pestañaActiva === 2 && (
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0f2c2b', mb: 2 }}>
            Evoluciones y Atenciones Registradas
          </Typography>

          {atenciones.length === 0 ? (
            <Alert severity="info">
              Este paciente aún no tiene evoluciones o atenciones clínicas registradas. Haz clic en "Nueva Atención Médica" para ingresar la primera consulta.
            </Alert>
          ) : (
            atenciones.map((a) => (
              <Box key={a.id} sx={{ p: 2, mb: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#0f2c2b' }}>
                    {a.diagnosticoPrincipal} {a.diagnosticoCie10 ? `(${a.diagnosticoCie10})` : ''}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip
                      icon={<ShieldCheck size={14} />}
                      label={a.estado}
                      color={a.estado === 'FIRMADA' ? 'success' : 'default'}
                      size="small"
                    />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(a.fechaCreacion).toLocaleString('es-PE')}
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Motivo de consulta:</strong> {a.motivoConsulta}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, whiteSpace: 'pre-line' }}>
                  <strong>Notas de evolución:</strong> {a.notasEvolucion}
                </Typography>

                {a.indicacionesReceta && (
                  <Typography variant="caption" sx={{ display: 'block', color: '#0369a1', bgcolor: '#e0f2fe', p: 1, borderRadius: 1 }}>
                    <strong>Indicaciones farmacológicas:</strong> {a.indicacionesReceta}
                  </Typography>
                )}

                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">
                    Profesional: {a.odontologoNombre}
                  </Typography>
                  {a.fechaFirma && (
                    <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 'bold' }}>
                      Firmado Digitalmente: {new Date(a.fechaFirma).toLocaleString('es-PE')}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))
          )}
        </CardContent>
      </Card>
      )}

      {/* Modal para Registrar Atención Médica */}
      <Dialog open={abrirModalAtencion} onClose={() => setAbrirModalAtencion(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', color: '#0f2c2b' }}>
          Registrar Nueva Atención Clínica & Evolución
        </DialogTitle>
        <DialogContent dividers>
          <form onSubmit={guardarAtencionClinica}>
            <TextField
              label="Motivo de Consulta"
              value={formularioAtencion.motivoConsulta}
              onChange={(e) => setFormularioAtencion({ ...formularioAtencion, motivoConsulta: e.target.value })}
              fullWidth
              required
              size="small"
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 2, mb: 2 }}>
              <TextField
                label="Diagnóstico Principal"
                value={formularioAtencion.diagnosticoPrincipal}
                onChange={(e) => setFormularioAtencion({ ...formularioAtencion, diagnosticoPrincipal: e.target.value })}
                required
                size="small"
                placeholder="Ej. Caries dentinaria oclusal pieza 16"
              />
              <TextField
                label="Código CIE-10"
                value={formularioAtencion.diagnosticoCie10}
                onChange={(e) => setFormularioAtencion({ ...formularioAtencion, diagnosticoCie10: e.target.value })}
                size="small"
              />
            </Box>

            <TextField
              label="Evolución / Procedimiento Realizado"
              multiline
              rows={4}
              value={formularioAtencion.notasEvolucion}
              onChange={(e) => setFormularioAtencion({ ...formularioAtencion, notasEvolucion: e.target.value })}
              required
              fullWidth
              sx={{ mb: 2 }}
              placeholder="Describa el acto clínico realizado, anestesia aplicada, materiales y técnicas empleadas..."
            />

            <TextField
              label="Indicaciones y Receta Médica"
              multiline
              rows={2}
              value={formularioAtencion.indicacionesReceta}
              onChange={(e) => setFormularioAtencion({ ...formularioAtencion, indicacionesReceta: e.target.value })}
              fullWidth
              sx={{ mb: 3 }}
              placeholder="Amoxicilina 500mg cada 8 horas por 5 días..."
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={() => setAbrirModalAtencion(false)}>Cancelar</Button>
              <Button type="submit" variant="contained" sx={{ bgcolor: '#0d9488' }}>
                Guardar y Firmar Atención
              </Button>
            </Box>
          </form>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

