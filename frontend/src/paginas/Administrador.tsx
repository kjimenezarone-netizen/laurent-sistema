import React,{useState} from 'react';
import {CalendarDays,BarChart3,MessageSquareText,Users,Wallet} from 'lucide-react';
import {moneda} from '../servicios/cliente';
import {Aviso,CajaCard,Cargando,Vacío,useDatos} from '../componentes/Ui';
type Resumen={pacientes:number;citasHoy:number;ingresosMes:number;solicitudes:number};
type Dia={fecha:string;monto:number};
type Trat={nombre:string;atenciones:number;facturado:number};
export function Administrador(){
 const [periodo,setPeriodo]=useState(30);
 const r=useDatos<Resumen>('/administracion/resumen',{pacientes:0,citasHoy:0,ingresosMes:0,solicitudes:0});
 const ingresos=useDatos<Dia[]>(`/administracion/ingresos-diarios?dias=${periodo}`,[]);
 const populares=useDatos<Trat[]>('/administracion/tratamientos-frecuentes',[]);
 const max=Math.max(1,...ingresos.datos.map(x=>Number(x.monto)||0));
 return <section className="dashboard"><div className="seccion-titulo"><h2>Indicadores reales de Laurent</h2><p>Gerencia, recaudación y productividad consultadas en PostgreSQL; no son valores de demostración.</p></div>
 <Cargando visible={r.cargando}/><Aviso texto={r.error}/>
 <div className="grid-kpis cuatro"><div className="tarjeta-kpi"><span><Users size={17}/> Pacientes activos</span><strong>{r.datos.pacientes}</strong><small>Registro general</small></div><div className="tarjeta-kpi verde"><span><CalendarDays size={17}/> Citas hoy</span><strong>{r.datos.citasHoy}</strong><small>Sin citas canceladas</small></div><div className="tarjeta-kpi dorado"><span><Wallet size={17}/> Recaudación mensual</span><strong>{moneda(r.datos.ingresosMes)}</strong><small>Pagos confirmados</small></div><div className="tarjeta-kpi azul"><span><MessageSquareText size={17}/> Nuevas consultas web</span><strong>{r.datos.solicitudes}</strong><small>Por atender</small></div></div>
 <div className="grid-config"><CajaCard titulo="Evolución de ingresos" acciones={<select aria-label="Período de ingresos" value={periodo} onChange={e=>setPeriodo(Number(e.target.value))}><option value={7}>7 días</option><option value={30}>30 días</option><option value={90}>90 días</option></select>}>
 <Aviso texto={ingresos.error}/><div className="grafico-ingresos" role="img" aria-label={`Recaudación por fecha en los últimos ${periodo} días`}>
 {ingresos.datos.map(d=><div key={d.fecha} className="grafico-columna" title={`${d.fecha}: ${moneda(d.monto)}`}><span style={{height:`${Math.max(2,Number(d.monto)/max*100)}%`}}/><small>{periodo<=7?d.fecha.slice(5):''}</small></div>)}
 </div>{!ingresos.datos.length&&<Vacío texto="No hay datos de ingresos en el período."/>}<p className="nota-caja">Ingresos de caja confirmados; no incluye deudas futuras ni pagos revertidos.</p></CajaCard>
 <CajaCard titulo="Tratamientos más facturados">{populares.datos.length?<div className="tabla-scroll"><table className="tabla"><thead><tr><th>Tratamiento</th><th>Atenciones cobradas</th><th>Facturado</th></tr></thead><tbody>{populares.datos.map(d=><tr key={d.nombre}><td>{d.nombre}</td><td>{d.atenciones}</td><td>{moneda(d.facturado)}</td></tr>)}</tbody></table></div>:<Vacío texto="Los tratamientos aparecerán al registrar cargos relacionados con el catálogo."/>}</CajaCard></div>
 </section>;
}
