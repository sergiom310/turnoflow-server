const bcrypt = require('bcrypt')
const jwt    = require('jsonwebtoken')
const { User, Role, Business } = require('../models')
const {
  JWT_SECRET, JWT_EXPIRES_IN,
  JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRES_IN,
} = require('../config/config')
const { sendSuccess, sendError } = require('../utils/response')
const { createAuditLog }         = require('../utils/audit')
const logger                     = require('../utils/logger')

// ── Helpers ─────────────────────────────────────────────────

const generateTokens = (user) => {
  const payload = {
    id:          user.id,
    username:    user.username,
    email:       user.email,
    role:        user.role?.name,
    business_id: user.business_id,
    permissions: user.role?.permissions || {},
  }
  const accessToken  = jwt.sign(payload, JWT_SECRET,         { expiresIn: JWT_EXPIRES_IN })
  const refreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN })
  return { accessToken, refreshToken }
}

const safeUser = (user) => ({
  id:          user.id,
  username:    user.username,
  first_name:  user.first_name,
  last_name:   user.last_name,
  email:       user.email,
  photo_url:   user.photo_url,
  role:        user.role?.name,
  permissions: user.role?.permissions,
  business_id: user.business_id,
  business:    user.business
    ? { id: user.business.id, name: user.business.name, logo_url: user.business.logo_url }
    : null,
})

// ── Controllers ─────────────────────────────────────────────

/**
 * POST /api/v1/auth/login
 * Body: { username, password }
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body

    const user = await User.findOne({
      where: { username, is_active: true },
      include: [
        { model: Role,     as: 'role' },
        { model: Business, as: 'business', required: false },
      ],
    })

    if (!user) {
      return sendError(res, 'Usuario o contraseña incorrectos', 401, 'INVALID_CREDENTIALS')
    }

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return sendError(res, 'Usuario o contraseña incorrectos', 401, 'INVALID_CREDENTIALS')
    }

    const { accessToken, refreshToken } = generateTokens(user)

    await createAuditLog({
      business_id: user.business_id,
      user_id:     user.id,
      action:      'login',
      entity_type: 'user',
      entity_id:   user.id,
      ip_address:  req.ip,
      user_agent:  req.headers['user-agent'],
    })

    return sendSuccess(res, { accessToken, refreshToken, user: safeUser(user) }, 'Login exitoso')
  } catch (error) {
    logger.error('Error en login:', error)
    return sendError(res, 'Error interno del servidor', 500, 'SERVER_ERROR')
  }
}

/**
 * POST /api/v1/auth/refresh
 * Body: { refreshToken }
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body
    if (!token) return sendError(res, 'Refresh token requerido', 400, 'TOKEN_REQUIRED')

    let decoded
    try {
      decoded = jwt.verify(token, JWT_REFRESH_SECRET)
    } catch {
      return sendError(res, 'Refresh token inválido o expirado', 401, 'TOKEN_INVALID')
    }

    const user = await User.findOne({
      where: { id: decoded.id, is_active: true },
      include: [
        { model: Role,     as: 'role' },
        { model: Business, as: 'business', required: false },
      ],
    })

    if (!user) return sendError(res, 'Usuario no encontrado', 401, 'USER_NOT_FOUND')

    const tokens = generateTokens(user)
    return sendSuccess(res, tokens, 'Token renovado')
  } catch (error) {
    logger.error('Error en refresh token:', error)
    return sendError(res, 'Error interno del servidor', 500, 'SERVER_ERROR')
  }
}

/**
 * GET /api/v1/auth/me
 * Requiere JWT válido (middleware auth)
 */
const me = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { id: req.user.id, is_active: true },
      include: [
        { model: Role,     as: 'role' },
        { model: Business, as: 'business', required: false },
      ],
    })
    if (!user) return sendError(res, 'Usuario no encontrado', 404, 'USER_NOT_FOUND')

    return sendSuccess(res, safeUser(user))
  } catch (error) {
    logger.error('Error en /me:', error)
    return sendError(res, 'Error interno del servidor', 500, 'SERVER_ERROR')
  }
}

module.exports = { login, refreshToken, me }
