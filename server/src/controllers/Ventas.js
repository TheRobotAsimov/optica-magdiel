import Venta from '../models/Venta.js';

export const createVenta = async (req, res) => {
  try {
    const newVentaId = await Venta.create(req.body);
    res.status(201).json({ id: newVentaId, message: 'Venta created successfully' });
  } catch (error) {
    console.log(req.body)
    console.log(error.message)
    res.status(500).json({ error: error.message });
  }
};

export const getVentas = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    const totalItems = await Venta.count(search);
    const totalPages = Math.ceil(totalItems / limit);

    const items = await Venta.getAll(page, limit, search);

    res.json({
      items,
      totalItems,
      totalPages,
      currentPage: page
    });
  } catch (error) {
    console.error('Error in getVentas:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getVentasByAsesor = async (req, res) => {
  try {
    const ventas = await Venta.getByAsesor(req.params.idasesor);
    res.json(ventas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getVentaByFolio = async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.folio);
    if (venta) {
      res.json(venta);
    } else {
      res.status(404).json({ message: 'Venta not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateVenta = async (req, res) => {
  try {
    const affectedRows = await Venta.updateById(req.params.folio, req.body);
    if (affectedRows > 0) {
      res.json({ message: 'Venta updated successfully' });
    } else {
      res.status(404).json({ message: 'Venta not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteVenta = async (req, res) => {
  try {
    const affectedRows = await Venta.remove(req.params.folio);
    if (affectedRows > 0) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Venta not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
