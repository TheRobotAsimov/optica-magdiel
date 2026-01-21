import axios from 'axios';

const API_URL = 'http://localhost:1234/api/pagos';
axios.defaults.withCredentials = true;

const pagoService = {
  getAllPagos: async (params = {}) => {
    const response = await axios.get(API_URL + '/', { params });
    return response.data;
  },

  getPendingPagos: async () => {
    const response = await axios.get(API_URL + '/pending');
    return response.data;
  },

  getPagoById: async (id) => {
    const response = await axios.get(API_URL + `/${id}`);
    return response.data;
  },

  createPago: async (pagoData) => {
    const response = await axios.post(API_URL + '/', pagoData);
    return response.data;
  },

  updatePago: async (id, pagoData) => {
    const response = await axios.put(API_URL + `/${id}`, pagoData);
    return response.data;
  },

  deletePago: async (id) => {
    const response = await axios.delete(API_URL + `/${id}`);
    return response.data;
  },
};

export default pagoService;
