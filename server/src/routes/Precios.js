import { Router } from 'express';
import { getPriceCatalog, updatePriceCatalog } from '../controllers/Precios.js';

const router = Router();

router.get('/', getPriceCatalog);
router.put('/', updatePriceCatalog);

export default router;