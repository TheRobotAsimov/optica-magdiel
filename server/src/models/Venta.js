import pool from '../config/db.js';

class Venta {
  static async create(newVenta) {
    const {
      folio,
      idasesor,
      idcliente,
      fecha,
      tipo,
      enganche,
      total,
      estatus,
      cant_pagos,
      observaciones,
      imagen_contrato,
      imagen_cobranza
    } = newVenta;
    const [result] = await pool.execute(
      'INSERT INTO venta (folio, idasesor, idcliente, fecha, tipo, enganche, total, estatus, cant_pagos, observaciones, imagen_contrato, imagen_cobranza) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [folio, idasesor, idcliente, fecha, tipo, enganche, total, estatus, cant_pagos, observaciones, imagen_contrato, imagen_cobranza]
    );
    return result.insertId;
  }

  static async getAll() {
    const [rows] = await pool.execute(`
      SELECT
        v.*,
        c.nombre as cliente_nombre,
        c.paterno as cliente_paterno
      FROM venta v
      JOIN cliente c ON v.idcliente = c.idcliente
    `);
    return rows;
  }

  static async getByAsesor(idasesor) {
    const [rows] = await pool.execute('SELECT * FROM venta WHERE idasesor = ?', [idasesor]);
    return rows;
  }

  static async findById(folio) {
    const [rows] = await pool.execute('SELECT * FROM venta WHERE folio = ?', [folio]);
    return rows[0];
  }

  static async updateById(folio, venta) {
    const {
      idasesor,
      idcliente,
      fecha,
      tipo,
      enganche,
      total,
      estatus,
      cant_pagos,
      observaciones,
      imagen_contrato,
      imagen_cobranza
    } = venta;
    const [result] = await pool.execute(
      'UPDATE venta SET idasesor = ?, idcliente = ?, fecha = ?, tipo = ?, enganche = ?, total = ?, estatus = ?, cant_pagos = ?, observaciones = ?, imagen_contrato = ?, imagen_cobranza = ? WHERE folio = ?',
      [idasesor, idcliente, fecha, tipo, enganche, total, estatus, cant_pagos, observaciones, imagen_contrato, imagen_cobranza, folio]
    );
    return result.affectedRows;
  }

  static async remove(folio) {
    const [result] = await pool.execute('DELETE FROM venta WHERE folio = ?', [folio]);
    return result.affectedRows;
  }
}

export default Venta;
