import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/Auth.js';
import userRoutes from './routes/Users.js';
import clientRoutes from './routes/Clients.js';
import databaseRoutes from './routes/Database.js';
import empleadoRoutes from './routes/Empleados.js';
import lenteRoutes from './routes/Lentes.js';
import ventaRoutes from './routes/Ventas.js';
import preciosRoutes from './routes/Precios.js';
import rutasRoutes from './routes/Rutas.js';
import pagoRoutes from './routes/Pagos.js';
import entregaRoutes from './routes/Entregas.js';
import gastoRutaRoutes from './routes/GastoRutas.js';

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
app.use('/api/database', databaseRoutes);
app.use('/api/empleados', empleadoRoutes);
app.use('/api/lentes', lenteRoutes);
app.use('/api/ventas', ventaRoutes);
app.use('/api/precios', preciosRoutes);
app.use('/api/rutas', rutasRoutes);
app.use('/api/pagos', pagoRoutes);
app.use('/api/entregas', entregaRoutes);
app.use('/api/gasto-rutas', gastoRutaRoutes);

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    console.error('Error:', err.message);
    console.log(err);
    res.status(500).json({ message: 'Error interno del servidor' });
});

export default app;