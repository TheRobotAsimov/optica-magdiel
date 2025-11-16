import express from 'express';
import {
    createNotificacion,
    getNotificaciones,
    getUnreadCount,
    markAsRead
} from '../controllers/Notificaciones.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', createNotificacion);
router.get('/', getNotificaciones);
router.get('/unread-count', getUnreadCount);
router.put('/:id/read', markAsRead);

export default router;