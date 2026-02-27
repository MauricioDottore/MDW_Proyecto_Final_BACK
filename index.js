import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/user.route.js';
import authRoutes from './routes/auth.route.js';

dotenv.config();

const app = express();
app.use(express.json());

const connectionString = process.env.MONGO_URL_LOCAL;

mongoose.connect(connectionString)
  .then(() => {
    console.log(`✅ ¡Conectado con éxito!`);
    console.log(`📍 Destino: ${connectionString.includes('127.0.0.1') ? 'Base de datos Local' : 'Base de datos en la Nube'}`);
  })
  .catch((err) => {
    console.error('❌ Error de conexión:', err.message);
  });

app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes); 

// --- Middleware de Manejo de Errores Optimizado ---
app.use((err, req, res, next) => {
  // Si por alguna razón los headers ya se enviaron, dejamos que Express maneje el error solo
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500; // Cambiado de err.status a err.statusCode (estándar)
  const message = err.message || 'Error interno del servidor';
  
  return res.status(statusCode).json({ 
    success: false,
    statusCode,
    message
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`📡 Servidor API corriendo en http://localhost:${PORT}`);
});