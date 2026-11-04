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

export const PaginaGestionUsuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<any[]>([]);

  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const resp = await clienteHttp.get('/usuarios');
        setUsuarios(resp.data);
      } catch (err) {
        console.error('Error cargando usuarios:', err);
      }
    };
    cargarUsuarios();
  }, []);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0f2c2b' }}>
          Gestión de Personal & Usuarios del Sistema
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Control de acceso por roles y personal clínico autorizado
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f1f5f9' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Usuario</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Nombre Completo</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Correo Electrónico</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>DNI</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Roles Asignados</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Estado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuarios.map((u) => (
              <TableRow key={u.id} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#0f2c2b' }}>
                    {u.nombreUsuario}
                  </Typography>
                </TableCell>
                <TableCell>{u.nombres} {u.apellidos}</TableCell>
                <TableCell>{u.correoElectronico}</TableCell>
                <TableCell>{u.numeroDocumento}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {u.roles?.map((r: any) => (
                      <Chip key={r.id || r.codigo} label={r.codigo || r.nombre} size="small" color="primary" variant="outlined" />
                    ))}
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={u.activo ? 'Activo' : 'Inactivo'}
                    size="small"
                    color={u.activo ? 'success' : 'default'}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
};

