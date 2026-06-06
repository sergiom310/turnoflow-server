'use strict'
const router   = require('express').Router()
const rateLimit = require('express-rate-limit')
const auth     = require('../../middleware/auth')
const authCtrl = require('../../controllers/tenant/authController')
const { validate, loginSchema } = require('../../middleware/validate')

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  standardHeaders: true, legacyHeaders: false,
  message: { success: false, data: null, message: 'Demasiados intentos. Espere 15 minutos.', error: 'RATE_LIMIT' },
})

// tenant middleware ya fue aplicado en routes/index.js
router.post('/login',   loginLimiter, validate(loginSchema), authCtrl.login)
router.post('/refresh',                                       authCtrl.refreshToken) // lee cookie, sin body
router.post('/logout',                                        authCtrl.logout)
router.get ('/me',      auth,                                 authCtrl.me)

module.exports = router
