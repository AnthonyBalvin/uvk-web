// microservicio-auth/index.js
import express from 'express';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Configuración Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const JWT_SECRET = process.env.JWT_SECRET || 'mi_secreto_ultra_seguro_123';
const PORT = process.env.PORT || 4001;

// ============ ENDPOINTS ============

// 1. LOGIN - Genera JWT
app.post('/login', async (req, res) => {
  console.log('📥 Solicitud de login recibida:', req.body);
  
  const { email, password } = req.body;
  
  // Validación
  if (!email || !password) {
    return res.status(400).json({ 
      success: false,
      error: 'Email y contraseña son requeridos' 
    });
  }

  try {
    // Autenticar con Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error('❌ Error de autenticación:', authError);
      return res.status(401).json({ 
        success: false,
        error: authError.message 
      });
    }

    // Obtener perfil del usuario
    const { data: profileData, error: profileError } = await supabase
      .from('perfiles')
      .select('rol')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('❌ Error obteniendo perfil:', profileError);
    }

    const userRole = profileData?.rol || 'user';

    // Generar JWT PROPIO del microservicio
    const token = jwt.sign(
      {
        userId: authData.user.id,
        email: authData.user.email,
        rol: userRole,
        iat: Math.floor(Date.now() / 1000)
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✅ Login exitoso para:', email);

    res.json({
      success: true,
      token: token,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        rol: userRole,
        nombre: authData.user.user_metadata?.nombre || email.split('@')[0]
      }
    });

  } catch (error) {
    console.error('💥 Error inesperado:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor' 
    });
  }
});

// 2. VERIFICAR TOKEN
app.post('/verify', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ 
      valid: false,
      error: 'Token no proporcionado' 
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token válido para:', decoded.email);
    
    res.json({
      valid: true,
      user: decoded
    });
  } catch (error) {
    console.error('❌ Token inválido:', error.message);
    res.status(401).json({ 
      valid: false,
      error: 'Token inválido o expirado' 
    });
  }
});

// 3. OBTENER USUARIO ACTUAL
app.get('/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({
      success: true,
      user: decoded
    });
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'microservicio-auth',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   🔐 MICROSERVICIO AUTH                    ║
║   Puerto: ${PORT}                              ║
║   Estado: ✅ Activo                         ║
╚════════════════════════════════════════════╝
  `);
});