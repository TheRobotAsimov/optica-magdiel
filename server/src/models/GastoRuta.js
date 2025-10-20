import db from '../config/db.js';

const GastoRuta = {
  getAll: async () => {
    const [rows] = await db.query(`
      SELECT 
        g.idgasto_ruta,
        g.idruta,
        g.cantidad,
        g.motivo,
        r.fecha as ruta_fecha
      FROM gasto_ruta g
      JOIN ruta r ON g.idruta = r.idruta
    `);
    return rows;
  },

  findById: async (id) => {
    const [rows] = await db.query('SELECT * FROM gasto_ruta WHERE idgasto_ruta = ?', [id]);
    return rows[0];
  },

  create: async (gastoRuta) => {
    const { idruta, cantidad, motivo } = gastoRuta;
    const [result] = await db.query(
      'INSERT INTO gasto_ruta (idruta, cantidad, motivo) VALUES (?, ?, ?)',
      [idruta, cantidad, motivo]
    );
    return { id: result.insertId, ...gastoRuta };
  },

  update: async (id, gastoRuta) => {
    const { idruta, cantidad, motivo } = gastoRuta;
    await db.query(
      'UPDATE gasto_ruta SET idruta = ?, cantidad = ?, motivo = ? WHERE idgasto_ruta = ?',
      [idruta, cantidad, motivo, id]
    );
    return { id, ...gastoRuta };
  },

  remove: async (id) => {
    await db.query('DELETE FROM gasto_ruta WHERE idgasto_ruta = ?', [id]);
    return { id };
  },
};

export default GastoRuta;
