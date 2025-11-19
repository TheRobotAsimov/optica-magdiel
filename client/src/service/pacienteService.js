import axios from 'axios';

const API_BASE_URL = 'http://localhost:1234/api';

const pacienteService = {
  getAllPacientes: async () => {
    const response = await axios.get(`${API_BASE_URL}/pacientes`);
    return response.data;
  },
  getPacienteById: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/pacientes/${id}`);
    return response.data;
  },
  createPaciente: async (pacienteData) => {
    const response = await axios.post(`${API_BASE_URL}/pacientes`, pacienteData);
    return response.data;
  },
  updatePaciente: async (id, pacienteData) => {
    const response = await axios.put(`${API_BASE_URL}/pacientes/${id}`, pacienteData);
    return response.data;
  },
  deletePaciente: async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/pacientes/${id}`);
    return response.data;
  },
};

export default pacienteService;