'use strict'
const path  = require('path')
const fs    = require('fs')
const sharp = require('sharp')
const { Tenant, BusinessType, TenantPayment, SubscriptionPlan } = require('../../models/landlord')
const { sendSuccess, sendError } = require('../../utils/response')
const { UPLOAD_DIR } = require('../../config/config')
const logger = require('../../utils/logger')

// ── GET /api/v1/settings ─────────────────────────────────────
// Devuelve la configuración completa del tenant: datos del negocio + suscripción
const getSettings = async (req, res) => {
  try {
    const tenant = await Tenant.findByPk(req.tenant.id, {
      include: [
        { model: BusinessType, as: 'businessType', attributes: ['id', 'name', 'slug', 'icon', 'default_colors'] },
      ],
      attributes: { exclude: ['db_name', 'notes'] },
    })

    // Pagos / suscripción del tenant
    const payments = await TenantPayment.findAll({
      where: { tenant_id: req.tenant.id },
      order: [['created_at', 'DESC']],
      limit: 10,
    })

    // Datos del plan contratado
    const plan = await SubscriptionPlan.findOne({ where: { name: req.tenant.plan } })

    return sendSuccess(res, { tenant, plan, payments })
  } catch (error) {
    logger.error('Error en getSettings:', error)
    return sendError(res, 'Error al obtener configuración', 500, 'SERVER_ERROR')
  }
}

// ── PATCH /api/v1/settings ───────────────────────────────────
// Actualiza datos básicos del negocio (name, phone, email)
const updateSettings = async (req, res) => {
  try {
    const { name, phone, email, theme_colors } = req.body

    const tenant = await Tenant.findByPk(req.tenant.id)
    if (!tenant) return sendError(res, 'Tenant no encontrado', 404, 'NOT_FOUND')

    // Validar theme_colors si se envían
    if (theme_colors !== undefined) {
      if (theme_colors !== null && typeof theme_colors !== 'object') {
        return sendError(res, 'theme_colors debe ser un objeto o null', 400, 'INVALID_THEME')
      }
    }

    // Subdomain, db_name y plan son inmutables desde aquí
    await tenant.update({
      ...(name  && { name }),
      ...(phone !== undefined && { phone }),
      ...(email !== undefined && { email }),
      ...(theme_colors !== undefined && { theme_colors }),
    })

    return sendSuccess(res, {
      id:           tenant.id,
      name:         tenant.name,
      phone:        tenant.phone,
      email:        tenant.email,
      logo_url:     tenant.logo_url,
      theme_colors: tenant.theme_colors,
    }, 'Datos del negocio actualizados')
  } catch (error) {
    logger.error('Error en updateSettings:', error)
    return sendError(res, 'Error al actualizar configuración', 500, 'SERVER_ERROR')
  }
}

// ── POST /api/v1/settings/logo ───────────────────────────────
// Sube y reemplaza el logo del tenant (convierte a WebP 512x512)
const uploadLogo = async (req, res) => {
  try {
    if (!req.file) return sendError(res, 'No se recibió ningún archivo', 400, 'NO_FILE')

    const dir = path.resolve(UPLOAD_DIR, 'logo')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

    const filename   = `${req.tenant.subdomain}_${Date.now()}.webp`
    const outputPath = path.join(dir, filename)

    await sharp(req.file.buffer)
      .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(outputPath)

    const logoUrl = `/uploads/logo/${filename}`

    // Borrar logo anterior si existe
    const tenant = await Tenant.findByPk(req.tenant.id)
    if (tenant.logo_url) {
      const oldPath = path.resolve(UPLOAD_DIR, '..', tenant.logo_url.replace(/^\//, ''))
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath)
    }

    await tenant.update({ logo_url: logoUrl })

    return sendSuccess(res, { logo_url: logoUrl }, 'Logo actualizado')
  } catch (error) {
    logger.error('Error en uploadLogo:', error)
    return sendError(res, 'Error al subir el logo', 500, 'SERVER_ERROR')
  }
}

module.exports = { getSettings, updateSettings, uploadLogo }
