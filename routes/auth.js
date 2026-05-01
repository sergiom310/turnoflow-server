const router = require('express').Router()
const rateLimit = require('express-rate-limit')
const authController = require('../controllers/authController')
const auth           = require('../middleware/auth')
const { validate, loginSchema, refreshTokenSchema } = require('../middleware/validate')

// Rate limiter para login — 10 intentos cada 15 minutos por IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false, data: null,
    message: 'Demasiados intentos de login. Espere 15 minutos.',
    error: 'RATE_LIMIT',
  },
})

router.post('/login',   loginLimiter, validate(loginSchema),        authController.login)
router.post('/refresh', validate(refreshTokenSchema),                authController.refreshToken)
router.get ('/me',      auth,                                        authController.me)

module.exports = router
