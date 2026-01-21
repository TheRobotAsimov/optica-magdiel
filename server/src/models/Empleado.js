// Modelo de Empleado para interactuar con la base de datos
// Maneja operaciones CRUD de empleados

import pool from '../config/db.js';

class Empleado {
  // Obtener todos los empleados (con soporte para paginación)
  static async getAll(page = 1, limit = 10, search = '') {
    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM empleado WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (nombre LIKE ? OR paterno LIKE ? OR materno LIKE ? OR puesto LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY idempleado DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async count(search = '') {
    let query = 'SELECT COUNT(*) as total FROM empleado WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (nombre LIKE ? OR paterno LIKE ? OR materno LIKE ? OR puesto LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [rows] = await pool.query(query, params);
    return rows[0].total;
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
