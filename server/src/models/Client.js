import pool from '../config/db.js';

class Client {
  static async getAll() {
    const [rows] = await pool.execute('SELECT * FROM cliente');
    return rows;
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
}

export default Client;
