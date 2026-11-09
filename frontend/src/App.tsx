import React,{useState} from 'react';
import {BrowserRouter,Link,Navigate,Route,Routes,useLocation,useNavigate} from 'react-router-dom';
import {Activity,BarChart3,CalendarDays,ClipboardList,CreditCard,Database,FileHeart,Globe,HeartPulse,Home,LogOut,Menu,Package,PenLine,Settings2,ShieldCheck,Stethoscope,Users,Warehouse,X} from 'lucide-react';
import {api,post,setToken,Usuario,Rol} from './servicios/cliente';
import {Publica} from './paginas/Publica';
import {Agenda} from './paginas/Agenda';
import {Pacientes} from './paginas/Pacientes';
import {Clinica} from './paginas/Clinica';
import {Caja} from './paginas/Caja';
import {Administrador} from './paginas/Administrador';
import {Cms} from './paginas/Cms';
import {Configuracion} from './paginas/Configuracion';
import {Inventario} from './paginas/Inventario';
import {Laboratorio} from './paginas/Laboratorio';
import {Mensajeria} from './paginas/Mensajeria';
import {Esterilizacion} from './paginas/Esterilizacion';
import {Horarios} from './paginas/Horarios';

type Sesion={usuario:Usuario;token:string}|null;
const menu=[
 {ruta:'/panel',texto:'Resumen',icono:Home,roles:['ADMINISTRADOR','MEDICO','RECEPCIONISTA']},
 {ruta:'/agenda',texto:'Agenda inteligente',icono:CalendarDays,roles:['ADMINISTRADOR','MEDICO','RECEPCIONISTA']},
 {ruta:'/horarios',texto:'Horarios y turnos',icono:CalendarDays,roles:['ADMINISTRADOR','MEDICO','RECEPCIONISTA']},
 {ruta:'/pacientes',texto:'Pacientes',icono:Users,roles:['ADMINISTRADOR','MEDICO','RECEPCIONISTA']},
 {ruta:'/clinica',texto:'Historia clínica',icono:FileHeart,roles:['MEDICO']},
 {ruta:'/caja',texto:'Caja y saldos',icono:CreditCard,roles:['ADMINISTRADOR','RECEPCIONISTA']},
 {ruta:'/cms',texto:'Web y marketing',icono:Globe,roles:['ADMINISTRADOR']},
 {ruta:'/inventario',texto:'Inventario',icono:Package,roles:['ADMINISTRADOR','RECEPCIONISTA']},
 {ruta:'/esterilizacion',texto:'Esterilización',icono:ShieldCheck,roles:['ADMINISTRADOR']},
 {ruta:'/laboratorio',texto:'Laboratorio',icono:ClipboardList,roles:['ADMINISTRADOR','MEDICO','RECEPCIONISTA']},
 {ruta:'/mensajeria',texto:'LaurentBot / WhatsApp',icono:Activity,roles:['ADMINISTRADOR','RECEPCIONISTA']},
 {ruta:'/administracion',texto:'Configuración',icono:Settings2,roles:['ADMINISTRADOR']},
];
function Logo(){return <div className="marca"><div className="marca-simbolo">L<span>✦</span></div><div><strong>LAURENT</strong><small>CLÍNICA DENTAL</small></div></div>}
function Entrar({onLogin}:{onLogin:(s:Sesion)=>void}){
 const [usuario,setUsuario]=useState('');const [contrasena,setContrasena]=useState('');const [error,setError]=useState('');const [cargando,setCargando]=useState(false);const navegar=useNavigate();
 async function enviar(e:React.FormEvent){e.preventDefault();setCargando(true);setError('');try{const x=await post<{token:string;usuario:Usuario}>('/autenticacion/iniciar-sesion',{usuario,contrasena});setToken(x.token);onLogin(x);navegar('/panel',{replace:true});}catch(err){setError((err as Error).message)}finally{setCargando(false)}}
 return <div className="login-fondo"><div className="login-tarjeta"><Link to="/" className="regresar">← Regresar al sitio web</Link><Logo/><h1>Bienvenido a Laurent</h1><p>Accede a tu entorno de trabajo con tus credenciales autorizadas.</p><form onSubmit={enviar} className="formulario"><label>Usuario<input value={usuario} autoComplete="username" required onChange={e=>setUsuario(e.target.value)}/></label><label>Contraseña<input type="password" autoComplete="current-password" value={contrasena} required onChange={e=>setContrasena(e.target.value)}/></label>{error&&<p className="error" role="alert">{error}</p>}<button className="boton primario" disabled={cargando}>{cargando?'Verificando…':'Ingresar al sistema'}</button></form><div className="login-seguridad"><ShieldCheck size={18}/> Acceso restringido al personal autorizado. Nunca compartas tus credenciales.</div></div><aside className="login-banner"><div className="orbita"></div><div><span className="etiqueta oro">TECNOLOGÍA AL SERVICIO DE TU SONRISA</span><h2>La atención de siempre, con una gestión más inteligente.</h2><p>Clínica · Agenda · Pacientes · Atención · Finanzas.</p></div></aside></div>
}
function Marco({sesion,salir,children}:{sesion:NonNullable<Sesion>,salir:()=>void,children:React.ReactNode}){
 const [movil,setMovil]=useState(false);const ruta=useLocation();const titulo=menu.find(x=>x.ruta===ruta.pathname)?.texto||'Laurent';
 return <div className="aplicacion"><aside className={`sidebar ${movil?'abierta':''}`}><div className="sidebar-cabecera"><Logo/><button className="icono-boton cerrar-sidebar" onClick={()=>setMovil(false)} aria-label="Cerrar menú"><X/></button></div><div className="sidebar-info"><span className="avatar">{sesion.usuario.nombre.charAt(0)}</span><div><strong>{sesion.usuario.nombre}</strong><small>{sesion.usuario.rol==='MEDICO'?'Médico / Odontólogo':sesion.usuario.rol==='RECEPCIONISTA'?'Recepción':'Administrador'}</small></div></div><nav className="menu-lateral" aria-label="Menú principal">{menu.filter(x=>x.roles.includes(sesion.usuario.rol)).map(x=><Link key={x.ruta} onClick={()=>setMovil(false)} className={ruta.pathname===x.ruta?'activo':''} to={x.ruta}><x.icono size={18}/>{x.texto}</Link>)}</nav><div className="sidebar-pie"><Link to="/" target="_blank"><Globe size={18}/> Ver sitio público</Link><button onClick={salir}><LogOut size={18}/> Cerrar sesión</button></div></aside>{movil&&<div className="overlay-mobile" onClick={()=>setMovil(false)}/>}<div className="contenido-app"><header className="barra-superior"><button className="icono-boton abrir-sidebar" onClick={()=>setMovil(true)} aria-label="Abrir menú"><Menu/></button><div><span className="miga">CLÍNICA DENTAL LAURENT / PANEL</span><h2>{titulo}</h2></div><div className="barra-superior-derecha"><span className="pill-claro"><span className="punto-verde"/> Sistema interno</span><span className="avatar mini">{sesion.usuario.nombre.charAt(0)}</span></div></header><main className="pagina-app">{children}</main><footer className="footer-app">Laurent · Plataforma de gestión clínica · Información confidencial</footer></div></div>
}
function InicioPanel({sesion}:{sesion:NonNullable<Sesion>}){
 const rol=sesion.usuario.rol;const accesos=menu.filter(x=>x.roles.includes(rol)&&x.ruta!=='/panel');
 return <><div className="pagina-intro"><div><span className="eyebrow">TU ESPACIO DE TRABAJO</span><h1>Buen día, {sesion.usuario.nombre.split(' ')[0]}.</h1><p>Todo organizado en un solo lugar para atender mejor a cada paciente.</p></div><span className="emblema-hero"><HeartPulse size={56}/></span></div>{rol==='ADMINISTRADOR'&&<Administrador/>}<div className="seccion-titulo"><h2>Accesos a tu área</h2><p>Solo ves los módulos autorizados para tu perfil.</p></div><div className="tarjetas-acceso">{accesos.map(x=><Link key={x.ruta} to={x.ruta} className="tarjeta-acceso"><span className="acceso-icono"><x.icono size={26}/></span><strong>{x.texto}</strong><span>Entrar al módulo →</span></Link>)}</div></>
}
function Zona({sesion,permitidos,children}:{sesion:Sesion;permitidos:Rol[];children:React.ReactNode}){if(!sesion)return <Navigate to="/iniciar-sesion" replace/>;if(!permitidos.includes(sesion.usuario.rol))return <Navigate to="/panel" replace/>;return <Marco sesion={sesion} salir={()=>{setToken(null);window.location.assign('/iniciar-sesion')}}>{children}</Marco>}
function Navegacion(){const [sesion,setSesion]=useState<Sesion>(null);const roles:Rol[]=['ADMINISTRADOR','MEDICO','RECEPCIONISTA'];return <Routes><Route path="/" element={<Publica/>}/><Route path="/iniciar-sesion" element={sesion?<Navigate to="/panel" replace/>:<Entrar onLogin={setSesion}/>}/><Route path="/panel" element={<Zona sesion={sesion} permitidos={roles}><InicioPanel sesion={sesion!}/></Zona>}/><Route path="/agenda" element={<Zona sesion={sesion} permitidos={roles}><Agenda rol={sesion?.usuario.rol}/></Zona>}/><Route path="/horarios" element={<Zona sesion={sesion} permitidos={roles}><Horarios rol={sesion?.usuario.rol || 'RECEPCIONISTA'} usuarioId={sesion?.usuario.id || ''}/></Zona>}/><Route path="/pacientes" element={<Zona sesion={sesion} permitidos={roles}><Pacientes rol={sesion?.usuario.rol}/></Zona>}/><Route path="/clinica" element={<Zona sesion={sesion} permitidos={['MEDICO']}><Clinica/></Zona>}/><Route path="/caja" element={<Zona sesion={sesion} permitidos={['ADMINISTRADOR','RECEPCIONISTA']}><Caja rol={sesion?.usuario.rol || 'RECEPCIONISTA'}/></Zona>}/><Route path="/cms" element={<Zona sesion={sesion} permitidos={['ADMINISTRADOR']}><Cms/></Zona>}/><Route path="/inventario" element={<Zona sesion={sesion} permitidos={['ADMINISTRADOR','RECEPCIONISTA']}><Inventario rol={sesion?.usuario.rol || 'RECEPCIONISTA'}/></Zona>}/><Route path="/esterilizacion" element={<Zona sesion={sesion} permitidos={['ADMINISTRADOR']}><Esterilizacion/></Zona>}/><Route path="/laboratorio" element={<Zona sesion={sesion} permitidos={roles}><Laboratorio rol={sesion?.usuario.rol || 'RECEPCIONISTA'}/></Zona>}/><Route path="/mensajeria" element={<Zona sesion={sesion} permitidos={['ADMINISTRADOR','RECEPCIONISTA']}><Mensajeria/></Zona>}/><Route path="/administracion" element={<Zona sesion={sesion} permitidos={['ADMINISTRADOR']}><Configuracion/></Zona>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes>}
export default function App(){return <BrowserRouter><Navegacion/></BrowserRouter>}
