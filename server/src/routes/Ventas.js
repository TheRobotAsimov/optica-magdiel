import express from 'express';
import {
  createVenta,
  getVentas,
  getVentaByFolio,
  updateVenta,
  deleteVenta
} from '../controllers/Ventas.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', createVenta);
router.get('/', getVentas);
router.get('/:folio', getVentaByFolio);
router.put('/:folio', isAdmin, updateVenta);
router.delete('/:folio', isAdmin, deleteVenta);

export default router;
