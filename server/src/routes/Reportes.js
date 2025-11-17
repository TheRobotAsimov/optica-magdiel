import express from 'express';
import { getDesempenoAsesor, getPagosClientes } from '../controllers/Reportes.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);
router.use(isAdmin); // Solo usuarios Matriz pueden acceder

router.get('/desempeno-asesor', getDesempenoAsesor);
router.get('/pagos-clientes', getPagosClientes);

export default router;