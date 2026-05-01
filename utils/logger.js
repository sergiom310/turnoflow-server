const winston = require('winston')
const { NODE_ENV } = require('../config/config')

const logger = winston.createLogger({
  level: NODE_ENV === 'production' ? 'warn' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'DD/MM/YYYY HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    NODE_ENV === 'production'
      ? winston.format.json()
      : winston.format.printf(({ timestamp, level, message, stack }) => {
          const color = { error: '\x1b[31m', warn: '\x1b[33m', info: '\x1b[32m', debug: '\x1b[36m' }
          const c = color[level] || ''
          return `[${timestamp}] ${c}${level.toUpperCase()}\x1b[0m: ${stack || message}`
        })
  ),
  transports: [
    new winston.transports.Console(),
    ...(NODE_ENV === 'production'
      ? [
          new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
          new winston.transports.File({ filename: 'logs/combined.log' }),
        ]
      : []),
  ],
})

module.exports = logger
