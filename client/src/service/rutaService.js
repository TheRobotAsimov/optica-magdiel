import axios from 'axios';

const API_URL = 'http://localhost:1234/api/rutas';
axios.defaults.withCredentials = true;

const rutaService = {
  getAllRutas: async (params = {}) => {
    const response = await axios.get(API_URL + '/', { params });
    return response.data;
  },

  getRutaById: async (id) => {
    const response = await axios.get(API_URL + `/${id}`);
    return response.data;
  },

  createRuta: async (rutaData) => {
    const response = await axios.post(API_URL + '/', rutaData);
    return response.data;
  },

  updateRuta: async (id, rutaData) => {
    const response = await axios.put(API_URL + `/${id}`, rutaData);
    return response.data;
  },

  deleteRuta: async (id) => {
    const response = await axios.delete(API_URL + `/${id}`);
    return response.data;
  },
};

export default rutaService;