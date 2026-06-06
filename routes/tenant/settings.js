'use strict'
const router  = require('express').Router()
const auth    = require('../../middleware/auth')
const { upload } = require('../../middleware/upload')
const ctrl    = require('../../controllers/tenant/settingsController')

// Todas las rutas requieren JWT (cookie o Bearer)
router.get ('/',     auth, ctrl.getSettings)
router.patch('/',    auth, ctrl.updateSettings)
router.post('/logo', auth, upload.single('logo'), ctrl.uploadLogo)

module.exports = router
