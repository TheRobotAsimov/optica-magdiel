import express from 'express';
import { 
    getAllEmpleados, 
    getEmpleadoById, 
    createEmpleado, 
    updateEmpleado, 
    deleteEmpleado 
} from '../controllers/Empleados.js';

const router = express.Router();

router.get('/', getAllEmpleados);
router.get('/:id', getEmpleadoById);
router.post('/', createEmpleado);
router.put('/:id', updateEmpleado);
router.delete('/:id', deleteEmpleado);

export default router;
