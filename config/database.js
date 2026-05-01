const { Sequelize } = require('sequelize')
const config = require('./config')

const sequelize = new Sequelize(config.DB_NAME, config.DB_USER, config.DB_PASS, {
  host: config.DB_HOST,
  port: config.DB_PORT,
  dialect: 'mysql',
  logging: config.NODE_ENV === 'development' ? (sql) => console.log(`\x1b[36m[SQL]\x1b[0m ${sql}`) : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    underscored: true,       // snake_case en columnas
    timestamps: true,         // created_at, updated_at automáticos
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
  },
  timezone: '-05:00',         // UTC-5 Colombia
})

module.exports = sequelize
