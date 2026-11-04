import React from 'react';
import { TipoHallazgo, EstadoHallazgo } from '../../tipos/tiposClinica';
import { Button, ButtonGroup, Chip, Stack, Typography } from '@mui/material';

interface SelectorHallazgosProps {
  hallazgoSeleccionado: TipoHallazgo;
  estadoSeleccionado: EstadoHallazgo;
  alCambiarHallazgo: (tipo: TipoHallazgo) => void;
  alCambiarEstado: (estado: EstadoHallazgo) => void;
}

const OPCIONES_HALLAZGOS: { tipo: TipoHallazgo; etiqueta: string; color: string }[] = [
  { tipo: 'CARIES', etiqueta: 'Caries Dental', color: '#ef4444' },
  { tipo: 'RESTAURACION', etiqueta: 'Curación / Resina', color: '#3b82f6' },
  { tipo: 'CORONA', etiqueta: 'Corona Protésica', color: '#d97706' },
  { tipo: 'ENDODONCIA', etiqueta: 'Endodoncia Realizada', color: '#dc2626' },
  { tipo: 'IMPLANTE', etiqueta: 'Implante Dental', color: '#475569' },
  { tipo: 'PIEZA_AUSENTE', etiqueta: 'Pieza Ausente', color: '#991b1b' },
  { tipo: 'SELLANTE', etiqueta: 'Sellante Preventivo', color: '#10b981' },
];

export const SelectorHallazgos: React.FC<SelectorHallazgosProps> = ({
  hallazgoSeleccionado,
  estadoSeleccionado,
  alCambiarHallazgo,
  alCambiarEstado,
}) => {
  return (
    <Stack spacing={2} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
      <div>
        <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#475569', textTransform: 'uppercase' }}>
          1. Selecciona el Tipo de Hallazgo Clínico
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
          {OPCIONES_HALLAZGOS.map((opcion) => {
            const estaActivo = hallazgoSeleccionado === opcion.tipo;
            return (
              <Chip
                key={opcion.tipo}
                label={opcion.etiqueta}
                onClick={() => alCambiarHallazgo(opcion.tipo)}
                variant={estaActivo ? 'filled' : 'outlined'}
                sx={{
                  bgcolor: estaActivo ? opcion.color : 'transparent',
                  color: estaActivo ? '#ffffff' : '#1e293b',
                  fontWeight: estaActivo ? 'bold' : 'normal',
                  borderColor: opcion.color,
                  '&:hover': {
                    bgcolor: estaActivo ? opcion.color : '#f1f5f9',
                  },
                }}
              />
            );
          })}
        </Stack>
      </div>

      <div>
        <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#475569', textTransform: 'uppercase' }}>
          2. Estado del Procedimiento
        </Typography>
        <ButtonGroup size="small" sx={{ mt: 1 }}>
          <Button
            variant={estadoSeleccionado === 'PLANIFICADO' ? 'contained' : 'outlined'}
            color="warning"
            onClick={() => alCambiarEstado('PLANIFICADO')}
          >
            Planificado (Por hacer)
          </Button>
          <Button
            variant={estadoSeleccionado === 'REALIZADO' ? 'contained' : 'outlined'}
            color="success"
            onClick={() => alCambiarEstado('REALIZADO')}
          >
            Realizado en Sesión
          </Button>
          <Button
            variant={estadoSeleccionado === 'EXISTENTE' ? 'contained' : 'outlined'}
            color="info"
            onClick={() => alCambiarEstado('EXISTENTE')}
          >
            Existente Previo
          </Button>
        </ButtonGroup>
      </div>
    </Stack>
  );
};

