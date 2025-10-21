import { Router } from 'express';
import { getPagos, getPendingPagos, getPago, createPago, updatePago, deletePago } from '../controllers/Pagos.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/', getPagos);
router.get('/pending', getPendingPagos);
router.post('/', createPago);
router.get('/:id', getPago);
router.put('/:id', updatePago);
router.delete('/:id', isAdmin, deletePago);

export default router;
