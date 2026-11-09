import React, { useId } from 'react';
import { HallazgoDental, SuperficieDental } from '../../tipos/tiposClinica';

interface DienteSvgProps {
  piezaFdi: number;
  hallazgos: HallazgoDental[];
  alHacerClicSuperficie?: (piezaFdi: number, superficie: SuperficieDental) => void;
  seleccionado?: boolean;
}

type ClasePieza = 'INCISIVO' | 'CANINO' | 'PREMOLAR' | 'MOLAR';

/** FDI permanente: 1-4, temporal: 5-8. El dígito final identifica el tipo de pieza. */
export function claseDePiezaFdi(piezaFdi: number): ClasePieza {
  const cuadrante = Math.floor(piezaFdi / 10);
  const posicion = piezaFdi % 10;
  if (posicion === 1 || posicion === 2) return 'INCISIVO';
  if (posicion === 3) return 'CANINO';
  if (cuadrante <= 4 && (posicion === 4 || posicion === 5)) return 'PREMOLAR';
  return 'MOLAR'; // 6-8 permanentes o 4-5 temporales
}

const coronas: Record<ClasePieza, string> = {
  // Contornos independientes, basados en la silueta esquemática de cada clase.
  INCISIVO: 'M14 51 Q14 47 19 46 L45 46 Q50 47 50 51 L47 84 Q46 91 32 91 Q18 91 17 84 Z',
  CANINO: 'M13 57 Q15 52 23 50 L32 42 L41 50 Q49 52 51 57 L47 83 Q43 92 32 92 Q21 92 17 83 Z',
  PREMOLAR: 'M12 55 Q14 48 22 49 L27 45 Q32 41 37 45 L43 49 Q50 49 52 55 L49 82 Q46 92 32 92 Q18 92 15 82 Z',
  MOLAR: 'M8 55 Q9 49 15 49 L19 45 Q23 42 28 47 L32 44 Q36 42 41 46 L46 49 Q54 47 56 55 L53 83 Q48 92 32 92 Q16 92 11 83 Z',
};

const raices: Record<ClasePieza, string[]> = {
  INCISIVO: ['M23 49 Q21 28 28 10 Q32 2 35 10 Q43 29 41 49 Z'],
  CANINO: ['M21 52 Q19 31 28 8 Q32 -1 37 9 Q47 33 43 52 Z'],
  PREMOLAR: [
    'M19 50 Q16 30 22 13 Q25 6 29 15 L31 50 Z',
    'M33 50 Q35 22 42 12 Q46 8 47 19 Q48 37 45 50 Z',
  ],
  MOLAR: [
    'M14 51 Q9 33 12 12 Q15 3 19 15 L27 51 Z',
    'M28 51 Q30 31 34 11 Q37 2 41 14 L43 51 Z',
    'M45 51 Q48 30 53 15 Q58 9 57 25 L51 51 Z',
  ],
};

// Cada región está recortada por el contorno real de la corona, de modo que los
// colores/hallazgos no aparecen sobre cuadros o hexágonos externos.
const zonasBase = {
  vestibular: 'M15 70 L49 70 L53 93 L11 93 Z',
  lingual: 'M11 42 L53 42 L47 58 L17 58 Z',
  izquierda: 'M8 51 L25 58 L25 75 L8 92 Z',
  derecha: 'M56 51 L39 58 L39 75 L56 92 Z',
  centro: 'M25 58 L39 58 L39 75 L25 75 Z',
};

function colorHallazgo(h: HallazgoDental | undefined): string {
  if (!h) return 'rgba(255,255,255,0.02)';
  switch (h.tipoHallazgo) {
    case 'CARIES': return '#e96a67';
    case 'RESTAURACION': return '#6d9ddd';
    case 'SELLANTE': return '#6fbfa5';
    default: return 'rgba(255,255,255,0.02)';
  }
}

