import { Router } from 'express';
import { getPriceCatalog, updatePriceCatalog } from '../controllers/Precios.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/', getPriceCatalog);
router.put('/', isAdmin, updatePriceCatalog);

export default router;