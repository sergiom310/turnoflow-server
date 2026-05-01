const Joi = require('joi')
const { sendError } = require('../utils/response')

/**
 * Factory de middleware de validación con Joi.
 *
 * Uso:
 *   router.post('/login', validate(loginSchema), authController.login)
 *
 * @param {Joi.Schema} schema  Esquema Joi
 * @param {'body'|'query'|'params'} source  Dónde validar (default: 'body')
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,   // reportar todos los errores, no solo el primero
      stripUnknown: true,  // eliminar campos no definidos en el schema
    })

    if (error) {
      const messages = error.details.map((d) => d.message).join('; ')
      return sendError(res, messages, 422, 'VALIDATION_ERROR')
    }

    req[source] = value  // reemplazar con valor sanitizado
    next()
  }
}

// ── Schemas ─────────────────────────────────────────────────

const loginSchema = Joi.object({
  username: Joi.string().min(3).max(50).required().messages({
    'string.empty':  'El usuario es requerido',
    'any.required':  'El usuario es requerido',
  }),
  password: Joi.string().min(4).required().messages({
    'string.empty':  'La contraseña es requerida',
    'any.required':  'La contraseña es requerida',
  }),
})

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
})

const createBusinessSchema = Joi.object({
  name:                 Joi.string().max(255).required().messages({ 'any.required': 'El nombre es requerido' }),
  nit:                  Joi.string().max(50).allow('').optional(),
  tax_regime:           Joi.string().max(50).allow('').optional(),
  phone:                Joi.string().max(20).allow('').optional(),
  address:              Joi.string().allow('').optional(),
  city:                 Joi.string().max(100).allow('').optional(),
  email:                Joi.string().email().allow('').optional(),
  legal_representative: Joi.string().max(255).allow('').optional(),
  legal_id:             Joi.string().max(50).allow('').optional(),
  legal_phone:          Joi.string().max(20).allow('').optional(),
  whatsapp:             Joi.string().max(20).allow('').optional(),
  instagram:            Joi.string().max(100).allow('').optional(),
  facebook:             Joi.string().max(100).allow('').optional(),
  website:              Joi.string().max(500).allow('').optional(),
  opening_time:         Joi.string().pattern(/^([01]\d|2[0-3]):[0-5]\d$/).allow('').optional(),
  closing_time:         Joi.string().pattern(/^([01]\d|2[0-3]):[0-5]\d$/).allow('').optional(),
  description:          Joi.string().max(300).allow('').optional(),
  business_type_id:     Joi.number().integer().positive().optional(),
  business_subtype:     Joi.string().max(50).allow('').optional(),
})

const updateBusinessSchema = createBusinessSchema  // mismos campos, todos opcionales
  .fork(Object.keys(createBusinessSchema.describe().keys), (s) => s.optional())

const createSubscriptionSchema = Joi.object({
  plan:       Joi.string().valid('free', 'basic', 'professional', 'enterprise').required(),
  start_date: Joi.string().isoDate().optional(),
  end_date:   Joi.string().isoDate().optional(),
  notes:      Joi.string().max(500).allow('').optional(),
})

module.exports = {
  validate,
  loginSchema,
  refreshTokenSchema,
  createBusinessSchema,
  updateBusinessSchema,
  createSubscriptionSchema,
}
