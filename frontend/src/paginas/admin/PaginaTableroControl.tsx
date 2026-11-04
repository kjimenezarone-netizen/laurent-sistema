import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
} from '@mui/material';
import { clienteHttp } from '../../api/clienteHttp';
import { Users, Calendar, DollarSign, Activity } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const PaginaTableroControl: React.FC = () => {
  const [metricas, setMetricas] = useState({
    totalPacientes: 0,
    totalCitas: 0,
    recaudacionTotal: 0,
    procedimientosActivos: 0,
  });

  const datosIngresos = [
    { mes: 'Mayo', ingresos: 12400 },
    { mes: 'Junio', ingresos: 15800 },
    { mes: 'Julio', ingresos: 18900 },
    { mes: 'Agosto', ingresos: 17200 },
    { mes: 'Septiembre', ingresos: 21500 },
    { mes: 'Octubre', ingresos: 24800 },
  ];

  const datosTratamientos = [
    { nombre: 'Restauraciones', valor: 45, color: '#0d9488' },
    { nombre: 'Endodoncia', valor: 25, color: '#3b82f6' },
    { nombre: 'Prótesis & Coronas', valor: 18, color: '#d97706' },
    { nombre: 'Profilaxis', valor: 12, color: '#10b981' },
  ];

  useEffect(() => {
    const cargarMetricas = async () => {
      try {
        const [respPacientes, respTratamientos] = await Promise.all([
          clienteHttp.get('/pacientes'),
          clienteHttp.get('/finanzas/tratamientos'),
        ]);

        setMetricas({
          totalPacientes: respPacientes.data.length,
          totalCitas: 18, // Demostración inicial
          recaudacionTotal: 24800,
          procedimientosActivos: respTratamientos.data.length,
        });
      } catch (err) {
        console.error('Error cargando métricas:', err);
      }
    };
    cargarMetricas();
  }, []);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0f2c2b' }}>
          Panel Gerencial & Business Intelligence (BI)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Visión panorámica de productividad, ingresos y demanda de procedimientos
        </Typography>
      </Box>

      {/* Tarjetas KPI */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 18px rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: '#f0fdfa', borderRadius: 2, color: '#0d9488' }}>
                <Users size={28} />
              </Box>
              <div>
                <Typography variant="caption" color="text.secondary">Pacientes Activos</Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0f2c2b' }}>
                  {metricas.totalPacientes}
                </Typography>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 18px rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: '#eff6ff', borderRadius: 2, color: '#2563eb' }}>
                <Calendar size={28} />
              </Box>
              <div>
                <Typography variant="caption" color="text.secondary">Citas del Mes</Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0f2c2b' }}>
                  {metricas.totalCitas}
                </Typography>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 18px rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: '#f0fdf4', borderRadius: 2, color: '#16a34a' }}>
                <DollarSign size={28} />
              </Box>
              <div>
                <Typography variant="caption" color="text.secondary">Recaudación (Octubre)</Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#15803d' }}>
                  S/ {metricas.recaudacionTotal.toLocaleString()}
                </Typography>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 18px rgba(0,0,0,0.06)' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: '#fef3c7', borderRadius: 2, color: '#d97706' }}>
                <Activity size={28} />
              </Box>
              <div>
                <Typography variant="caption" color="text.secondary">Catálogo de Servicios</Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0f2c2b' }}>
                  {metricas.procedimientosActivos}
                </Typography>
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficos Recharts */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 18px rgba(0,0,0,0.06)' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#0f2c2b' }}>
              Evolución Semestral de Ingresos (S/)
            </Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datosIngresos}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip formatter={(value) => `S/ ${value}`} />
                  <Bar dataKey="ingresos" fill="#0d9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 18px rgba(0,0,0,0.06)' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#0f2c2b' }}>
              Distribución por Especialidad
            </Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={datosTratamientos}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    dataKey="valor"
                    label
                  >
                    {datosTratamientos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

