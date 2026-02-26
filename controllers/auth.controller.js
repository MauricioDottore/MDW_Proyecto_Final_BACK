import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { errorHandler } from '../utils/error.js';

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


export const signin = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password || email === '' || password === '') {
        return next(errorHandler(400, 'Todos los campos son obligatorios'));
    }

    try {
        const validUser = await User.findOne({ email });

        if (!validUser) {
            return next(errorHandler(404, 'Usuario no encontrado'));
        }

        const validPassword = bcrypt.compareSync(password, validUser.password);

        if (!validPassword) {
            return next(errorHandler(400, 'Contraseña incorrecta'));
        }

        const token = jwt.sign( { id: validUser._id }, process.env.JWT_SECRET);
        const { password: pass, ...rest } = validUser._doc;

        res.status(200).cookie("access_token", token, {
            httpOnly: true,
        }).json({ message: "Inicio de sesión exitoso", user: rest, token });


        res.status(200).json({ message: "Inicio de sesión exitoso", user: rest, token });
    } catch (error) {
        next(error);
    }   
}; 