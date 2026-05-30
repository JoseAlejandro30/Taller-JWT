const jwt = require('jsonwebtoken');

/**
 * Middleware de autenticación JWT
 *
 * Flujo:
 * 1. Lee el header Authorization (formato: "Bearer <token>")
 *    o, como fallback, la cookie access_token.
 * 2. Verifica la firma y la expiración con JWT_SECRET.
 * 3. Adjunta { id, email } al objeto req.user para uso en los controladores.
 * 4. Llama a next() si todo es válido, o responde con 401 en caso de error.
 */
function auth(req, res, next) {
  // Leer token del header Authorization
  const authHeader = req.headers.authorization || '';
  const [scheme, tokenFromHeader] = authHeader.split(' ');

  // Fallback: leer token de cookie HTTP-only (opcional)
  const tokenFromCookie = req.cookies?.access_token;

  const token =
    scheme === 'Bearer' && tokenFromHeader ? tokenFromHeader : tokenFromCookie;

  if (!token) {
    return res.status(401).json({
      ok: false,
      message: 'Acceso denegado: token no proporcionado',
    });
  }

  try {
    // Verifica firma y expiración
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Solo adjuntamos datos mínimos al request
    req.user = { id: decoded.id, email: decoded.email };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        ok: false,
        message: 'Token expirado. Por favor inicia sesión nuevamente.',
      });
    }
    return res.status(401).json({
      ok: false,
      message: 'Token inválido.',
    });
  }
}

module.exports = auth;
