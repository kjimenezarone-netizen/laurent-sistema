import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  MenuItem,
  TextField,
  Typography,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Alert,
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { clienteHttp } from '../../api/clienteHttp';
import { Paciente } from '../../tipos/tiposPaciente';
import { EstadoCuentaPaciente, CatalogoTratamiento } from '../../tipos/tiposFinanzas';
import { FormularioCobro } from '../../componentes/caja/FormularioCobro';
import { EstadoCuentaDetalle } from '../../componentes/caja/EstadoCuentaDetalle';
import { ModalComprobantePago } from '../../componentes/caja/ModalComprobantePago';
import { usarAutenticacion } from '../../api/ContextoAutenticacion';
import { PlusCircle, Receipt } from 'lucide-react';

export const PaginaCajaFacturacion: React.FC = () => {
  const [parametros] = useSearchParams();
  const pacienteIdUrl = parametros.get('pacienteId');

  const { usuario } = usarAutenticacion();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [pacienteSeleccionadoId, setPacienteSeleccionadoId] = useState<string>(pacienteIdUrl || '');
  const [estadoCuenta, setEstadoCuenta] = useState<EstadoCuentaPaciente | null>(null);
  const [catalogo, setCatalogo] = useState<CatalogoTratamiento[]>([]);

  const [abrirModalCargo, setAbrirModalCargo] = useState(false);
  const [tratamientoSeleccionadoId, setTratamientoSeleccionadoId] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [descuento, setDescuento] = useState(0);

  const [comprobanteGenerado, setComprobanteGenerado] = useState<any>(null);
  const [abrirModalComprobante, setAbrirModalComprobante] = useState(false);

  const emitirComprobanteUltimo = async () => {
    if (!estadoCuenta || estadoCuenta.movimientos.length === 0) return;
    const ultimoAbono = estadoCuenta.movimientos.find((m) => m.tipo === 'ABONO');
    if (!ultimoAbono) return;

    try {
      const resp = await clienteHttp.get(`/finanzas/abonos/${ultimoAbono.id}/comprobante`);
      setComprobanteGenerado(resp.data);
      setAbrirModalComprobante(true);
    } catch (err) {
      console.error('Error generando comprobante:', err);
    }
  };

  const cargarPacientesYCatalogo = async () => {
    try {
      const [respPac, respCat] = await Promise.all([
        clienteHttp.get('/pacientes'),
        clienteHttp.get('/finanzas/tratamientos'),
      ]);
      setPacientes(respPac.data);
      setCatalogo(respCat.data);

      if (!pacienteSeleccionadoId && respPac.data.length > 0) {
        setPacienteSeleccionadoId(respPac.data[0].id);
      }
    } catch (err) {
      console.error('Error cargando datos de caja:', err);
    }
  };

  const cargarEstadoCuenta = async (pacId: string) => {
    if (!pacId) return;
    try {
      const resp = await clienteHttp.get(`/finanzas/pacientes/${pacId}/estado-cuenta`);
      setEstadoCuenta(resp.data);
    } catch (err) {
      console.error('Error cargando estado de cuenta:', err);
    }
  };

  useEffect(() => {
    cargarPacientesYCatalogo();
  }, []);

  useEffect(() => {
    if (pacienteSeleccionadoId) {
      cargarEstadoCuenta(pacienteSeleccionadoId);
    }
  }, [pacienteSeleccionadoId]);

  const emitirNuevoCargo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pacienteSeleccionadoId || !tratamientoSeleccionadoId) return;

    try {
      await clienteHttp.post('/finanzas/cargos', {
        pacienteId: pacienteSeleccionadoId,
        tratamientoId: tratamientoSeleccionadoId,
        cantidad,
        descuento,
        usuarioCreadorId: usuario?.id,
      });
      setAbrirModalCargo(false);
      cargarEstadoCuenta(pacienteSeleccionadoId);
    } catch (err) {
      console.error('Error emitiendo cargo:', err);
    }
  };

  const pacienteActual = pacientes.find((p) => p.id === pacienteSeleccionadoId);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <div>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0f2c2b' }}>
            Caja Registradora & Estado de Cuenta
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cobranzas con clave de idempotencia, libro mayor inmutable y cálculo exacto de saldo
          </Typography>
        </div>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<Receipt size={18} />}
            onClick={emitirComprobanteUltimo}
            sx={{ borderColor: '#0d9488', color: '#0d9488' }}
          >
            Imprimir Última Boleta / Recibo
          </Button>
          <Button
            variant="contained"
            startIcon={<PlusCircle size={18} />}
            onClick={() => setAbrirModalCargo(true)}
            disabled={!pacienteSeleccionadoId}
            sx={{ bgcolor: '#0d9488', '&:hover': { bgcolor: '#0f766e' } }}
          >
            Generar Cargo a Paciente
          </Button>
        </Box>
      </Box>

      {/* Selector de Paciente */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent sx={{ py: 2 }}>
          <TextField
            select
            label="Seleccionar Paciente para Consulta de Cuenta y Cobranza"
            value={pacienteSeleccionadoId}
            onChange={(e) => setPacienteSeleccionadoId(e.target.value)}
            fullWidth
            size="small"
          >
            {pacientes.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.nombreCompleto} — DNI: {p.numeroDocumento} ({p.telefonoMovil})
              </MenuItem>
            ))}
          </TextField>
        </CardContent>
      </Card>

      {estadoCuenta && pacienteActual && (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={7}>
            <EstadoCuentaDetalle cuenta={estadoCuenta} />
          </Grid>
          <Grid item xs={12} lg={5}>
            <FormularioCobro
              pacienteId={pacienteActual.id}
              pacienteNombre={pacienteActual.nombreCompleto}
              saldoDeudorTotal={estadoCuenta.saldoDeudor}
              alCompletarPago={() => cargarEstadoCuenta(pacienteActual.id)}
            />
          </Grid>
        </Grid>
      )}

      {/* Modal para emitir cargo a cuenta */}
      <Dialog open={abrirModalCargo} onClose={() => setAbrirModalCargo(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', color: '#0f2c2b' }}>
          Emitir Cargo de Tratamiento Realizado
        </DialogTitle>
        <DialogContent dividers>
          <form onSubmit={emitirNuevoCargo}>
            <TextField
              select
              label="Procedimiento / Tratamiento del Catálogo"
              value={tratamientoSeleccionadoId}
              onChange={(e) => setTratamientoSeleccionadoId(e.target.value)}
              fullWidth
              required
              size="small"
              sx={{ mb: 2 }}
            >
              {catalogo.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.nombre} — S/ {cat.precioBase.toFixed(2)}
                </MenuItem>
              ))}
            </TextField>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
              <TextField
                label="Cantidad"
                type="number"
                inputProps={{ min: 1 }}
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value))}
                required
                size="small"
              />
              <TextField
                label="Descuento Autorizado (S/)"
                type="number"
                inputProps={{ min: 0, step: '0.50' }}
                value={descuento}
                onChange={(e) => setDescuento(Number(e.target.value))}
                size="small"
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={() => setAbrirModalCargo(false)}>Cancelar</Button>
              <Button type="submit" variant="contained" sx={{ bgcolor: '#0d9488' }}>
                Emitir Cargo
              </Button>
            </Box>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Comprobante Electrónico */}
      <ModalComprobantePago
        abierto={abrirModalComprobante}
        alCerrar={() => setAbrirModalComprobante(false)}
        comprobante={comprobanteGenerado}
      />
    </Box>
  );
};

