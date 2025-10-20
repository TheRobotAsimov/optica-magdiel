import axios from 'axios';

const API_URL = 'http://localhost:1234/api/rutas';

const getAllRutas = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

const getRutaById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};

const createRuta = async (ruta) => {
  const res = await axios.post(API_URL, ruta);
  return res.data;
};

const updateRuta = async (id, ruta) => {
  const res = await axios.put(`${API_URL}/${id}`, ruta);
  return res.data;
};

const deleteRuta = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};

const rutaService = {
  getAllRutas,
  getRutaById,
  createRuta,
  updateRuta,
  deleteRuta,
};

export default rutaService;