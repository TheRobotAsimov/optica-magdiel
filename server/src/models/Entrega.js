import db from '../config/db.js';

const Entrega = {
  getAll: async (page = 1, limit = 10, search = '') => {
    const offset = (page - 1) * limit;
    let query = `
      SELECT
        e.identrega,
        e.idruta,
        e.estatus,
        e.idlente,
        e.idpago,
        e.motivo,
        e.hora,
        r.fecha as ruta_fecha,
        COALESCE(l.folio, p.folio) as folio
      FROM entrega e
      JOIN ruta r ON e.idruta = r.idruta
      LEFT JOIN lente l ON e.idlente = l.idlente
      LEFT JOIN pago p ON e.idpago = p.idpago
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND (l.folio LIKE ? OR p.folio LIKE ? OR e.motivo LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY e.identrega DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await db.query(query, params);
    return rows;
  },

  count: async (search = '') => {
    let query = `
      SELECT COUNT(*) as total
      FROM entrega e
      JOIN ruta r ON e.idruta = r.idruta
      LEFT JOIN lente l ON e.idlente = l.idlente
      LEFT JOIN pago p ON e.idpago = p.idpago
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND (l.folio LIKE ? OR p.folio LIKE ? OR e.motivo LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [rows] = await db.query(query, params);
    return rows[0].total;
  },

  findById: async (id) => {
    const [rows] = await db.query('SELECT * FROM entrega WHERE identrega = ?', [id]);
    return rows[0];
  },

  create: async (entrega) => {
    const { idruta, estatus, idlente, idpago, motivo, hora } = entrega;
    const [result] = await db.query(
      'INSERT INTO entrega (idruta, estatus, idlente, idpago, motivo, hora) VALUES (?, ?, ?, ?, ?, ?)',
      [idruta, estatus, idlente || null, idpago || null, motivo, hora]
    );
    return { id: result.insertId, ...entrega };
  },

  update: async (id, entrega) => {
    const { idruta, estatus, idlente, idpago, motivo, hora } = entrega;
    await db.query(
      'UPDATE entrega SET idruta = ?, estatus = ?, idlente = ?, idpago = ?, motivo = ?, hora = ? WHERE identrega = ?',
      [idruta, estatus, idlente || null, idpago || null, motivo, hora, id]
    );
    return { id, ...entrega };
  },

  remove: async (id) => {
    await db.query('DELETE FROM entrega WHERE identrega = ?', [id]);
    return { id };
  },
};

export default Entrega;
