import { Router } from 'express';
import { getPriceCatalog } from '../controllers/Precios.js';

const router = Router();

router.get('/', getPriceCatalog);

export default router;