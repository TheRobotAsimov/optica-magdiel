import express from 'express';
import { getDesempenoAsesor, getPagosClientes, getRutasReport, getBalanceReport } from '../controllers/Reportes.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);
router.use(isAdmin); // Solo usuarios Matriz pueden acceder

router.get('/desempeno-asesor', getDesempenoAsesor);
router.get('/pagos-clientes', getPagosClientes);
router.get('/rutas', getRutasReport);
router.get('/balance', getBalanceReport);

export default router;