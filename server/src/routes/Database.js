
import { Router } from 'express';
import multer from 'multer';
import { dumpDatabase, restoreDatabase } from '../controllers/Database.js';
import { authenticateToken as auth, isAdmin } from '../middleware/auth.js';

const router = Router();

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Routes
router.get('/dump', auth, isAdmin, dumpDatabase);
router.post('/restore', auth, isAdmin, upload.single('sqlFile'), restoreDatabase);

export default router;
