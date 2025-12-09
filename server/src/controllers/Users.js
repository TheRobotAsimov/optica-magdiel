// Controlador para las rutas de usuarios
// Maneja las operaciones CRUD de usuarios

import User from '../models/User.js';

// Obtener todos los usuarios
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.getAll();
        res.json(users);
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Obtener un usuario por ID
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error getting user by id:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Crear un nuevo usuario
export const createUser = async (req, res) => {
    try {
        const userId = await User.create(req.body);
        res.status(201).json({ message: 'User created successfully', userId });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Actualizar un usuario existente
export const updateUser = async (req, res) => {
    try {
        await User.update(req.params.id, req.body);
        res.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Eliminar un usuario
export const deleteUser = async (req, res) => {
    try {
        await User.delete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Obtener usuarios que no tienen empleado asociado
export const getUsersWithoutEmployee = async (req, res) => {
    try {
        const users = await User.getUsersWithoutEmployee();
        res.json(users);
    } catch (error) {
        console.error('Error getting users without employee:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
