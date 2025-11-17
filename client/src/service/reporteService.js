import axios from 'axios';

const API_URL = 'http://localhost:1234/api/reportes';
axios.defaults.withCredentials = true;

const reporteService = {
  getDesempenoAsesor: async (idasesor, fechaInicio, fechaFin) => {
    const response = await axios.get(API_URL + '/desempeno-asesor', {
      params: { idasesor, fechaInicio, fechaFin }
    });
    return response.data;
  },

  getPagosClientes: async (fechaInicio, fechaFin) => {
    const response = await axios.get(API_URL + '/pagos-clientes', {
      params: { fechaInicio, fechaFin }
    });
    return response.data;
  },

  getRutasReport: async (fecha) => {
    const response = await axios.get(API_URL + '/rutas', {
      params: { fecha }
    });
    return response.data;
  },

  getBalanceReport: async (fechaInicio, fechaFin) => {
    const response = await axios.get(API_URL + '/balance', {
      params: { fechaInicio, fechaFin }
    });
    return response.data;
  },
};

export default reporteService;