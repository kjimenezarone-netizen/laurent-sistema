import React from 'react';
import { EstadoCuentaPaciente } from '../../tipos/tiposFinanzas';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

interface EstadoCuentaDetalleProps {
  cuenta: EstadoCuentaPaciente;
}

export const EstadoCuentaDetalle: React.FC<EstadoCuentaDetalleProps> = ({ cuenta }) => {
  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 18px rgba(0,0,0,0.06)' }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0f2c2b', mb: 2 }}>
          Estado de Cuenta Corriente (Libro Inmutable)
        </Typography>

        {/* Resumen de Indicadores Financieros */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
          <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
            <Typography variant="caption" color="text.secondary">Total Facturado</Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
              S/ {cuenta.totalFacturado.toFixed(2)}
            </Typography>
          </Box>
          <Box sx={{ p: 2, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px solid #bbf7d0' }}>
            <Typography variant="caption" sx={{ color: '#166534' }}>Total Abonado</Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#15803d' }}>
              S/ {cuenta.totalAbonado.toFixed(2)}
            </Typography>
          </Box>
          <Box sx={{ p: 2, bgcolor: '#fef2f2', borderRadius: 2, border: '1px solid #fecaca' }}>
            <Typography variant="caption" sx={{ color: '#991b1b' }}>Saldo Deudor</Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#dc2626' }}>
              S/ {cuenta.saldoDeudor.toFixed(2)}
            </Typography>
          </Box>
          <Box sx={{ p: 2, bgcolor: '#eff6ff', borderRadius: 2, border: '1px solid #bfdbfe' }}>
            <Typography variant="caption" sx={{ color: '#1e40af' }}>Saldo a Favor (Crédito)</Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2563eb' }}>
              S/ {cuenta.saldoAFavor.toFixed(2)}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Tabla de Movimientos Contables */}
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#334155' }}>
          Historial de Movimientos de Cuenta
        </Typography>

        <Table size="small">
          <TableHead sx={{ bgcolor: '#f1f5f9' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Tipo</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Concepto / Detalle</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Cargo (S/)</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Abono (S/)</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Estado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cuenta.movimientos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3, color: '#94a3b8' }}>
                  No se registran movimientos financieros para este paciente.
                </TableCell>
              </TableRow>
            ) : (
              cuenta.movimientos.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>{new Date(m.fecha).toLocaleDateString('es-PE')}</TableCell>
                  <TableCell>
                    <Chip
                      label={m.tipo}
                      size="small"
                      color={m.tipo === 'CARGO' ? 'error' : 'success'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{m.descripcion}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: m.cargo > 0 ? 'bold' : 'normal', color: m.cargo > 0 ? '#b91c1c' : 'inherit' }}>
                    {m.cargo > 0 ? `S/ ${m.cargo.toFixed(2)}` : '-'}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: m.abono > 0 ? 'bold' : 'normal', color: m.abono > 0 ? '#15803d' : 'inherit' }}>
                    {m.abono > 0 ? `S/ ${m.abono.toFixed(2)}` : '-'}
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={m.estado} size="small" variant="filled" sx={{ fontSize: '10px' }} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

