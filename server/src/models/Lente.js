import pool from '../config/db.js';

class Lente {
  static async getAll(page = 1, limit = 10, search = '') {
    const offset = (page - 1) * limit;
    let query = `
      SELECT
        l.*,
        v.folio,
        c.nombre as cliente_nombre,
        c.paterno as cliente_paterno,
        c.materno as cliente_materno,
        e.nombre as optometrista_nombre,
        e.paterno as optometrista_paterno
      FROM lente l
      JOIN venta v ON l.folio = v.folio
      JOIN cliente c ON v.idcliente = c.idcliente
      JOIN empleado e ON l.idoptometrista = e.idempleado
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND (c.nombre LIKE ? OR c.paterno LIKE ? OR l.folio LIKE ? OR e.nombre LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY l.idlente DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async count(search = '') {
    let query = `
      SELECT COUNT(*) as total
      FROM lente l
      JOIN venta v ON l.folio = v.folio
      JOIN cliente c ON v.idcliente = c.idcliente
      JOIN empleado e ON l.idoptometrista = e.idempleado
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND (c.nombre LIKE ? OR c.paterno LIKE ? OR l.folio LIKE ? OR e.nombre LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [rows] = await pool.query(query, params);
    return rows[0].total;
  }

  static async getPending() {
    const [rows] = await pool.execute(`
      SELECT
        l.*,
        v.folio,
        c.nombre as cliente_nombre,
        c.paterno as cliente_paterno,
        c.materno as cliente_materno,
        e.nombre as optometrista_nombre,
        e.paterno as optometrista_paterno
      FROM lente l
      JOIN venta v ON l.folio = v.folio
      JOIN cliente c ON v.idcliente = c.idcliente
      JOIN empleado e ON l.idoptometrista = e.idempleado
      WHERE l.estatus IN ("Pendiente", "No entregado")
    `);
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.execute(`
      SELECT
        l.*,
        v.folio,
        c.nombre as cliente_nombre,
        c.paterno as cliente_paterno,
        c.materno as cliente_materno,
        e.nombre as optometrista_nombre,
        e.paterno as optometrista_paterno
      FROM lente l
      JOIN venta v ON l.folio = v.folio
      JOIN cliente c ON v.idcliente = c.idcliente
      JOIN empleado e ON l.idoptometrista = e.idempleado
      WHERE l.idlente = ?
    `, [id]);
    return rows[0];
  }

  static async create(data) {
    const {
      idoptometrista,
      folio,
      sintomas,
      uso_de_lente,
      armazon,
      material,
      tratamiento,
      tipo_de_lente,
      tinte_color,
      tono,
      desvanecido,
      fecha_entrega,
      examen_seguimiento,
      estatus,
      od_esf,
      od_cil,
      od_eje,
      od_add,
      od_av,
      oi_esf,
      oi_cil,
      oi_eje,
      oi_add,
      oi_av,
      subtipo,
      blend,
      procesado,
      kit
    } = data;

    const [result] = await pool.execute(
      `INSERT INTO lente (idoptometrista, folio, sintomas, uso_de_lente, armazon, material, tratamiento, tipo_de_lente, tinte_color, tono, desvanecido, fecha_entrega, examen_seguimiento, estatus, od_esf, od_cil, od_eje, od_add, od_av, oi_esf, oi_cil, oi_eje, oi_add, oi_av, subtipo, blend, procesado, kit)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) `,
      [idoptometrista, folio, sintomas, uso_de_lente, armazon, material, tratamiento, tipo_de_lente, tinte_color, tono, desvanecido, fecha_entrega, examen_seguimiento, estatus, od_esf, od_cil, od_eje, od_add, od_av, oi_esf, oi_cil, oi_eje, oi_add, oi_av, subtipo, blend, procesado, kit]
    ); return result.insertId;
  }

  static async update(id, data) {
    const {
      idoptometrista,
      folio,
      sintomas,
      uso_de_lente,
      armazon,
      material,
      tratamiento,
      tipo_de_lente,
      tinte_color,
      tono,
      desvanecido,
      fecha_entrega,
      examen_seguimiento,
      estatus,
      od_esf,
      od_cil,
      od_eje,
      od_add,
      od_av,
      oi_esf,
      oi_cil,
      oi_eje,
      oi_add,
      oi_av,
      subtipo,
      blend,
      procesado,
      kit
    } = data;

    await pool.execute(
      `UPDATE lente SET
        idoptometrista = ?,
        folio = ?,
        sintomas = ?,
        uso_de_lente = ?,
        armazon = ?,
        material = ?,
        tratamiento = ?,
        tipo_de_lente = ?,
        tinte_color = ?,
        tono = ?,
        desvanecido = ?,
        fecha_entrega = ?,
        examen_seguimiento = ?,
        estatus = ?,
        od_esf = ?,
        od_cil = ?,
        od_eje = ?,
        od_add = ?,
        od_av = ?,
        oi_esf = ?,
        oi_cil = ?,
        oi_eje = ?,
        oi_add = ?,
        oi_av = ?,
        subtipo = ?,
        blend = ?,
        procesado = ?,
        kit = ?
       WHERE idlente = ?`,
      [idoptometrista, folio, sintomas, uso_de_lente, armazon, material, tratamiento, tipo_de_lente, tinte_color, tono, desvanecido, fecha_entrega, examen_seguimiento, estatus, od_esf, od_cil, od_eje, od_add, od_av, oi_esf, oi_cil, oi_eje, oi_add, oi_av, subtipo, blend, procesado, kit, id]
    );
  }

  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM lente WHERE idlente = ?', [id]);
    return result.affectedRows;
  }
}

export default Lente;
