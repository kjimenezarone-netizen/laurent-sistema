import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertTriangle, BookHeart, CalendarDays, CheckCircle2, ClipboardList,
  CreditCard, FileHeart, FileImage, FileText, HeartPulse, Plus,
  Save, ShieldCheck, Stethoscope, Wallet, Printer,
} from 'lucide-react';
import { api, fechaLocal, moneda, post } from '../servicios/cliente';
import { Aviso, CajaCard, Encabezado, Modal, Vacío, useDatos } from '../componentes/Ui';
import { DienteSvg } from '../componentes/odontograma/DienteSvg';
import { DocumentosClinicos } from '../componentes/DocumentosClinicos';
import { EstadoHallazgo, HallazgoDental, SuperficieDental, TipoDenticion, TipoHallazgo } from '../tipos/tiposClinica';

type Paciente = {
  id: string; nombres: string; apellidos: string; numero_documento?: string;
  alergias?: string; antecedentes_alertas?: string; telefono?: string;
};
type Registro = {
  id: string; paciente_id: string; pieza_fdi: number; superficie: SuperficieDental;
  tipo: TipoHallazgo; estado: EstadoHallazgo; observacion?: string;
  rectifica_a?: string; registrado_en: string;
};
type Atencion = {
  id: string; motivo_consulta: string; diagnostico?: string; diagnostico_cie10?: string;
  procedimiento: string; indicaciones?: string; estado: string; creada_en: string; profesional: string;
};
type Anamnesis = {
  id: string; enfermedades?: string; medicamentos?: string; alergias?: string;
  antecedentes_familiares?: string; observaciones?: string; registrada_en: string;
};
type Plan = { id: string; version: number; estado: string; observaciones?: string; creado_en: string };
type Presupuesto = Plan & { monto_total: number; cantidad_items: number };
type Movimiento = {
  id: string; tipo: 'CARGO' | 'ABONO'; fecha: string; descripcion: string;
  cargo: number; abono: number; saldo_acumulado: number;
};
type Saldo = { total_cargos: number; total_pagado: number; deuda: number; saldo_a_favor: number };
type Consentimiento = {
  id: string; plantilla_codigo: string; version_documento: number;
  firmado_en?: string; creado_en: string; firmante_nombre?: string;
};
type Pestaña = 'resumen' | 'odontograma' | 'periodonto' | 'anamnesis' | 'evoluciones' |
  'tratamientos' | 'presupuestos' | 'documentos' | 'consentimientos' | 'cuenta';

const PESTAÑAS: { clave: Pestaña; texto: string }[] = [
  { clave: 'resumen', texto: 'Resumen' },
  { clave: 'odontograma', texto: 'Odontograma FDI' },
  { clave: 'periodonto', texto: 'Periodontograma' },
  { clave: 'anamnesis', texto: 'Anamnesis' },
  { clave: 'evoluciones', texto: 'Evoluciones' },
  { clave: 'tratamientos', texto: 'Tratamientos realizados' },
  { clave: 'presupuestos', texto: 'Planes y presupuestos' },
  { clave: 'documentos', texto: 'Imágenes y archivos' },
  { clave: 'consentimientos', texto: 'Consentimientos' },
  { clave: 'cuenta', texto: 'Atenciones y cuenta' },
];
const CUADRANTES: Record<TipoDenticion, number[][]> = {
  PERMANENTE: [[18, 17, 16, 15, 14, 13, 12, 11], [21, 22, 23, 24, 25, 26, 27, 28],
    [48, 47, 46, 45, 44, 43, 42, 41], [31, 32, 33, 34, 35, 36, 37, 38]],
  TEMPORAL: [[55, 54, 53, 52, 51], [61, 62, 63, 64, 65],
    [85, 84, 83, 82, 81], [71, 72, 73, 74, 75]],
};
const TIPOS: TipoHallazgo[] = ['CARIES','RESTAURACION','SELLANTE','CORONA','ENDODONCIA',
  'IMPLANTE','FRACTURA','PIEZA_AUSENTE','PROTESIS'];
const ESTADOS: EstadoHallazgo[] = ['EXISTENTE','PLANIFICADO','REALIZADO'];
const sitios = ['MV', 'V', 'DV', 'ML', 'L', 'DL'] as const;

