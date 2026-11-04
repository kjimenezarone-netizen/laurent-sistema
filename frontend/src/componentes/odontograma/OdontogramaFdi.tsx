import React, { useState } from 'react';
import { DienteSvg } from './DienteSvg';
import { SelectorHallazgos } from './SelectorHallazgos';
import { HallazgoDental, SuperficieDental, TipoHallazgo, EstadoHallazgo } from '../../tipos/tiposClinica';
import { Box, Card, CardContent, Divider, Typography, Grid } from '@mui/material';

interface OdontogramaFdiProps {
  hallazgos: HallazgoDental[];
  alRegistrarHallazgo: (hallazgo: HallazgoDental) => void;
  soloLectura?: boolean;
}

export const OdontogramaFdi: React.FC<OdontogramaFdiProps> = ({
  hallazgos,
  alRegistrarHallazgo,
  soloLectura = false,
}) => {
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoHallazgo>('CARIES');
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<EstadoHallazgo>('PLANIFICADO');

  const cuadrante1 = [18, 17, 16, 15, 14, 13, 12, 11];
  const cuadrante2 = [21, 22, 23, 24, 25, 26, 27, 28];
  const cuadrante4 = [48, 47, 46, 45, 44, 43, 42, 41];
  const cuadrante3 = [31, 32, 33, 34, 35, 36, 37, 38];

  const manejarClicSuperficie = (piezaFdi: number, superficie: SuperficieDental) => {
    if (soloLectura) return;

    alRegistrarHallazgo({
      piezaFdi,
      tipoDenticion: 'PERMANENTE',
      superficie,
      tipoHallazgo: tipoSeleccionado,
      estadoHallazgo: estadoSeleccionado,
    });
  };

  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
      <CardContent>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0f2c2b' }}>
              Odontograma Clínico (Norma FDI)
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Haz clic en la superficie o pieza dental para aplicar el hallazgo seleccionado
            </Typography>
          </div>
        </Box>

        {!soloLectura && (
          <Box sx={{ mb: 3 }}>
            <SelectorHallazgos
              hallazgoSeleccionado={tipoSeleccionado}
              estadoSeleccionado={estadoSeleccionado}
              alCambiarHallazgo={setTipoSeleccionado}
              alCambiarEstado={setEstadoSeleccionado}
            />
          </Box>
        )}

        {/* Arco Superior */}
        <Box sx={{ p: 2, bgcolor: '#ffffff', borderRadius: 2, border: '1px solid #f1f5f9', mb: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#64748b', display: 'block', mb: 1, textAlign: 'center' }}>
            MAXILAR SUPERIOR (VESTIBULAR / PALATINO)
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', gap: '2px' }}>
              {cuadrante1.map((fdi) => (
                <DienteSvg
                  key={fdi}
                  piezaFdi={fdi}
                  hallazgos={hallazgos.filter((h) => h.piezaFdi === fdi)}
                  alHacerClicSuperficie={manejarClicSuperficie}
                />
              ))}
            </Box>
            <Divider orientation="vertical" flexItem sx={{ mx: 1, borderRightWidth: 2, borderColor: '#cbd5e1' }} />
            <Box sx={{ display: 'flex', gap: '2px' }}>
              {cuadrante2.map((fdi) => (
                <DienteSvg
                  key={fdi}
                  piezaFdi={fdi}
                  hallazgos={hallazgos.filter((h) => h.piezaFdi === fdi)}
                  alHacerClicSuperficie={manejarClicSuperficie}
                />
              ))}
            </Box>
          </Box>
        </Box>

        {/* Arco Inferior */}
        <Box sx={{ p: 2, bgcolor: '#ffffff', borderRadius: 2, border: '1px solid #f1f5f9' }}>
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#64748b', display: 'block', mb: 1, textAlign: 'center' }}>
            MAXILAR INFERIOR (VESTIBULAR / LINGUAL)
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', gap: '2px' }}>
              {cuadrante4.map((fdi) => (
                <DienteSvg
                  key={fdi}
                  piezaFdi={fdi}
                  hallazgos={hallazgos.filter((h) => h.piezaFdi === fdi)}
                  alHacerClicSuperficie={manejarClicSuperficie}
                />
              ))}
            </Box>
            <Divider orientation="vertical" flexItem sx={{ mx: 1, borderRightWidth: 2, borderColor: '#cbd5e1' }} />
            <Box sx={{ display: 'flex', gap: '2px' }}>
              {cuadrante3.map((fdi) => (
                <DienteSvg
                  key={fdi}
                  piezaFdi={fdi}
                  hallazgos={hallazgos.filter((h) => h.piezaFdi === fdi)}
                  alHacerClicSuperficie={manejarClicSuperficie}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

