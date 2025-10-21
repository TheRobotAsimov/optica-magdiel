import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

class User {
    static async create(userData) {
        const {
            correo,
            contrasena,
            rol
        } = userData;

        // Encriptar contraseña
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(contrasena, saltRounds);

        const [result] = await pool.execute(
            `INSERT INTO usuario (
                correo, contrasena, rol
            ) VALUES (?, ?, ?)`,
            [
                correo, hashedPassword, rol
            ]
        );

        return result.insertId;
    }

    static async findByEmail(email) {
        const [rows] = await pool.execute(
            'SELECT * FROM usuario WHERE correo = ?',
            [email]
        );
        return rows[0];
    }

    static async findById(id) {
        const [rows] = await pool.execute(`
            SELECT 
            u.id,
            u.correo,
            u.rol,
            e.idempleado,
            e.nombre,
            e.paterno,
            e.materno,
            e.puesto,
            e.estado
            FROM usuario u
            LEFT JOIN empleado e ON e.idusuario = u.id
            WHERE u.id = ?
        `, [id]);

        return rows[0];
    }

    static async updateResetToken(email, token, expires) {
        await pool.execute(
            'UPDATE usuario SET reset_token = ?, reset_expires = ? WHERE correo = ?',
            [token, expires, email]
        );
    }

    static async findByResetToken(token) {
        const [rows] = await pool.execute(
            'SELECT * FROM usuario WHERE reset_token = ? AND reset_expires > NOW()',
            [token]
        );
        return rows[0];
    }

    static async updatePassword(id, newPassword) {
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        
        await pool.execute(
            'UPDATE usuario SET contrasena = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?',
            [hashedPassword, id]
        );
    }

    static async comparePassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    static async getAll() {
        const [rows] = await pool.execute('SELECT id, correo, rol FROM usuario');
        return rows;
    }

    static async update(id, userData) {
        const {
            correo,
            rol
        } = userData;

        await pool.execute(
            `UPDATE usuario SET
                correo = ?,
                rol = ?
            WHERE id = ?`,
            [
                correo,
                rol,
                id
            ]
        );
    }

    static async delete(id) {
        await pool.execute('DELETE FROM usuario WHERE id = ?', [id]);
    }
}

export default User;