export function hallazgosVigentes(registros: Registro[]) {
  const reemplazados = new Set(registros.map((r) => r.rectifica_a).filter(Boolean));
  return registros.filter((r) => !reemplazados.has(r.id));
}
function Odontograma({ registros, seleccionar }: {
  registros: Registro[]; seleccionar: (pieza: number, superficie: SuperficieDental) => void;
}) {
  const [denticion, setDenticion] = useState<TipoDenticion>('PERMANENTE');
  const q = CUADRANTES[denticion];
  const datos: HallazgoDental[] = hallazgosVigentes(registros).map((r) => ({
    id: r.id, piezaFdi: r.pieza_fdi, tipoDenticion: r.pieza_fdi < 50 ? 'PERMANENTE' : 'TEMPORAL',
    superficie: r.superficie, tipoHallazgo: r.tipo, estadoHallazgo: r.estado,
    observacion: r.observacion, fechaRegistro: r.registrado_en,
  }));
  const arcada = (titulo: string, izquierda: number[], derecha: number[]) => (
    <div className="arcada" key={titulo}>
      <div className="arcada-titulo">{titulo}</div>
      <div className="arcada-scroll"><div className="arcada-dientes">
        {izquierda.map((fdi) => <DienteSvg key={fdi} piezaFdi={fdi}
          hallazgos={datos.filter((d) => d.piezaFdi === fdi)} alHacerClicSuperficie={seleccionar} />)}
        <span className="arcada-separador" aria-hidden="true" />
        {derecha.map((fdi) => <DienteSvg key={fdi} piezaFdi={fdi}
          hallazgos={datos.filter((d) => d.piezaFdi === fdi)} alHacerClicSuperficie={seleccionar} />)}
      </div></div>
    </div>
  );
  return <>
    <div className="titulo-con-acciones">
      <div><h3>Odontograma anatómico e interactivo</h3><p>Dientes diferenciados; selecciona la superficie dentro de la pieza FDI.</p></div>
      <div className="segmentado" role="group" aria-label="Dentición">
        <button type="button" onClick={() => setDenticion('PERMANENTE')} className={denticion === 'PERMANENTE' ? 'activo' : ''}>Permanente · 32</button>
        <button type="button" onClick={() => setDenticion('TEMPORAL')} className={denticion === 'TEMPORAL' ? 'activo' : ''}>Temporal · 20</button>
      </div>
    </div>
    {arcada('MAXILAR SUPERIOR', q[0], q[1])}
    {arcada('MANDÍBULA', q[2], q[3])}
    <div className="leyenda-clinica" aria-label="Leyenda de hallazgos">
      {[['#e96a67','Caries'],['#6d9ddd','Restauración'],['#6fbfa5','Sellante'],
        ['#c59b27','Corona'],['#378a73','Endodoncia'],['#657583','Implante'],['#606c75','Ausencia']]
        .map(([color, texto]) => <span key={texto}><i style={{ backgroundColor: color }} />{texto}</span>)}
    </div>
    <p className="nota-caja">Las formas son ilustraciones clínicas esquemáticas; la simbología definitiva debe validarse con el odontólogo responsable. Los cambios se guardan como registros auditables.</p>
  </>;
}

