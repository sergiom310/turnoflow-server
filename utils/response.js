/**
 * Helpers de respuesta HTTP estandarizados.
 *
 * Formato siempre:
 * {
 *   "success": true | false,
 *   "data":    {...} | null,
 *   "message": "texto opcional",
 *   "error":   "CODIGO_ERROR" | null
 * }
 */

const sendSuccess = (res, data = null, message = null, statusCode = 200) => {
  return res.status(statusCode).json({ success: true, data, message, error: null })
}

const sendError = (res, message = 'Error interno', statusCode = 400, error = null) => {
  return res.status(statusCode).json({ success: false, data: null, message, error })
}

const sendCreated = (res, data, message = 'Creado exitosamente') => {
  return sendSuccess(res, data, message, 201)
}

module.exports = { sendSuccess, sendError, sendCreated }
