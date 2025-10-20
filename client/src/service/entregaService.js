import axios from 'axios';

const API_URL = 'http://localhost:1234/api/entregas';

const getAllEntregas = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

const getEntregaById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};

const createEntrega = async (entrega) => {
  const res = await axios.post(API_URL, entrega);
  return res.data;
};

const updateEntrega = async (id, entrega) => {
  const res = await axios.put(`${API_URL}/${id}`, entrega);
  return res.data;
};

const deleteEntrega = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};

const entregaService = {
  getAllEntregas,
  getEntregaById,
  createEntrega,
  updateEntrega,
  deleteEntrega,
};

export default entregaService;
