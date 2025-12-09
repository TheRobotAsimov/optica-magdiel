// Modelo de Ruta para interactuar con la base de datos
// Maneja operaciones CRUD de rutas de asesores

import db from '../config/db.js';

const Ruta = {
  // Obtener todas las rutas con información del asesor
  getAll: async () => {
    const [rows] = await db.query('SELECT r.*, e.nombre as asesor_nombre, e.paterno as asesor_paterno FROM ruta r JOIN empleado e ON r.idasesor = e.idempleado');
    return rows;
  },

  // Buscar ruta por ID con información del asesor
  findById: async (id) => {
    const [rows] = await db.query('SELECT r.*, e.nombre as asesor_nombre, e.paterno as asesor_paterno FROM ruta r JOIN empleado e ON r.idasesor = e.idempleado WHERE r.idruta = ?', [id]);
    return rows[0];
  },

  // Crear una nueva ruta
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
      estatus,
    } = ruta;
    const [result] = await db.query(
      'INSERT INTO ruta (idasesor, lentes_entregados, tarjetas_entregadas, lentes_no_entregados, tarjetas_no_entregadas, fecha, lentes_recibidos, tarjetas_recibidas, hora_inicio, hora_fin, estatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [idasesor, lentes_entregados, tarjetas_entregadas, lentes_no_entregados, tarjetas_no_entregadas, fecha, lentes_recibidos, tarjetas_recibidas, hora_inicio, hora_fin, estatus]
    );
    return { id: result.insertId, ...ruta };
  },

  // Actualizar ruta por ID
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
      estatus,
    } = ruta;
    await db.query(
      'UPDATE ruta SET idasesor = ?, lentes_entregados = ?, tarjetas_entregadas = ?, lentes_no_entregados = ?, tarjetas_no_entregadas = ?, fecha = ?, lentes_recibidos = ?, tarjetas_recibidas = ?, hora_inicio = ?, hora_fin = ?, estatus = ? WHERE idruta = ?',
      [idasesor, lentes_entregados, tarjetas_entregadas, lentes_no_entregados, tarjetas_no_entregadas, fecha, lentes_recibidos, tarjetas_recibidas, hora_inicio, hora_fin, estatus, id]
    );
    return { id, ...ruta };
  },

  // Eliminar ruta por ID
  remove: async (id) => {
    await db.query('DELETE FROM ruta WHERE idruta = ?', [id]);
    return { id };
  },
};

export default Ruta;
