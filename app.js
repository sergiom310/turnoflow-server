'use strict'
require('dotenv').config()
const path = require('path')
const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const morgan = require('morgan')

const config = require('./config/config')
const { sequelize } = require('./models')
const routes = require('./routes')
const errorHandler = require('./middleware/errorHandler')
const logger = require('./utils/logger')

const app = express()

// ── Seguridad: cabeceras HTTP ───────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // permite servir uploads al front
}))

// ── CORS ───────────────────────────────────────────────────
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// ── Body parsers ───────────────────────────────────────────
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

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
    await sequelize.authenticate()
    logger.info('✅ Conexión a MySQL establecida')

    // sync({ alter: true }) en desarrollo actualiza columnas sin borrar datos
    // En producción usar migraciones Sequelize
    await sequelize.sync({ alter: config.NODE_ENV === 'development' })
    logger.info('✅ Modelos sincronizados con la base de datos')

    app.listen(config.PORT, () => {
      logger.info(`🚀 TurnoFlow API corriendo en http://localhost:${config.PORT} [${config.NODE_ENV}]`)
    })
  } catch (error) {
    logger.error('Error al iniciar el servidor:', error)
    process.exit(1)
  }
}

start()

module.exports = app
