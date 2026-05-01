const logger = require('../utils/logger')

/**
 * Middleware centralizado de manejo de errores.
 * Captura cualquier error no manejado y responde con formato estándar.
 */
const errorHandler = (err, req, res, next) => {
  // Errores de Multer (upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false, data: null,
      message: 'El archivo supera el tamaño máximo permitido (3MB)',
      error: 'FILE_TOO_LARGE',
    })
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(413).json({
      success: false, data: null,
      message: 'Se excedió el número máximo de archivos (5)',
      error: 'TOO_MANY_FILES',
    })
  }

  if (err.message === 'Tipo de archivo no permitido. Use imágenes, PDF, DOC o TXT') {
    return res.status(400).json({
      success: false, data: null,
      message: err.message,
      error: 'INVALID_FILE_TYPE',
    })
  }

  // Errores de Sequelize
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors?.[0]?.path || 'campo'
    return res.status(409).json({
      success: false, data: null,
      message: `El valor para '${field}' ya existe`,
      error: 'DUPLICATE_ENTRY',
    })
  }

  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map((e) => e.message).join('; ')
    return res.status(422).json({
      success: false, data: null,
      message: messages,
      error: 'VALIDATION_ERROR',
    })
  }

  // Error genérico
  logger.error(`[${req.method}] ${req.path} →`, err)

  return res.status(500).json({
    success: false, data: null,
    message: 'Error interno del servidor',
    error: 'SERVER_ERROR',
  })
}

module.exports = errorHandler
