// Controlador para las rutas de gestión de rutas de asesores
// Maneja operaciones CRUD de rutas

import Ruta from '../models/Ruta.js';

// Obtener todas las rutas (con soporte para paginación)
export const getRutas = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const idasesor = req.query.idasesor || null;

    const totalItems = await Ruta.count(search, idasesor);
    const totalPages = Math.ceil(totalItems / limit);

    const items = await Ruta.getAll(page, limit, search, idasesor);

    res.json({
      items,
      totalItems,
      totalPages,
      currentPage: page
    });
  } catch (error) {
    console.error('Error in getRutas:', error);
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
