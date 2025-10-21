import Pago from '../models/Pago.js';

export const getPagos = async (req, res) => {
  try {
    const pagos = await Pago.getAll();
    res.json(pagos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPendingPagos = async (req, res) => {
  try {
    const pagos = await Pago.getPending();
    res.json(pagos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPago = async (req, res) => {
  try {
    const pago = await Pago.findById(req.params.id);
    if (!pago) return res.status(404).json({ message: 'Pago not found' });
    res.json(pago);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPago = async (req, res) => {
  try {
    const newPago = await Pago.create(req.body);
    res.status(201).json(newPago);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePago = async (req, res) => {
  try {
    const updatedPago = await Pago.update(req.params.id, req.body);
    res.json(updatedPago);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePago = async (req, res) => {
  try {
    await Pago.remove(req.params.id);
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
