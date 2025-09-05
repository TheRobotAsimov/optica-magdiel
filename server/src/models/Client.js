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
      fecnac,
      telefono,
      domicilio,
      ruta,
      sexo
    } = data;

    const [result] = await pool.execute(
      `INSERT INTO cliente (nombre, paterno, materno, fecnac, telefono, domicilio, ruta, sexo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, paterno, materno, fecnac, telefono, domicilio, ruta, sexo]
    );
    return result.insertId;
  }

  static async update(id, data) {
    const {
      nombre,
      paterno,
      materno,
      fecnac,
      telefono,
      domicilio,
      ruta,
      sexo
    } = data;

    await pool.execute(
      `UPDATE cliente SET
        nombre = ?, paterno = ?, materno = ?, fecnac = ?,
        telefono = ?, domicilio = ?, ruta = ?, sexo = ?
       WHERE idcliente = ?`,
      [nombre, paterno, materno, fecnac, telefono, domicilio, ruta, sexo, id]
    );

  }

  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM cliente WHERE idcliente = ?', [id]);
    return result.affectedRows;
  }
}

export default Client;
