import axios from 'axios';

const API_BASE_URL = 'http://localhost:1234/api/notificaciones';

export const notificacionService = {
    create: async (mensaje) => {
        const response = await axios.post(API_BASE_URL, { mensaje });
        return response.data;
    },

    getAll: async () => {
        const response = await axios.get(API_BASE_URL);
        return response.data;
    },

    getUnreadCount: async () => {
        const response = await axios.get(`${API_BASE_URL}/unread-count`);
        return response.data;
    },

    markAsRead: async (id) => {
        const response = await axios.put(`${API_BASE_URL}/${id}/read`);
        return response.data;
    }
};

export default notificacionService;