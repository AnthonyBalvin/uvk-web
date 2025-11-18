import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Mensaje de bienvenida
app.get('/', (req, res) => {
  res.send('🏰 BIENVENIDO AL API GATEWAY DE UVK');
});

// ==========================================
// 🚦 RUTAS DE PROXY
// ==========================================

// 1. Auth (4001)
app.use('/api/auth', createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL,
  changeOrigin: true,
}));

// 2. Películas (4002)
app.use('/api/peliculas', createProxyMiddleware({
  target: process.env.MOVIES_SERVICE_URL,
  changeOrigin: true,
}));

// 3. Ventas (4003)
app.use('/api/ventas', createProxyMiddleware({
  target: process.env.SALES_SERVICE_URL,
  changeOrigin: true,
}));

app.listen(PORT, () => {
  console.log(`
  🏰 API GATEWAY
  Puerto: ${PORT}
  Estado: ✅ FUNCIONANDO
  Rutas:
    - Auth:      http://localhost:${PORT}/api/auth
    - Películas: http://localhost:${PORT}/api/peliculas
    - Ventas:    http://localhost:${PORT}/api/ventas
  `);
});