import axios from 'axios';

const API_URL = 'http://localhost:1234/api/pacientes';
axios.defaults.withCredentials = true;

const pacienteService = {
  getAllPacientes: async (params = {}) => {
    const response = await axios.get(API_URL + '/', { params });
    return response.data;
  },

  getPacienteById: async (id) => {
    const response = await axios.get(API_URL + `/${id}`);
    return response.data;
  },

  getPacientesByCliente: async (idcliente) => {
    const response = await axios.get(API_URL + `/cliente/${idcliente}`);
    return response.data;
  },

  createPaciente: async (pacienteData) => {
    const response = await axios.post(API_URL + '/', pacienteData);
    return response.data;
  },

  updatePaciente: async (id, pacienteData) => {
    const response = await axios.put(API_URL + `/${id}`, pacienteData);
    return response.data;
  },

  deletePaciente: async (id) => {
    const response = await axios.delete(API_URL + `/${id}`);
    return response.data;
  },
};

export default pacienteService;