'use strict'
const router    = require('express').Router()
const auth      = require('../../middleware/auth')
const requireSA = require('../../middleware/requireSuperadmin')
const Joi       = require('joi')
const { validate } = require('../../middleware/validate')
const { SubscriptionPlan, PaymentMethod, BusinessType } = require('../../models/landlord')
const { sendSuccess, sendError, sendCreated } = require('../../utils/response')
const logger    = require('../../utils/logger')

router.use('/auth',    require('./auth'))
router.use('/tenants', require('./tenants'))

// ── Validación ────────────────────────────────────────────────
const planSchema = Joi.object({
  icon:                   Joi.string().max(10).optional().allow('', null),
  name:                   Joi.string().max(50).required(),
  display_name:           Joi.string().max(100).required(),
  description:            Joi.string().max(255).optional().allow('', null),
  price_cop:              Joi.number().min(0).required(),
  max_users:              Joi.number().integer().min(1).required(),
  max_appointments_month: Joi.number().integer().min(1).required(),
  features:               Joi.array().items(Joi.string()).optional().allow(null),
  is_active:              Joi.boolean().optional(),
})

const planUpdateSchema = planSchema.fork(['name','display_name','price_cop','max_users','max_appointments_month'], f => f.optional())

// GET /superadmin/plans
router.get('/plans', auth, requireSA, async (req, res) => {
  try {
    const plans = await SubscriptionPlan.findAll({ order: [['price_cop', 'ASC']] })
    return sendSuccess(res, plans)
  } catch (err) {
    logger.error('Error getPlans:', err)
    return sendError(res, 'Error al obtener planes', 500, 'SERVER_ERROR')
  }
})

// POST /superadmin/plans
router.post('/plans', auth, requireSA, validate(planSchema), async (req, res) => {
  try {
    const existing = await SubscriptionPlan.findOne({ where: { name: req.body.name } })
    if (existing) return sendError(res, `Ya existe un plan con el nombre "${req.body.name}"`, 409, 'PLAN_EXISTS')
    const plan = await SubscriptionPlan.create(req.body)
    return sendCreated(res, plan, 'Plan creado')
  } catch (err) {
    logger.error('Error createPlan:', err)
    return sendError(res, 'Error al crear el plan', 500, 'SERVER_ERROR')
  }
})

// PUT /superadmin/plans/:id
router.put('/plans/:id', auth, requireSA, validate(planUpdateSchema), async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findByPk(req.params.id)
    if (!plan) return sendError(res, 'Plan no encontrado', 404, 'NOT_FOUND')
    await plan.update(req.body)
    return sendSuccess(res, plan, 'Plan actualizado')
  } catch (err) {
    logger.error('Error updatePlan:', err)
    return sendError(res, 'Error al actualizar el plan', 500, 'SERVER_ERROR')
  }
})

// DELETE /superadmin/plans/:id
router.delete('/plans/:id', auth, requireSA, async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findByPk(req.params.id)
    if (!plan) return sendError(res, 'Plan no encontrado', 404, 'NOT_FOUND')
    await plan.destroy()
    return sendSuccess(res, null, 'Plan eliminado')
  } catch (err) {
    logger.error('Error deletePlan:', err)
    return sendError(res, 'Error al eliminar el plan', 500, 'SERVER_ERROR')
  }
})

// ── CRUD Métodos de pago ──────────────────────────────────────
const pmSchema = Joi.object({
  name:         Joi.string().max(50).required(),
  display_name: Joi.string().max(100).required(),
  icon:         Joi.string().max(10).optional().allow('', null),
  description:  Joi.string().max(255).optional().allow('', null),
  is_active:    Joi.boolean().optional(),
})
const pmUpdateSchema = pmSchema.fork(['name', 'display_name'], f => f.optional())

// GET /superadmin/payment-methods
router.get('/payment-methods', auth, requireSA, async (req, res) => {
  try {
    const methods = await PaymentMethod.findAll({ order: [['display_name', 'ASC']] })
    return sendSuccess(res, methods)
  } catch (err) {
    logger.error('Error getPaymentMethods:', err)
    return sendError(res, 'Error al obtener métodos de pago', 500, 'SERVER_ERROR')
  }
})

// POST /superadmin/payment-methods
router.post('/payment-methods', auth, requireSA, validate(pmSchema), async (req, res) => {
  try {
    const existing = await PaymentMethod.findOne({ where: { name: req.body.name } })
    if (existing) return sendError(res, `Ya existe un método con el nombre "${req.body.name}"`, 409, 'PM_EXISTS')
    const method = await PaymentMethod.create(req.body)
    return sendCreated(res, method, 'Método de pago creado')
  } catch (err) {
    logger.error('Error createPaymentMethod:', err)
    return sendError(res, 'Error al crear el método de pago', 500, 'SERVER_ERROR')
  }
})

// PUT /superadmin/payment-methods/:id
router.put('/payment-methods/:id', auth, requireSA, validate(pmUpdateSchema), async (req, res) => {
  try {
    const method = await PaymentMethod.findByPk(req.params.id)
    if (!method) return sendError(res, 'Método no encontrado', 404, 'NOT_FOUND')
    await method.update(req.body)
    return sendSuccess(res, method, 'Método actualizado')
  } catch (err) {
    logger.error('Error updatePaymentMethod:', err)
    return sendError(res, 'Error al actualizar el método de pago', 500, 'SERVER_ERROR')
  }
})

// DELETE /superadmin/payment-methods/:id
router.delete('/payment-methods/:id', auth, requireSA, async (req, res) => {
  try {
    const method = await PaymentMethod.findByPk(req.params.id)
    if (!method) return sendError(res, 'Método no encontrado', 404, 'NOT_FOUND')
    await method.destroy()
    return sendSuccess(res, null, 'Método eliminado')
  } catch (err) {
    logger.error('Error deletePaymentMethod:', err)
    return sendError(res, 'Error al eliminar el método de pago', 500, 'SERVER_ERROR')
  }
})

// ── Tipos de negocio ──────────────────────────────────────────
const btColorsSchema = Joi.object({
  default_colors: Joi.object({
    primary:   Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).required(),
    secondary: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).required(),
    accent:    Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
  }).required(),
})

// PATCH /superadmin/business-types/:id — actualiza default_colors de un tipo
router.patch('/business-types/:id', auth, requireSA, validate(btColorsSchema), async (req, res) => {
  try {
    const bt = await BusinessType.findByPk(req.params.id)
    if (!bt) return sendError(res, 'Tipo de negocio no encontrado', 404, 'NOT_FOUND')
    await bt.update({ default_colors: req.body.default_colors })
    return sendSuccess(res, bt, 'Colores actualizados')
  } catch (err) {
    logger.error('Error patchBusinessType:', err)
    return sendError(res, 'Error al actualizar el tipo de negocio', 500, 'SERVER_ERROR')
  }
})

module.exports = router
