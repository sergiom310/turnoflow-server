const { Business, BusinessType, Subscription, User } = require('../models')
const { processLogo }    = require('../middleware/upload')
const { sendSuccess, sendError, sendCreated } = require('../utils/response')
const { createAuditLog } = require('../utils/audit')
const logger             = require('../utils/logger')

// ── Helpers ─────────────────────────────────────────────────

/** Añade la fecha de fin según el plan seleccionado */
const calcEndDate = (plan, startDate = new Date()) => {
  const d = new Date(startDate)
  const months = { free: 0, basic: 1, professional: 6, enterprise: 12 }
  if (plan === 'free') return null
  d.setMonth(d.getMonth() + (months[plan] || 1))
  return d.toISOString().split('T')[0]
}

const PLAN_LIMITS = {
  free:         { max_users: 3,   max_appointments_month: 50,   price_cop: 0 },
  basic:        { max_users: 10,  max_appointments_month: 300,  price_cop: 49900 },
  professional: { max_users: 30,  max_appointments_month: 1000, price_cop: 119900 },
  enterprise:   { max_users: 999, max_appointments_month: 99999,price_cop: 299900 },
}

// ── Controllers ─────────────────────────────────────────────

/**
 * GET /api/v1/businesses
 * Solo superadmin puede listar todos los negocios.
 */
const getAll = async (req, res) => {
  try {
    const businesses = await Business.findAll({
      include: [
        { model: BusinessType,  as: 'businessType', attributes: ['id', 'name', 'slug', 'icon'] },
        { model: Subscription,  as: 'subscription', attributes: ['plan', 'status', 'end_date'] },
      ],
      order: [['created_at', 'DESC']],
    })
    return sendSuccess(res, businesses)
  } catch (error) {
    logger.error('Error en getAll businesses:', error)
    return sendError(res, 'Error al obtener negocios', 500, 'SERVER_ERROR')
  }
}

/**
 * GET /api/v1/businesses/:id
 */
const getOne = async (req, res) => {
  try {
    const business = await Business.findByPk(req.params.id, {
      include: [
        { model: BusinessType, as: 'businessType' },
        { model: Subscription, as: 'subscription' },
      ],
    })
    if (!business) return sendError(res, 'Empresa no encontrada', 404, 'NOT_FOUND')
    return sendSuccess(res, business)
  } catch (error) {
    logger.error('Error en getOne business:', error)
    return sendError(res, 'Error al obtener el negocio', 500, 'SERVER_ERROR')
  }
}

/**
 * POST /api/v1/businesses
 * Crea empresa + suscripción inicial.
 * Body: { name, nit, …, business_type_id, business_subtype, plan }
 */
const create = async (req, res) => {
  try {
    const { plan = 'free', ...businessData } = req.body

    const business = await Business.create(businessData)

    // Suscripción automática
    const today    = new Date().toISOString().split('T')[0]
    const limits   = PLAN_LIMITS[plan] || PLAN_LIMITS.free
    await Subscription.create({
      business_id:            business.id,
      plan,
      status:                 'active',
      start_date:             today,
      end_date:               calcEndDate(plan),
      price_cop:              limits.price_cop,
      max_users:              limits.max_users,
      max_appointments_month: limits.max_appointments_month,
    })

    await createAuditLog({
      business_id: business.id,
      user_id:     req.user?.id,
      action:      'create_business',
      entity_type: 'business',
      entity_id:   business.id,
      new_values:  businessData,
      ip_address:  req.ip,
    })

    const result = await Business.findByPk(business.id, {
      include: [
        { model: BusinessType, as: 'businessType' },
        { model: Subscription, as: 'subscription' },
      ],
    })

    return sendCreated(res, result, 'Empresa creada exitosamente')
  } catch (error) {
    logger.error('Error en create business:', error)
    return sendError(res, 'Error al crear la empresa', 500, 'SERVER_ERROR')
  }
}

/**
 * PUT /api/v1/businesses/:id
 * Actualiza datos de la empresa.
 */
