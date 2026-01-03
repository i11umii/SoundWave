import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Перехватчик запросов - добавляем токен
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Перехватчик ответов - обработка 401 ошибки
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// === AUTH ===
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me')
};

// === TRACKS ===
export const trackAPI = {
  getAll: () => api.get('/tracks'),
  getById: (id) => api.get(`/tracks/${id}`),
  getRecommendations: () => api.get('/tracks/recommendations'),
  like: (id) => api.post(`/tracks/${id}/like`),
  unlike: (id) => api.delete(`/tracks/${id}/like`)
};

// === ARTISTS ===
export const artistAPI = {
  getAll: () => api.get('/artists'),
  getById: (id) => api.get(`/artists/${id}`),
  follow: (id) => api.post(`/artists/${id}/follow`),
  unfollow: (id) => api.delete(`/artists/${id}/follow`)
};

// === PLAYLISTS ===
export const playlistAPI = {
  getAll: () => api.get('/playlists'),
  getById: (id) => api.get(`/playlists/${id}`),
  create: (data) => api.post('/playlists', data),
  delete: (id) => api.delete(`/playlists/${id}`),
  addTrack: (playlistId, trackId) =>
    api.post(`/playlists/${playlistId}/tracks`, { trackId }),
  removeTrack: (playlistId, trackId) =>
    api.delete(`/playlists/${playlistId}/tracks/${trackId}`)
};

// === USER ===
export const userAPI = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.patch('/users/me', data),
  getRecentlyPlayed: () => api.get('/users/recently-played'),
  addToRecentlyPlayed: (trackId) =>
    api.post(`/users/recently-played/${trackId}`),
  getLikedTracks: () => api.get('/users/liked-tracks'),
  search: (query) => api.get('/users/search', { params: { q: query } }),
  getStats: () => api.get('/users/stats'),
  
  // Music DNA
  getMusicDNA: () => api.get('/music-dna'),

  // Smart Stats
  getSmartStats: () => api.get('/smart-stats'),

  // Mood Journal
  getMoodJournal: (rangeDays) =>
    api.get('/users/mood-journal', { params: { range: rangeDays } })
};

export default api;