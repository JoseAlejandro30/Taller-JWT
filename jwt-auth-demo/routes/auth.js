const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const router = express.Router();

// ─────────────────────────────────────────────────────────────
// POST /api/auth/register
// Registra un nuevo usuario con contraseña hasheada
// ─────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validación básica de campos
    if (!username || !email || !password) {
      return res.status(400).json({
        ok: false,
        message: 'Todos los campos son obligatorios (username, email, password)',
      });
    }

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        ok: false,
        message: 'Ya existe una cuenta con ese email',
      });
    }

    // Verificar si el username ya existe
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({
        ok: false,
        message: 'Ese nombre de usuario ya está en uso',
      });
    }

    // Hashear la contraseña antes de guardar
    // El factor de coste 10 es un buen equilibrio entre seguridad y rendimiento
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({
      ok: true,
      message: 'Usuario registrado exitosamente',
      user: newUser, // toJSON() ya elimina el password
    });
  } catch (err) {
    // Errores de validación de Mongoose
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ ok: false, message: messages.join(', ') });
    }
    console.error('Error en /register:', err.message);
    res.status(500).json({ ok: false, message: 'Error interno del servidor' });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/auth/login
// Autentica al usuario y emite un JWT de acceso (15 min)
// ─────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        message: 'Email y contraseña son obligatorios',
      });
    }

    // Buscar el usuario por email
    const user = await User.findOne({ email });
    if (!user) {
      // Mensaje genérico para no revelar qué campo falló (seguridad)
      return res.status(400).json({ ok: false, message: 'Credenciales inválidas' });
    }

    // Comparar la contraseña ingresada con el hash almacenado
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ ok: false, message: 'Credenciales inválidas' });
    }

    // Crear el payload del JWT (mínima información necesaria)
    const payload = { id: user._id, email: user.email };

    // Firmar el token con expiración de 15 minutos
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });

    // Opcionalmente: guardar en cookie HTTP-only (más seguro que localStorage)
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('access_token', token, {
      httpOnly: true,       // No accesible desde JavaScript del navegador
      secure: isProd,       // Solo HTTPS en producción
      sameSite: 'strict',   // Protección contra CSRF
      maxAge: 15 * 60 * 1000, // 15 minutos en ms
    });

    res.json({
      ok: true,
      message: 'Inicio de sesión exitoso',
      token, // También enviamos el token en el body para uso con Authorization header
      expiresIn: '15 minutos',
    });
  } catch (err) {
    console.error('Error en /login:', err.message);
    res.status(500).json({ ok: false, message: 'Error interno del servidor' });
  }
});

module.exports = router;
