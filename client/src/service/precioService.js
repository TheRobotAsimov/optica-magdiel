import axios from 'axios';

const API_URL = 'http://localhost:1234/api';

const getPriceCatalog = async () => {
  try {
    const response = await axios.get(`${API_URL}/precios`);
    return response.data;
  } catch (error) {
    console.error('Error fetching price catalog:', error);
    throw error;
  }
};

export default {
  getPriceCatalog,
};