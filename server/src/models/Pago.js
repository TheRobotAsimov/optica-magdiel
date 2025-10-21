import db from '../config/db.js';

const Pago = {
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

  findById: async (id) => {
    const [rows] = await db.query('SELECT * FROM pago WHERE idpago = ?', [id]);
    return rows[0];
  },

  create: async (pago) => {
    const { folio, fecha, cantidad, estatus } = pago;
    const cantidadNum = parseFloat(cantidad) || 0;
    const [result] = await db.query(
      'INSERT INTO pago (folio, fecha, cantidad, estatus) VALUES (?, ?, ?, ?)',
      [folio, fecha, cantidadNum, estatus]
    );
    return { id: result.insertId, ...pago };
  },

  update: async (id, pago) => {
    const { folio, fecha, cantidad, estatus } = pago;
    const cantidadNum = parseFloat(cantidad) || 0;
    // Format date to YYYY-MM-DD if it's a full ISO string
    const fechaFormatted = fecha && fecha.includes('T') ? fecha.split('T')[0] : fecha;
    const [result] = await db.query(
      'UPDATE pago SET folio = ?, fecha = ?, cantidad = ?, estatus = ? WHERE idpago = ?',
      [folio, fechaFormatted, cantidadNum, estatus, id]
    );
    return { id, ...pago };
  },

  remove: async (id) => {
    await db.query('DELETE FROM pago WHERE idpago = ?', [id]);
    return { id };
  },
};

export default Pago;
