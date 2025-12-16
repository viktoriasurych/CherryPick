// client/src/api/axios.js
import axios from 'axios';

const api = axios.create({
  // Завдяки Proxy у vite.config.js, ми пишемо просто /api
  baseURL: '/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;