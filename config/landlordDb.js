'use strict'
const { Sequelize } = require('sequelize')
const config = require('./config')
const logger = require('../utils/logger')

/**
 * Conexión Sequelize a la BD landlord (turnoflow_landlord).
 * Usada por: models/landlord/, scripts/migrateLandlord.js
 */
const landlordDb = new Sequelize(
  config.DB_LANDLORD_NAME,
  config.DB_USER,
  config.DB_PASS,
  {
    host:    config.DB_HOST,
    port:    config.DB_PORT,
    dialect: 'mysql',
    logging: config.NODE_ENV === 'development' ? (msg) => logger.debug(msg) : false,
    define:  { underscored: true, timestamps: true, charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' },
    pool:    { max: 5, min: 0, acquire: 30000, idle: 10000 },
    timezone: '-05:00',
  }
)

module.exports = landlordDb
