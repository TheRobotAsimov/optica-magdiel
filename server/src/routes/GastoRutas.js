import { Router } from 'express';
import { getGastoRutas, getGastoRuta, createGastoRuta, updateGastoRuta, deleteGastoRuta } from '../controllers/GastoRutas.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/', getGastoRutas);
router.post('/', createGastoRuta);
router.get('/:id', getGastoRuta);
router.put('/:id', isAdmin, updateGastoRuta);
router.delete('/:id', isAdmin, deleteGastoRuta);

export default router;
