import axios from 'axios';

const API_URL = 'http://localhost:1234/api/lentes';
axios.defaults.withCredentials = true;

const lenteService = {
    getAllLentes: async (params = {}) => {
        const response = await axios.get(API_URL + '/', { params });
        return response.data;
    },

    getLenteById: async (id) => {
        const response = await axios.get(API_URL + `/${id}`);
        return response.data;
    },

    getPendingLentes: async () => {
        const response = await axios.get(API_URL + '/pending');
        return response.data;
    },

    createLente: async (lenteData) => {
        const response = await axios.post(API_URL + '/', lenteData);
        return response.data;
    },

    updateLente: async (id, lenteData) => {
        const response = await axios.put(API_URL + `/${id}`, lenteData);
        return response.data;
    },

    deleteLente: async (id) => {
        const response = await axios.delete(API_URL + `/${id}`);
        return response.data;
    },
};

export default lenteService;