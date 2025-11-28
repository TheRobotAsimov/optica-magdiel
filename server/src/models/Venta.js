import pool from '../config/db.js';

class Venta {
  static async create(newVenta) {
    const {
      folio,
      idasesor,
      idcliente,
      fecha,
      institucion,
      tipo,
      inapam,
      enganche,
      total,
      pagado,
      estatus,
      cant_pagos,
      observaciones,
      imagen_contrato,
      imagen_cobranza
    } = newVenta;
    const [result] = await pool.execute(
      'INSERT INTO venta (folio, idasesor, idcliente, fecha, institucion, tipo, inapam, enganche, total, pagado, estatus, cant_pagos, observaciones, imagen_contrato, imagen_cobranza) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [folio, idasesor, idcliente, fecha, institucion, tipo, inapam, enganche, total, pagado, estatus, cant_pagos, observaciones, imagen_contrato, imagen_cobranza]
    );
    return result.insertId;
  }

  static async getAll() {
    const [rows] = await pool.execute(`
      SELECT
        v.*,
        c.nombre as cliente_nombre,
        c.paterno as cliente_paterno,
        e.nombre as asesor_nombre,
        e.paterno as asesor_paterno
      FROM venta v
      JOIN cliente c ON v.idcliente = c.idcliente
      JOIN empleado e ON v.idasesor = e.idempleado
    `);
    return rows;
  }

  static async getByAsesor(idasesor) {
    const [rows] = await pool.execute('SELECT * FROM venta WHERE idasesor = ?', [idasesor]);
    return rows;
  }

  static async findById(folio) {
    const [rows] = await pool.execute(`
      SELECT
        v.*,
        c.nombre as cliente_nombre,
        c.paterno as cliente_paterno,
        e.nombre as asesor_nombre,
        e.paterno as asesor_paterno
      FROM venta v
      JOIN cliente c ON v.idcliente = c.idcliente
      JOIN empleado e ON v.idasesor = e.idempleado
      WHERE v.folio = ?
    `, [folio]);
    return rows[0];
  }

  static async updateById(folio, venta) {
    const fields = [];
    const values = [];

    if (venta.idasesor !== undefined) {
      fields.push('idasesor = ?');
      values.push(venta.idasesor);
    }
    if (venta.idcliente !== undefined) {
      fields.push('idcliente = ?');
      values.push(venta.idcliente);
    }
    if (venta.fecha !== undefined) {
      fields.push('fecha = ?');
      values.push(venta.fecha);
    }
    if (venta.institucion !== undefined) {
      fields.push('institucion = ?');
      values.push(venta.institucion);
    }
    if (venta.tipo !== undefined) {
      fields.push('tipo = ?');
      values.push(venta.tipo);
    }
    if (venta.inapam !== undefined) {
      fields.push('inapam = ?');
      values.push(venta.inapam);
    }
    if (venta.enganche !== undefined) {
      fields.push('enganche = ?');
      values.push(venta.enganche);
    }
    if (venta.total !== undefined) {
      fields.push('total = ?');
      values.push(venta.total);
    }
    if (venta.pagado !== undefined) {
      fields.push('pagado = ?');
      values.push(venta.pagado);
    }
    if (venta.estatus !== undefined) {
      fields.push('estatus = ?');
      values.push(venta.estatus);
    }
    if (venta.cant_pagos !== undefined) {
      fields.push('cant_pagos = ?');
      values.push(venta.cant_pagos);
    }
    if (venta.observaciones !== undefined) {
      fields.push('observaciones = ?');
      values.push(venta.observaciones);
    }
    if (venta.imagen_contrato !== undefined) {
      fields.push('imagen_contrato = ?');
      values.push(venta.imagen_contrato);
    }
    if (venta.imagen_cobranza !== undefined) {
      fields.push('imagen_cobranza = ?');
      values.push(venta.imagen_cobranza);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    const query = `UPDATE venta SET ${fields.join(', ')} WHERE folio = ?`;
    values.push(folio);

    const [result] = await pool.execute(query, values);
    return result.affectedRows;
  }

  static async remove(folio) {
    const [result] = await pool.execute('DELETE FROM venta WHERE folio = ?', [folio]);
    return result.affectedRows;
  }

  static async getVentasAggregatedByAsesorAndDateRange(idasesor, fechaInicio, fechaFin) {
    const [rows] = await pool.execute(`
      SELECT
        fecha,
        SUM(total) as total_ventas,
        COUNT(*) as numero_ventas
      FROM venta
      WHERE idasesor = ? AND fecha BETWEEN ? AND ?
      GROUP BY fecha
      ORDER BY fecha
    `, [idasesor, fechaInicio, fechaFin]);
    return rows;
  }

  static async getTotalVentasByAsesorAndDateRange(idasesor, fechaInicio, fechaFin) {
    const [rows] = await pool.execute(`
      SELECT
        SUM(total) as total_ventas,
        COUNT(*) as numero_ventas
      FROM venta
      WHERE idasesor = ? AND fecha BETWEEN ? AND ?
    `, [idasesor, fechaInicio, fechaFin]);
    return rows[0] || { total_ventas: 0, numero_ventas: 0 };
  }

  //Venta.findByFolio
  static async findByFolio(folio) {
    const [rows] = await pool.execute('SELECT * FROM venta WHERE folio = ?', [folio]);
    return rows[0];
  }

}

export default Venta;
