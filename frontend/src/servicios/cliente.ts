export type Rol = 'ADMINISTRADOR'|'MEDICO'|'RECEPCIONISTA';
export type Usuario = {id:string;nombre:string;rol:Rol;username?:string};
let tokenSesion: string|null=null;
export const setToken=(token:string|null)=>{tokenSesion=token;};
export const tieneToken=()=>Boolean(tokenSesion);
export class ErrorApi extends Error { constructor(readonly status:number, message:string){super(message);} }
export async function api<T=any>(ruta:string, opciones:RequestInit={}):Promise<T>{
 const encabezados:Record<string,string>={};
 if(!(opciones.body instanceof FormData))encabezados['Content-Type']='application/json';
 if(tokenSesion) encabezados['Authorization']=`Bearer ${tokenSesion}`;
 Object.assign(encabezados,opciones.headers||{});
 const res=await fetch(`/api${ruta}`,{...opciones,headers:encabezados,credentials:'same-origin'});
 const body=await res.text();let datos:any;
 try{datos=body?JSON.parse(body):null;}catch{datos=body;}
 if(!res.ok){ if(res.status===401)setToken(null);throw new ErrorApi(res.status,datos?.error||`Error HTTP ${res.status}`); }
 return datos as T;
}
export const post=<T=any>(r:string,body:unknown,headers?:HeadersInit)=>api<T>(r,{method:'POST',body:JSON.stringify(body),headers});
export const patch=<T=any>(r:string,body:unknown)=>api<T>(r,{method:'PATCH',body:JSON.stringify(body)});
export const put=<T=any>(r:string,body:unknown)=>api<T>(r,{method:'PUT',body:JSON.stringify(body)});
export function fechaLocal(iso:string){return new Date(iso).toLocaleString('es-PE',{dateStyle:'short',timeStyle:'short'});}
export function moneda(v:unknown){return Number(v||0).toLocaleString('es-PE',{style:'currency',currency:'PEN'});}
export function fechaInputLocal(d:Date){const off=new Date(d.getTime()-d.getTimezoneOffset()*60000);return off.toISOString().slice(0,16);}
export async function subirArchivoPaciente(pacienteId:string,archivo:File,tipo:string){
 const datos=new FormData();datos.append('archivo',archivo);datos.append('tipo',tipo);
 return api(`/clinica/pacientes/${pacienteId}/archivos`,{method:'POST',body:datos});
}
export async function descargarArchivo(id:string,nombre:string){
 const r=await fetch(`/api/clinica/archivos/${id}/descargar`,{headers:tokenSesion?{Authorization:`Bearer ${tokenSesion}`}:{}});
 if(!r.ok)throw new Error(`Error de descarga: ${r.status}`);
 const url=URL.createObjectURL(await r.blob());const a=document.createElement('a');a.href=url;a.download=nombre;a.click();URL.revokeObjectURL(url);
}
