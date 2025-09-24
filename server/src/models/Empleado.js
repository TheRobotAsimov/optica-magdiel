import pool from '../config/db.js';

class Empleado {
  static async getAll() {
    const [rows] = await pool.execute('SELECT * FROM empleado');
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.execute('SELECT * FROM empleado WHERE idempleado = ?', [id]);
    return rows[0];
  }

  static async create(data) {
    const {
      idusuario,
      nombre,
      paterno,
      materno,
      fecnac,
      feccon,
      sueldo,
      telefono,
      sexo,
      puesto,
      estado
    } = data;

    const [result] = await pool.execute(
      `INSERT INTO empleado (idusuario, nombre, paterno, materno, fecnac, feccon, sueldo, telefono, sexo, puesto, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [idusuario, nombre, paterno, materno, fecnac, feccon, sueldo, telefono, sexo, puesto, estado]
    );
    return result.insertId;
  }

  static async update(id, data) {
    const {
      idusuario,
      nombre,
      paterno,
      materno,
      fecnac,
      feccon,
      sueldo,
      telefono,
      sexo,
      puesto,
      estado
    } = data;

    await pool.execute(
      `UPDATE empleado SET
        idusuario = ?,
        nombre = ?,
        paterno = ?,
        materno = ?,
        fecnac = ?,
        feccon = ?,
        sueldo = ?,
        telefono = ?,
        sexo = ?,
        puesto = ?,
        estado = ?
       WHERE idempleado = ?`,
      [idusuario, nombre, paterno, materno, fecnac, feccon, sueldo, telefono, sexo, puesto, estado, id]
    );
  }

  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM empleado WHERE idempleado = ?', [id]);
    return result.affectedRows;
  }
}

export default Empleado;
