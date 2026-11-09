import React,{useState} from 'react';
import {ShieldCheck,Plus} from 'lucide-react';
import {fechaLocal,post} from '../servicios/cliente';
import {Aviso,CajaCard,Encabezado,Vacío,useDatos} from '../componentes/Ui';
type Ciclo={id:string;equipo:string;inicio:string;fin?:string;resultado:string;observaciones?:string};
export function Esterilizacion(){
 const ciclos=useDatos<Ciclo[]>('/operaciones/esterilizacion',[]);
 const [form,setForm]=useState({equipo:'',inicio:'',fin:'',resultado:'PENDIENTE',observaciones:''}),[error,setError]=useState(''),[ok,setOk]=useState('');
 async function guardar(e:React.FormEvent){e.preventDefault();setError('');try{await post('/operaciones/esterilizacion',{...form,inicio:new Date(form.inicio).toISOString(),fin:form.fin?new Date(form.fin).toISOString():null});ciclos.cargar();setOk('Ciclo de esterilización registrado.');}catch(x){setError((x as Error).message)}}
 return <><Encabezado titulo="Esterilización" subtitulo="Registro de equipos, resultados y ciclos realizados."/><Aviso texto={error}/><Aviso tipo="ok" texto={ok}/>
 <CajaCard titulo="Ciclos recientes">{ciclos.datos.length?<div className="tabla-scroll"><table className="tabla"><thead><tr><th>Equipo</th><th>Inicio</th><th>Fin</th><th>Resultado</th><th>Observaciones</th></tr></thead><tbody>{ciclos.datos.map(c=><tr key={c.id}><td>{c.equipo}</td><td>{fechaLocal(c.inicio)}</td><td>{c.fin?fechaLocal(c.fin):'Pendiente'}</td><td>{c.resultado}</td><td>{c.observaciones}</td></tr>)}</tbody></table></div>:<Vacío texto="No hay ciclos registrados."/>}</CajaCard>
 <CajaCard titulo="Registrar nuevo ciclo"><form className="formulario" onSubmit={guardar}><label>Equipo de esterilización<input required value={form.equipo} onChange={e=>setForm({...form,equipo:e.target.value})}/></label><div className="form-grid"><label>Inicio<input type="datetime-local" required value={form.inicio} onChange={e=>setForm({...form,inicio:e.target.value})}/></label><label>Fin<input type="datetime-local" value={form.fin} onChange={e=>setForm({...form,fin:e.target.value})}/></label></div><label>Resultado<select value={form.resultado} onChange={e=>setForm({...form,resultado:e.target.value})}>{['PENDIENTE','APROBADO','RECHAZADO'].map(x=><option key={x}>{x}</option>)}</select></label><label>Observaciones<textarea value={form.observaciones} onChange={e=>setForm({...form,observaciones:e.target.value})}/></label><button className="boton primario"><ShieldCheck size={17}/> Registrar ciclo</button></form></CajaCard></>
}
