require('dotenv').config()

const config = {
  PORT: parseInt(process.env.PORT) || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Base de datos
  DB_HOST:          process.env.DB_HOST          || 'localhost',
  DB_PORT:          parseInt(process.env.DB_PORT) || 3306,
  DB_USER:          process.env.DB_USER          || 'root',
  DB_PASS:          process.env.DB_PASS          || '',
  // BD del landlord (superadmin central)
  DB_LANDLORD_NAME: process.env.DB_LANDLORD_NAME || 'turnoflow_landlord',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',

  // Uploads
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 3 * 1024 * 1024,

  // Auditoría
  AUDIT_RETENTION_DAYS: parseInt(process.env.AUDIT_RETENTION_DAYS) || 90,
}

// Fallback para desarrollo — En producción los secrets son obligatorios
if (!config.JWT_SECRET) {
  if (config.NODE_ENV === 'production') {
    console.error('FATAL: JWT_SECRET no definido. Defínalo en .env')
    process.exit(1)
  }
  config.JWT_SECRET = 'dev_jwt_secret_turnoflow_2026'
  config.JWT_REFRESH_SECRET = 'dev_refresh_secret_turnoflow_2026'
  console.warn('⚠️  Usando JWT secrets de desarrollo. Defina JWT_SECRET en .env')
}

module.exports = config
