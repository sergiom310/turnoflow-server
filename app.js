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

// ── Seguridad: cabeceras HTTP ───────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}))

// ── CORS ───────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    // Sin origin (Postman, curl, mismo servidor) → permitir
    if (!origin) return callback(null, true)

    if (config.NODE_ENV !== 'production') {
      // Dev: permitir localhost y turnoflow.local (con o sin subdominio)
      const devPattern = /^https?:\/\/((.*\.)?turnoflow\.local|localhost)(:\d+)?$/
      if (devPattern.test(origin)) return callback(null, true)
      return callback(new Error('No permitido por CORS (dev)'))
    }

    if (allowedOrigins.includes(origin)) return callback(null, true)

    // Fallback por compatibilidad con despliegues antiguos
    if (/^https:\/\/.*\.turnoflow\.co$/.test(origin)) return callback(null, true)
    callback(new Error('No permitido por CORS'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Subdomain'],
}))

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
