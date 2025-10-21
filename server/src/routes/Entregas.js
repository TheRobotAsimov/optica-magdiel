import { Router } from 'express';
import { getEntregas, getEntrega, createEntrega, updateEntrega, deleteEntrega } from '../controllers/Entregas.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/', getEntregas);
router.post('/', createEntrega);
router.get('/:id', getEntrega);
router.put('/:id', isAdmin, updateEntrega);
router.delete('/:id', isAdmin, deleteEntrega); 

export default router;
