import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

class User {
    static async create(userData) {
        const {
            nombre,
            paterno,
            materno,
            fecnac,
            feccon,
            sueldo,
            telefono,
            sexo,
            correo,
            contrasena,
            tipo
        } = userData;

        // Encriptar contraseña
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(contrasena, saltRounds);

        const [result] = await pool.execute(
            `INSERT INTO usuario (
                nombre, paterno, materno, fecnac,
                feccon, sueldo, telefono, sexo,
                correo, contrasena, tipo
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                nombre, paterno, materno, fecnac,
                feccon, sueldo, telefono, sexo,
                correo, hashedPassword, tipo
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
        const [rows] = await pool.execute(
            'SELECT id, nombre, paterno, materno, fecnac, feccon, sueldo, telefono, sexo, correo, tipo FROM usuario WHERE id = ?',
            [id]
        );
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
}

export default User;