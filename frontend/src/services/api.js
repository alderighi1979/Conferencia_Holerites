import axios from 'axios';

// Vazio = mesma origem (quando servido pelo FastAPI no exe). Dev: proxy no Vite encaminha /api.
const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30s - evita "Carregando..." travado; dá tempo ao backend responder
});

// INSS
export const inssAPI = {
  getAll: () => api.get('/api/inss/'),
  getById: (id) => api.get(`/api/inss/${id}`),
  create: (data) => api.post('/api/inss/', data),
  update: (id, data) => api.put(`/api/inss/${id}`, data),
  delete: (id) => api.delete(`/api/inss/${id}`),
};

// IRRF
export const irrfAPI = {
  getAll: () => api.get('/api/irrf/'),
  getById: (id) => api.get(`/api/irrf/${id}`),
  create: (data) => api.post('/api/irrf/', data),
  update: (id, data) => api.put(`/api/irrf/${id}`, data),
  delete: (id) => api.delete(`/api/irrf/${id}`),
};

// Config Simplificada
export const configSimplificadaAPI = {
  getAll: () => api.get('/api/config-simplificada/'),
  getById: (id) => api.get(`/api/config-simplificada/${id}`),
  create: (data) => api.post('/api/config-simplificada/', data),
  update: (id, data) => api.put(`/api/config-simplificada/${id}`, data),
  delete: (id) => api.delete(`/api/config-simplificada/${id}`),
};

// Eventos
export const eventosAPI = {
  getAll: () => api.get('/api/eventos/'),
  getByCodigo: (codigo) => api.get(`/api/eventos/${codigo}`),
  create: (data) => api.post('/api/eventos/', data),
  update: (codigo, data) => api.put(`/api/eventos/${codigo}`, data),
  delete: (codigo) => api.delete(`/api/eventos/${codigo}`),
};

// Cálculo
export const calculoAPI = {
  calcular: (data) => api.post('/api/calculo/', data),
};

// Cálculo de Proventos CLT
export const calculoProventosAPI = {
  horasExtras: (data) => api.post('/api/calculo-proventos/horas-extras', data),
  horaNormalDiurna: (data) => api.post('/api/calculo-proventos/hora-normal-diurna', data),
  horaNormalNoturna: (data) => api.post('/api/calculo-proventos/hora-normal-noturna', data),
  adicionalNoturno: (data) => api.post('/api/calculo-proventos/adicional-noturno', data),
  dsr: (data) => api.post('/api/calculo-proventos/dsr', data),
  periculosidade: (data) => api.post('/api/calculo-proventos/periculosidade', data),
  interjornada: (data) => api.post('/api/calculo-proventos/interjornada', data),
  tempoADisposicao: (data) => api.post('/api/calculo-proventos/tempo-a-disposicao', data),
};

// Encerrar servidor (botão Sair)
export const sairAPI = {
  sair: () => api.post('/api/sair'),
};

export default api;
