'use strict'
const { Sequelize } = require('sequelize')
const config = require('./config')
const logger = require('../utils/logger')

/**
 * Pool de conexiones a BDs de tenants.
 * Cada llamada a getTenantConnection(dbName) devuelve { sequelize, models }.
 * La conexión se cachea en memoria por el tiempo de vida del proceso.
 */

/** @type {Map<string, { sequelize: Sequelize, models: object }>} */
const _cache = new Map()

const getTenantConnection = async (dbName) => {
  if (_cache.has(dbName)) return _cache.get(dbName)

  const sequelize = new Sequelize(dbName, config.DB_USER, config.DB_PASS, {
    host:    config.DB_HOST,
    port:    config.DB_PORT,
    dialect: 'mysql',
    logging: false,
    define:  { underscored: true, timestamps: true, charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' },
    pool:    { max: 5, min: 0, acquire: 30000, idle: 10000 },
    timezone: '-05:00',
  })

  await sequelize.authenticate()

  // Importar factory de modelos aquí para evitar dependencias circulares
  const defineTenantModels = require('../models/tenant')
  const models = defineTenantModels(sequelize)

  const conn = { sequelize, models }
  _cache.set(dbName, conn)
  logger.info(`🔌 Conexión tenant establecida: ${dbName}`)
  return conn
}

/**
 * Elimina una conexión del cache y la cierra.
 * Llamar cuando un tenant se desactiva o elimina.
 */
const removeTenantConnection = async (dbName) => {
  if (_cache.has(dbName)) {
    const { sequelize } = _cache.get(dbName)
    await sequelize.close()
    _cache.delete(dbName)
    logger.info(`🔌 Conexión tenant cerrada: ${dbName}`)
  }
}

module.exports = { getTenantConnection, removeTenantConnection }
