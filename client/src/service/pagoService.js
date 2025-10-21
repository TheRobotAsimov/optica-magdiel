import axios from 'axios';

const API_URL = 'http://localhost:1234/api/pagos';

const getAllPagos = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

const getPendingPagos = async () => {
  const res = await axios.get(API_URL + '/pending');
  return res.data;
};

const getPagoById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};

const createPago = async (pago) => {
  const res = await axios.post(API_URL, pago);
  return res.data;
};

const updatePago = async (id, pago) => {
  const res = await axios.put(`${API_URL}/${id}`, pago);
  return res.data;
};

const deletePago = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};

const pagoService = {
  getAllPagos,
  getPendingPagos,
  getPagoById,
  createPago,
  updatePago,
  deletePago,
};

export default pagoService;
