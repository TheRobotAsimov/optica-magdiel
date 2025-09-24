import express from 'express';
import { 
    getAllLentes, 
    getLenteById, 
    createLente, 
    updateLente, 
    deleteLente 
} from '../controllers/Lentes.js';

const router = express.Router();

router.get('/', getAllLentes);
router.get('/:id', getLenteById);
router.post('/', createLente);
router.put('/:id', updateLente);
router.delete('/:id', deleteLente);

export default router;
