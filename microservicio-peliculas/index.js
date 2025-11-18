import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 4002;
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:4001/api/auth/verify';

// Configuración Supabase (Base de datos)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// ==========================================
// 🛡️ MIDDLEWARE DE COMUNICACIÓN ENTRE SERVICIOS
// ==========================================
// Esta función intercepta las peticiones y pregunta al Microservicio Auth si el token es válido.
const verificarAutenticacion = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    // 📞 AQUÍ OCURRE LA MAGIA: Comunicación entre microservicios
    // El servicio de Películas llama al servicio de Auth (Puerto 4001)
    const respuestaAuth = await axios.post(AUTH_SERVICE_URL, {}, {
      headers: { Authorization: token }
    });

    if (respuestaAuth.data.valid) {
      // Si Auth dice que es válido, guardamos la info del usuario y dejamos pasar
      req.user = respuestaAuth.data.user;
      next();
    } else {
      res.status(401).json({ error: 'Token inválido según Auth Service' });
    }

  } catch (error) {
    console.error('❌ Error comunicándose con Auth Service:', error.message);
    res.status(401).json({ error: 'Fallo de autenticación entre servicios' });
  }
};

// ============ ENDPOINTS ============

// 1. Listar todas las películas (Público - Cualquiera puede ver la cartelera)
app.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('peliculas')
    .select('*');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// 2. Crear una nueva película (PRIVADO - Solo admins)
// Usamos el middleware 'verificarAutenticacion' aquí
app.post('/', verificarAutenticacion, async (req, res) => {
    console.log("📦 BODY RECIBIDO:", req.body);
  // Verificar rol
  if (req.user.rol !== 'administrador') {
    return res.status(403).json({ error: 'Acceso denegado: Se requiere ser administrador' });
  }

  // Recibimos los datos EXACTOS de tu tabla
  const { titulo, sinopsis, duracion, genero, imagen_url, trailer_url, estado } = req.body;

  const { data, error } = await supabase
    .from('peliculas') // Asegúrate que la tabla se llame 'peliculas' en Supabase
    .insert([
      { 
        titulo, 
        sinopsis, 
        duracion, 
        genero, 
        imagen_url, 
        trailer_url, 
        estado 
      }
    ])
    .select();

  if (error) {
    console.error('Error Supabase:', error);
    return res.status(500).json({ error: error.message });
  }
  
  res.status(201).json({ 
    success: true, 
    message: 'Película creada correctamente',
    data 
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ service: 'microservicio-peliculas', status: 'active', port: PORT });
});

app.listen(PORT, () => {
  console.log(`
  🎬 MICROSERVICIO PELÍCULAS
  Puerto: ${PORT}
  Estado: ✅ Escuchando
  Modo: Conectado a Auth en puerto 4001
  `);
});