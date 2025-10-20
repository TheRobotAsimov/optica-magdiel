import { Router } from 'express';
import { getEntregas, getEntrega, createEntrega, updateEntrega, deleteEntrega } from '../controllers/Entregas.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.route('/').get(getEntregas).post(createEntrega);
router.route('/:id').get(getEntrega).put(updateEntrega).delete(deleteEntrega);

export default router;
