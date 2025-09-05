import express from 'express';
import { getAllClients, getClientById, createClient, updateClient, deleteClient } from '../controllers/Clients.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);
router.use(isAdmin);

router.get('/', getAllClients);
router.get('/:id', getClientById);
router.post('/', createClient);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);

export default router;