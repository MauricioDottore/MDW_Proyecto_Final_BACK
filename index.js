import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/user.route.js';

// Esto carga las variables del archivo .env
dotenv.config();

const app = express();

// Elegimos cuál usar. 
// Mientras estés en el trabajo, usa process.env.MONGO_URL_LOCAL
// Cuando vayas a entregar, cambias LOCAL por ATLAS aquí abajo:
const connectionString = process.env.MONGO_URL_LOCAL;

mongoose.connect(connectionString)
  .then(() => {
    console.log(`✅ ¡Conectado con éxito!`);
    console.log(`📍 Destino: ${connectionString.includes('127.0.0.1') ? 'Base de datos Local' : 'Base de datos en la Nube'}`);
  })
  .catch((err) => {
    console.error('❌ Error de conexión:', err.message);
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`📡 Servidor API corriendo en http://localhost:${PORT}`);
});

app.use('/api/user', userRoutes);