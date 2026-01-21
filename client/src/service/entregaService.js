import axios from 'axios';

const API_URL = 'http://localhost:1234/api/entregas';
axios.defaults.withCredentials = true;

const entregaService = {
  getAllEntregas: async (params = {}) => {
    const response = await axios.get(API_URL + '/', { params });
    return response.data;
  },

  getEntregaById: async (id) => {
    const response = await axios.get(API_URL + `/${id}`);
    return response.data;
  },

  createEntrega: async (entregaData) => {
    const response = await axios.post(API_URL + '/', entregaData);
    return response.data;
  },

  updateEntrega: async (id, entregaData) => {
    const response = await axios.put(API_URL + `/${id}`, entregaData);
    return response.data;
  },

  deleteEntrega: async (id) => {
    const response = await axios.delete(API_URL + `/${id}`);
    return response.data;
  },
};

export default entregaService;
