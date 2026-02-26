import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';

export const signup = async (req, res, next) => {
    const { username, email, password } = req.body;

    // 1. Validación de campos
    if (!username ||
         !email ||
          !password ||
           username === ''
            || email === ''
             || password === ''
            ) {
                next(errorHandler(400, 'Todos los campos son obligatorios'));
            }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = new User({
        username,
        email,
        password: hashedPassword,
    });

    try {
        // 2. Intentamos guardar (SOLO UNA VEZ)
        await newUser.save();
        res.status(201).json({ message: 'Usuario registrado exitosamente' });
    } catch (error) {
        next(error); // Pasamos el error al middleware de manejo de errores
    }
};