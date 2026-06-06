'use strict'
const router      = require('express').Router()
const rateLimit   = require('express-rate-limit')
const auth        = require('../../middleware/auth')
const requireSA   = require('../../middleware/requireSuperadmin')
const authCtrl    = require('../../controllers/superadmin/authController')
const { validate, loginSchema, refreshTokenSchema } = require('../../middleware/validate')

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  standardHeaders: true, legacyHeaders: false,
  message: { success: false, data: null, message: 'Demasiados intentos. Espere 15 minutos.', error: 'RATE_LIMIT' },
})

router.post('/login',   loginLimiter, validate(loginSchema),       authCtrl.login)
router.post('/refresh', validate(refreshTokenSchema),               authCtrl.refreshToken)
router.get ('/me',      auth, requireSA,                            authCtrl.me)

module.exports = router
