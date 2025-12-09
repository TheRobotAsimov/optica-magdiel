// Modelo de Usuario para interactuar con la base de datos
// Maneja operaciones CRUD y autenticación de usuarios

import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

class User {
    // Crear un nuevo usuario en la base de datos
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

    // Buscar usuario por correo electrónico
    static async findByEmail(email) {
        const [rows] = await pool.execute(
            'SELECT * FROM usuario WHERE correo = ?',
            [email]
        );
        return rows[0];
    }

    // Buscar usuario por ID, incluyendo información del empleado si existe
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

    // Actualizar token de reset de contraseña
    static async updateResetToken(email, token, expires) {
        await pool.execute(
            'UPDATE usuario SET reset_token = ?, reset_expires = ? WHERE correo = ?',
            [token, expires, email]
        );
    }

    // Buscar usuario por token de reset válido
    static async findByResetToken(token) {
        const [rows] = await pool.execute(
            'SELECT * FROM usuario WHERE reset_token = ? AND reset_expires > NOW()',
            [token]
        );
        return rows[0];
    }

    // Actualizar contraseña del usuario y limpiar tokens de reset
    static async updatePassword(id, newPassword) {
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        await pool.execute(
            'UPDATE usuario SET contrasena = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?',
            [hashedPassword, id]
        );
    }

    // Comparar contraseña plana con la encriptada
    static async comparePassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    // Obtener todos los usuarios (solo campos básicos)
    static async getAll() {
        const [rows] = await pool.execute('SELECT id, correo, rol FROM usuario');
        return rows;
    }

    // Obtener usuarios por rol específico
    static async getByRole(rol) {
        const [rows] = await pool.execute('SELECT id, correo, rol FROM usuario WHERE rol = ?', [rol]);
        return rows;
    }

    // Obtener usuarios que no tienen empleado asociado (excepto Matriz)
    static async getUsersWithoutEmployee() {
        const [rows] = await pool.execute(`
            SELECT u.id, u.correo, u.rol
            FROM usuario u
            LEFT JOIN empleado e ON e.idusuario = u.id
            WHERE e.idusuario IS NULL AND u.rol != 'Matriz'
        `);
        return rows;
    }

    // Actualizar información del usuario (correo y rol)
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

    // Eliminar usuario por ID
    static async delete(id) {
        await pool.execute('DELETE FROM usuario WHERE id = ?', [id]);
    }
}

export default User;