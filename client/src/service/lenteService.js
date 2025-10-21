import axios from 'axios';

const API_URL = 'http://localhost:1234/api/lentes';

const getAllLentes = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

const getPendingLentes = async () => {
    const response = await axios.get(API_URL + '/pending');
    return response.data;
};

const getLenteById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

const createLente = async (lente) => {
    const response = await axios.post(API_URL, lente);
    return response.data;
};

const updateLente = async (id, lente) => {
    const response = await axios.put(`${API_URL}/${id}`, lente);
    return response.data;
};

const deleteLente = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};

const lenteService = {
    getAllLentes,
    getPendingLentes,
    getLenteById,
    createLente,
    updateLente,
    deleteLente
};

export default lenteService;