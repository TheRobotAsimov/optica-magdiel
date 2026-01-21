import axios from 'axios';

const API_URL = 'http://localhost:1234/api/clients';
axios.defaults.withCredentials = true;

const clientService = {
  getAllClients: async (params = {}) => {
    const response = await axios.get(API_URL + '/', { params });
    return response.data;
  },

  getClientById: async (id) => {
    const response = await axios.get(API_URL + `/${id}`);
    return response.data;
  },

  createClient: async (clientData) => {
    const response = await axios.post(API_URL + '/', clientData);
    return response.data;
  },

  updateClient: async (id, clientData) => {
    const response = await axios.put(API_URL + `/${id}`, clientData);
    return response.data;
  },

  deleteClient: async (id) => {
    const response = await axios.delete(API_URL + `/${id}`);
    return response.data;
  },

  searchClients: async (nombre, paterno) => {
    const response = await axios.get(API_URL + `/search`, {
      params: { nombre, paterno },
    });
    return response.data;
  },
};

export default clientService;
