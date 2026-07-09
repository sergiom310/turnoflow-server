'use strict'
require('dotenv').config()
const path = require('path')
const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const morgan = require('morgan')

const config       = require('./config/config')
const { landlordDb } = require('./models/landlord')
const routes       = require('./routes')
const errorHandler = require('./middleware/errorHandler')
const logger       = require('./utils/logger')
const cookieParser = require('cookie-parser')

const app = express()

const allowedOrigins = (config.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const isAllowedOrigin = (origin) => {
  if (!origin) return true

  // Orígenes explícitos en CORS_ORIGIN → siempre permitidos (dev y prod)
  if (allowedOrigins.includes(origin)) return true

  if (config.NODE_ENV !== 'production') {
    return /^https?:\/\/((.*\.)?turnoflow\.local|localhost)(:\d+)?$/.test(origin)
  }

  if (/^https:\/\/.*\.turnoflow\.co$/.test(origin)) return true
  if (/^https:\/\/.*\.bitwia\.com$/.test(origin)) return true

  return false
}

const corsOptions = {
  origin: (origin, callback) => {
    // 🔍 Cazador de errores: Esto imprimirá el origen exacto en los logs de Docker
    console.log("CORS ORGIN RECV:", origin);

    // 1. Permitir si es undefined
    // 2. Permitir si tu función isAllowedOrigin lo aprueba
    // 3. ¡Parche definitivo!: Permitir si el string contiene tu dominio de producción
    if (!origin || isAllowedOrigin(origin) || origin.includes('turnoflow.probeta.dev')) {
      return callback(null, true);
    }
    
    callback(new Error(config.NODE_ENV !== 'production' ? 'No permitido por CORS (dev)' : 'No permitido por CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Subdomain'],
  optionsSuccessStatus: 204,
}

// ── Seguridad: cabeceras HTTP ───────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}))

// ── CORS ───────────────────────────────────────────────────
app.use((req, res, next) => {
  const origin = req.headers.origin

  if (origin && isAllowedOrigin(origin)) {
    res.header('Access-Control-Allow-Origin', origin)
    res.header('Vary', 'Origin')
    res.header('Access-Control-Allow-Credentials', 'true')
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Tenant-Subdomain')
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(origin && isAllowedOrigin(origin) ? 204 : 403)
  }

  next()
})

app.options('*', cors(corsOptions))
app.use(cors(corsOptions))

// ── Body parsers ───────────────────────────────────────────
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

// ── HTTP logging (solo desarrollo) ────────────────────────
if (config.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
}

// ── Archivos estáticos (uploads) ───────────────────────────
app.use('/uploads', express.static(path.resolve(config.UPLOAD_DIR)))

// ── Health check ───────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', env: config.NODE_ENV, timestamp: new Date().toISOString() })
})

// ── API v1 ─────────────────────────────────────────────────
app.use('/api/v1', routes)

// ── 404 ────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, data: null, message: 'Ruta no encontrada', error: 'NOT_FOUND' })
})

// ── Error handler centralizado ─────────────────────────────
app.use(errorHandler)

// ── Arrancar servidor ──────────────────────────────────────
const start = async () => {
  try {
    // Verificar conexión a landlord DB (las tablas las crean las migraciones)
    await landlordDb.authenticate()
    logger.info(`✅ Landlord DB conectada: ${config.DB_LANDLORD_NAME}`)

    app.listen(config.PORT, () => {
      logger.info(`🚀 TurnoFlow API en http://localhost:${config.PORT} [${config.NODE_ENV}]`)
    })
  } catch (error) {
    logger.error('Error al iniciar el servidor:', error)
    process.exit(1)
  }
}

start()

module.exports = app
