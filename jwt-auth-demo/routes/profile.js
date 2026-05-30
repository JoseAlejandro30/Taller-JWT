const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/user');

const router = express.Router();

// ─────────────────────────────────────────────────────────────
// GET /api/profile/me  [PROTEGIDA]
// Retorna los datos del usuario autenticado (sin password)
// Requiere: Authorization: Bearer <token>
// ─────────────────────────────────────────────────────────────
router.get('/me', auth, async (req, res) => {
  try {
    // req.user fue adjuntado por el middleware auth
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({
        ok: false,
        message: 'Usuario no encontrado',
      });
    }

    res.json({
      ok: true,
      user,
    });
  } catch (err) {
    console.error('Error en /profile/me:', err.message);
    res.status(500).json({ ok: false, message: 'Error interno del servidor' });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/profile/dashboard  [PROTEGIDA - ejemplo adicional]
// Simula un recurso que requiere autenticación
// ─────────────────────────────────────────────────────────────
router.get('/dashboard', auth, (req, res) => {
  res.json({
    ok: true,
    message: `Bienvenido al dashboard, usuario ${req.user.email}`,
    data: {
      userId: req.user.id,
      acceso: 'Autorizado',
      timestamp: new Date().toISOString(),
    },
  });
});

module.exports = router;
