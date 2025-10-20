import db from '../config/db.js';

const Entrega = {
  getAll: async () => {
    const [rows] = await db.query(`
      SELECT 
        e.identrega,
        e.idruta,
        e.estatus,
        e.idlente,
        e.idpago,
        e.motivo,
        e.hora,
        r.fecha as ruta_fecha
      FROM entrega e
      JOIN ruta r ON e.idruta = r.idruta
    `);
    return rows;
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
