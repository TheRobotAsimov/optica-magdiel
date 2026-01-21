import axios from 'axios';

const API_URL = 'http://localhost:1234/api/gasto-rutas';
axios.defaults.withCredentials = true;

const gastoRutaService = {
  getAllGastoRutas: async (params = {}) => {
    const response = await axios.get(API_URL + '/', { params });
    return response.data;
  },

  getGastoRutaById: async (id) => {
    const response = await axios.get(API_URL + `/${id}`);
    return response.data;
  },

  createGastoRuta: async (gastoRutaData) => {
    const response = await axios.post(API_URL + '/', gastoRutaData);
    return response.data;
  },

  updateGastoRuta: async (id, gastoRutaData) => {
    const response = await axios.put(API_URL + `/${id}`, gastoRutaData);
    return response.data;
  },

  deleteGastoRuta: async (id) => {
    const response = await axios.delete(API_URL + `/${id}`);
    return response.data;
  },
};

export default gastoRutaService;
