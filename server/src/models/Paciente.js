import pool from '../config/db.js';

class Paciente {
  static async getAll(page = 1, limit = 10, search = '') {
    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM paciente WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (nombre LIKE ? OR paterno LIKE ? OR materno LIKE ? OR parentesco LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY idpaciente DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async count(search = '') {
    let query = 'SELECT COUNT(*) as total FROM paciente WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (nombre LIKE ? OR paterno LIKE ? OR materno LIKE ? OR parentesco LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [rows] = await pool.query(query, params);
    return rows[0].total;
  }

  static async getById(id) {
    const [rows] = await pool.execute('SELECT * FROM paciente WHERE idpaciente = ?', [id]);
    return rows[0];
  }

  static async getByCliente(idcliente) {
    const [rows] = await pool.execute('SELECT * FROM paciente WHERE idcliente = ?', [idcliente]);
    return rows;
  }

  static async create(data) {
    const { idcliente, nombre, paterno, materno, sexo, edad, parentesco } = data;
    const [result] = await pool.execute(
      'INSERT INTO paciente (idcliente, nombre, paterno, materno, sexo, edad, parentesco) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [idcliente, nombre, paterno, materno, sexo, edad, parentesco]
    );
    return result.insertId;
  }

  static async update(id, data) {
    const { idcliente, nombre, paterno, materno, sexo, edad, parentesco } = data;
    await pool.execute(
      'UPDATE paciente SET idcliente = ?, nombre = ?, paterno = ?, materno = ?, sexo = ?, edad = ?, parentesco = ? WHERE idpaciente = ?',
      [idcliente, nombre, paterno, materno, sexo, edad, parentesco, id]
    );
  }

  static async delete(id) {
    await pool.execute('DELETE FROM paciente WHERE idpaciente = ?', [id]);
  }
}

export default Paciente;