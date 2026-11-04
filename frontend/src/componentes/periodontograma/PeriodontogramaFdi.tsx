import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Checkbox,
  Button,
  Chip,
  Divider,
} from '@mui/material';
import { clienteHttp } from '../../api/clienteHttp';
import { usarAutenticacion } from '../../api/ContextoAutenticacion';

interface PeriodontogramaFdiProps {
  pacienteId: string;
  registrosExistentes: any[];
  alGuardarExitoso: () => void;
}

export const PeriodontogramaFdi: React.FC<PeriodontogramaFdiProps> = ({
  pacienteId,
  registrosExistentes,
  alGuardarExitoso,
}) => {
  const { usuario } = usarAutenticacion();
  const [piezaSeleccionada, setPiezaSeleccionada] = useState<number>(11);

  // Formulario de los 6 sitios de la pieza
  const [psVM, setPsVM] = useState(2);
  const [psVMed, setPsVMed] = useState(2);
  const [psVD, setPsVD] = useState(2);
  const [ssVM, setSsVM] = useState(false);
  const [ssVMed, setSsVMed] = useState(false);
  const [ssVD, setSsVD] = useState(false);

  const [psLM, setPsLM] = useState(2);
  const [psLMed, setPsLMed] = useState(2);
  const [psLD, setPsLD] = useState(2);
  const [ssLM, setSsLM] = useState(false);
  const [ssLMed, setSsLMed] = useState(false);
  const [ssLD, setSsLD] = useState(false);

  const [movilidad, setMovilidad] = useState(0);
  const [supuracion, setSupuracion] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const piezasSextanteSuperior = [17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27];
  const piezasSextanteInferior = [47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37];

  const guardarMedicion = async () => {
    setGuardando(true);
    try {
      await clienteHttp.post('/clinica/periodontograma', {
        pacienteId,
        odontologoId: usuario?.odontologoId || 'e0000000-0000-0000-0000-000000000001',
        piezaFdi: piezaSeleccionada,
        profundidadSondajeVestibularMesial: psVM,
        profundidadSondajeVestibularMedio: psVMed,
        profundidadSondajeVestibularDistal: psVD,
        sangradoVestibularMesial: ssVM,
        sangradoVestibularMedio: ssVMed,
        sangradoVestibularDistal: ssVD,
        profundidadSondajeLingualMesial: psLM,
        profundidadSondajeLingualMedio: psLMed,
        profundidadSondajeLingualDistal: psLD,
        sangradoLingualMesial: ssLM,
        sangradoLingualMedio: ssLMed,
        sangradoLingualDistal: ssLD,
        movilidadGrado: movilidad,
        supuracion,
      });
      alGuardarExitoso();
    } catch (err) {
      console.error('Error guardando periodontograma:', err);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
      <CardContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0f2c2b' }}>
            Periodontograma Clínico (Sondaje en 6 Sitios)
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Medición de profundidad de bolsas (mm), sangrado al sondaje (SS), margen y movilidad
          </Typography>
        </Box>

        {/* Selector de Pieza FDI */}
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
          Selecciona Pieza FDI a Evaluar:
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
          {piezasSextanteSuperior.map((p) => (
            <Chip
              key={p}
              label={p}
              size="small"
              onClick={() => setPiezaSeleccionada(p)}
              color={piezaSeleccionada === p ? 'primary' : 'default'}
              variant={piezaSeleccionada === p ? 'filled' : 'outlined'}
            />
          ))}
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 3 }}>
          {piezasSextanteInferior.map((p) => (
            <Chip
              key={p}
              label={p}
              size="small"
              onClick={() => setPiezaSeleccionada(p)}
              color={piezaSeleccionada === p ? 'primary' : 'default'}
              variant={piezaSeleccionada === p ? 'filled' : 'outlined'}
            />
          ))}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Tabla de Registro de 6 Sitios */}
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#0d9488', mb: 1 }}>
          Evaluación Pieza {piezaSeleccionada}
        </Typography>

        <Table size="small" sx={{ mb: 3, bgcolor: '#f8fafc', borderRadius: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Cara / Zona</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Distal</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Medio (Central)</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Mesial</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Vestibular */}
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Vestibular - Profundidad (mm)</TableCell>
              <TableCell align="center">
                <TextField
                  type="number"
                  size="small"
                  sx={{ width: 65 }}
                  value={psVD}
                  onChange={(e) => setPsVD(Number(e.target.value))}
                />
              </TableCell>
              <TableCell align="center">
                <TextField
                  type="number"
                  size="small"
                  sx={{ width: 65 }}
                  value={psVMed}
                  onChange={(e) => setPsVMed(Number(e.target.value))}
                />
              </TableCell>
              <TableCell align="center">
                <TextField
                  type="number"
                  size="small"
                  sx={{ width: 65 }}
                  value={psVM}
                  onChange={(e) => setPsVM(Number(e.target.value))}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Vestibular - Sangrado al Sondaje</TableCell>
              <TableCell align="center">
                <Checkbox checked={ssVD} onChange={(e) => setSsVD(e.target.checked)} color="error" />
              </TableCell>
              <TableCell align="center">
                <Checkbox checked={ssVMed} onChange={(e) => setSsVMed(e.target.checked)} color="error" />
              </TableCell>
              <TableCell align="center">
                <Checkbox checked={ssVM} onChange={(e) => setSsVM(e.target.checked)} color="error" />
              </TableCell>
            </TableRow>

            {/* Lingual / Palatino */}
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Lingual/Palatino - Profundidad (mm)</TableCell>
              <TableCell align="center">
                <TextField
                  type="number"
                  size="small"
                  sx={{ width: 65 }}
                  value={psLD}
                  onChange={(e) => setPsLD(Number(e.target.value))}
                />
              </TableCell>
              <TableCell align="center">
                <TextField
                  type="number"
                  size="small"
                  sx={{ width: 65 }}
                  value={psLMed}
                  onChange={(e) => setPsLMed(Number(e.target.value))}
                />
              </TableCell>
              <TableCell align="center">
                <TextField
                  type="number"
                  size="small"
                  sx={{ width: 65 }}
                  value={psLM}
                  onChange={(e) => setPsLM(Number(e.target.value))}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Lingual/Palatino - Sangrado</TableCell>
              <TableCell align="center">
                <Checkbox checked={ssLD} onChange={(e) => setSsLD(e.target.checked)} color="error" />
              </TableCell>
              <TableCell align="center">
                <Checkbox checked={ssLMed} onChange={(e) => setSsLMed(e.target.checked)} color="error" />
              </TableCell>
              <TableCell align="center">
                <Checkbox checked={ssLM} onChange={(e) => setSsLM(e.target.checked)} color="error" />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              label="Movilidad Dental (Grado 0 - 3)"
              type="number"
              size="small"
              inputProps={{ min: 0, max: 3 }}
              value={movilidad}
              onChange={(e) => setMovilidad(Number(e.target.value))}
              sx={{ width: 220 }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Checkbox checked={supuracion} onChange={(e) => setSupuracion(e.target.checked)} color="warning" />
              <Typography variant="body2">Presencia de Supuración</Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            onClick={guardarMedicion}
            disabled={guardando}
            sx={{ bgcolor: '#0d9488', '&:hover': { bgcolor: '#0f766e' } }}
          >
            {guardando ? 'Guardando...' : `Guardar Pieza ${piezaSeleccionada}`}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

