// Modelo de Empleado para interactuar con la base de datos
// Maneja operaciones CRUD de empleados

import pool from '../config/db.js';

class Empleado {
  // Obtener todos los empleados
  static async getAll() {
    const [rows] = await pool.execute('SELECT * FROM empleado');
    return rows;
  }

  // Obtener empleado por ID
  static async getById(id) {
    const [rows] = await pool.execute('SELECT * FROM empleado WHERE idempleado = ?', [id]);
    return rows[0];
  }

  // Obtener empleados por puesto (solo activos)
  static async getByPuesto(puesto) {
    const [rows] = await pool.execute('SELECT * FROM empleado WHERE puesto = ? AND estado = "Activo"', [puesto]);
    return rows;
  }

  // Crear un nuevo empleado
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

  // Actualizar empleado por ID
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

  // Eliminar empleado por ID
  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM empleado WHERE idempleado = ?', [id]);
    return result.affectedRows;
  }
}

export default Empleado;
