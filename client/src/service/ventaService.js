import axios from 'axios';

const API_URL = 'http://localhost:1234/api/ventas';
axios.defaults.withCredentials = true;

const ventaService = {
  getAllVentas: async (params = {}) => {
    const response = await axios.get(API_URL + '/', { params });
    return response.data;
  },

  getVentasByAsesor: async (idasesor) => {
    const response = await axios.get(API_URL + `/asesor/${idasesor}`);
    return response.data;
  },

  getVentaByFolio: async (folio) => {
    const response = await axios.get(API_URL + `/${folio}`);
    return response.data;
  },

  createVenta: async (ventaData) => {
    const response = await axios.post(API_URL + '/', ventaData);
    return response.data;
  },

  updateVenta: async (folio, ventaData) => {
    const response = await axios.put(API_URL + `/${folio}`, ventaData);
    return response.data;
  },

  deleteVenta: async (folio) => {
    const response = await axios.delete(API_URL + `/${folio}`);
    return response.data;
  },
};

export default ventaService;
