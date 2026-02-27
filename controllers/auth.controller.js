import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { errorHandler } from '../utils/error.js';

export const signup = async (req, res, next) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return next(errorHandler(400, 'Todos los campos son obligatorios'));
    }

    try {
        const hashedPassword = bcrypt.hashSync(password, 10);
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        await newUser.save();
        return res.status(201).json({ success: true, message: "Usuario creado con éxito" });

    } catch (error) {
        // Manejo de duplicados (Email o Username ya existen)
        if (error.code === 11000) {
            return next(errorHandler(409, 'El usuario o email ya está en uso'));
        }
        next(error); 
    }
};

export const signin = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(errorHandler(400, 'Email y contraseña son obligatorios'));
    }

    try {
        const validUser = await User.findOne({ email });
        if (!validUser) return next(errorHandler(404, 'Usuario no encontrado'));

        const validPassword = bcrypt.compareSync(password, validUser.password);
        if (!validPassword) return next(errorHandler(401, 'Credenciales inválidas'));

        // Generar Token
        const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);

        // Separar la contraseña del resto de los datos para no enviarla al frente
        const { password: pass, ...rest } = validUser._doc;

        // UNA SOLA RESPUESTA: Enviamos cookie y JSON de una vez
        return res
            .status(200)
            .cookie("access_token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
                maxAge: 24 * 60 * 60 * 1000, // 1 día
            })
            .json(rest); // Enviamos el objeto 'rest' que ya configuraste en el SignIn de React

    } catch (error) {
        next(error);
    }   
};