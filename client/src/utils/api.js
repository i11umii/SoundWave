import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// создаем общий axios-клиент
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// перед каждым запросом добавляем токен, если он есть
api.interceptors.request.use(function (config) {
  console.log('[api] request', config.method, config.url);

  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = 'Bearer ' + token;
  }

  return config;
});

// если сервер вернул 401 — очищаем токен и отправляем на страницу логина
api.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    console.log('[api] error', error);

    let status = null;
    if (error && error.response && typeof error.response.status === 'number') {
      status = error.response.status;
    }

    if (status === 401) {
      console.log('[api] 401 -> logout');

      localStorage.removeItem('token');

      const currentPath = window.location.pathname;
      const isLoginPage = currentPath.indexOf('/login') !== -1;
      if (!isLoginPage) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

export const trackAPI = {
  getAll: () => api.get('/tracks'),
  getById: (id) => api.get(`/tracks/${id}`),
  getRecommendations: () => api.get('/tracks/recommendations'),
  like: (id) => api.post(`/users/like/${id}`),
  unlike: (id) => api.post(`/users/like/${id}`),
};

export const artistAPI = {
  getAll: () => api.get('/artists'),
  getById: (id) => api.get(`/artists/${id}`),
  follow: (id) => api.post(`/artists/${id}/follow`),
  unfollow: (id) => api.delete(`/artists/${id}/follow`),
};

export const playlistAPI = {
  getAll: () => api.get('/playlists'),
  getById: (id) => api.get(`/playlists/${id}`),
  create: (data) => api.post('/playlists', data),
  delete: (id) => api.delete(`/playlists/${id}`),
  rename: (id, name) => api.patch(`/playlists/${id}`, { name: name }),
  addTrack: (plId, trId) => api.post(`/playlists/${plId}/tracks`, { trackId: trId }),
  removeTrack: (plId, trId) => api.delete(`/playlists/${plId}/tracks/${trId}`),
};

export const userAPI = {
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/users/me', data),
  getRecentlyPlayed: () => api.get('/users/recently-played'),
  addRecentlyPlayed: (id) => api.post(`/users/recently-played/${id}`),
  getLikedTracks: () => api.get('/users/liked-tracks'),
  getFollowedArtists: () => api.get('/users/followed-artists'),
  search: (q) => api.get('/users/search', { params: { q: q } }),
  getMusicDNA: () => api.get('/smart-stats'),
  getSmartStats: () => api.get('/smart-stats'),
};

export const albumAPI = {
  getById: (id) => api.get(`/albums/${id}`),
};

export default api;
