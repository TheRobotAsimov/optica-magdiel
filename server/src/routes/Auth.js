import express from 'express';
import rateLimit from 'express-rate-limit';
import {
    register,
    login,
    forgotPassword,
    resetPassword,
    getProfile,
    logout
} from '../controllers/Auth.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Rate limiting para endpoints sensibles
const authLimiter = rateLimit({
    windowMs: 1,// 15 * 60 * 1000, // 15 minutos
    max: 5, // máximo 5 intentos por IP
    message: { message: 'Demasiados intentos, intenta de nuevo en 15 minutos' }
});

// Rutas públicas
router.post('/register', register);
router.post('/login', authLimiter, login);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Rutas protegidas
router.get('/profile', authenticateToken, getProfile);
router.post('/logout', authenticateToken, logout);

export default router;