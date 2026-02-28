import bcryptjs from 'bcryptjs';
import User from '../models/user.model.js'; // Ajusta la ruta a tu modelo
import { errorHandler } from '../utils/error.js'; // Tu utilidad de errores personalizados

export const test = (req, res) => {
    res.json({ message: '¡API funcionando correctamente!' });
};

export const getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return next(errorHandler(404, 'Usuario no encontrado'));
        
        const { password, ...rest } = user._doc;
        res.status(200).json(rest);
    } catch (error) {
        next(error);
    }
};

// --- ACTUALIZAR USUARIO (Corregido para incluir profileColor) ---
export const updateUser = async (req, res, next) => {
    if (req.user.id !== req.params.userId) {
        return next(errorHandler(401, '¡Solo puedes actualizar tu propia cuenta!'));
    }

    try {
        if (req.body.password) {
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
                    profileColor: req.body.profileColor, // <--- Agregamos esto para que se guarde el color!
                },
            },
            { new: true } // 'new: true' es más estándar en Mongoose para devolver el dato actualizado
        );

        if (!updatedUser) return next(errorHandler(404, 'Usuario no encontrado'));

        const { password, ...rest } = updatedUser._doc;
        res.status(200).json(rest);

    } catch (error) {
        next(error);
    }
};

// --- ELIMINAR USUARIO (Sintaxis corregida) ---
export const deleteUser = async (req, res, next) => {
    // 1. Verificación de seguridad (Dentro de la función)
    if (req.user.id !== req.params.userId) {
        return next(errorHandler(401, '¡Solo puedes eliminar tu propia cuenta!'));
    }

    try {
        const userDeleted = await User.findByIdAndDelete(req.params.userId);
        
        if (!userDeleted) {
            return next(errorHandler(404, 'Usuario no encontrado'));
        }

        res.status(200).json({ message: '¡Cuenta eliminada exitosamente!' });
    } catch (error) {
        next(error);
    } // Aquí se cierra correctamente la función
};