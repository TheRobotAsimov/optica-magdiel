import express from 'express';
import { 
    getAllLentes, 
    getLenteById, 
    createLente, 
    updateLente, 
    deleteLente 
} from '../controllers/Lentes.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken);

router.get('/', getAllLentes);
router.get('/:id', getLenteById);
router.post('/', createLente);
router.put('/:id', updateLente);
router.delete('/:id', deleteLente);

export default router;
