import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me')
};

export const trackAPI = {
  getAll: () => api.get('/tracks'),
  getById: (id) => api.get(`/tracks/${id}`),
  getRecommendations: () => api.get('/tracks/recommendations'),
  like: (id) => api.post(`/users/like/${id}`),
  unlike: (id) => api.post(`/users/like/${id}`)
};

export const artistAPI = {
  getAll: () => api.get('/artists'),
  getById: (id) => api.get(`/artists/${id}`),
  follow: (id) => api.post(`/artists/${id}/follow`),
  unfollow: (id) => api.delete(`/artists/${id}/follow`)
};

export const playlistAPI = {
  getAll: () => api.get('/playlists'),
  getById: (id) => api.get(`/playlists/${id}`),
  create: (data) => api.post('/playlists', data),
  delete: (id) => api.delete(`/playlists/${id}`),
  addTrack: (plId, trId) => api.post(`/playlists/${plId}/tracks`, { trackId: trId }),
  removeTrack: (plId, trId) => api.delete(`/playlists/${plId}/tracks/${trId}`)
};

export const userAPI = {
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/users/me', data),
  getRecentlyPlayed: () => api.get('/users/recently-played'),
  addToRecentlyPlayed: (id) => api.post(`/users/recently-played/${id}`),
  getLikedTracks: () => api.get('/users/liked-tracks'),
  getFollowedArtists: () => api.get('/users/followed-artists'),
  
  // FIX: Теперь используем правильный endpoint поиска
  search: (q) => api.get('/users/search', { params: { q } }),

  getMusicDNA: () => api.get('/smart-stats'),
  getSmartStats: () => api.get('/smart-stats'),
};
// Добавь объект albumAPI
export const albumAPI = {
  getById: (id) => api.get(`/albums/${id}`),
};

export default api;