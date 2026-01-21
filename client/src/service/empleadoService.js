import axios from 'axios';

const API_URL = 'http://localhost:1234/api/empleados';
axios.defaults.withCredentials = true;

const empleadoService = {
    getAllEmpleados: async (params = {}) => {
        const response = await axios.get(API_URL + '/', { params });
        return response.data;
    },

    getEmpleadoById: async (id) => {
        const response = await axios.get(API_URL + `/${id}`);
        return response.data;
    },

    getEmpleadosByPuesto: async (puesto) => {
        const response = await axios.get(API_URL + `/puesto/${puesto}`);
        return response.data;
    },

    createEmpleado: async (empleadoData) => {
        const response = await axios.post(API_URL + '/', empleadoData);
        return response.data;
    },

    updateEmpleado: async (id, empleadoData) => {
        const response = await axios.put(API_URL + `/${id}`, empleadoData);
        return response.data;
    },

    deleteEmpleado: async (id) => {
        const response = await axios.delete(API_URL + `/${id}`);
        return response.data;
    },
};

export default empleadoService;