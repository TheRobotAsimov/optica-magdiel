import { Router } from 'express';
import { getRutas, getRuta, createRuta, updateRuta, deleteRuta } from '../controllers/Rutas.js';
import { authenticateToken } from '../middleware/auth.js';


const router = Router();
router.use(authenticateToken);

router.get('/', getRutas);
router.get('/:id', getRuta);
router.post('/', createRuta);
router.put('/:id', updateRuta);
router.delete('/:id', deleteRuta);

export default router;
