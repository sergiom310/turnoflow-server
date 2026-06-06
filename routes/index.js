'use strict'
const router           = require('express').Router()
const tenantMiddleware = require('../middleware/tenant')
const { BusinessType } = require('../models/landlord')
const { sendSuccess, sendError } = require('../utils/response')

// ── Rutas públicas (sin auth, sin tenant) ─────────────────────
router.get('/business-types', async (req, res) => {
  try {
    const types = await BusinessType.findAll({
      where:      { is_active: true },
      attributes: ['id', 'name', 'slug', 'description', 'icon', 'default_colors'],
      order:      [['name', 'ASC']],
    })
    return sendSuccess(res, types)
  } catch (error) {
    return sendError(res, 'Error al obtener tipos de negocio', 500, 'SERVER_ERROR')
  }
})

// ── Rutas SuperAdmin (sin tenant middleware — usan landlord DB) ──
router.use('/superadmin', require('./superadmin'))

// ── Rutas Tenant (todas pasan por tenant middleware) ─────────────
router.use(tenantMiddleware)
router.use('/auth',     require('./tenant/auth'))
router.use('/settings', require('./tenant/settings'))

// ── Ruta pública del tenant (requiere tenant middleware, sin auth) ──
// Devuelve datos de branding del tenant para el login y páginas públicas
router.get('/theme', (req, res) => {
  const t  = req.tenant
  const bt = t.businessType
  return sendSuccess(res, {
    name:         t.name,
    logo_url:     t.logo_url  || null,
    theme_colors: t.theme_colors || null,
    default_colors: bt?.default_colors || null,
  })
})

module.exports = router
