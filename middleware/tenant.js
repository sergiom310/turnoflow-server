'use strict'
const { Tenant, BusinessType } = require('../models/landlord')
const { getTenantConnection }  = require('../config/tenantDb')
const { sendError }            = require('../utils/response')
const logger                   = require('../utils/logger')

/**
 * Middleware de resolución de tenant.
 *
 * Estrategia de identificación (en orden):
 *   1. Header `X-Tenant-Subdomain` — para desarrollo local / clientes API
 *   2. Subdominio del Host header  — para producción (barberia-juan.turnoflow.co)
 *
 * Resultado: popula req.tenant (registro landlord) y req.models (modelos del tenant).
 */
module.exports = async (req, res, next) => {
  try {
    // 1. Header explícito (dev / Postman / clientes SPA en localhost)
    let subdomain = req.headers['x-tenant-subdomain']

    // 2. Subdominio del host (producción)
    if (!subdomain) {
      const host  = req.hostname // e.g. 'barberia-juan.turnoflow.co'
      const parts = host.split('.')
      // Necesita mínimo 3 partes: subdomain.domain.tld
      if (parts.length >= 3) subdomain = parts[0]
    }

    if (!subdomain) {
      return sendError(res, 'No se pudo identificar el negocio (subdomain faltante)', 400, 'TENANT_MISSING')
    }

    const tenant = await Tenant.findOne({
      where:   { subdomain, is_active: true },
      include: [{ model: BusinessType, as: 'businessType', attributes: ['id', 'name', 'slug', 'icon', 'default_colors'] }],
    })
    if (!tenant) {
      return sendError(res, 'Negocio no encontrado o inactivo', 404, 'TENANT_NOT_FOUND')
    }

    // Obtener (o crear) la conexión cacheada al BD del tenant
    const { models } = await getTenantConnection(tenant.db_name)

    req.tenant = tenant      // info del tenant (id, name, subdomain, plan…)
    req.models = models      // acceso a todos los modelos del tenant
    next()
  } catch (error) {
    logger.error('Error en tenant middleware:', error)
    return sendError(res, 'Error al resolver el tenant', 500, 'TENANT_ERROR')
  }
}
