import express from 'express';
import {
    getAllPacientes,
    getPacienteById,
    getPacientesByCliente,
    createPaciente,
    updatePaciente,
    deletePaciente
} from '../controllers/Pacientes.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken);

router.get('/', getAllPacientes);
router.get('/:id', getPacienteById);
router.get('/cliente/:idcliente', getPacientesByCliente);
router.post('/', createPaciente);
router.put('/:id', updatePaciente);
router.delete('/:id', deletePaciente);

export default router;