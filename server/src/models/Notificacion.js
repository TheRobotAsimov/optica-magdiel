import pool from '../config/db.js';

class Notificacion {
    static async create(mensaje, idRemitente) {
        const [result] = await pool.execute(
            `INSERT INTO notificacion (idusuario, mensaje, leido) VALUES (?, ?, 0)`,
            [idRemitente, mensaje]
        );

        return result.insertId;
    }

    static async getByUser(idusuario) {
        const [rows] = await pool.execute(
            `SELECT n.idnotificacion, n.mensaje, n.leido, n.fecha, u.correo as remitente_correo, u.rol as remitente_rol
             FROM notificacion n
             JOIN usuario u ON n.idusuario = u.id
             WHERE n.idusuario = ?
             ORDER BY n.fecha DESC`,
            [idusuario]
        );
        return rows;
    }

    static async getAllForMatriz() {
        const [rows] = await pool.execute(
            `SELECT n.idnotificacion, n.mensaje, n.leido, n.fecha, u.correo as remitente_correo, u.rol as remitente_rol
             FROM notificacion n
             JOIN usuario u ON n.idusuario = u.id
             WHERE u.rol != 'Matriz'
             ORDER BY n.fecha DESC`
        );
        return rows;
    }

    static async getUnreadCountForMatriz() {
        const [rows] = await pool.execute(
            `SELECT COUNT(*) as count
             FROM notificacion n
             JOIN usuario u ON n.idusuario = u.id
             WHERE u.rol != 'Matriz' AND n.leido = 0`
        );
        return rows[0].count;
    }

    static async markAsRead(idnotificacion) {
        await pool.execute(
            'UPDATE notificacion SET leido = 1 WHERE idnotificacion = ?',
            [idnotificacion]
        );
    }
}

export default Notificacion;