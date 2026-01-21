import pool from '../config/db.js';

class Client {
  static async getAll(page = 1, limit = 10, search = '') {
    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM cliente WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (nombre LIKE ? OR paterno LIKE ? OR materno LIKE ? OR telefono1 LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY idcliente DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async count(search = '') {
    let query = 'SELECT COUNT(*) as total FROM cliente WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (nombre LIKE ? OR paterno LIKE ? OR materno LIKE ? OR telefono1 LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [rows] = await pool.query(query, params);
    return rows[0].total;
  }

  static async getById(id) {
    const [rows] = await pool.execute('SELECT * FROM cliente WHERE idcliente = ?', [id]);
    return rows[0];
  }

  static async create(data) {
    const {
      nombre,
      paterno,
      materno,
      edad,
      sexo,
      domicilio1,
      telefono1,
      domicilio2,
      telefono2,
      map_url
    } = data;

    const [result] = await pool.execute(
      `INSERT INTO cliente (nombre, paterno, materno, edad, sexo, domicilio1, telefono1, domicilio2, telefono2, map_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, paterno, materno, edad, sexo, domicilio1, telefono1, domicilio2, telefono2, map_url]
    );
    return result.insertId;
  }

  static async update(id, data) {
    const {
      nombre,
      paterno,
      materno,
      edad,
      sexo,
      domicilio1,
      telefono1,
      domicilio2,
      telefono2,
      map_url
    } = data;

    await pool.execute(
      `UPDATE cliente SET
        nombre = ?, paterno = ?, materno = ?, edad = ?,
        sexo = ?, domicilio1 = ?, telefono1 = ?, domicilio2 = ?,
        telefono2 = ?, map_url = ?
       WHERE idcliente = ?`,
      [nombre, paterno, materno, edad, sexo, domicilio1, telefono1, domicilio2, telefono2, map_url, id]
    );

  }

  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM cliente WHERE idcliente = ?', [id]);
    return result.affectedRows;
  }

  // search method is now redundant but keeping it for backward compatibility if needed, 
  // though we should migrate to the new getAll with search param
  static async search(nombre, paterno) {
    let query = 'SELECT * FROM cliente WHERE 1=1';
    const params = [];

    if (nombre) {
      query += ' AND nombre LIKE ?';
      params.push(`%${nombre}%`);
    }
    if (paterno) {
      query += ' AND paterno LIKE ?';
      params.push(`%${paterno}%`);
    }

    const [rows] = await pool.execute(query, params);
    return rows;
  }
}

export default Client;
