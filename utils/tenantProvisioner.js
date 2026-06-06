'use strict'
/**
 * tenantProvisioner.js
 *
 * Encapsula el ciclo de vida de la BD de un tenant:
 *   - provisionTenant  → crea BD + corre migraciones + siembra roles (+ admin inicial opcional)
 *   - deprovisionTenant → cierra conexión + DROP DATABASE (¡irreversible!)
 *   - getDbName         → convierte subdomain en nombre de BD MySQL válido
 */

require('dotenv').config()
const path      = require('path')
const bcrypt    = require('bcrypt')
const { Sequelize }                      = require('sequelize')
const { Umzug, SequelizeStorage }        = require('umzug')
const config                             = require('../config/config')
const { getTenantConnection, removeTenantConnection } = require('../config/tenantDb')
const { DEFAULT_ROLES }                  = require('../config/tenantDefaults')
const logger                             = require('./logger')

/**
 * 'barberia-juan' → 'turnoflow_t_barberia_juan'
 * Sanitiza guiones y convierte a minúsculas para nombre de BD MySQL válido.
 */
const getDbName = (subdomain) =>
  `turnoflow_t_${subdomain.replace(/-/g, '_').toLowerCase()}`

/**
 * Provisiona un tenant nuevo:
 *   1. Crea la BD MySQL del tenant
 *   2. Corre las migraciones tenant
 *   3. Siembra los roles por defecto
 *   4. (Opcional) Crea el primer usuario administrador
 *
 * @param {object} tenant    — instancia del modelo Tenant (ya guardada en landlord)
 * @param {object} [adminUser] — { username, password, first_name, last_name, email? }
 */
const provisionTenant = async (tenant, adminUser = null) => {
  const { db_name } = tenant

  // ── 1. Crear la BD ───────────────────────────────────────
  const rootSeq = new Sequelize(null, config.DB_USER, config.DB_PASS, {
    host: config.DB_HOST, port: config.DB_PORT, dialect: 'mysql', logging: false,
  })
  await rootSeq.query(
    `CREATE DATABASE IF NOT EXISTS \`${db_name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  )
  await rootSeq.close()
  logger.info(`✅ BD tenant creada: ${db_name}`)

  // ── 2. Correr migraciones ────────────────────────────────
  const tenantSeq = new Sequelize(db_name, config.DB_USER, config.DB_PASS, {
    host: config.DB_HOST, port: config.DB_PORT, dialect: 'mysql', logging: false,
  })

  const umzug = new Umzug({
    migrations: {
      glob: path.join(__dirname, '../migrations/tenant/*.js'),
      resolve: ({ name, path: mPath }) => {
        const migration = require(mPath)
        return {
          name,
          up:   () => migration.up(tenantSeq.getQueryInterface(), Sequelize),
          down: () => migration.down(tenantSeq.getQueryInterface(), Sequelize),
        }
      },
    },
    context: tenantSeq.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize: tenantSeq }),
    logger:  null,
  })

  await umzug.up()
  await tenantSeq.close()
  logger.info(`✅ Migraciones tenant corridas: ${db_name}`)

  // ── 3. Sembrar roles por defecto ─────────────────────────
  const { models } = await getTenantConnection(db_name)
  for (const roleData of DEFAULT_ROLES) {
    await models.Role.findOrCreate({ where: { name: roleData.name }, defaults: roleData })
  }
  logger.info(`✅ Roles sembrados en: ${db_name}`)

  // ── 4. Crear admin inicial (opcional) ────────────────────
  if (adminUser) {
    const adminRole    = await models.Role.findOne({ where: { name: 'administrador' } })
    const passwordHash = await bcrypt.hash(adminUser.password, 12)
    await models.User.create({
      first_name:    adminUser.first_name,
      last_name:     adminUser.last_name,
      email:         adminUser.email || null,
      username:      adminUser.username,
      password_hash: passwordHash,
      role_id:       adminRole.id,
      is_active:     true,
    })
    logger.info(`✅ Usuario admin creado en: ${db_name}`)
  }

  return { db_name }
}

/**
 * Elimina completamente la BD de un tenant.
 * ¡IRREVERSIBLE! Solo llamar cuando se elimina definitivamente un tenant.
 */
const deprovisionTenant = async (dbName) => {
  await removeTenantConnection(dbName)

  const rootSeq = new Sequelize(null, config.DB_USER, config.DB_PASS, {
    host: config.DB_HOST, port: config.DB_PORT, dialect: 'mysql', logging: false,
  })
  await rootSeq.query(`DROP DATABASE IF EXISTS \`${dbName}\``)
  await rootSeq.close()
  logger.info(`🗑️  BD tenant eliminada: ${dbName}`)
}

module.exports = { provisionTenant, deprovisionTenant, getDbName }
