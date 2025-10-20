import { Router } from 'express';
import { getGastoRutas, getGastoRuta, createGastoRuta, updateGastoRuta, deleteGastoRuta } from '../controllers/GastoRutas.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.route('/').get(getGastoRutas).post(createGastoRuta);
router.route('/:id').get(getGastoRuta).put(updateGastoRuta).delete(deleteGastoRuta);

export default router;
