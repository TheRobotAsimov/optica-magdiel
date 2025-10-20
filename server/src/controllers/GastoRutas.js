import GastoRuta from '../models/GastoRuta.js';

export const getGastoRutas = async (req, res) => {
  try {
    const gastoRutas = await GastoRuta.getAll();
    res.json(gastoRutas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getGastoRuta = async (req, res) => {
  try {
    const gastoRuta = await GastoRuta.findById(req.params.id);
    if (!gastoRuta) return res.status(404).json({ message: 'Gasto de ruta not found' });
    res.json(gastoRuta);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createGastoRuta = async (req, res) => {
  try {
    const newGastoRuta = await GastoRuta.create(req.body);
    res.status(201).json(newGastoRuta);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateGastoRuta = async (req, res) => {
  try {
    const updatedGastoRuta = await GastoRuta.update(req.params.id, req.body);
    res.json(updatedGastoRuta);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteGastoRuta = async (req, res) => {
  try {
    await GastoRuta.remove(req.params.id);
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