const update = async (req, res) => {
  try {
    const business = await Business.findByPk(req.params.id)
    if (!business) return sendError(res, 'Empresa no encontrada', 404, 'NOT_FOUND')

    const oldValues = business.toJSON()
    await business.update(req.body)

    await createAuditLog({
      business_id: business.id,
      user_id:     req.user?.id,
      action:      'update_business',
      entity_type: 'business',
      entity_id:   business.id,
      old_values:  oldValues,
      new_values:  req.body,
      ip_address:  req.ip,
    })

    return sendSuccess(res, business, 'Empresa actualizada exitosamente')
  } catch (error) {
    logger.error('Error en update business:', error)
    return sendError(res, 'Error al actualizar la empresa', 500, 'SERVER_ERROR')
  }
}

/**
 * POST /api/v1/businesses/:id/logo
 * Sube y procesa el logo con Sharp → WEBP 400x400.
 * Requiere multipart/form-data con campo 'logo'.
 */
const uploadLogo = async (req, res) => {
  try {
    if (!req.file) return sendError(res, 'No se proporcionó ningún archivo', 400, 'NO_FILE')

    const business = await Business.findByPk(req.params.id)
    if (!business) return sendError(res, 'Empresa no encontrada', 404, 'NOT_FOUND')

    const logoPath = await processLogo(req.file.buffer, req.file.originalname)
    await business.update({ logo_url: logoPath })

    await createAuditLog({
      business_id: business.id,
      user_id:     req.user?.id,
      action:      'upload_logo',
      entity_type: 'business',
      entity_id:   business.id,
      new_values:  { logo_url: logoPath },
      ip_address:  req.ip,
    })

    return sendSuccess(res, { logo_url: logoPath }, 'Logo actualizado exitosamente')
  } catch (error) {
    logger.error('Error en uploadLogo:', error)
    return sendError(res, 'Error al subir el logo', 500, 'SERVER_ERROR')
  }
}

/**
 * PUT /api/v1/businesses/:id/subscription
 * Actualiza plan de suscripción.
 * Body: { plan, notes? }
 */
const updateSubscription = async (req, res) => {
  try {
    const { plan, notes } = req.body
    if (!plan) return sendError(res, 'El plan es requerido', 400, 'MISSING_PLAN')

    const business = await Business.findByPk(req.params.id, {
      include: [{ model: Subscription, as: 'subscription' }],
    })
    if (!business) return sendError(res, 'Empresa no encontrada', 404, 'NOT_FOUND')

    const today  = new Date().toISOString().split('T')[0]
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free

    if (business.subscription) {
      await business.subscription.update({
        plan,
        status:                 'active',
        start_date:             today,
        end_date:               calcEndDate(plan),
        price_cop:              limits.price_cop,
        max_users:              limits.max_users,
        max_appointments_month: limits.max_appointments_month,
        notes:                  notes || null,
      })
    } else {
      await Subscription.create({
        business_id:            business.id,
        plan,
        status:                 'active',
        start_date:             today,
        end_date:               calcEndDate(plan),
        price_cop:              limits.price_cop,
        max_users:              limits.max_users,
        max_appointments_month: limits.max_appointments_month,
        notes:                  notes || null,
      })
    }

    await createAuditLog({
      business_id: business.id,
      user_id:     req.user?.id,
      action:      'update_subscription',
      entity_type: 'subscription',
      entity_id:   business.id,
      new_values:  { plan },
      ip_address:  req.ip,
    })

    const updated = await Business.findByPk(business.id, {
      include: [{ model: Subscription, as: 'subscription' }],
    })
    return sendSuccess(res, updated.subscription, 'Suscripción actualizada')
  } catch (error) {
    logger.error('Error en updateSubscription:', error)
    return sendError(res, 'Error al actualizar la suscripción', 500, 'SERVER_ERROR')
  }
}

/**
 * GET /api/v1/businesses/:id/config
 * Retorna configuración de tipo + subtipo del negocio.
 */
const getConfig = async (req, res) => {
  try {
    const business = await Business.findByPk(req.params.id, {
      include: [{ model: BusinessType, as: 'businessType' }],
      attributes: ['id', 'name', 'business_type_id', 'business_subtype'],
    })
    if (!business) return sendError(res, 'Empresa no encontrada', 404, 'NOT_FOUND')

    return sendSuccess(res, {
      business_type:    business.businessType?.slug,
      business_subtype: business.business_subtype,
      business_type_id: business.business_type_id,
    })
  } catch (error) {
    logger.error('Error en getConfig:', error)
    return sendError(res, 'Error al obtener la configuración', 500, 'SERVER_ERROR')
  }
}

module.exports = { getAll, getOne, create, update, uploadLogo, updateSubscription, getConfig }