export const DienteSvg: React.FC<DienteSvgProps> = ({
  piezaFdi, hallazgos, alHacerClicSuperficie, seleccionado = false,
}) => {
  const uid = useId().replace(/:/g, '_');
  const clase = claseDePiezaFdi(piezaFdi);
  const cuadrante = Math.floor(piezaFdi / 10);
  const inferior = [3, 4, 7, 8].includes(cuadrante);
  const ladoDerechoPaciente = [1, 4, 5, 8].includes(cuadrante);
  const caraCentral: SuperficieDental = clase === 'INCISIVO' || clase === 'CANINO' ? 'INCISAL' : 'OCLUSAL';
  const caraInterna: SuperficieDental = [1, 2, 5, 6].includes(cuadrante) ? 'PALATINO' : 'LINGUAL';

  const zonas: { id: string; superficie: SuperficieDental; d: string }[] = [
    { id:'vestibular', superficie:'VESTIBULAR', d:zonasBase.vestibular },
    { id:'interna', superficie:caraInterna, d:zonasBase.lingual },
    { id:'mesial', superficie:ladoDerechoPaciente ? 'MESIAL' : 'DISTAL', d:zonasBase.derecha },
    { id:'distal', superficie:ladoDerechoPaciente ? 'DISTAL' : 'MESIAL', d:zonasBase.izquierda },
    { id:'central', superficie:caraCentral, d:zonasBase.centro },
  ];
  const primerHallazgo = (superficie: SuperficieDental) => hallazgos.find(h =>
    h.superficie === superficie && ['CARIES','RESTAURACION','SELLANTE'].includes(h.tipoHallazgo));
  const hay = (tipo: HallazgoDental['tipoHallazgo']) => hallazgos.some(h => h.tipoHallazgo === tipo);
  const habilitado = Boolean(alHacerClicSuperficie);
  const activar = (superficie: SuperficieDental) => alHacerClicSuperficie?.(piezaFdi, superficie);

  return (
    <div style={{ display:'inline-flex', flexDirection:'column', alignItems:'center', flexShrink:0,
      padding:'5px 2px', borderRadius:12,
      background:seleccionado ? '#eaf6f5' : 'transparent',
      outline:seleccionado ? '2px solid #0e777c' : 'none' }}>
      <span style={{fontSize:12, fontWeight:700, color:'#245359'}}>{piezaFdi}</span>
      <svg width="66" height="112" viewBox="0 0 64 108" role="group"
        aria-label={`Pieza FDI ${piezaFdi}, ${clase.toLowerCase()}, ${inferior ? 'inferior':'superior'}`}>
        <defs>
          <clipPath id={`${uid}-corona`}><path d={coronas[clase]}/></clipPath>
        </defs>
        {/* Invertimos anatómicamente la ilustración para piezas inferiores. */}
        <g transform={inferior ? 'translate(0 108) scale(1 -1)' : undefined}>
          {raices[clase].map((d,i)=><path key={i} d={d} fill="#f2ead7" stroke="#bfae94" strokeWidth="1.45"/>)}
          <path d={coronas[clase]} fill="#fcfbf7" stroke="#aabec0" strokeWidth="1.7"/>
          <g clipPath={`url(#${uid}-corona)`}>
            {zonas.map(z=>(
              <path key={z.id} d={z.d} fill={colorHallazgo(primerHallazgo(z.superficie))}
                stroke="#bac8c7" strokeWidth="0.85"
                style={{ cursor:habilitado ? 'pointer' : 'default', outline:'none' }}
                tabIndex={habilitado ? 0 : -1}
                role={habilitado ? 'button' : undefined}
                aria-label={`Pieza ${piezaFdi}, superficie ${z.superficie.toLowerCase()}`}
                onClick={habilitado ? ()=>activar(z.superficie) : undefined}
                onKeyDown={habilitado ? e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activar(z.superficie);}} : undefined}
              />
            ))}
            {hay('CORONA') && <path pointerEvents="none" d={coronas[clase]} fill="rgba(198,161,79,.28)" stroke="#a78139" strokeWidth="3"/>}
            {hay('PROTESIS') && <path pointerEvents="none" d="M11 77 Q32 88 53 77" fill="none" stroke="#8c6fb3" strokeWidth="4" strokeDasharray="5 3"/>}
            {hay('FRACTURA') && <path pointerEvents="none" d="M35 46 L28 60 L37 68 L27 82" fill="none" stroke="#c74335" strokeWidth="3.3"/>}
          </g>
          {hay('ENDODONCIA') && <g pointerEvents="none" fill="none" stroke="#378a73" strokeWidth="2.8" strokeLinecap="round">
            {clase==='MOLAR' ? <>
              <path d="M20 19 Q17 35 25 62"/><path d="M36 18 Q33 36 32 61"/><path d="M48 20 Q45 35 40 63"/>
            </> : <path d="M32 15 Q29 36 32 70"/>}
          </g>}
          {hay('IMPLANTE') && <g pointerEvents="none" stroke="#657583" strokeWidth="1.5">
            <path d="M23 15 L41 15 L38 58 L26 58 Z" fill="#bbc4ca"/>
            {[21,29,37,45,53].map(y=><path key={y} d={`M24 ${y} L40 ${y+3}`} />)}
          </g>}
          {hay('PIEZA_AUSENTE') && <g pointerEvents="none" stroke="#606c75" strokeWidth="3.7" opacity=".88">
            <path d="M11 13 L53 91 M53 13 L11 91" />
          </g>}
        </g>
      </svg>
    </div>
  );
};
