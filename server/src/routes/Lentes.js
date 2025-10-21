import express from 'express';
import { 
    getAllLentes, 
    getLenteById, 
    createLente, 
    updateLente, 
    deleteLente 
} from '../controllers/Lentes.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken);

router.get('/', getAllLentes);
router.get('/:id', getLenteById);
router.post('/', createLente);
router.put('/:id', isAdmin, updateLente);
router.delete('/:id', isAdmin, deleteLente);

export default router;
