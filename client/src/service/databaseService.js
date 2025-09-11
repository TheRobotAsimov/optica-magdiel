
import axios from 'axios';

const API_URL = `http://localhost:1234/api/database`;

export const getDbDump = async () => {
    const response = await axios.get(`${API_URL}/dump`, {
        withCredentials: true,
        responseType: 'blob',
    });
    return response.data;
};

export const restoreDb = async (file) => {
    const formData = new FormData();
    formData.append('sqlFile', file);

    const response = await axios.post(`${API_URL}/restore`, formData, {
        withCredentials: true,
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};
