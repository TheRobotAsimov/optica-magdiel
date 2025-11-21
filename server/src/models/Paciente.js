import pool from '../config/db.js';

class Paciente {
  static async getAll() {
    const [rows] = await pool.execute('SELECT * FROM paciente');
    return rows;
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