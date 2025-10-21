import express from 'express';
import {
  createVenta,
  getVentas,
  getVentasByAsesor,
  getVentaByFolio,
  updateVenta,
  deleteVenta
} from '../controllers/Ventas.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', createVenta);
router.get('/', getVentas);
router.get('/asesor/:idasesor', getVentasByAsesor);
router.get('/:folio', getVentaByFolio);
router.put('/:folio', isAdmin, updateVenta);
router.delete('/:folio', isAdmin, deleteVenta);

export default router;