export function Clinica() {
  const [params] = useSearchParams();
  const pacientes = useDatos<Paciente[]>('/pacientes', []);
  const [pacienteId, setPacienteId] = useState(params.get('paciente') || params.get('pacienteId') || '');
  const [tab, setTab] = useState<Pestaña>('resumen');
  useEffect(() => { if (!pacienteId && pacientes.datos.length > 0) setPacienteId(pacientes.datos[0].id); }, [pacientes.datos, pacienteId]);
  const url = (sufijo: string) => pacienteId ? `/clinica/pacientes/${pacienteId}/${sufijo}` : null;
  const hallazgos = useDatos<Registro[]>(url('odontograma'), []);
  const atenciones = useDatos<Atencion[]>(url('atenciones'), []);
  const anamnesis = useDatos<Anamnesis[]>(url('anamnesis'), []);
  const periodontos = useDatos<{id:string;registrado_en:string;observacion?:string}[]>(url('periodontograma'), []);
  const historial = useDatos<{id:string;tipo:string;fecha:string;titulo:string;detalle:string}[]>(url('timeline'), []);
  const planes = useDatos<Plan[]>(url('planes'), []);
  const presupuestos = useDatos<Presupuesto[]>(url('presupuestos'), []);
  const consentimientos = useDatos<Consentimiento[]>(url('consentimientos'), []);
  const cuenta = useDatos<Saldo | null>(url('saldo-consulta'), null);
  const movimientos = useDatos<Movimiento[]>(url('movimientos-cuenta'), []);
  const tratamientos = useDatos<{id:string;nombre:string;precio_base:number}[]>('/publico/servicios', []);
  const [seleccionPlan, setSeleccionPlan] = useState('');
  const items = useDatos<{id:string;pieza_fdi?:number;tratamiento:string;cantidad:number;precio_unitario:number;subtotal:number}[]>(
    seleccionPlan ? `/clinica/planes/${seleccionPlan}/items` : null, []);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [modalHallazgo, setModalHallazgo] = useState(false);
  const [modalAtencion, setModalAtencion] = useState(false);
  const [selector, setSelector] = useState<{piezaFdi:number;superficie:SuperficieDental}>({ piezaFdi: 16, superficie: 'OCLUSAL' });
  const [tipo, setTipo] = useState<TipoHallazgo>('CARIES');
  const [estado, setEstado] = useState<EstadoHallazgo>('EXISTENTE');
  const [observacion, setObservacion] = useState('');
  const [atencion, setAtencion] = useState({ motivoConsulta:'', diagnostico:'', diagnosticoCie10:'', procedimiento:'', indicaciones:'', firmar:false });
  const [anam, setAnam] = useState({ enfermedades:'', medicamentos:'', alergias:'', antecedentesFamiliares:'', observaciones:'', validada:false });
  const [perio, setPerio] = useState({ piezaFdi: 16, observacion:'', sondajes:[2,2,2,2,2,2], sangrados:[false,false,false,false,false,false] });
  const [plan, setPlan] = useState({ tratamientoId:'', piezaFdi:16, cantidad:1, precioUnitario:0, observaciones:'' });
  const [plantilla, setPlantilla] = useState('CONSENTIMIENTO_TRATAMIENTO');
  const paciente = pacientes.datos.find((p) => p.id === pacienteId);
  const vigentes = hallazgosVigentes(hallazgos.datos);

  function reiniciarPaciente(id: string) { setPacienteId(id); setSeleccionPlan(''); setTab('resumen'); setError(''); setOk(''); }
  function seleccionSuperficie(piezaFdi: number, superficie: SuperficieDental) { setSelector({ piezaFdi, superficie }); setModalHallazgo(true); }
  function exito(texto: string) { setError(''); setOk(texto); }
  function fallo(e: unknown) { setOk(''); setError((e as Error).message || 'No se pudo completar la operación.'); }
  async function guardarHallazgo(e: React.FormEvent) {
    e.preventDefault(); try {
      await post('/clinica/odontograma', { pacienteId, ...selector, tipo, estado, observacion });
      setModalHallazgo(false); setObservacion(''); hallazgos.cargar(); historial.cargar(); exito('Hallazgo registrado con fecha y autor.');
    } catch (e) { fallo(e); }
  }
  async function guardarAtencion(e: React.FormEvent) {
    e.preventDefault(); try {
      await post('/clinica/atenciones', { pacienteId, ...atencion });
      setModalAtencion(false); setAtencion({motivoConsulta:'',diagnostico:'',diagnosticoCie10:'',procedimiento:'',indicaciones:'',firmar:false});
      atenciones.cargar(); historial.cargar(); exito('Atención clínica registrada.');
    } catch (e) { fallo(e); }
  }
  async function guardarAnamnesis(e: React.FormEvent) {
    e.preventDefault(); try {
      await post('/clinica/anamnesis', { pacienteId, ...anam }); anamnesis.cargar(); historial.cargar(); exito('Anamnesis registrada.');
    } catch (e) { fallo(e); }
  }
  async function guardarPeriodonto(e: React.FormEvent) {
    e.preventDefault(); try {
      await post('/clinica/periodontograma', { pacienteId, observacion:perio.observacion,
        sitios:sitios.map((sitio, i) => ({piezaFdi:perio.piezaFdi,sitio,sondajeMm:perio.sondajes[i],recesionMm:0,
          sangrado:perio.sangrados[i],placa:false,supuracion:false})) });
      periodontos.cargar(); exito('Examen periodontal de seis sitios registrado.');
    } catch (e) { fallo(e); }
  }
  async function guardarPlan(e: React.FormEvent) {
    e.preventDefault(); try {
      await post('/clinica/planes', { pacienteId, observaciones:plan.observaciones,
        items:[{tratamientoId:plan.tratamientoId,piezaFdi:plan.piezaFdi,cantidad:plan.cantidad,precioUnitario:plan.precioUnitario}] });
      planes.cargar(); presupuestos.cargar(); exito('Plan guardado en borrador. Aún no es un presupuesto aceptado.');
    } catch (e) { fallo(e); }
  }
  async function crearConsentimiento(e: React.FormEvent) {
    e.preventDefault(); try {
      await post('/clinica/consentimientos/borrador', {pacienteId,plantillaCodigo:plantilla,versionDocumento:1});
      consentimientos.cargar(); exito('Borrador de consentimiento creado. No equivale a una firma del paciente.');
    } catch (e) { fallo(e); }
  }
  const tablaVacia = (mensaje: string) => <Vacío texto={mensaje} />;

  return <>
    <Encabezado titulo="Historia Clínica Integral" subtitulo="Un expediente completo, trazable y organizado por paciente."
      accion={<div className="acciones-encabezado"><button type="button" className="boton secundario" disabled={!pacienteId} onClick={() => window.print()}><Printer size={17}/> Imprimir / PDF</button><button type="button" className="boton primario" disabled={!pacienteId} onClick={() => setModalAtencion(true)}><Plus size={17}/> Nueva atención</button></div>} />
    <Aviso tipo="ok" texto={ok}/><Aviso texto={error}/>
    <div className="ficha-paciente">
      <div className="ficha-avatar"><FileHeart size={27}/></div>
      <div className="ficha-datos"><label>Historia del paciente
        <select aria-label="Seleccionar historia clínica" value={pacienteId} onChange={(e) => reiniciarPaciente(e.target.value)}>
          <option value="">Seleccionar paciente asignado</option>
          {pacientes.datos.map((p) => <option key={p.id} value={p.id}>{p.nombres} {p.apellidos} · {p.numero_documento || 'Sin documento'}</option>)}
        </select>
      </label>{paciente && <small>Documento: {paciente.numero_documento || 'No registrado'} · Teléfono: {paciente.telefono || 'No registrado'}</small>}</div>
      <div className="ficha-alertas">
        {paciente?.alergias ? <span className="alerta-clinica"><AlertTriangle size={16}/> Alergias: {paciente.alergias}</span> :
          <span className="estado-salud"><ShieldCheck size={16}/> Verificar alergias y anamnesis</span>}
        {paciente?.antecedentes_alertas && <span className="alerta-clinica"><AlertTriangle size={16}/>{paciente.antecedentes_alertas}</span>}
      </div>
    </div>
    {!pacienteId ? <CajaCard>{tablaVacia('Selecciona un paciente asignado para abrir la Historia Clínica.')}</CajaCard> : <>
      <div className="tabs-clinicas" role="tablist" aria-label="Secciones de la historia clínica">
        {PESTAÑAS.map(({clave, texto}) => <button key={clave} role="tab" aria-selected={tab === clave}
          className={tab === clave ? 'activo' : ''} onClick={() => setTab(clave)}>{texto}</button>)}
      </div>
      <div className="clinica-layout-integrado">
        <div className="clinica-contenido"><CajaCard>
          {tab === 'resumen' && <>
            <div className="titulo-con-acciones"><h3>Resumen e historial cronológico</h3><span className="etiqueta-estado">Historia del paciente</span></div>
            <div className="grid-kpis tres">
              <div className="tarjeta-kpi"><span><Stethoscope size={17}/> Atenciones</span><strong>{atenciones.datos.length}</strong></div>
              <div className="tarjeta-kpi"><span><HeartPulse size={17}/> Hallazgos</span><strong>{vigentes.length}</strong></div>
              <div className="tarjeta-kpi"><span><ClipboardList size={17}/> Exámenes periodontales</span><strong>{periodontos.datos.length}</strong></div>
            </div>
            <h3 className="subtitulo-clinico">Línea de tiempo clínica</h3>
            {historial.datos.length ? historial.datos.map((x, i) => <div className="timeline-item" key={x.id + i}>
              <div className="timeline-punto"/><div><small>{fechaLocal(x.fecha)} · {x.tipo}</small><strong>{x.titulo}</strong><p>{x.detalle}</p></div>
            </div>) : tablaVacia('No hay eventos clínicos. Registra la primera atención o hallazgo.')}
          </>}
          {tab === 'odontograma' && <>
            <Odontograma registros={hallazgos.datos} seleccionar={seleccionSuperficie}/>
            <h3 className="subtitulo-clinico">Hallazgos registrados ({vigentes.length})</h3>
            {vigentes.length ? <div className="tabla-scroll"><table className="tabla"><thead><tr><th>Fecha</th><th>Pieza</th><th>Superficie</th><th>Hallazgo</th><th>Estado</th><th>Observación</th></tr></thead>
              <tbody>{[...vigentes].reverse().map((r) => <tr key={r.id}><td>{fechaLocal(r.registrado_en)}</td><td>{r.pieza_fdi}</td><td>{r.superficie}</td><td>{r.tipo}</td><td>{r.estado}</td><td>{r.observacion || '—'}</td></tr>)}</tbody></table></div> : tablaVacia('Todavía no existen hallazgos para este paciente.')}
          </>}
          {tab === 'periodonto' && <>
            <h3>Periodontograma — medición en seis sitios</h3>
            <p className="muted">Se registran sondaje, sangrado y observaciones por pieza FDI. Selecciona una pieza de la arcada permanente para completar sus seis sitios.</p>
            <div className="selector-piezas-perio" role="group" aria-label="Seleccionar diente para sondaje periodontal">
              {CUADRANTES.PERMANENTE.flat().map((fdi) => <button type="button" key={fdi}
                className={perio.piezaFdi === fdi ? 'activo' : ''} onClick={() => setPerio({...perio,piezaFdi:fdi})}>{fdi}</button>)}
            </div>
            <form className="formulario" onSubmit={guardarPeriodonto}>
              <label>Pieza FDI <input type="number" min={11} max={85} value={perio.piezaFdi} onChange={(e) => setPerio({...perio,piezaFdi:Number(e.target.value)})}/></label>
              <div className="perio-grid">{sitios.map((sitio, i) => <label key={sitio}>{sitio}
                <input type="number" min={0} max={20} value={perio.sondajes[i]} onChange={(e) => setPerio((p) => ({...p,sondajes:p.sondajes.map((v,j) => i === j ? Number(e.target.value) : v)}))}/>
                <span className="checkbox-perio"><input type="checkbox" checked={perio.sangrados[i]} onChange={(e) => setPerio((p) => ({...p,sangrados:p.sangrados.map((v,j) => i === j ? e.target.checked : v)}))}/> Sangrado</span>
              </label>)}</div>
              <label>Observaciones<textarea rows={2} value={perio.observacion} onChange={(e) => setPerio({...perio,observacion:e.target.value})}/></label>
              <button className="boton primario"><Save size={16}/> Guardar examen</button>
            </form>
            <h3 className="subtitulo-clinico">Mediciones anteriores</h3>
            {periodontos.datos.length ? periodontos.datos.map((x) => <div className="fila-resumen" key={x.id}><span>{fechaLocal(x.registrado_en)}</span><span>{x.observacion || 'Examen registrado'}</span></div>) : tablaVacia('No hay exámenes anteriores.')}
          </>}
          {tab === 'anamnesis' && <div className="clinica-dos-columnas">
            <form className="formulario" onSubmit={guardarAnamnesis}><h3>Registrar anamnesis</h3>
              {(['enfermedades','medicamentos','alergias','antecedentesFamiliares','observaciones'] as const).map((k) => <label key={k}>{({enfermedades:'Enfermedades',medicamentos:'Medicamentos',alergias:'Alergias',antecedentesFamiliares:'Antecedentes familiares',observaciones:'Observaciones'} as const)[k]}
                <textarea rows={2} value={anam[k]} onChange={(e) => setAnam({...anam,[k]:e.target.value})}/></label>)}
              <label className="checkbox-linea"><input type="checkbox" checked={anam.validada} onChange={(e) => setAnam({...anam,validada:e.target.checked})}/> Información validada por el profesional</label>
              <button className="boton primario">Guardar anamnesis</button>
            </form><div><h3>Historial</h3>{anamnesis.datos.map((a) => <div className="nota-clinica" key={a.id}><small>{fechaLocal(a.registrada_en)}</small><p><strong>Alergias:</strong> {a.alergias || 'No especificadas'}</p><p><strong>Enfermedades:</strong> {a.enfermedades || 'No especificadas'}</p><p><strong>Medicamentos:</strong> {a.medicamentos || 'No especificados'}</p></div>)}{!anamnesis.datos.length && tablaVacia('No hay anamnesis registradas.')}</div>
          </div>}
          {tab === 'evoluciones' && <>
            <div className="titulo-con-acciones"><h3>Evoluciones y registros firmados</h3><button className="boton secundario" onClick={() => setModalAtencion(true)}><Plus size={16}/> Registrar</button></div>
            {atenciones.datos.map((a) => <div className="nota-clinica" key={a.id}><div className="nota-cabecera"><strong>{a.diagnostico || a.motivo_consulta}</strong><span className={'etiqueta-estado ' + (a.estado === 'FIRMADA' ? 'exito' : '')}>{a.estado}</span></div>
              <small>{fechaLocal(a.creada_en)} · {a.profesional}</small><p><strong>Motivo:</strong> {a.motivo_consulta}</p><p><strong>Evolución y procedimiento:</strong> {a.procedimiento}</p>{a.indicaciones && <p><strong>Indicaciones:</strong> {a.indicaciones}</p>}</div>)}
            {!atenciones.datos.length && tablaVacia('Este paciente no tiene evoluciones todavía.')}
          </>}
          {tab === 'tratamientos' && <>
            <h3>Procedimientos efectuados por fecha</h3><p className="muted">La atención médica y su cargo financiero son registros diferentes: aquí se ve lo que el profesional documentó.</p>
            {atenciones.datos.length ? <div className="tabla-scroll"><table className="tabla"><thead><tr><th>Fecha</th><th>Profesional</th><th>Procedimiento</th><th>Diagnóstico</th><th>Registro</th></tr></thead>
              <tbody>{atenciones.datos.map((a) => <tr key={a.id}><td>{fechaLocal(a.creada_en)}</td><td>{a.profesional}</td><td>{a.procedimiento}</td><td>{a.diagnostico || '—'}</td><td>{a.estado}</td></tr>)}</tbody></table></div> : tablaVacia('No hay tratamientos documentados.')}
          </>}
          {tab === 'presupuestos' && <div className="clinica-dos-columnas">
            <form className="formulario" onSubmit={guardarPlan}><h3>Plan de tratamiento</h3>
              <label>Tratamiento<select required value={plan.tratamientoId} onChange={(e) => {const elegido = tratamientos.datos.find((t) => t.id === e.target.value);setPlan({...plan,tratamientoId:e.target.value,precioUnitario:elegido?.precio_base || 0});}}><option value="">Seleccionar</option>{tratamientos.datos.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}</select></label>
              <div className="form-grid"><label>Pieza FDI<input type="number" value={plan.piezaFdi} onChange={(e) => setPlan({...plan,piezaFdi:Number(e.target.value)})}/></label>
                <label>Cantidad<input type="number" min={1} value={plan.cantidad} onChange={(e) => setPlan({...plan,cantidad:Number(e.target.value)})}/></label></div>
              <label>Precio unitario (S/)<input type="number" min={0} step=".01" value={plan.precioUnitario} onChange={(e) => setPlan({...plan,precioUnitario:Number(e.target.value)})}/></label>
              <label>Observaciones<textarea rows={3} value={plan.observaciones} onChange={(e) => setPlan({...plan,observaciones:e.target.value})}/></label>
              <button className="boton primario">Guardar plan en borrador</button>
            </form>
            <div><h3>Planes y presupuestos</h3><p className="muted">Solo propuestas; la aceptación verificable todavía requiere implementar el circuito de firma.</p>
              {presupuestos.datos.map((x) => <button type="button" className={'seleccion-presupuesto ' + (seleccionPlan === x.id ? 'activo' : '')} onClick={() => setSeleccionPlan(x.id)} key={x.id}>
                <strong>Plan v{x.version} · {x.estado}</strong><span>{moneda(x.monto_total)} · {x.cantidad_items} tratamientos</span><small>{fechaLocal(x.creado_en)}</small>
              </button>)}
              {!presupuestos.datos.length && tablaVacia('No hay presupuestos registrados.')}
              {seleccionPlan && <div className="tabla-scroll"><table className="tabla"><thead><tr><th>Tratamiento</th><th>Pieza</th><th>Subtotal</th></tr></thead><tbody>{items.datos.map((i) => <tr key={i.id}><td>{i.tratamiento}</td><td>{i.pieza_fdi || '—'}</td><td>{moneda(i.subtotal)}</td></tr>)}</tbody></table></div>}
            </div>
          </div>}
          {tab === 'documentos' && <><h3>Radiografías, fotografías y archivos clínicos</h3><DocumentosClinicos pacienteId={pacienteId}/></>}
          {tab === 'consentimientos' && <>
            <h3>Consentimientos informados</h3><p className="muted">Los borradores no son firmas digitales ni autorizaciones clínicas efectivas hasta completar la validación correspondiente.</p>
            <form className="formulario formulario-inline" onSubmit={crearConsentimiento}><label>Plantilla
              <select value={plantilla} onChange={(e) => setPlantilla(e.target.value)}>
                <option value="CONSENTIMIENTO_TRATAMIENTO">Consentimiento de tratamiento</option><option value="CONSENTIMIENTO_CIRUGIA">Cirugía</option>
                <option value="CONSENTIMIENTO_ENDODONCIA">Endodoncia</option><option value="CONSENTIMIENTO_ORTODONCIA">Ortodoncia</option>
                <option value="CONSENTIMIENTO_FOTOGRAFIA">Fotografía clínica</option>
              </select></label><button className="boton primario">Crear borrador</button></form>
            {consentimientos.datos.length ? <div className="tabla-scroll"><table className="tabla"><thead><tr><th>Creado</th><th>Plantilla</th><th>Versión</th><th>Estado de firma</th></tr></thead><tbody>
              {consentimientos.datos.map((c) => <tr key={c.id}><td>{fechaLocal(c.creado_en)}</td><td>{c.plantilla_codigo}</td><td>{c.version_documento}</td><td>{c.firmado_en ? `Registrada: ${fechaLocal(c.firmado_en)}` : 'Borrador sin firma'}</td></tr>)}
            </tbody></table></div> : tablaVacia('No hay consentimientos registrados.')}
          </>}
          {tab === 'cuenta' && <>
            <div className="titulo-con-acciones"><div><h3>Atenciones y estado de cuenta</h3><p>Solo lectura clínica. Los cargos y abonos los registra recepción o administración.</p></div><span className="etiqueta-estado">Consulta</span></div>
            <div className="grid-kpis cuatro">
              <div className="tarjeta-kpi"><span>Cuenta</span><strong>{moneda(cuenta.datos?.total_cargos)}</strong></div>
              <div className="tarjeta-kpi"><span>Abonos</span><strong>{moneda(cuenta.datos?.total_pagado)}</strong></div>
              <div className="tarjeta-kpi"><span>Saldo deudor</span><strong>{moneda(cuenta.datos?.deuda)}</strong></div>
              <div className="tarjeta-kpi"><span>Saldo a favor</span><strong>{moneda(cuenta.datos?.saldo_a_favor)}</strong></div>
            </div>
            {movimientos.datos.length ? <div className="tabla-scroll"><table className="tabla"><thead><tr><th>Fecha</th><th>Tratamiento / Movimiento</th><th>Cuenta (S/)</th><th>Abono (S/)</th><th>Saldo (S/)</th></tr></thead>
              <tbody>{movimientos.datos.map((m) => <tr key={m.id}><td>{fechaLocal(m.fecha)}</td><td>{m.descripcion}</td><td>{m.tipo === 'CARGO' ? moneda(m.cargo) : '—'}</td><td>{m.tipo === 'ABONO' ? moneda(m.abono) : '—'}</td><td>{moneda(m.saldo_acumulado)}</td></tr>)}</tbody></table></div> : tablaVacia('No existen movimientos financieros de este paciente.')}
            <p className="nota-caja">El saldo acumulado muestra la secuencia de cargos y abonos; el saldo deudor y saldo a favor se calculan por separado.</p>
          </>}
        </CajaCard></div>
        <aside className="clinica-barra-lateral" aria-label="Contexto del paciente">
          <div className="clinica-panel-contexto"><span className="contexto-etiqueta"><CalendarDays size={15}/> Última atención</span>
            <strong>{atenciones.datos[0] ? fechaLocal(atenciones.datos[0].creada_en) : 'Sin atención registrada'}</strong>
            <p>{atenciones.datos[0]?.procedimiento || 'La primera atención aparecerá aquí.'}</p></div>
          <div className="clinica-panel-contexto"><span className="contexto-etiqueta"><BookHeart size={15}/> Plan vigente</span>
            <strong>{planes.datos[0] ? `Versión ${planes.datos[0].version} · ${planes.datos[0].estado}` : 'Sin plan registrado'}</strong>
            <p>{planes.datos[0]?.observaciones || 'Registra el plan clínico desde la pestaña de presupuestos.'}</p></div>
          <div className="clinica-panel-contexto"><span className="contexto-etiqueta"><Wallet size={15}/> Saldo de consulta</span>
            <strong>{moneda(cuenta.datos?.deuda)}</strong><p>Deuda actual. Los cobros se gestionan en el panel de recepción.</p></div>
          <div className="clinica-panel-contexto"><span className="contexto-etiqueta"><ShieldCheck size={15}/> Trazabilidad</span><p>Atenciones, firmas internas, hallazgos y rectificaciones conservan fecha y autor.</p></div>
        </aside>
      </div>
    </>}
    <Modal titulo={`Hallazgo · Pieza ${selector.piezaFdi} · ${selector.superficie}`} abierto={modalHallazgo} cerrar={() => setModalHallazgo(false)}>
      <form className="formulario" onSubmit={guardarHallazgo}><label>Hallazgo<select value={tipo} onChange={(e) => setTipo(e.target.value as TipoHallazgo)}>{TIPOS.map((x) => <option key={x}>{x}</option>)}</select></label>
        <label>Estado<select value={estado} onChange={(e) => setEstado(e.target.value as EstadoHallazgo)}>{ESTADOS.map((x) => <option key={x}>{x}</option>)}</select></label>
        <label>Observaciones<textarea rows={3} value={observacion} onChange={(e) => setObservacion(e.target.value)} /></label>
        <button className="boton primario"><Save size={16}/> Guardar hallazgo</button></form>
    </Modal>
    <Modal titulo="Registrar atención clínica" abierto={modalAtencion} cerrar={() => setModalAtencion(false)}>
      <form className="formulario" onSubmit={guardarAtencion}><label>Motivo de consulta *<input required value={atencion.motivoConsulta} onChange={(e) => setAtencion({...atencion,motivoConsulta:e.target.value})}/></label>
        <div className="form-grid"><label>Diagnóstico<input value={atencion.diagnostico} onChange={(e) => setAtencion({...atencion,diagnostico:e.target.value})}/></label><label>CIE-10<input value={atencion.diagnosticoCie10} onChange={(e) => setAtencion({...atencion,diagnosticoCie10:e.target.value})}/></label></div>
        <label>Evolución y procedimiento *<textarea required rows={5} value={atencion.procedimiento} onChange={(e) => setAtencion({...atencion,procedimiento:e.target.value})}/></label>
        <label>Indicaciones<textarea rows={3} value={atencion.indicaciones} onChange={(e) => setAtencion({...atencion,indicaciones:e.target.value})}/></label>
        <label className="checkbox-linea"><input type="checkbox" checked={atencion.firmar} onChange={(e) => setAtencion({...atencion,firmar:e.target.checked})}/> Cerrar y generar huella de integridad (no es firma digital certificada)</label>
        <button className="boton primario">Guardar atención</button></form>
    </Modal>
  </>;
}
