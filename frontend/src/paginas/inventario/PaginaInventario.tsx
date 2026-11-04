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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { clienteHttp } from '../../api/clienteHttp';
import { Package, AlertTriangle, Plus, Calendar } from 'lucide-react';

export const PaginaInventario: React.FC = () => {
  const [insumos, setInsumos] = useState<any[]>([]);
  const [lotes, setLotes] = useState<any[]>([]);
  const [abrirModal, setAbrirModal] = useState(false);

  const [formulario, setFormulario] = useState({
    codigoBarras: '',
    nombre: '',
    descripcion: '',
    unidadMedida: 'UNIDAD',
    stockMinimoAlerta: 5,
  });

  const cargarDatos = async () => {
    try {
      const [respInsumos, respLotes] = await Promise.all([
        clienteHttp.get('/inventario/insumos'),
        clienteHttp.get('/inventario/lotes'),
      ]);
      setInsumos(respInsumos.data);
      setLotes(respLotes.data);
    } catch (err) {
      console.error('Error cargando inventario:', err);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const guardarInsumo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await clienteHttp.post('/inventario/insumos', formulario);
      setAbrirModal(false);
      setFormulario({
        codigoBarras: '',
        nombre: '',
        descripcion: '',
        unidadMedida: 'UNIDAD',
        stockMinimoAlerta: 5,
      });
      cargarDatos();
    } catch (err) {
      console.error('Error guardando insumo:', err);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <div>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0f2c2b' }}>
            Inventario, Insumos & Control de Lotes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gestión de materiales dentales, alertas de vencimiento y stock crítico
          </Typography>
        </div>

        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => setAbrirModal(true)}
          sx={{ bgcolor: '#0d9488', '&:hover': { bgcolor: '#0f766e' } }}
        >
          Nuevo Material / Insumo
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Tabla de Insumos */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0f2c2b', mb: 2 }}>
                Materiales e Insumos en Catálogo
              </Typography>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Código</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Nombre del Material</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Unidad</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Stock Mínimo</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {insumos.map((ins) => (
                    <TableRow key={ins.id} hover>
                      <TableCell sx={{ color: '#64748b' }}>{ins.codigoBarras || 'SIN-COD'}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{ins.nombre}</TableCell>
                      <TableCell>{ins.unidadMedida}</TableCell>
                      <TableCell align="right">{ins.stockMinimoAlerta}</TableCell>
                      <TableCell align="center">
                        <Chip label="Disponible" color="success" size="small" variant="outlined" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        {/* Lotes y Fechas de Vencimiento */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0f2c2b', mb: 2 }}>
                Lotes Próximos a Vencer
              </Typography>
              {lotes.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No hay lotes con alerta de caducidad cercana.
                </Typography>
              ) : (
                lotes.map((lote) => (
                  <Box key={lote.id} sx={{ p: 1.5, mb: 1.5, bgcolor: '#fef2f2', borderRadius: 2, border: '1px solid #fee2e2' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#991b1b' }}>
                      Lote: {lote.numeroLote}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', color: '#7f1d1d' }}>
                      Vencimiento: {lote.fechaVencimiento || 'No especificada'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#b91c1c', fontWeight: 'bold' }}>
                      Stock actual: {lote.cantidadActual}
                    </Typography>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Modal para crear Insumo */}
      <Dialog open={abrirModal} onClose={() => setAbrirModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', color: '#0f2c2b' }}>
          Registrar Insumo / Material Dental
        </DialogTitle>
        <DialogContent dividers>
          <form onSubmit={guardarInsumo}>
            <TextField
              label="Nombre del Material"
              value={formulario.nombre}
              onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
              required
              fullWidth
              size="small"
              sx={{ mb: 2 }}
              placeholder="Ej. Resina Filtek Z350 XT 3M"
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
              <TextField
                label="Código de Barras / SKU"
                value={formulario.codigoBarras}
                onChange={(e) => setFormulario({ ...formulario, codigoBarras: e.target.value })}
                size="small"
              />
              <TextField
                select
                SelectProps={{ native: true }}
                label="Unidad de Medida"
                value={formulario.unidadMedida}
                onChange={(e) => setFormulario({ ...formulario, unidadMedida: e.target.value })}
                size="small"
              >
                <option value="UNIDAD">Unidad</option>
                <option value="CAJA">Caja</option>
                <option value="KIT">Kit</option>
                <option value="GRAMO">Gramo</option>
                <option value="MILILITRO">Mililitro</option>
              </TextField>
            </Box>

            <TextField
              label="Stock Mínimo para Alerta"
              type="number"
              value={formulario.stockMinimoAlerta}
              onChange={(e) => setFormulario({ ...formulario, stockMinimoAlerta: Number(e.target.value) })}
              size="small"
              sx={{ mb: 3 }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={() => setAbrirModal(false)}>Cancelar</Button>
              <Button type="submit" variant="contained" sx={{ bgcolor: '#0d9488' }}>
                Guardar Insumo
              </Button>
            </Box>
          </form>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

