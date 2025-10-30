import Ruta from '../models/Ruta.js';

export const getRutas = async (req, res) => {
  try {
    const rutas = await Ruta.getAll();
    res.json(rutas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRuta = async (req, res) => {
  try {
    const ruta = await Ruta.findById(req.params.id);
    if (!ruta) return res.status(404).json({ message: 'Ruta not found' });
    console.log(ruta);
    res.json(ruta);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createRuta = async (req, res) => {
  try {
    const newRuta = await Ruta.create(req.body);
    res.status(201).json(newRuta);
  } catch (error) {
    console.log(req.body);
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const updateRuta = async (req, res) => {
  try {
    const updatedRuta = await Ruta.update(req.params.id, req.body);
    res.json(updatedRuta);
  } catch (error) {
    console.log(req.body);
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteRuta = async (req, res) => {
  try {
    await Ruta.remove(req.params.id);
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
