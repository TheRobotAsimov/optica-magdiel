import express from 'express';
import {
  createVenta,
  getVentas,
  getVentaByFolio,
  updateVenta,
  deleteVenta
} from '../controllers/Ventas.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', createVenta);
router.get('/', getVentas);
router.get('/:folio', getVentaByFolio);
router.put('/:folio', updateVenta);
router.delete('/:folio', deleteVenta);

export default router;
