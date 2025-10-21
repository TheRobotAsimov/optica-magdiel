import express from 'express';
import { getAllClients, getClientById, createClient, updateClient, deleteClient, searchClients } from '../controllers/Clients.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/search', searchClients);
router.get('/', getAllClients);
router.get('/:id', getClientById);
router.post('/', createClient);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);

export default router;