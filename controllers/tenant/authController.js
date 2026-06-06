'use strict'
const bcrypt = require('bcrypt')
const jwt    = require('jsonwebtoken')
const { JWT_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRES_IN, NODE_ENV } = require('../../config/config')
const { sendSuccess, sendError } = require('../../utils/response')
const logger = require('../../utils/logger')

// ── Helpers ──────────────────────────────────────────────────

const COOKIE_ACCESS  = 'tf_access_token'
const COOKIE_REFRESH = 'tf_refresh_token'

const cookieOptions = (maxAgeMs) => ({
  httpOnly: true,                         // JS del front NO puede leerla
  secure:   NODE_ENV === 'production',    // solo HTTPS en producción
  sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge:   maxAgeMs,
  path:     '/',
})

const parseDuration = (str) => {
  const n = parseInt(str)
  if (str.endsWith('d')) return n * 24 * 60 * 60 * 1000
  if (str.endsWith('h')) return n * 60 * 60 * 1000
  return n * 1000
}

const generateTokens = (user, tenantId) => {
  const payload = {
    id:          user.id,
    username:    user.username,
    email:       user.email,
    role:        user.role?.name,
    tenant_id:   tenantId,
    type:        'tenant',
    permissions: user.role?.permissions || {},
  }
  return {
    accessToken:  jwt.sign(payload, JWT_SECRET,         { expiresIn: JWT_EXPIRES_IN }),
    refreshToken: jwt.sign({ id: user.id, tenant_id: tenantId, type: 'tenant' },
                           JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN }),
  }
}

/** Datos seguros del usuario + tenant para guardar en localStorage */
const buildSession = (user, tenant) => ({
  user: {
    id:          user.id,
    username:    user.username,
    first_name:  user.first_name,
    last_name:   user.last_name,
    email:       user.email,
    photo_url:   user.photo_url,
    role:        user.role?.name,
  },
  permissions: user.role?.permissions || {},   // → localStorage para RBAC en el front
  tenant: {                                    // → localStorage para config del negocio
    id:               tenant.id,
    name:             tenant.name,
    subdomain:        tenant.subdomain,
    plan:             tenant.plan,
    logo_url:         tenant.logo_url         || null,
    business_type:    tenant.businessType?.slug   || null,
    business_subtype: tenant.business_subtype     || null,
    theme_colors:     tenant.theme_colors         || null,
    default_colors:   tenant.businessType?.default_colors || null,
  },
})

// ── Controllers ──────────────────────────────────────────────

/** POST /api/v1/auth/login — requiere tenant middleware antes */
const login = async (req, res) => {
  try {
    const { username, password } = req.body
    const { models, tenant }     = req

    // Aceptar username o email indistintamente
    const { Op } = require('sequelize')
    const user = await models.User.findOne({
      where:   { [Op.or]: [{ username }, { email: username }], is_active: true },
      include: [{ model: models.Role, as: 'role' }],
    })
    if (!user) return sendError(res, 'Usuario o contraseña incorrectos', 401, 'INVALID_CREDENTIALS')

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return sendError(res, 'Usuario o contraseña incorrectos', 401, 'INVALID_CREDENTIALS')

    const { accessToken, refreshToken } = generateTokens(user, tenant.id)

    // ── Cookies httpOnly (el token nunca queda expuesto en JS) ──
    res.cookie(COOKIE_ACCESS,  accessToken,  cookieOptions(parseDuration(JWT_EXPIRES_IN)))
    res.cookie(COOKIE_REFRESH, refreshToken, cookieOptions(parseDuration(JWT_REFRESH_EXPIRES_IN)))

    // ── Body: solo datos de sesión (sin tokens) ──
    return sendSuccess(res, buildSession(user, tenant), 'Login exitoso')
  } catch (error) {
    logger.error('Error en tenant login:', error)
    return sendError(res, 'Error interno del servidor', 500, 'SERVER_ERROR')
  }
}

/** POST /api/v1/auth/refresh — renueva cookie desde la refresh cookie */
const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.[COOKIE_REFRESH]
    if (!token) return sendError(res, 'Refresh token requerido', 400, 'TOKEN_REQUIRED')

    let decoded
    try { decoded = jwt.verify(token, JWT_REFRESH_SECRET) }
    catch { return sendError(res, 'Token inválido o expirado', 401, 'TOKEN_INVALID') }
    if (decoded.type !== 'tenant') return sendError(res, 'Token inválido', 401, 'TOKEN_INVALID')

    const { models, tenant } = req
    const user = await models.User.findOne({
      where:   { id: decoded.id, is_active: true },
      include: [{ model: models.Role, as: 'role' }],
    })
    if (!user) return sendError(res, 'Usuario no encontrado', 401, 'USER_NOT_FOUND')

    const { accessToken, refreshToken: newRefresh } = generateTokens(user, tenant.id)
    res.cookie(COOKIE_ACCESS,  accessToken, cookieOptions(parseDuration(JWT_EXPIRES_IN)))
    res.cookie(COOKIE_REFRESH, newRefresh,  cookieOptions(parseDuration(JWT_REFRESH_EXPIRES_IN)))

    return sendSuccess(res, buildSession(user, tenant), 'Token renovado')
  } catch (error) {
    logger.error('Error en tenant refresh:', error)
    return sendError(res, 'Error interno del servidor', 500, 'SERVER_ERROR')
  }
}

/** POST /api/v1/auth/logout — borra las cookies */
const logout = async (req, res) => {
  res.clearCookie(COOKIE_ACCESS,  { path: '/' })
  res.clearCookie(COOKIE_REFRESH, { path: '/' })
  return sendSuccess(res, null, 'Sesión cerrada')
}

/** GET /api/v1/auth/me — requiere auth + tenant middleware */
const me = async (req, res) => {
  try {
    const { models, tenant } = req
    const user = await models.User.findOne({
      where:   { id: req.user.id, is_active: true },
      include: [{ model: models.Role, as: 'role' }],
    })
    if (!user) return sendError(res, 'Usuario no encontrado', 404, 'USER_NOT_FOUND')
    return sendSuccess(res, buildSession(user, tenant))
  } catch (error) {
    logger.error('Error en tenant /me:', error)
    return sendError(res, 'Error interno del servidor', 500, 'SERVER_ERROR')
  }
}

module.exports = { login, refreshToken, logout, me }

