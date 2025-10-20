import Entrega from '../models/Entrega.js';

export const getEntregas = async (req, res) => {
  try {
    const entregas = await Entrega.getAll();
    res.json(entregas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEntrega = async (req, res) => {
  try {
    const entrega = await Entrega.findById(req.params.id);
    if (!entrega) return res.status(404).json({ message: 'Entrega not found' });
    res.json(entrega);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createEntrega = async (req, res) => {
  try {
    const newEntrega = await Entrega.create(req.body);
    res.status(201).json(newEntrega);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateEntrega = async (req, res) => {
  try {
    const updatedEntrega = await Entrega.update(req.params.id, req.body);
    res.json(updatedEntrega);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteEntrega = async (req, res) => {
  try {
    await Entrega.remove(req.params.id);
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
