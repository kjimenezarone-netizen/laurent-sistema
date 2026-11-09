import React, { useState } from 'react';
import { CalendarClock, CheckCircle2, LockKeyhole, Plus, ShieldCheck } from 'lucide-react';
import { fechaLocal, patch, post, Rol } from '../servicios/cliente';
import { Aviso, CajaCard, Encabezado, Vacío, useDatos } from '../componentes/Ui';

type Disponibilidad = { id:string;odontologo_usuario_id:string;medico:string;dia_semana:number;desde:string;hasta:string;aprobado:boolean };
type Odontologo = {usuario_id:string;nombre:string};
type Bloqueo = {id:string;medico?:string;sillon?:string;inicio:string;fin:string;motivo:string};
const dias=['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
export function Horarios({rol,usuarioId}:{rol:Rol;usuarioId:string}) {
 const r=useDatos<Disponibilidad[]>('/horarios',[]),m=useDatos<Odontologo[]>('/agenda/odontologos',[]);
 const bloqueos=useDatos<Bloqueo[]>('/horarios/bloqueos',[]);
 const [error,setError]=useState(''),[ok,setOk]=useState(''),[form,setForm]=useState({odontologoUsuarioId:usuarioId,diaSemana:1,desde:'08:00',hasta:'17:00'});
 const [bloqueo,setBloqueo]=useState({odontologoUsuarioId:'',sillonId:'',inicio:'',fin:'',motivo:''});
 const s=useDatos<{id:string;nombre:string}[]>('/agenda/sillones',[]);
 async function proponer(e:React.FormEvent) { e.preventDefault();setError('');try{
   await post('/horarios', {...form,odontologoUsuarioId:rol==='MEDICO'?usuarioId:form.odontologoUsuarioId});
   r.cargar();setOk('Horario propuesto. Su uso para reservar requiere aprobación administrativa.');
  }catch(x){setError((x as Error).message)} }
 async function aprobar(id:string,valor:boolean){setError('');try{await patch(`/horarios/${id}/aprobar`,{aprobado:valor});r.cargar();setOk('Aprobación actualizada.')}catch(x){setError((x as Error).message)}}
 async function bloquear(e:React.FormEvent){e.preventDefault();setError('');try{
  await post('/horarios/bloqueos',{...bloqueo,odontologoUsuarioId:bloqueo.odontologoUsuarioId||null,sillonId:bloqueo.sillonId||null,
   inicio:new Date(bloqueo.inicio).toISOString(),fin:new Date(bloqueo.fin).toISOString()});
   bloqueos.cargar();setOk('Bloqueo creado después de comprobar las citas vigentes.');
  }catch(x){setError((x as Error).message)}}
 return <><Encabezado titulo="Horarios y disponibilidad" subtitulo="El odontólogo propone sus turnos y administración aprueba la disponibilidad para la Agenda Inteligente."/>
 <Aviso texto={error}/><Aviso tipo="ok" texto={ok}/>
 <CajaCard titulo="Turnos semanales" acciones={<span className="pill-claro"><CalendarClock size={16}/> Aprobación de recepción no permitida</span>}>
 {r.datos.length===0?<Vacío texto="No hay propuestas. Comienza creando un horario semanal."/>:<div className="tabla-scroll"><table className="tabla"><thead><tr><th>Odontólogo</th><th>Día</th><th>Desde</th><th>Hasta</th><th>Estado</th>{rol==='ADMINISTRADOR'&&<th>Acciones</th>}</tr></thead><tbody>
 {r.datos.map(x=><tr key={x.id}><td>{x.medico}</td><td>{dias[x.dia_semana-1]}</td><td>{x.desde}</td><td>{x.hasta}</td><td><span className={'etiqueta-estado '+(x.aprobado?'exito':'')}>{x.aprobado?'Aprobado':'Pendiente'}</span></td>{rol==='ADMINISTRADOR'&&<td><button className="boton secundario" onClick={()=>aprobar(x.id,!x.aprobado)}>{x.aprobado?'Retirar aprobación':'Aprobar'}</button></td>}</tr>)}
 </tbody></table></div>}
 </CajaCard>
 {(rol==='MEDICO'||rol==='ADMINISTRADOR')&&<CajaCard titulo="Proponer nuevo turno"><form onSubmit={proponer} className="formulario"><div className="form-grid">
 {rol==='ADMINISTRADOR'&&<label>Odontólogo<select required value={form.odontologoUsuarioId} onChange={e=>setForm({...form,odontologoUsuarioId:e.target.value})}><option value="">Seleccionar</option>{m.datos.map(x=><option key={x.usuario_id} value={x.usuario_id}>{x.nombre}</option>)}</select></label>}
 <label>Día<select value={form.diaSemana} onChange={e=>setForm({...form,diaSemana:Number(e.target.value)})}>{dias.map((d,i)=><option key={d} value={i+1}>{d}</option>)}</select></label>
 <label>Inicio<input required type="time" value={form.desde} onChange={e=>setForm({...form,desde:e.target.value})}/></label>
 <label>Fin<input required type="time" value={form.hasta} onChange={e=>setForm({...form,hasta:e.target.value})}/></label></div><button className="boton primario"><Plus size={16}/> Proponer turno</button></form></CajaCard>}
 <CajaCard titulo="Bloqueos aprobados de agenda"><p className="muted">Permisos, vacaciones, mantenimiento y emergencias no deben sobreponerse a citas activas.</p>
 {bloqueos.datos.length>0?<div className="tabla-scroll"><table className="tabla"><thead><tr><th>Odontólogo / sillón</th><th>Inicio</th><th>Fin</th><th>Motivo</th></tr></thead><tbody>{bloqueos.datos.map(x=><tr key={x.id}><td>{x.medico||x.sillon||'General'}</td><td>{fechaLocal(x.inicio)}</td><td>{fechaLocal(x.fin)}</td><td>{x.motivo}</td></tr>)}</tbody></table></div>:<Vacío texto="No hay bloqueos registrados."/>}
 {rol==='ADMINISTRADOR'&&<form className="formulario" onSubmit={bloquear}><h3>Registrar bloqueo administrativo</h3><div className="form-grid"><label>Odontólogo (opcional)<select value={bloqueo.odontologoUsuarioId} onChange={e=>setBloqueo({...bloqueo,odontologoUsuarioId:e.target.value})}><option value="">Sin odontólogo</option>{m.datos.map(x=><option key={x.usuario_id} value={x.usuario_id}>{x.nombre}</option>)}</select></label><label>Sillón (opcional)<select value={bloqueo.sillonId} onChange={e=>setBloqueo({...bloqueo,sillonId:e.target.value})}><option value="">Sin sillón</option>{s.datos.map(x=><option key={x.id} value={x.id}>{x.nombre}</option>)}</select></label></div><div className="form-grid"><label>Inicio<input required type="datetime-local" value={bloqueo.inicio} onChange={e=>setBloqueo({...bloqueo,inicio:e.target.value})}/></label><label>Fin<input required type="datetime-local" value={bloqueo.fin} onChange={e=>setBloqueo({...bloqueo,fin:e.target.value})}/></label></div><label>Motivo<input required minLength={5} value={bloqueo.motivo} onChange={e=>setBloqueo({...bloqueo,motivo:e.target.value})}/></label><button className="boton secundario"><LockKeyhole size={16}/> Registrar bloqueo</button></form>}
 </CajaCard></>
}
