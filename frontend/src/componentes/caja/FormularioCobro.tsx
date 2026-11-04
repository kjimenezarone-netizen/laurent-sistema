import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Alert,
  Divider,
} from '@mui/material';
import { clienteHttp } from '../../api/clienteHttp';
import { usarAutenticacion } from '../../api/ContextoAutenticacion';

interface FormularioCobroProps {
  pacienteId: string;
  pacienteNombre: string;
  saldoDeudorTotal: number;
  alCompletarPago: () => void;
}

export const FormularioCobro: React.FC<FormularioCobroProps> = ({
  pacienteId,
  pacienteNombre,
  saldoDeudorTotal,
  alCompletarPago,
}) => {
  const { usuario } = usarAutenticacion();
  const [montoAbonar, setMontoAbonar] = useState<string>(saldoDeudorTotal > 0 ? saldoDeudorTotal.toFixed(2) : '0.00');
  const [medioPago, setMedioPago] = useState<string>('EFECTIVO');
  const [dineroRecibido, setDineroRecibido] = useState<string>('');
  const [numeroOperacion, setNumeroOperacion] = useState<string>('');
  const [procesando, setProcesando] = useState<boolean>(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  // Generador de clave de idempotencia única por formulario
  const [claveIdempotencia] = useState<string>(() => 'IDEMP-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9));

  // Calculadora de vuelto en vivo
  const montoNum = parseFloat(montoAbonar) || 0;
  const recibidoNum = parseFloat(dineroRecibido) || 0;
  const vuelto = medioPago === 'EFECTIVO' && recibidoNum > montoNum ? (recibidoNum - montoNum).toFixed(2) : '0.00';

  const manejarEnvioPago = async (e: React.FormEvent) => {
    e.preventDefault();
    if (montoNum <= 0) {
      setMensajeError('El monto a cobrar debe ser mayor a S/ 0.00');
      return;
    }

    setProcesando(true);
    setMensajeError(null);
    setMensajeExito(null);

    try {
      await clienteHttp.post(
        '/finanzas/abonos',
        {
          pacienteId,
          monto: montoNum,
          medioPago,
          numeroOperacion: numeroOperacion || undefined,
          claveIdempotencia,
          cajeroId: usuario?.id,
        },
        {
          headers: {
            'Idempotency-Key': claveIdempotencia,
          },
        }
      );

      setMensajeExito(`Cobro de S/ ${montoNum.toFixed(2)} procesado con éxito.`);
      setTimeout(() => {
        alCompletarPago();
      }, 1200);
    } catch (err: any) {
      setMensajeError(err.response?.data?.mensaje || 'Error al procesar el pago.');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 18px rgba(0,0,0,0.06)' }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0f2c2b', mb: 1 }}>
          Caja Registradora: Cobro de Servicios
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Paciente: <strong>{pacienteNombre}</strong> | Saldo Deudor: <strong style={{ color: '#dc2626' }}>S/ {saldoDeudorTotal.toFixed(2)}</strong>
        </Typography>

        {mensajeExito && <Alert severity="success" sx={{ mb: 2 }}>{mensajeExito}</Alert>}
        {mensajeError && <Alert severity="error" sx={{ mb: 2 }}>{mensajeError}</Alert>}

        <form onSubmit={manejarEnvioPago}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 2 }}>
            <TextField
              label="Monto a Cobrar (S/ PEN)"
              type="number"
              inputProps={{ step: '0.10', min: '0.10' }}
              value={montoAbonar}
              onChange={(e) => setMontoAbonar(e.target.value)}
              required
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel id="medio-pago-label">Medio de Pago</InputLabel>
              <Select
                labelId="medio-pago-label"
                value={medioPago}
                label="Medio de Pago"
                onChange={(e) => setMedioPago(e.target.value)}
              >
                <MenuItem value="EFECTIVO">Efectivo en Caja</MenuItem>
                <MenuItem value="YAPE">Yape / Plin (Billetera Digital)</MenuItem>
                <MenuItem value="TARJETA_CREDITO">Tarjeta de Crédito</MenuItem>
                <MenuItem value="TARJETA_DEBITO">Tarjeta de Débito</MenuItem>
                <MenuItem value="TRANSFERENCIA">Transferencia Bancaria</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {medioPago === 'EFECTIVO' ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 2, p: 2, bgcolor: '#f0fdf4', borderRadius: 2 }}>
              <TextField
                label="Efectivo Recibido (S/)"
                type="number"
                inputProps={{ step: '0.50' }}
                value={dineroRecibido}
                onChange={(e) => setDineroRecibido(e.target.value)}
                placeholder="Ej. 100.00"
                fullWidth
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="caption" sx={{ color: '#166534', fontWeight: 'bold' }}>
                  VUELTO A ENTREGAR AL PACIENTE:
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#15803d' }}>
                  S/ {vuelto}
                </Typography>
              </Box>
            </Box>
          ) : (
            <TextField
              label="Número de Operación / Voucher / Referencia"
              value={numeroOperacion}
              onChange={(e) => setNumeroOperacion(e.target.value)}
              placeholder="Ej. OP-984321"
              fullWidth
              sx={{ mb: 2 }}
            />
          )}

          <Divider sx={{ my: 2 }} />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={procesando}
            sx={{
              bgcolor: '#0d9488',
              py: 1.5,
              fontWeight: 'bold',
              '&:hover': { bgcolor: '#0f766e' },
            }}
          >
            {procesando ? 'Procesando Transacción Segura...' : `Confirmar y Registrar Pago (S/ ${montoNum.toFixed(2)})`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

