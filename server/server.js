import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from './src/models/User.js';
import app from './src/app.js';
import dotenv from 'dotenv';

dotenv.config();

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true
    }
});

// Middleware de Socket.io para autenticación
io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication error'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return next(new Error('User not found'));
        }

        socket.userId = decoded.id;
        socket.user = user;
        next();
    } catch (err) {
        next(new Error('Authentication error'));
    }
});

// Conexiones de Socket.io
io.on('connection', (socket) => {
    console.log('Usuario conectado:', socket.userId);

    // Unir al usuario a una sala específica
    socket.join(`user_${socket.userId}`);

    socket.on('disconnect', () => {
        console.log('Usuario desconectado:', socket.userId);
    });
});

// Hacer io disponible globalmente para emitir eventos
global.io = io;

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Servidor ejecutándose en puerto ${PORT}`);
});