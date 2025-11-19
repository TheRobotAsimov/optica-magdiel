import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticateToken = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Token de acceso requerido' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }

        // Verificar si el usuario tiene un empleado asociado o es Matriz
        if (user.rol !== 'Matriz' && !user.idempleado) {
            return res.status(403).json({ message: 'Acceso denegado. Usuario no autorizado.' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Token inválido' });
    }
};

export const isAdmin = (req, res, next) => {
    if (req.user && req.user.rol === 'Matriz') {
        next();
    } else {
        res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
    }
};