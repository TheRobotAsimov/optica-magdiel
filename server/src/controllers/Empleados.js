import Empleado from '../models/Empleado.js';

export const getAllEmpleados = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    const totalItems = await Empleado.count(search);
    const totalPages = Math.ceil(totalItems / limit);

    const items = await Empleado.getAll(page, limit, search);

    res.status(200).json({
      items,
      totalItems,
      totalPages,
      currentPage: page
    });
  } catch (error) {
    console.error('Error in getAllEmpleados:', error);
    res.status(500).json({ message: 'Error al obtener los empleados', error: error.message });
  }
};

export const getEmpleadoById = async (req, res) => {
  try {
    const empleado = await Empleado.getById(req.params.id);
    if (empleado) {
      res.status(200).json(empleado);
    } else {
      res.status(404).json({ message: 'Empleado no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el empleado', error });
  }
};

export const getEmpleadosByPuesto = async (req, res) => {
  try {
    const empleados = await Empleado.getByPuesto(req.params.puesto);
    res.status(200).json(empleados);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los empleados', error });
  }
};

export const createEmpleado = async (req, res) => {
  try {
    const empleadoId = await Empleado.create(req.body);
    res.status(201).json({ id: empleadoId, message: 'Empleado creado exitosamente' });
  } catch (error) {
    console.log(req.body);
    console.error(error);
    res.status(500).json({ message: 'Error al crear el empleado', error });
  }
};

export const updateEmpleado = async (req, res) => {
  try {
    await Empleado.update(req.params.id, req.body);
    res.status(200).json({ message: 'Empleado actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el empleado', error });
  }
};

export const deleteEmpleado = async (req, res) => {
  try {
    const affectedRows = await Empleado.delete(req.params.id);
    if (affectedRows > 0) {
      res.status(200).json({ message: 'Empleado eliminado exitosamente' });
    } else {
      res.status(404).json({ message: 'Empleado no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el empleado', error });
  }
};
