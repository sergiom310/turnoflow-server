const router       = require('express').Router()
const { BusinessType } = require('../models')
const { sendSuccess, sendError } = require('../utils/response')
const auth         = require('../middleware/auth')

const authRoutes      = require('./auth')
const businessRoutes  = require('./businesses')

// ── Rutas públicas ──────────────────────────────────────────

/**
 * GET /api/v1/business-types
 * Listado de tipos de negocio para TipoNegocioTab.
 * Público — no requiere autenticación.
 */
router.get('/business-types', async (req, res) => {
  try {
    const types = await BusinessType.findAll({
      where: { is_active: true },
      attributes: ['id', 'name', 'slug', 'description', 'icon', 'default_colors'],
      order: [['name', 'ASC']],
    })
    return sendSuccess(res, types)
  } catch (error) {
    return sendError(res, 'Error al obtener tipos de negocio', 500, 'SERVER_ERROR')
  }
})

// ── Rutas protegidas ────────────────────────────────────────
router.use('/auth',       authRoutes)
router.use('/businesses', businessRoutes)

module.exports = router
