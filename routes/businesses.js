const router  = require('express').Router()
const ctrl    = require('../controllers/businessController')
const auth    = require('../middleware/auth')
const { rbac, sameBusinessOrSuperAdmin } = require('../middleware/rbac')
const { upload } = require('../middleware/upload')
const { validate, createBusinessSchema, updateBusinessSchema, createSubscriptionSchema } = require('../middleware/validate')

// Todos los endpoints requieren autenticación
router.use(auth)

// Listar todos — solo superadmin
router.get ('/',         rbac('superadmin'), ctrl.getAll)

// Crear empresa — solo superadmin
router.post('/',         rbac('superadmin'), validate(createBusinessSchema), ctrl.create)

// Detalle de empresa
router.get ('/:id',      sameBusinessOrSuperAdmin, ctrl.getOne)

// Actualizar datos de empresa
router.put ('/:id',      sameBusinessOrSuperAdmin, validate(updateBusinessSchema), ctrl.update)

// Subir logo — campo 'logo' en multipart/form-data
router.post('/:id/logo', sameBusinessOrSuperAdmin, upload.single('logo'), ctrl.uploadLogo)

// Gestión de suscripción
router.put ('/:id/subscription', rbac('superadmin'), validate(createSubscriptionSchema), ctrl.updateSubscription)

// Configuración del negocio (tipo + subtipo)
router.get ('/:id/config', sameBusinessOrSuperAdmin, ctrl.getConfig)

module.exports = router
