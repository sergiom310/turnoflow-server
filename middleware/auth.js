const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../config/config')
const { sendError } = require('../utils/response')

/**
 * Middleware de autenticación JWT.
 *
 * Estrategia (en orden de prioridad):
 *   1. Cookie httpOnly `tf_access_token`  — usada por tenants (login web)
 *   2. Header `Authorization: Bearer <token>` — usada por superadmin y clientes API
 *
 * Resultado: popula req.user con el payload del token.
 */
const authMiddleware = (req, res, next) => {
  // 1. Cookie httpOnly (tenants)
  const cookieToken = req.cookies?.tf_access_token

  // 2. Bearer header (superadmin / API)
  const authHeader = req.headers.authorization
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null

  const token = cookieToken || bearerToken

  if (!token) {
    return sendError(res, 'Token de autenticación requerido', 401, 'AUTH_REQUIRED')
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Sesión expirada. Inicie sesión nuevamente', 401, 'TOKEN_EXPIRED')
    }
    return sendError(res, 'Token inválido', 401, 'TOKEN_INVALID')
  }
}

module.exports = authMiddleware
