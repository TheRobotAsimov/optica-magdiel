import axios from 'axios';

const API_URL = 'http://localhost:1234/api/gasto-rutas';

const getAllGastoRutas = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

const getGastoRutaById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};

const createGastoRuta = async (gastoRuta) => {
  const res = await axios.post(API_URL, gastoRuta);
  return res.data;
};

const updateGastoRuta = async (id, gastoRuta) => {
  const res = await axios.put(`${API_URL}/${id}`, gastoRuta);
  return res.data;
};

const deleteGastoRuta = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};

const gastoRutaService = {
  getAllGastoRutas,
  getGastoRutaById,
  createGastoRuta,
  updateGastoRuta,
  deleteGastoRuta,
};

export default gastoRutaService;
