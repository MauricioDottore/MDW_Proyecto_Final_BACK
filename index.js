import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

// --- CONFIGURACIÓN DE RUTAS PARA EL .env ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Importación de rutas
import userRoutes from './routes/user.route.js';
import authRoutes from './routes/auth.route.js';
import postRoutes from './routes/post.route.js';

const app = express();

// --- 1. CONFIGURACIÓN MANUAL DE CORS (SIN LIBRERÍA) ---
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [process.env.FRONTEND_URL, 'http://localhost:5173'];

  if (allowedOrigins.includes(origin) || !origin) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// --- 2. MIDDLEWARES ---
app.use(express.json()); 
app.use(cookieParser());

// --- 3. CONEXIÓN A MONGODB ---
const connectionString = process.env.MONGO_URL_ATLAS;

if (!connectionString) {
    console.error("❌ ERROR: No se encontró MONGO_URL_ATLAS. Verifica el archivo .env");
} else {
    mongoose.connect(connectionString)
      .then(() => console.log("🚀 ¡CONEXIÓN EXITOSA A MONGODB!"))
      .catch((err) => console.error('❌ Error de conexión:', err.message));
}

// --- 4. RUTAS DE LA API ---
app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes); 
app.use('/api/post', postRoutes);

app.get('/', (req, res) => {
  res.send('API funcionando correctamente 🚀');
});

// --- 5. MANEJO DE ERRORES ---
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';
  res.status(statusCode).json({ 
    success: false,
    statusCode,
    message
  });
});

// --- 6. LANZAMIENTO / EXPORTACIÓN PARA VERCEL ---
const PORT = process.env.PORT || 3000;

// Importante para local: Solo iniciamos el puerto si no estamos en Vercel (producción)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`📡 Servidor local corriendo en puerto ${PORT}`);
    });
}

export default app;