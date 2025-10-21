import express from 'express';
import { getAllClients, getClientById, createClient, updateClient, deleteClient, searchClients } from '../controllers/Clients.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/search', searchClients);
router.get('/', getAllClients);
router.get('/:id', getClientById);
router.post('/', createClient);
router.put('/:id', isAdmin, updateClient);
router.delete('/:id', isAdmin, deleteClient);

export default router;