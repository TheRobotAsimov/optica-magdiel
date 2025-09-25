import Lente from '../models/Lente.js';

export const getAllLentes = async (req, res) => {
  try {
    const lentes = await Lente.getAll();
    res.status(200).json(lentes);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los lentes', error });
  }
};

export const getLenteById = async (req, res) => {
  try {
    const lente = await Lente.getById(req.params.id);
    if (lente) {
      res.status(200).json(lente);
    } else {
      res.status(404).json({ message: 'Lente no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el lente', error });
  }
};

export const createLente = async (req, res) => {
  const {
    material,
    tipo_de_lente,
    kit,
    tratamiento,
    precio,
    graduacion,
    esfera,
    cilindro,
    eje,
    adicion,
    altura,
    dip,
    desvanecido,
    blend,
    extra,
    tono,
  } = req.body;
  try {
    const newLente = await Lente.create({
      material,
      tipo_de_lente,
      kit,
      tratamiento,
      precio,
      graduacion,
      esfera,
      cilindro,
      eje,
      adicion,
      altura,
      dip,
      desvanecido,
      blend,
      extra,
      tono,
    });
    res.status(201).json({ id: newLente.id, message: 'Lente creado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el lente', error });
  }
};

export const updateLente = async (req, res) => {
  try {
    await Lente.update(req.params.id, req.body);
    res.status(200).json({ message: 'Lente actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el lente', error });
  }
};

export const deleteLente = async (req, res) => {
  try {
    const affectedRows = await Lente.delete(req.params.id);
    if (affectedRows > 0) {
      res.status(200).json({ message: 'Lente eliminado exitosamente' });
    } else {
      res.status(404).json({ message: 'Lente no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el lente', error });
  }
};
