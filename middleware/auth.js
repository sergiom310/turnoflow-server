const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../config/config')
const { sendError } = require('../utils/response')

/**
 * Middleware de autenticación JWT.
 * Extrae el token del header Authorization: Bearer <token>
 * Agrega req.user con el payload decodificado.
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Token de autenticación requerido', 401, 'AUTH_REQUIRED')
  }

  const token = authHeader.substring(7)

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Sesión expirada. Inicie sesión nuevamente', 401, 'TOKEN_EXPIRED')
    }
    return sendError(res, 'Token inválido', 401, 'TOKEN_INVALID')
  }
}

module.exports = authMiddleware
