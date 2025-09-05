import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/Auth.js';
import userRoutes from './routes/Users.js';
import clientRoutes from './routes/Clients.js';

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Rutas
app.get('/', (req, res) => {
    res.send('Hello Optica')
})
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    console.error('Error:', err.message);
    console.log(err);
    res.status(500).json({ message: 'Error interno del servidor' });
});

export default app;