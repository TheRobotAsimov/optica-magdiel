// Modelo de GastoRuta para interactuar con la base de datos
// Maneja operaciones CRUD de gastos de ruta

import db from '../config/db.js';

const GastoRuta = {
  // Obtener todos los gastos de ruta con información de ruta y asesor
  getAll: async () => {
    const [rows] = await db.query(`
      SELECT
        g.idgasto_ruta,
        g.idruta,
        g.cantidad,
        g.motivo,
        r.fecha as ruta_fecha,
        e.nombre,
        e.paterno
      FROM gasto_ruta g
      JOIN ruta r ON g.idruta = r.idruta
      JOIN empleado e ON r.idasesor = e.idempleado
    `);
    return rows;
  },

  // Buscar gasto de ruta por ID
  findById: async (id) => {
    const [rows] = await db.query('SELECT * FROM gasto_ruta WHERE idgasto_ruta = ?', [id]);
    return rows[0];
  },

  // Crear un nuevo gasto de ruta
  create: async (gastoRuta) => {
    const { idruta, cantidad, motivo } = gastoRuta;
    const [result] = await db.query(
      'INSERT INTO gasto_ruta (idruta, cantidad, motivo) VALUES (?, ?, ?)',
      [idruta, cantidad, motivo]
    );
    return { id: result.insertId, ...gastoRuta };
  },

  // Actualizar gasto de ruta por ID
  update: async (id, gastoRuta) => {
    const { idruta, cantidad, motivo } = gastoRuta;
    await db.query(
      'UPDATE gasto_ruta SET idruta = ?, cantidad = ?, motivo = ? WHERE idgasto_ruta = ?',
      [idruta, cantidad, motivo, id]
    );
    return { id, ...gastoRuta };
  },

  // Eliminar gasto de ruta por ID
  remove: async (id) => {
    await db.query('DELETE FROM gasto_ruta WHERE idgasto_ruta = ?', [id]);
    return { id };
  },

  // Obtener gastos agregados por asesor y rango de fechas (diarios)
  getGastosAggregatedByAsesorAndDateRange: async (idasesor, fechaInicio, fechaFin) => {
    const [rows] = await db.query(`
      SELECT
        r.fecha,
        SUM(g.cantidad) as total_gastos
      FROM gasto_ruta g
      JOIN ruta r ON g.idruta = r.idruta
      WHERE r.idasesor = ? AND r.fecha BETWEEN ? AND ?
      GROUP BY r.fecha
      ORDER BY r.fecha
    `, [idasesor, fechaInicio, fechaFin]);
    return rows;
  },

  // Obtener totales de gastos por asesor y rango de fechas
  getTotalGastosByAsesorAndDateRange: async (idasesor, fechaInicio, fechaFin) => {
    const [rows] = await db.query(`
      SELECT SUM(g.cantidad) as total_gastos
      FROM gasto_ruta g
      JOIN ruta r ON g.idruta = r.idruta
      WHERE r.idasesor = ? AND r.fecha BETWEEN ? AND ?
    `, [idasesor, fechaInicio, fechaFin]);
    return rows[0] || { total_gastos: 0 };
  },
};

export default GastoRuta;
