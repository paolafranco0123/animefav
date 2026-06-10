import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/users/register', data),
  login: (data) => api.post('/users/login', data),
  getProfile: () => api.get('/users/profile')
};

export const listasAPI = {
  getAll: () => api.get('/listas'),
  create: (nombre, color) => api.post('/listas', { nombre, color }),
  update: (id, nombre) => api.put(`/listas/${id}`, { nombre }),
  delete: (id) => api.delete(`/listas/${id}`),
  getAnimes: (id) => api.get(`/listas/${id}/animes`),
  addAnime: (id, data) => api.post(`/listas/${id}/animes`, data),
  removeAnime: (id, animeId) => api.delete(`/listas/${id}/animes/${animeId}`),
  updateProgress: (id, animeId, episodios_vistos) =>
    api.patch(`/listas/${id}/animes/${animeId}/progress`, { episodios_vistos })
};

export const jikanAPI = {
  search: (query, page = 1, filters = {}) => 
    api.get('/jikan/search', { params: { query, page, ...filters } }),
  getById: (malId) => api.get(`/jikan/anime/${malId}`),
  getTop: (page = 1) => api.get(`/jikan/top?page=${page}`),
  getCurrentSeason: () => api.get('/jikan/season/now'),
  getGenres: () => api.get('/jikan/genres'),
  getCalendario: () => api.get('/jikan/calendario'),
  import: (malId) => api.post(`/jikan/import/${malId}`)
};

export const puntuacionesAPI = {
  rate: (animeId, valor) => api.post(`/puntuaciones/animes/${animeId}/rate`, { valor }),
  getMyRating: (animeId) => api.get(`/puntuaciones/animes/${animeId}/my-rating`),
  deleteRating: (animeId) => api.delete(`/puntuaciones/animes/${animeId}/rate`),
  getAverage: (animeId) => api.get(`/puntuaciones/animes/${animeId}/average`),
  getMyRatings: () => api.get('/puntuaciones/my-ratings')
};

export const reseniasAPI = {
  create: (animeId, texto) => api.post(`/resenias/anime/${animeId}`, { texto }),
  getByAnime: (animeId) => api.get(`/resenias/anime/${animeId}`),
  getMyReviews: () => api.get('/resenias/user/my-reviews'),
  update: (id, texto) => api.put(`/resenias/${id}`, { texto }),
  delete: (id) => api.delete(`/resenias/${id}`)
};

export const statsAPI = {
  getResumen: () => api.get('/stats'),
  getGenerosFavoritos: () => api.get('/stats/generos'),
  getTiempo: () => api.get('/stats/tiempo'),
  getPuntuaciones: () => api.get('/stats/puntuaciones')
};

export default api;