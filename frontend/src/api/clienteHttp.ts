import axios from 'axios';

const urlServidor = import.meta.env.VITE_API_URL || 'https://laurent-backend.onrender.com';
const apiBaseUrl = `${urlServidor.replace(/\/$/, '')}/api/v1`;

export const clienteHttp = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para inyectar token JWT
clienteHttp.interceptors.request.use((config) => {
  const token = localStorage.getItem('laurent_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para redirección automática en 401
clienteHttp.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('laurent_token');
      localStorage.removeItem('laurent_user');
      if (window.location.pathname.startsWith('/admin') || 
          window.location.pathname.startsWith('/medico') || 
          window.location.pathname.startsWith('/recepcion')) {
        window.location.href = '/iniciar-sesion';
      }
    }
    return Promise.reject(error);
  }
);

export default clienteHttp;

