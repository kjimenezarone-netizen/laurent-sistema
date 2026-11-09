import React, { useState } from 'react';
import { Bot, ChevronRight, MessageCircle, Send, ShieldCheck, X } from 'lucide-react';

type Tema = 'servicios' | 'citas' | 'horarios' | 'precios' | 'urgencias';
const PREGUNTAS: {id:Tema; texto:string;respuesta:string}[] = [
  { id:'servicios',texto:'¿Qué tratamientos ofrecen?',respuesta:'En la sección de Tratamientos puedes consultar nuestros servicios y solicitar orientación personalizada a recepción.' },
  { id:'citas',texto:'Quiero solicitar una cita',respuesta:'Puedes completar el formulario de contacto de esta página. Recepción revisará tu solicitud y te responderá para coordinar la cita.' },
  { id:'horarios',texto:'Horarios y ubicación',respuesta:'Consulta el canal de contacto oficial de Clínica Laurent para verificar horarios, dirección y disponibilidad actualizados.' },
  { id:'precios',texto:'Precios y presupuestos',respuesta:'Los precios dependen del tratamiento y de la evaluación profesional. Puedes solicitar información desde la sección Contacto.' },
  { id:'urgencias',texto:'Tengo una urgencia dental',respuesta:'Este asistente no realiza diagnósticos. Ante dolor intenso, sangrado persistente, hinchazón importante o dificultades para respirar, busca atención sanitaria presencial urgente.' },
];
export function LaurentBotPublico({ telefono }: { telefono?: string }) {
  const [abierto, setAbierto] = useState(false);
  const [tema, setTema] = useState<Tema | null>(null);
  const respuesta = PREGUNTAS.find((q) => q.id === tema);
  const numero = (telefono || '').replace(/\D/g, '');
  const wa = numero ? `https://wa.me/${numero}?text=${encodeURIComponent('Hola, quisiera recibir información de Clínica Dental Laurent.')}` : '';
  return <div className="laurentbot-web">
    {abierto && <div role="dialog" aria-label="LaurentBot — Asistente informativo" className="laurentbot-ventana">
      <div className="laurentbot-cabecera"><Bot size={21}/><div><strong>LaurentBot</strong><small>Asistente informativo de la clínica</small></div><button type="button" aria-label="Cerrar LaurentBot" onClick={() => setAbierto(false)}><X size={19}/></button></div>
      <div className="laurentbot-mensajes">
        <div className="bot-burbuja">¡Bienvenido a Laurent! ¿En qué podemos orientarte?</div>
        {respuesta && <><div className="bot-pregunta">{respuesta.texto}</div><div className="bot-burbuja">{respuesta.respuesta}</div></>}
        <div className="laurentbot-opciones">{PREGUNTAS.map((q) => <button key={q.id} type="button" onClick={() => setTema(q.id)}><ChevronRight size={15}/>{q.texto}</button>)}</div>
      </div>
      <div className="laurentbot-pie">
        <span><ShieldCheck size={13}/> No compartas datos clínicos por este chat.</span>
        <div><a href="#contacto" onClick={() => setAbierto(false)}><Send size={16}/> Solicitar información</a>
          {wa && <a target="_blank" rel="noopener noreferrer" href={wa}><MessageCircle size={16}/> WhatsApp</a>}</div>
      </div>
    </div>}
    <button type="button" className="laurentbot-flotante" onClick={() => setAbierto((v) => !v)} aria-label={abierto ? 'Cerrar asistente LaurentBot' : 'Abrir asistente LaurentBot'}>
      {abierto ? <X size={23}/> : <><Bot size={24}/><span>¿Te ayudamos?</span></>}
    </button>
  </div>;
}
