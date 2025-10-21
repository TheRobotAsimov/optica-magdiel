import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { sendResetEmail } from '../utils/email.js';

export const register = async (req, res) => {
    try {
        const userData = req.body;
        
        console.log('Datos del usuario:', userData);
        // Verificar si el usuario ya existe
        const existingUser = await User.findByEmail(userData.correo);
        if (existingUser) {
            return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
        }


        const userId = await User.create(userData);
        
        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            userId
        });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const login = async (req, res) => {
    try {
        const { correo, contrasena } = req.body;

        // Buscar usuario
        const user = await User.findByEmail(correo);
        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Verificar contraseña
        const isValidPassword = await User.comparePassword(contrasena, user.contrasena);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Generar JWT
        const token = jwt.sign(
            { id: user.id, email: user.correo },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        const userFull = await User.findById(user.id);

        // Remover contraseña de la respuesta
        const { contrasena: _, ...userWithoutPassword } = userFull;

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: new Date(Date.now() + 60 * 60 * 1000)
        }).json({
            message: 'Inicio de sesión exitoso',
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { correo } = req.body;

        const user = await User.findByEmail(correo);
        if (!user) {
            return res.status(404).json({ message: 'No se encontró una cuenta con ese correo electrónico' });
        }

        // Generar token de reset
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

        await User.updateResetToken(correo, resetToken, resetTokenExpires);
        await sendResetEmail(correo, resetToken);

        res.json({ message: 'Se ha enviado un correo con las instrucciones para restablecer tu contraseña' });
    } catch (error) {
        console.error('Error en forgot password:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { nueva_contrasena } = req.body;

        const user = await User.findByResetToken(token);
        if (!user) {
            return res.status(400).json({ message: 'Token inválido o expirado' });
        }

        await User.updatePassword(user.id, nueva_contrasena);

        res.json({ message: 'Contraseña restablecida exitosamente' });
    } catch (error) {
        console.error('Error en reset password:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const getProfile = async (req, res) => {
    try {
        res.json({ user: req.user });
    } catch (error) {
        console.error('Error obteniendo perfil:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const logout = (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: new Date(0)
    }).json({ message: 'Sesión cerrada exitosamente' });
};