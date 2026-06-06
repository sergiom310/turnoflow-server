#!/usr/bin/env node
'use strict'
/**
 * scripts/migrateTenant.js
 *
 * Corre las migraciones tenant en una o todas las BDs de tenant.
 *
 * Uso:
 *   pnpm run migrate:tenant -- --db turnoflow_t_barberia_juan
 *   pnpm run migrate:tenant -- --all
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') })
const path    = require('path')
const { Sequelize }               = require('sequelize')
const { Umzug, SequelizeStorage } = require('umzug')
const config  = require('../config/config')

const runForDb = async (dbName) => {
  const sequelize = new Sequelize(
    dbName, config.DB_USER, config.DB_PASS,
    { host: config.DB_HOST, port: config.DB_PORT, dialect: 'mysql', logging: false }
  )

  await sequelize.authenticate()

  const umzug = new Umzug({
    migrations: {
      glob: path.join(__dirname, '../migrations/tenant/*.js'),
      resolve: ({ name, path: mPath }) => {
        const migration = require(mPath)
        return {
          name,
          up:   () => migration.up(sequelize.getQueryInterface(), Sequelize),
          down: () => migration.down(sequelize.getQueryInterface(), Sequelize),
        }
      },
    },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize }),
    logger:  { info: (msg) => console.log(`  [${dbName}] ${msg}`) },
  })

  await umzug.up()
  await sequelize.close()
}

const run = async () => {
  const args  = process.argv.slice(2)
  const flag  = args[0]
  const value = args[1]

  if (flag === '--all') {
    // Obtener todas las BDs activas desde landlord
    const landlordSeq = new Sequelize(
      config.DB_LANDLORD_NAME, config.DB_USER, config.DB_PASS,
      { host: config.DB_HOST, port: config.DB_PORT, dialect: 'mysql', logging: false }
    )
    await landlordSeq.authenticate()
    const [tenants] = await landlordSeq.query('SELECT db_name FROM tenants WHERE is_active = 1')
    await landlordSeq.close()

    if (tenants.length === 0) {
      console.log('ℹ️  No hay tenants activos')
      process.exit(0)
    }

    for (const { db_name } of tenants) {
      console.log(`\n📦 Migrando: ${db_name}`)
      await runForDb(db_name)
    }
    console.log('\n✅ Todas las migraciones tenant completadas')

  } else if (flag === '--db' && value) {
    console.log(`\n📦 Migrando: ${value}`)
    await runForDb(value)
    console.log('✅ Migraciones completadas')

  } else {
    console.error('Uso:')
    console.error('  pnpm run migrate:tenant -- --db <nombre_bd>')
    console.error('  pnpm run migrate:tenant -- --all')
    process.exit(1)
  }

  process.exit(0)
}

run().catch((err) => { console.error('❌ Error:', err); process.exit(1) })
