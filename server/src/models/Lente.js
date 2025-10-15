import pool from '../config/db.js';

class Lente {
  static async getAll() {
    const [rows] = await pool.execute('SELECT * FROM lente');
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.execute('SELECT * FROM lente WHERE idlente = ?', [id]);
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
            id_av,
            oi_esf,
            oi_cil,
            oi_eje,
            oi_add,
            oi_av,
            subtipo,
            blend,
            procesado
          } = data;
      
              const [result] = await pool.execute(
                `INSERT INTO lente (idoptometrista, folio, sintomas, uso_de_lente, armazon, material, tratamiento, tipo_de_lente, tinte_color, tono, desvanecido, fecha_entrega, examen_seguimiento, estatus, od_esf, od_cil, od_eje, od_add, od_av, oi_esf, oi_cil, oi_eje, oi_add, oi_av, subtipo, blend, procesado)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) `,
                [idoptometrista, folio, sintomas, uso_de_lente, armazon, material, tratamiento, tipo_de_lente, tinte_color, tono, desvanecido, fecha_entrega, examen_seguimiento, estatus, od_esf, od_cil, od_eje, od_add, od_av, oi_esf, oi_cil, oi_eje, oi_add, oi_av, subtipo, blend, procesado]
              );    return result.insertId;
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
      procesado
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
        procesado = ?
       WHERE idlente = ?`,
      [idoptometrista, folio, sintomas, uso_de_lente, armazon, material, tratamiento, tipo_de_lente, tinte_color, tono, desvanecido, fecha_entrega, examen_seguimiento, estatus, od_esf, od_cil, od_eje, od_add, od_av, oi_esf, oi_cil, oi_eje, oi_add, oi_av, subtipo, blend, procesado, id]
    );
  }

  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM lente WHERE idlente = ?', [id]);
    return result.affectedRows;
  }
}

export default Lente;
