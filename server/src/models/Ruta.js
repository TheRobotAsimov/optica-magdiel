import db from '../config/db.js';

const Ruta = {
  getAll: async () => {
    const [rows] = await db.query('SELECT r.*, e.nombre as asesor_nombre, e.paterno as asesor_paterno FROM ruta r JOIN empleado e ON r.idasesor = e.idempleado');
    return rows;
  },

  findById: async (id) => {
    const [rows] = await db.query('SELECT * FROM ruta WHERE idruta = ?', [id]);
    return rows[0];
  },

  create: async (ruta) => {
    const {
      idasesor,
      lentes_entregados,
      tarjetas_entregadas,
      lentes_no_entregados,
      tarjetas_no_entregadas,
      fecha,
      lentes_recibidos,
      tarjetas_recibidas,
      hora_inicio,
      hora_fin,
    } = ruta;
    const [result] = await db.query(
      'INSERT INTO ruta (idasesor, lentes_entregados, tarjetas_entregadas, lentes_no_entregados, tarjetas_no_entregadas, fecha, lentes_recibidos, tarjetas_recibidas, hora_inicio, hora_fin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [idasesor, lentes_entregados, tarjetas_entregadas, lentes_no_entregados, tarjetas_no_entregadas, fecha, lentes_recibidos, tarjetas_recibidas, hora_inicio, hora_fin]
    );
    return { id: result.insertId, ...ruta };
  },

  update: async (id, ruta) => {
    const {
      idasesor,
      lentes_entregados,
      tarjetas_entregadas,
      lentes_no_entregados,
      tarjetas_no_entregadas,
      fecha,
      lentes_recibidos,
      tarjetas_recibidas,
      hora_inicio,
      hora_fin,
    } = ruta;
    await db.query(
      'UPDATE ruta SET idasesor = ?, lentes_entregados = ?, tarjetas_entregadas = ?, lentes_no_entregados = ?, tarjetas_no_entregadas = ?, fecha = ?, lentes_recibidos = ?, tarjetas_recibidas = ?, hora_inicio = ?, hora_fin = ? WHERE idruta = ?',
      [idasesor, lentes_entregados, tarjetas_entregadas, lentes_no_entregados, tarjetas_no_entregadas, fecha, lentes_recibidos, tarjetas_recibidas, hora_inicio, hora_fin, id]
    );
    return { id, ...ruta };
  },

  remove: async (id) => {
    await db.query('DELETE FROM ruta WHERE idruta = ?', [id]);
    return { id };
  },
};

export default Ruta;
