import React from 'react';
import { HallazgoDental, SuperficieDental } from '../../tipos/tiposClinica';

interface DienteSvgProps {
  piezaFdi: number;
  hallazgos: HallazgoDental[];
  alHacerClicSuperficie?: (piezaFdi: number, superficie: SuperficieDental) => void;
  seleccionado?: boolean;
}

export const DienteSvg: React.FC<DienteSvgProps> = ({
  piezaFdi,
  hallazgos,
  alHacerClicSuperficie,
  seleccionado = false,
}) => {
  // Determinar colores por superficie según hallazgos
  const obtenerColorSuperficie = (superficie: SuperficieDental): string => {
    const hallazgo = hallazgos.find(
      (h) => h.superficie === superficie || h.superficie === 'GENERAL'
    );
    if (!hallazgo) return '#ffffff';

    switch (hallazgo.tipoHallazgo) {
      case 'CARIES':
        return '#ef4444'; // Rojo
      case 'RESTAURACION':
        return '#3b82f6'; // Azul
      case 'SELLANTE':
        return '#10b981'; // Verde
      default:
        return '#e2e8f0';
    }
  };

  // Verificar si tiene marcas especiales no de superficie
  const tieneEndodoncia = hallazgos.some((h) => h.tipoHallazgo === 'ENDODONCIA');
  const tieneImplante = hallazgos.some((h) => h.tipoHallazgo === 'IMPLANTE');
  const tieneCorona = hallazgos.some((h) => h.tipoHallazgo === 'CORONA');
  const esPiezaAusente = hallazgos.some((h) => h.tipoHallazgo === 'PIEZA_AUSENTE');

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '6px',
        margin: '2px',
        borderRadius: '6px',
        backgroundColor: seleccionado ? '#f0fdfa' : 'transparent',
        border: seleccionado ? '2px solid #0d9488' : '1px solid #e2e8f0',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#0f2c2b', marginBottom: '4px' }}>
        {piezaFdi}
      </span>

      <div style={{ position: 'relative', width: '52px', height: '64px' }}>
        <svg viewBox="0 0 60 75" width="52" height="64">
          {/* Raíz anatómica */}
          <path
            d="M20,20 Q22,4 30,2 Q38,4 40,20 Z"
            fill="#f8fafc"
            stroke="#94a3b8"
            strokeWidth="1.5"
          />

          {/* Corona dental dividida en las 5 superficies */}
          {/* Superior (Vestibular en inferiores, Lingual en superiores) */}
          <polygon
            points="10,20 50,20 40,32 20,32"
            fill={obtenerColorSuperficie('VESTIBULAR')}
            stroke="#475569"
            strokeWidth="1"
            onClick={() => alHacerClicSuperficie?.(piezaFdi, 'VESTIBULAR')}
          />

          {/* Izquierda (Mesial o Distal según cuadrante) */}
          <polygon
            points="10,20 20,32 20,52 10,64"
            fill={obtenerColorSuperficie('MESIAL')}
            stroke="#475569"
            strokeWidth="1"
            onClick={() => alHacerClicSuperficie?.(piezaFdi, 'MESIAL')}
          />

          {/* Centro (Oclusal o Incisal) */}
          <polygon
            points="20,32 40,32 40,52 20,52"
            fill={obtenerColorSuperficie('OCLUSAL')}
            stroke="#475569"
            strokeWidth="1"
            onClick={() => alHacerClicSuperficie?.(piezaFdi, 'OCLUSAL')}
          />

          {/* Derecha (Distal o Mesial según cuadrante) */}
          <polygon
            points="50,20 50,64 40,52 40,32"
            fill={obtenerColorSuperficie('DISTAL')}
            stroke="#475569"
            strokeWidth="1"
            onClick={() => alHacerClicSuperficie?.(piezaFdi, 'DISTAL')}
          />

          {/* Inferior (Lingual / Palatino) */}
          <polygon
            points="20,52 40,52 50,64 10,64"
            fill={obtenerColorSuperficie('LINGUAL')}
            stroke="#475569"
            strokeWidth="1"
            onClick={() => alHacerClicSuperficie?.(piezaFdi, 'LINGUAL')}
          />

          {/* OVERLAY: Endodoncia (línea central en raíz) */}
          {tieneEndodoncia && (
            <line
              x1="30"
              y1="4"
              x2="30"
              y2="50"
              stroke="#dc2626"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          )}

          {/* OVERLAY: Corona (círculo dorado envolvente) */}
          {tieneCorona && (
            <circle
              cx="30"
              cy="42"
              r="22"
              fill="none"
              stroke="#d97706"
              strokeWidth="2.5"
              strokeDasharray="4 2"
            />
          )}

          {/* OVERLAY: Implante Dental */}
          {tieneImplante && (
            <path
              d="M26,6 L34,6 L32,20 L28,20 Z"
              fill="#64748b"
              stroke="#334155"
              strokeWidth="1.5"
            />
          )}

          {/* OVERLAY: Diente Ausente (Cruz roja/negra) */}
          {esPiezaAusente && (
            <>
              <line x1="8" y1="8" x2="52" y2="70" stroke="#b91c1c" strokeWidth="3" />
              <line x1="52" y1="8" x2="8" y2="70" stroke="#b91c1c" strokeWidth="3" />
            </>
          )}
        </svg>
      </div>
    </div>
  );
};

