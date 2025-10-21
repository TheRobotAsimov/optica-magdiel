import { Router } from 'express';
import { getPagos, getPago, createPago, updatePago, deletePago } from '../controllers/Pagos.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/', getPagos);
router.post('/', createPago);
router.get('/:id', getPago);
router.put('/:id', isAdmin, updatePago);
router.delete('/:id', isAdmin, deletePago);

export default router;
