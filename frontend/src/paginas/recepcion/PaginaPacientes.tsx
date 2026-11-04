import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { clienteHttp } from '../../api/clienteHttp';
import { Paciente, RegistroPacienteFormulario } from '../../tipos/tiposPaciente';
import { Search, UserPlus, FileText, Receipt, Phone } from 'lucide-react';

export const PaginaPacientes: React.FC = () => {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(false);
  const [abrirModal, setAbrirModal] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  const navigate = useNavigate();

  const [formulario, setFormulario] = useState<RegistroPacienteFormulario>({
    tipoDocumento: 'DNI',
    numeroDocumento: '',
    nombres: '',
    apellidos: '',
    fechaNacimiento: '1995-01-01',
    sexo: 'MASCULINO',
    telefonoMovil: '',
    correoElectronico: '',
    direccion: '',
    alergias: '',
  });

  const cargarPacientes = async (termino = '') => {
    setCargando(true);
    try {
      const resp = await clienteHttp.get('/pacientes', {
        params: termino ? { busqueda: termino } : {},
      });
      setPacientes(resp.data);
    } catch (err) {
      console.error('Error cargando pacientes:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPacientes();
  }, []);

  const manejarBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    cargarPacientes(busqueda);
  };

  const guardarNuevoPaciente = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorModal(null);
    try {
      await clienteHttp.post('/pacientes', formulario);
      setAbrirModal(false);
      setFormulario({
        tipoDocumento: 'DNI',
        numeroDocumento: '',
        nombres: '',
        apellidos: '',
        fechaNacimiento: '1995-01-01',
        sexo: 'MASCULINO',
        telefonoMovil: '',
        correoElectronico: '',
        direccion: '',
        alergias: '',
      });
      cargarPacientes();
    } catch (err: any) {
      setErrorModal(err.response?.data?.mensaje || 'Error al registrar al paciente.');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <div>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0f2c2b' }}>
            Padrón de Pacientes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Búsqueda, registro y acceso directo a historia clínica y cobranzas
          </Typography>
        </div>

        <Button
          variant="contained"
          startIcon={<UserPlus size={18} />}
          onClick={() => setAbrirModal(true)}
          sx={{ bgcolor: '#0d9488', '&:hover': { bgcolor: '#0f766e' } }}
        >
          Nuevo Paciente
        </Button>
      </Box>

      {/* Buscador de Pacientes */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent sx={{ py: 2 }}>
          <form onSubmit={manejarBuscar} style={{ display: 'flex', gap: '12px' }}>
            <TextField
              placeholder="Buscar por DNI, nombres o apellidos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              fullWidth
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} color="#64748b" />
                  </InputAdornment>
                ),
              }}
            />
            <Button type="submit" variant="outlined" sx={{ minWidth: 100 }}>
              Buscar
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Tabla de Pacientes */}
      <Card sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f1f5f9' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Documento</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Paciente</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Contacto</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Alergias</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Acciones Rápidas</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pacientes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: '#94a3b8' }}>
                  {cargando ? 'Cargando pacientes...' : 'No se encontraron pacientes registrados.'}
                </TableCell>
              </TableRow>
            ) : (
              pacientes.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {p.tipoDocumento}: {p.numeroDocumento}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f2c2b' }}>
                      {p.nombreCompleto}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Nacimiento: {p.fechaNacimiento}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Phone size={14} color="#0d9488" />
                      <Typography variant="body2">{p.telefonoMovil}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {p.alergias ? (
                      <Chip label={p.alergias} size="small" color="error" variant="outlined" />
                    ) : (
                      <Typography variant="caption" color="text.secondary">Ninguna</Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      title="Ver Historia Clínica & Odontograma"
                      color="primary"
                      onClick={() => navigate(`/medico/historias?pacienteId=${p.id}`)}
                    >
                      <FileText size={18} />
                    </IconButton>
                    <IconButton
                      title="Ver Estado de Cuenta & Cobrar"
                      color="success"
                      onClick={() => navigate(`/caja?pacienteId=${p.id}`)}
                    >
                      <Receipt size={18} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Modal para Registro de Nuevo Paciente */}
      <Dialog open={abrirModal} onClose={() => setAbrirModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', color: '#0f2c2b' }}>
          Registrar Nuevo Paciente
        </DialogTitle>
        <DialogContent dividers>
          {errorModal && <Alert severity="error" sx={{ mb: 2 }}>{errorModal}</Alert>}

          <form onSubmit={guardarNuevoPaciente}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 2, mb: 2 }}>
              <TextField
                select
                SelectProps={{ native: true }}
                label="Tipo Doc."
                value={formulario.tipoDocumento}
                onChange={(e) => setFormulario({ ...formulario, tipoDocumento: e.target.value })}
                size="small"
              >
                <option value="DNI">DNI</option>
                <option value="CARNET_EXTRANJERIA">C. Extranjería</option>
                <option value="PASAPORTE">Pasaporte</option>
              </TextField>

              <TextField
                label="Número de Documento"
                value={formulario.numeroDocumento}
                onChange={(e) => setFormulario({ ...formulario, numeroDocumento: e.target.value })}
                required
                size="small"
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
              <TextField
                label="Nombres"
                value={formulario.nombres}
                onChange={(e) => setFormulario({ ...formulario, nombres: e.target.value })}
                required
                size="small"
              />
              <TextField
                label="Apellidos"
                value={formulario.apellidos}
                onChange={(e) => setFormulario({ ...formulario, apellidos: e.target.value })}
                required
                size="small"
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
              <TextField
                label="Fecha de Nacimiento"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formulario.fechaNacimiento}
                onChange={(e) => setFormulario({ ...formulario, fechaNacimiento: e.target.value })}
                required
                size="small"
              />
              <TextField
                label="Teléfono Móvil"
                value={formulario.telefonoMovil}
                onChange={(e) => setFormulario({ ...formulario, telefonoMovil: e.target.value })}
                required
                size="small"
              />
            </Box>

            <TextField
              label="Correo Electrónico"
              type="email"
              value={formulario.correoElectronico}
              onChange={(e) => setFormulario({ ...formulario, correoElectronico: e.target.value })}
              fullWidth
              size="small"
              sx={{ mb: 2 }}
            />

            <TextField
              label="Alergias Conocidas (Penicilina, Látex, etc.)"
              value={formulario.alergias}
              onChange={(e) => setFormulario({ ...formulario, alergias: e.target.value })}
              placeholder="Ej. Alergia a la anestesia local"
              fullWidth
              size="small"
              sx={{ mb: 3 }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={() => setAbrirModal(false)}>Cancelar</Button>
              <Button type="submit" variant="contained" sx={{ bgcolor: '#0d9488' }}>
                Guardar Paciente
              </Button>
            </Box>
          </form>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

