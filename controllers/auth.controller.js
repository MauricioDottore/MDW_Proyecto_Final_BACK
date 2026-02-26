import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
// Importa tu errorHandler si lo tienes en otro archivo
// import { errorHandler } from '../utils/error.js'; 

export const signup = async (req, res, next) => {
    const { username, email, password } = req.body;

    // 1. Validación de campos
    if (!username || !email || !password || username === '' || email === '' || password === '') {
        // Importante: agregar el RETURN para que no siga ejecutando lo de abajo
        return next(errorHandler(400, 'Todos los campos son obligatorios'));
    }

    // 2. Bloque TRY-CATCH (Ahora sí está completo)
    try {
        const hashedPassword = bcrypt.hashSync(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        await newUser.save();
        res.status(201).json({ message: "Usuario creado con éxito" });

    } catch (error) {
        // Manejo de errores de MongoDB (Duplicados)
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(409).json({ 
                success: false, 
                message: `El ${field} ya está en uso. Elige otro.` 
            });
        }
        
        // Para cualquier otro error, usamos el middleware global
        next(error); 
    }
};