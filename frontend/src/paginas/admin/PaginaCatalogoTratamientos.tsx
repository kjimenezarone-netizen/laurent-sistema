import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { clienteHttp } from '../../api/clienteHttp';
import { CatalogoTratamiento } from '../../tipos/tiposFinanzas';

export const PaginaCatalogoTratamientos: React.FC = () => {
  const [catalogo, setCatalogo] = useState<CatalogoTratamiento[]>([]);

  useEffect(() => {
    const cargarCatalogo = async () => {
      try {
        const resp = await clienteHttp.get('/finanzas/tratamientos');
        setCatalogo(resp.data);
      } catch (err) {
        console.error('Error cargando catálogo:', err);
      }
    };
    cargarCatalogo();
  }, []);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0f2c2b' }}>
          Tarifario & Catálogo de Tratamientos
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Lista oficial de procedimientos clínicos y precios base configurados
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f1f5f9' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Código</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Nombre del Procedimiento</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Categoría</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Duración Est.</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Precio Base (S/)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {catalogo.map((item) => (
              <TableRow key={item.id} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#64748b' }}>
                    {item.codigo}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f2c2b' }}>
                    {item.nombre}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.descripcion}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={item.categoria} size="small" variant="outlined" />
                </TableCell>
                <TableCell>{item.duracionEstimadaMinutos} minutos</TableCell>
                <TableCell align="right">
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#0d9488' }}>
                    S/ {item.precioBase.toFixed(2)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
};

