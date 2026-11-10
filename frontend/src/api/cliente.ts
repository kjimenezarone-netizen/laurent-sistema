export type Rol = 'ADMINISTRADOR' | 'MEDICO' | 'RECEPCIONISTA';
export type Usuario = { id: string; nombre: string; rol: Rol; username?: string };

const BASE_URL = (import.meta.env.VITE_API_URL || 'https://laurent-backend.onrender.com').replace(/\/$/, '');

let tokenSesion: string | null = null;
export const setToken = (token: string | null) => { tokenSesion = token; };
export const tieneToken = () => Boolean(tokenSesion);
export class ErrorApi extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
    this.name = 'ErrorApi';
  }
}

export async function api<T = any>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  const encabezados: Record<string, string> = {};
  if (!(opciones.body instanceof FormData)) {
    encabezados['Content-Type'] = 'application/json';
  }
  if (tokenSesion) {
    encabezados['Authorization'] = `Bearer ${tokenSesion}`;
  }
  Object.assign(encabezados, opciones.headers || {});

  const pathNormalizado = ruta.startsWith('/') ? ruta : `/${ruta}`;
  const urlFinal = ruta.startsWith('http') ? ruta : `${BASE_URL}/api${pathNormalizado}`;

  const res = await fetch(urlFinal, {
    ...opciones,
    headers: encabezados,
  });

  const body = await res.text();
  let datos: any;
  try {
    datos = body ? JSON.parse(body) : null;
  } catch {
    datos = { error: body || `Error de comunicación (${res.status})` };
  }

  if (!res.ok) {
    if (res.status === 401) {
      setToken(null);
    }
    const mensajeError = datos?.error || `Error HTTP ${res.status}`;
    throw new ErrorApi(res.status, mensajeError);
  }

  return datos as T;
}

export const post = <T = any>(r: string, body: unknown, headers?: HeadersInit) =>
  api<T>(r, { method: 'POST', body: JSON.stringify(body), headers });

export const patch = <T = any>(r: string, body: unknown) =>
  api<T>(r, { method: 'PATCH', body: JSON.stringify(body) });

export const put = <T = any>(r: string, body: unknown) =>
  api<T>(r, { method: 'PUT', body: JSON.stringify(body) });

export function fechaLocal(iso: string) {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' });
}

export function moneda(v: unknown) {
  return Number(v || 0).toLocaleString('es-PE', { style: 'currency', currency: 'PEN' });
}

export function fechaInputLocal(d: Date) {
  const off = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return off.toISOString().slice(0, 16);
}

export async function subirArchivoPaciente(pacienteId: string, archivo: File, tipo: string) {
  const datos = new FormData();
  datos.append('archivo', archivo);
  datos.append('tipo', tipo);
  return api(`/clinica/pacientes/${pacienteId}/archivos`, { method: 'POST', body: datos });
}

export async function descargarArchivo(id: string, nombre: string) {
  const url = `${BASE_URL}/api/clinica/archivos/${id}/descargar`;
  const r = await fetch(url, {
    headers: tokenSesion ? { Authorization: `Bearer ${tokenSesion}` } : {},
  });
  if (!r.ok) throw new Error(`Error de descarga: ${r.status}`);
  const urlBlob = URL.createObjectURL(await r.blob());
  const a = document.createElement('a');
  a.href = urlBlob;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(urlBlob);
}
