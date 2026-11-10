import React,{useCallback,useEffect,useState} from 'react';
import {AlertTriangle,CheckCircle2,Loader2,RefreshCw,X} from 'lucide-react';
import {api} from '../servicios/cliente';
export function useDatos<T>(url:string|null,inicial:T){
 const [datos,setDatos]=useState<T>(inicial),[error,setError]=useState(''),[cargando,setCargando]=useState(false),[revision,setRevision]=useState(0);
 const cargar=useCallback(()=>setRevision(v=>v+1),[]);
 useEffect(()=>{let activo=true;setDatos(inicial);setError('');if(!url){setCargando(false);return;}setCargando(true);api<T>(url).then(d=>{if(activo){if(Array.isArray(inicial)&&!Array.isArray(d)){setDatos(inicial);}else{setDatos(d);}setError('');}}).catch(e=>{if(activo)setError((e as Error).message)}).finally(()=>{if(activo)setCargando(false)});return()=>{activo=false};},[url,revision]);
 const datosSeguros = Array.isArray(inicial) ? (Array.isArray(datos) ? datos : inicial) : datos;
 return {datos: datosSeguros,setDatos,error,cargando,cargar};
}
export function Encabezado({titulo,subtitulo,accion}:{titulo:string;subtitulo?:string;accion?:React.ReactNode}){return <div className="encabezado-pagina"><div><h1>{titulo}</h1>{subtitulo&&<p>{subtitulo}</p>}</div>{accion&&<div className="acciones-encabezado">{accion}</div>}</div>}
export function Aviso({tipo='error',texto}:{tipo?:'error'|'ok'|'info';texto?:string}){return texto?<div className={'aviso '+tipo} role="status">{tipo==='error'?<AlertTriangle size={18}/>:<CheckCircle2 size={18}/>}<span>{texto}</span></div>:null}
export function Cargando({visible}:{visible:boolean}){return visible?<div className="cargando"><Loader2 className="rotando" size={18}/> Actualizando información…</div>:null}
export function CajaCard({titulo,children,acciones}:{titulo?:string;children:React.ReactNode;acciones?:React.ReactNode}){return <section className="caja-card">{titulo&&<header className="caja-card-header"><h2>{titulo}</h2>{acciones}</header>}<div className="caja-card-body">{children}</div></section>}
export function Modal({titulo,abierto,cerrar,children}:{titulo:string;abierto:boolean;cerrar:()=>void;children:React.ReactNode}){if(!abierto)return null;return <div className="fondo-modal" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)cerrar()}}><div className="modal" role="dialog" aria-modal="true" aria-label={titulo}><header><h2>{titulo}</h2><button className="icono-boton" onClick={cerrar} aria-label="Cerrar"><X/></button></header><div className="modal-contenido">{children}</div></div></div>}
export function Vacío({texto}:{texto:string}){return <div className="vacio"><p>{texto}</p></div>}
