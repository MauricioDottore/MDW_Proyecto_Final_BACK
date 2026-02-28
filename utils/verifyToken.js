import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';

export const verifyToken = (req, res, next) => {
  // Intentamos obtener el token de las cookies
  const token = req.cookies.access_token;

  if (!token) return next(errorHandler(401, 'No estás autorizado (No hay token)'));

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return next(errorHandler(403, 'Token no válido'));

    // ¡Aquí es donde se define req.user!
    req.user = user; 
    next();
  });
};