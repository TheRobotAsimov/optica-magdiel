import { Router } from 'express';
import { getPagos, getPago, createPago, updatePago, deletePago } from '../controllers/Pagos.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.route('/').get(getPagos).post(createPago);
router.route('/:id').get(getPago).put(updatePago).delete(deletePago);

export default router;
