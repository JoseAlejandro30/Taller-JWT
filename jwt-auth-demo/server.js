require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

const app = express();

// ─── Middlewares globales ─────────────────────────────────────
app.use(express.json());           // Parsear body JSON
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());           // Parsear cookies (para tokens HTTP-only)

// ─── Conexión a MongoDB ───────────────────────────────────────
connectDB();

// ─── Rutas públicas ───────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: '🔐 JWT Auth API funcionando',
    version: '1.0.0',
    endpoints: {
      registro:  'POST /api/auth/register',
      login:     'POST /api/auth/login',
      perfil:    'GET  /api/profile/me       [requiere JWT]',
      dashboard: 'GET  /api/profile/dashboard [requiere JWT]',
    },
  });
});

// ─── Rutas de autenticación ───────────────────────────────────
app.use('/api/auth',    require('./routes/auth'));

// ─── Rutas protegidas ─────────────────────────────────────────
app.use('/api/profile', require('./routes/profile'));

// ─── Manejo de rutas no encontradas ──────────────────────────
app.use((req, res) => {
  res.status(404).json({ ok: false, message: 'Ruta no encontrada' });
});

// ─── Manejo global de errores ─────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err.stack);
  res.status(500).json({ ok: false, message: 'Error interno del servidor' });
});

// ─── Iniciar servidor ─────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📌 Entorno: ${process.env.NODE_ENV || 'development'}`);
});
