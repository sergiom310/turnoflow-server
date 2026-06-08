'use strict'
const bcrypt = require('bcrypt')
const jwt    = require('jsonwebtoken')
const { Op } = require('sequelize')
const { SuperadminUser }   = require('../../models/landlord')
const { JWT_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRES_IN } = require('../../config/config')
const { sendSuccess, sendError } = require('../../utils/response')
const logger = require('../../utils/logger')

const generateTokens = (user) => {
  const payload = { id: user.id, username: user.username, email: user.email, role: 'superadmin', type: 'landlord' }
  return {
    accessToken:  jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN }),
    refreshToken: jwt.sign({ id: user.id, type: 'landlord' }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN }),
  }
}

const login = async (req, res) => {
  try {
    const { username, password } = req.body
    const user = await SuperadminUser.findOne({
      where: {
        [Op.or]: [{ username }, { email: username }],
        is_active: true,
      },
    })
    if (!user) return sendError(res, 'Credenciales incorrectas', 401, 'INVALID_CREDENTIALS')

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return sendError(res, 'Credenciales incorrectas', 401, 'INVALID_CREDENTIALS')

    const tokens = generateTokens(user)
    return sendSuccess(res, {
      ...tokens,
      user: { id: user.id, username: user.username, email: user.email,
              first_name: user.first_name, last_name: user.last_name,
              role: 'superadmin', type: 'landlord' },
    }, 'Login exitoso')
  } catch (error) {
    logger.error('Error en superadmin login:', error)
    return sendError(res, 'Error interno del servidor', 500, 'SERVER_ERROR')
  }
}

const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body
    if (!token) return sendError(res, 'Refresh token requerido', 400, 'TOKEN_REQUIRED')
    let decoded
    try { decoded = jwt.verify(token, JWT_REFRESH_SECRET) }
    catch { return sendError(res, 'Token inválido o expirado', 401, 'TOKEN_INVALID') }
    if (decoded.type !== 'landlord') return sendError(res, 'Token inválido', 401, 'TOKEN_INVALID')

    const user = await SuperadminUser.findOne({ where: { id: decoded.id, is_active: true } })
    if (!user) return sendError(res, 'Usuario no encontrado', 401, 'USER_NOT_FOUND')
    return sendSuccess(res, generateTokens(user), 'Token renovado')
  } catch (error) {
    logger.error('Error en superadmin refresh:', error)
    return sendError(res, 'Error interno del servidor', 500, 'SERVER_ERROR')
  }
}

const me = async (req, res) => {
  try {
    const user = await SuperadminUser.findOne({ where: { id: req.user.id, is_active: true } })
    if (!user) return sendError(res, 'Usuario no encontrado', 404, 'USER_NOT_FOUND')
    return sendSuccess(res, { id: user.id, username: user.username, email: user.email,
                               first_name: user.first_name, last_name: user.last_name,
                               role: 'superadmin', type: 'landlord' })
  } catch (error) {
    logger.error('Error en superadmin /me:', error)
    return sendError(res, 'Error interno del servidor', 500, 'SERVER_ERROR')
  }
}

module.exports = { login, refreshToken, me }
