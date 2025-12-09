// Controlador para las rutas de notificaciones
// Maneja operaciones de creación, obtención y marcado de notificaciones

import Notificacion from '../models/Notificacion.js';
import User from '../models/User.js';

// Crear notificación (el idusuario será el remitente)
export const createNotificacion = async (req, res) => {
    try {
        const { mensaje } = req.body;
        const idRemitente = req.user.id;

        const insertId = await Notificacion.create(mensaje, idRemitente);

        // Emitir evento a todos los usuarios Matriz conectados via Socket.IO
        if (global.io) {
            const matrizUsers = await User.getByRole('Matriz');

            matrizUsers.forEach(user => {
                global.io.to(`user_${user.id}`).emit('nueva_notificacion', {
                    idnotificacion: insertId,
                    mensaje,
                    fecha: new Date(),
                    remitente_correo: req.user.correo,
                    remitente_rol: req.user.rol
                });
            });
        }

        res.status(201).json({ message: 'Notificación creada', id: insertId });
    } catch (err) {
        console.log(req.body);
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};

// Obtener notificaciones según el rol del usuario
export const getNotificaciones = async (req, res) => {
    try {
        let notificaciones;

        // Usuarios Matriz ven todas las notificaciones de no-Matriz
        if (req.user.rol === 'Matriz') {
            notificaciones = await Notificacion.getAllForMatriz();
        } else {
            // Otros usuarios ven solo sus propias notificaciones
            notificaciones = await Notificacion.getByUser(req.user.id);
        }

        res.json(notificaciones);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Obtener conteo de notificaciones no leídas (solo para Matriz)
export const getUnreadCount = async (req, res) => {
    try {
        let count = 0;

        // Solo usuarios Matriz tienen acceso al conteo global
        if (req.user.rol === 'Matriz') {
            count = await Notificacion.getUnreadCountForMatriz();
        }

        res.json({ count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Marcar notificación como leída
export const markAsRead = async (req, res) => {
    try {
        await Notificacion.markAsRead(req.params.id);
        res.json({ message: 'Notificación marcada como leída' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};