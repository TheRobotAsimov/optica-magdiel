import axios from 'axios';

const API_URL = 'http://localhost:1234/api';
axios.defaults.baseURL = API_URL;

const authService = {
  login: async (credentials) => {
    const response = await axios.post('/auth/login', credentials);
    return response.data;
  },
  
  register: async (userData) => {
    const response = await axios.post('/auth/register', userData);
    return response.data;
  },
  
  forgotPassword: async (email) => {
    const response = await axios.post('/auth/forgot-password', { correo: email });
    return response.data;
  },
  
  resetPassword: async (token, newPassword) => {
    const response = await axios.post(`/auth/reset-password/${token}`, { nueva_contrasena: newPassword });
    return response.data;
  },
  
  getProfile: async (token) => {
    const response = await axios.get('/auth/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  logout: async (token) => {
    const response = await axios.post('/auth/logout', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};

export default authService;