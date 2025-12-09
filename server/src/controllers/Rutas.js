// Controlador para las rutas de gestión de rutas de asesores
// Maneja operaciones CRUD de rutas

import Ruta from '../models/Ruta.js';

// Obtener todas las rutas
export const getRutas = async (req, res) => {
  try {
    const rutas = await Ruta.getAll();
    res.json(rutas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener una ruta específica por ID
export const getRuta = async (req, res) => {
  try {
    const ruta = await Ruta.findById(req.params.id);
    if (!ruta) return res.status(404).json({ message: 'Ruta not found' });
    //console.log(ruta);
    res.json(ruta);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Crear una nueva ruta
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

// Actualizar una ruta existente
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

// Eliminar una ruta
export const deleteRuta = async (req, res) => {
  try {
    await Ruta.remove(req.params.id);
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
