import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  Divider,
  Button,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@mui/material';
import { Printer } from 'lucide-react';

interface ComprobantePagoModalProps {
  abierto: boolean;
  alCerrar: () => void;
  comprobante: any;
}

export const ModalComprobantePago: React.FC<ComprobantePagoModalProps> = ({
  abierto,
  alCerrar,
  comprobante,
}) => {
  if (!comprobante) return null;

  const imprimir = () => {
    window.print();
  };

  return (
    <Dialog open={abierto} onClose={alCerrar} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          Comprobante Electrónico
        </Typography>
        <Button
          size="small"
          variant="contained"
          startIcon={<Printer size={16} />}
          onClick={imprimir}
          sx={{ bgcolor: '#0d9488' }}
        >
          Imprimir
        </Button>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3, bgcolor: '#ffffff', fontFamily: 'monospace' }}>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0f2c2b' }}>
            {comprobante.razonSocialEmisor}
          </Typography>
          <Typography variant="body2">R.U.C. N° {comprobante.rucEmisor}</Typography>
          <Typography variant="caption" sx={{ display: 'block', color: '#64748b' }}>
            {comprobante.direccionEmisor}
          </Typography>
        </Box>

        <Box sx={{ border: '2px solid #0f2c2b', p: 1, textAlign: 'center', mb: 2, borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            {comprobante.tipoComprobante?.replace('_', ' ')}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0d9488' }}>
            {comprobante.serieCorrelativo}
          </Typography>
        </Box>

        <Box sx={{ mb: 2, fontSize: '13px' }}>
          <div><strong>Fecha:</strong> {new Date(comprobante.fechaEmision).toLocaleString('es-PE')}</div>
          <div><strong>Paciente:</strong> {comprobante.pacienteNombre}</div>
          <div><strong>Documento:</strong> {comprobante.pacienteDocumento}</div>
          <div><strong>Medio de Pago:</strong> {comprobante.medioPago}</div>
          {comprobante.numeroOperacion && (
            <div><strong>N° Operación:</strong> {comprobante.numeroOperacion}</div>
          )}
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell sx={{ pl: 0 }}>Subtotal (Base Imponible)</TableCell>
              <TableCell align="right" sx={{ pr: 0 }}>S/ {comprobante.subtotal?.toFixed(2)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ pl: 0 }}>I.G.V. (18%)</TableCell>
              <TableCell align="right" sx={{ pr: 0 }}>S/ {comprobante.igv?.toFixed(2)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ pl: 0, fontWeight: 'bold', fontSize: '15px' }}>TOTAL PAGADO</TableCell>
              <TableCell align="right" sx={{ pr: 0, fontWeight: 'bold', fontSize: '16px', color: '#0d9488' }}>
                S/ {comprobante.total?.toFixed(2)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <Box sx={{ textAlign: 'center', mt: 3, pt: 1, borderTop: '1px dashed #cbd5e1' }}>
          <Typography variant="caption" sx={{ display: 'block', color: '#64748b' }}>
            Hash de Seguridad: {comprobante.codigoHashSeguridad}
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}>
            ¡Gracias por confiar tu sonrisa en Clínica Laurent!
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

