import axios from 'axios';

const API_URL = 'http://localhost:1234/api/empleados';

const getAllEmpleados = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

const getEmpleadoById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

const getEmpleadosByPuesto = async (puesto) => {
    const response = await axios.get(`${API_URL}/puesto/${puesto}`);
    return response.data;
};

const createEmpleado = async (empleado) => {
    const response = await axios.post(API_URL, empleado);
    return response.data;
};

const updateEmpleado = async (id, empleado) => {
    const response = await axios.put(`${API_URL}/${id}`, empleado);
    return response.data;
};

const deleteEmpleado = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};

export default {
    getAllEmpleados,
    getEmpleadoById,
    getEmpleadosByPuesto,
    createEmpleado,
    updateEmpleado,
    deleteEmpleado
};