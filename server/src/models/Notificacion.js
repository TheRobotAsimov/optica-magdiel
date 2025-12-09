// Modelo de Notificación para interactuar con la base de datos
// Maneja operaciones CRUD de notificaciones

import pool from '../config/db.js';

class Notificacion {
    // Crear una nueva notificación en la base de datos
    static async create(mensaje, idRemitente) {
        const [result] = await pool.execute(
            `INSERT INTO notificacion (idusuario, mensaje, leido) VALUES (?, ?, 0)`,
            [idRemitente, mensaje]
        );

        return result.insertId;
    }

    // Obtener notificaciones de un usuario específico
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

    // Obtener todas las notificaciones para usuarios Matriz (de no-Matriz)
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

    // Obtener conteo de notificaciones no leídas para Matriz
    static async getUnreadCountForMatriz() {
        const [rows] = await pool.execute(
            `SELECT COUNT(*) as count
             FROM notificacion n
             JOIN usuario u ON n.idusuario = u.id
             WHERE u.rol != 'Matriz' AND n.leido = 0`
        );
        return rows[0].count;
    }

    // Marcar una notificación como leída
    static async markAsRead(idnotificacion) {
        await pool.execute(
            'UPDATE notificacion SET leido = 1 WHERE idnotificacion = ?',
            [idnotificacion]
        );
    }
}

export default Notificacion;