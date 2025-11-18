import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 4003;
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://127.0.0.1:4001/api/auth/verify';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// 🛡️ MIDDLEWARE DE COMUNICACIÓN ENTRE SERVICIOS (Igual que en Películas)
const verificarAutenticacion = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    // Llama al servicio de Auth (Puerto 4001)
    const respuestaAuth = await axios.post(AUTH_SERVICE_URL, {}, {
      headers: { Authorization: token }
    });

    if (respuestaAuth.data.valid) {
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

// 1. Registrar una nueva compra/venta (PRIVADO)
// 1. Registrar una nueva compra/venta (PRIVADO)
app.post('/comprar', verificarAutenticacion, async (req, res) => {
  // ⚠️ NUEVA ESTRUCTURA DE INPUT
  const { monto_total, items } = req.body; // Esperamos un total y una lista de items
  const user_id = req.user.userId;

  if (!user_id || !monto_total || !items || items.length === 0) {
    return res.status(400).json({ error: 'Faltan datos de la transacción o items.' });
  }

  try {
    // --- PASO 1: Insertar en la tabla PADRE (compras) para obtener el ID ---
    const { data: compraData, error: compraError } = await supabase
      .from('compras')
      .insert([{ usuario_id: user_id, monto_total: monto_total }]) 
      .select('id'); // Pedimos el ID generado

    if (compraError) throw compraError;
    const compra_id = compraData[0].id;

    // --- PASO 2: Insertar en la tabla HIJA (detalles_compra) ---
    // Mapeamos los items para incluir la clave foránea (compra_id)
    const detallesToInsert = items.map(item => ({
      compra_id: compra_id,
      boleto_id: item.boleto_id, // Usamos boleto_id como pide el ERD
      cantidad: item.cantidad,
      subtotal: item.subtotal
    }));

    const { error: detallesError } = await supabase
      .from('detalles_compra')
      .insert(detallesToInsert);

    if (detallesError) throw detallesError;

    res.status(201).json({ 
      success: true, 
      message: 'Transacción completada, registro en dos tablas.',
      compra_id: compra_id,
      items_registrados: items.length
    });

  } catch (error) {
    console.error('❌ Error de transacción:', error.message);
    res.status(500).json({ error: 'Error interno al procesar la compra. ' + error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ service: 'microservicio-ventas', status: 'active', port: PORT });
});

app.listen(PORT, () => {
  console.log(`
  💸 MICROSERVICIO VENTAS
  Puerto: ${PORT}
  Estado: ✅ Escuchando
  `);
});