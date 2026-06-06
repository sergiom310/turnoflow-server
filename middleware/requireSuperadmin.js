'use strict'
const { sendError } = require('../utils/response')

/**
 * Verifica que el JWT pertenezca a un usuario del panel SuperAdmin (landlord).
 * Se usa en todas las rutas bajo /api/v1/superadmin/.
 * Debe colocarse después del middleware `auth`.
 */
module.exports = (req, res, next) => {
  if (!req.user || req.user.type !== 'landlord') {
    return sendError(res, 'Acceso restringido a superadministradores', 403, 'FORBIDDEN')
  }
  next()
}
