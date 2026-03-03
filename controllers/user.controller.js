import bcryptjs from 'bcryptjs';
import User from '../models/user.model.js';
import { errorHandler } from '../utils/errorHandler.js';

// --- PRUEBA DE API ---
export const test = (req, res) => {
    res.json({ message: '¡API funcionando correctamente!' });
};

// --- OBTENER UN USUARIO ESPECÍFICO ---
export const getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.userId); // Cambiado a userId por consistencia
        if (!user) return next(errorHandler(404, 'Usuario no encontrado'));
        
        const { password, ...rest } = user._doc;
        res.status(200).json(rest);
    } catch (error) {
        next(error);
    }
};

// --- ACTUALIZAR USUARIO ---
export const updateUser = async (req, res, next) => {
    // Verificamos permisos: Solo el dueño puede actualizar su perfil
    if (req.user.id !== req.params.userId) {
        return next(errorHandler(403, '¡No tienes permiso para actualizar esta cuenta!'));
    }

    try {
        if (req.body.password) {
            if (req.body.password.length < 6) {
                return next(errorHandler(400, 'La contraseña debe tener al menos 6 caracteres'));
            }
            req.body.password = bcryptjs.hashSync(req.body.password, 10);
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.userId,
            {
                $set: {
                    username: req.body.username,
                    email: req.body.email,
                    password: req.body.password,
                    profilePicture: req.body.profilePicture,
                    profileColor: req.body.profileColor, 
                },
            },
            { new: true } 
        );

        if (!updatedUser) return next(errorHandler(404, 'Usuario no encontrado'));

        const { password, ...rest } = updatedUser._doc;
        res.status(200).json(rest);

    } catch (error) {
        next(error);
    }
};

// --- ELIMINAR USUARIO (LÓGICA CORREGIDA) ---
export const deleteUser = async (req, res, next) => {
    // Verificación: Solo el admin o el propio usuario pueden eliminar
    if (!req.user.isAdmin && req.user.id !== req.params.userId) {
        return next(errorHandler(403, '¡No tienes permiso para eliminar esta cuenta!'));
    }

    try {
        const userDeleted = await User.findByIdAndDelete(req.params.userId);
        if (!userDeleted) {
            return next(errorHandler(404, 'Usuario no encontrado'));
        }

        res.status(200).json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        next(error);
    } 
};

// --- CERRAR SESIÓN ---
export const signout = (req, res, next) => {
    try {
        res
            .clearCookie('access_token')
            .status(200)
            .json('Has cerrado sesión correctamente');
    } catch (error) {
        next(error);
    }
};

// --- OBTENER TODOS LOS USUARIOS (SOLO ADMIN) ---
export const getUsers = async (req, res, next) => {
    if (!req.user.isAdmin) {
        return next(errorHandler(403, '¡No tienes permisos para ver esta información!'));
    }

    try {
        const startIndex = parseInt(req.query.startIndex) || 0;
        const limit = parseInt(req.query.limit) || 9;
        const sortDirection = req.query.sort === 'asc' ? 1 : -1;

        const users = await User.find()
            .sort({ createdAt: sortDirection })
            .skip(startIndex)
            .limit(limit);

        const usersWithoutPassword = users.map(user => {
            const { password, ...rest } = user._doc;
            return rest;
        });

        const totalUsers = await User.countDocuments();
        
        const now = new Date();
        const oneMonthAgo = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            now.getDate()
        );

        const lastMonthUsersCount = await User.countDocuments({ 
            createdAt: { $gte: oneMonthAgo } 
        });

        res.status(200).json({
            users: usersWithoutPassword,
            totalUsers,
            lastMonthUsersCount
        });

    } catch (error) {
        next(error);
    }
};