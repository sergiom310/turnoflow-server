'use strict'
const router  = require('express').Router()
const auth    = require('../../middleware/auth')
const requireSA = require('../../middleware/requireSuperadmin')
const ctrl    = require('../../controllers/superadmin/tenantController')
const { validate } = require('../../middleware/validate')
const Joi     = require('joi')

const createTenantSchema = Joi.object({
  name:             Joi.string().min(2).max(255).required(),
  subdomain:        Joi.string().pattern(/^[a-z0-9-]+$/).min(3).max(50).required()
    .messages({ 'string.pattern.base': 'El subdominio solo puede contener letras minúsculas, números y guiones' }),
  email:            Joi.string().email().optional().allow('', null),
  phone:            Joi.string().max(20).optional().allow('', null),
  business_type_id: Joi.number().integer().optional().allow(null),
  business_subtype: Joi.string().max(50).optional().allow('', null),
  plan:             Joi.string().valid('free', 'basic', 'professional', 'enterprise').optional(),
  admin_user: Joi.object({
    username:   Joi.string().min(3).max(50).required(),
    password:   Joi.string().min(8).required(),
    first_name: Joi.string().required(),
    last_name:  Joi.string().required(),
    email:      Joi.string().email().optional().allow('', null),
  }).optional(),
})

const updateTenantSchema = Joi.object({
  name:             Joi.string().min(2).max(255).optional(),
  email:            Joi.string().email().optional().allow('', null),
  phone:            Joi.string().max(20).optional().allow('', null),
  business_type_id: Joi.number().integer().optional().allow(null),
  business_subtype: Joi.string().max(50).optional().allow('', null),
  plan:             Joi.string().valid('free', 'basic', 'professional', 'enterprise').optional(),
  is_active:        Joi.boolean().optional(),
  notes:            Joi.string().optional().allow('', null),
})

const paymentSchema = Joi.object({
  plan:           Joi.string().valid('free', 'basic', 'professional', 'enterprise').required(),
  amount_cop:     Joi.number().min(0).required(),
  payment_method: Joi.string().max(50).optional().allow('', null),
  status:         Joi.string().valid('pending', 'completed', 'failed', 'refunded').optional(),
  reference:      Joi.string().max(255).optional().allow('', null),
  period_start:   Joi.string().isoDate().optional().allow(null),
  period_end:     Joi.string().isoDate().optional().allow(null),
  notes:          Joi.string().optional().allow('', null),
})

// Todos requieren auth + superadmin
router.use(auth, requireSA)

router.get ('/',                    ctrl.getAll)
router.post('/',    validate(createTenantSchema), ctrl.create)
router.get ('/payments/all',        ctrl.getAllPayments)   // ← debe ir antes de /:id
router.get ('/:id', ctrl.getOne)
router.put ('/:id', validate(updateTenantSchema), ctrl.update)
router.patch('/:id/toggle',         ctrl.toggleActive)
router.get ('/:id/payments',        ctrl.getPayments)
router.post('/:id/payments', validate(paymentSchema), ctrl.registerPayment)
router.delete('/:id',               ctrl.deleteTenant)

module.exports = router
