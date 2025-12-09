// Modelo de Pago para interactuar con la base de datos
// Maneja operaciones CRUD de pagos

import db from '../config/db.js';

const Pago = {
  // Obtener todos los pagos con información de cliente
  getAll: async () => {
    const [rows] = await db.query(`
      SELECT
        p.idpago,
        p.folio,
        p.fecha,
        p.cantidad,
        p.estatus,
        c.nombre as cliente_nombre,
        c.paterno as cliente_paterno
      FROM pago p
      JOIN venta v ON p.folio = v.folio
      JOIN cliente c ON v.idcliente = c.idcliente
    `);
    return rows;
  },

  // Obtener pagos pendientes con información de cliente
  getPending: async () => {
    const [rows] = await db.query(`
      SELECT
        p.idpago,
        p.folio,
        p.fecha,
        p.cantidad,
        p.estatus,
        c.nombre as cliente_nombre,
        c.paterno as cliente_paterno
      FROM pago p
      JOIN venta v ON p.folio = v.folio
      JOIN cliente c ON v.idcliente = c.idcliente
      WHERE p.estatus = 'Pendiente'
    `);
    return rows;
  },

  // Buscar pago por ID
  findById: async (id) => {
    const [rows] = await db.query('SELECT * FROM pago WHERE idpago = ?', [id]);
    return rows[0];
  },

  // Crear un nuevo pago
  create: async (pago) => {
    const { folio, fecha, cantidad, estatus } = pago;
    const cantidadNum = parseFloat(cantidad) || 0;
    const [result] = await db.query(
      'INSERT INTO pago (folio, fecha, cantidad, estatus) VALUES (?, ?, ?, ?)',
      [folio, fecha, cantidadNum, estatus]
    );
    return { id: result.insertId, ...pago };
  },

  // Actualizar pago por ID con campos dinámicos
  update: async (id, pago) => {
    const { fecha, cantidad, estatus } = pago;
    const cantidadNum = parseFloat(cantidad) || 0;
    // Format date to YYYY-MM-DD if it's a full ISO string
    const fechaFormatted = fecha && fecha.includes('T') ? fecha.split('T')[0] : fecha;

    // Build dynamic update query to only update provided fields
    let query = 'UPDATE pago SET ';
    let params = [];
    let updates = [];

    if (fecha !== undefined && fecha !== null) {
      updates.push('fecha = ?');
      params.push(fechaFormatted);
    }
    if (cantidad !== undefined && cantidad !== null) {
      updates.push('cantidad = ?');
      params.push(cantidadNum);
    }
    if (estatus !== undefined && estatus !== null) {
      updates.push('estatus = ?');
      params.push(estatus);
    }

    if (updates.length === 0) {
      // No fields to update, return as is
      return { id, ...pago };
    }

    query += updates.join(', ') + ' WHERE idpago = ?';
    params.push(id);

    const [result] = await db.query(query, params);
    return { id, ...pago };
  },

  // Eliminar pago por ID
  remove: async (id) => {
    await db.query('DELETE FROM pago WHERE idpago = ?', [id]);
    return { id };
  },
};

export default Pago;
