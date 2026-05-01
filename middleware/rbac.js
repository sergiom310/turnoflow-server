const { sendError } = require('../utils/response')

/**
 * Middleware RBAC — Control de Acceso Basado en Roles.
 *
 * Uso en rutas:
 *   router.get('/clientes', auth, rbac('clients', 'read'), controller.list)
 *   router.post('/clientes', auth, rbac('clients', 'write'), controller.create)
 *   router.delete('/clientes/:id', auth, rbac('clients', 'delete'), controller.remove)
 *
 * @param {string} component - Nombre del componente ('clients', 'users', 'agenda'…)
 * @param {string} action    - Acción requerida: 'access' | 'read' | 'write' | 'delete'
 */
const rbac = (component, action = 'access') => {
  return (req, res, next) => {
    const user = req.user

    if (!user) {
      return sendError(res, 'Usuario no autenticado', 401, 'AUTH_REQUIRED')
    }

    // superadmin tiene acceso total sin verificación
    if (user.role === 'superadmin') {
      return next()
    }

    const permissions = user.permissions || {}
    const componentPerms = permissions.components?.[component]

    // Sin acceso al componente
    if (!componentPerms || !componentPerms.access) {
      return sendError(res, 'No tienes permiso para acceder a este módulo', 403, 'FORBIDDEN')
    }

    // Verificar acción específica (si no es solo 'access')
    if (action !== 'access' && !componentPerms[action]) {
      return sendError(res, `No tienes permiso para realizar esta acción`, 403, 'FORBIDDEN')
    }

    next()
  }
}

/**
 * Middleware para verificar que el usuario pertenece al mismo negocio
 * que el recurso que está accediendo.
 * Superadmin puede acceder a cualquier negocio.
 *
 * Espera que el negocio esté en req.params.businessId o req.body.business_id
 */
const sameBusinessOrSuperAdmin = (req, res, next) => {
  const user = req.user
  if (!user) return sendError(res, 'No autenticado', 401, 'AUTH_REQUIRED')
  if (user.role === 'superadmin') return next()

  const requestedBusinessId = parseInt(req.params.businessId || req.params.id || req.body.business_id)

  if (requestedBusinessId && user.business_id !== requestedBusinessId) {
    return sendError(res, 'Acceso denegado a este negocio', 403, 'FORBIDDEN')
  }

  next()
}

module.exports = { rbac, sameBusinessOrSuperAdmin }
