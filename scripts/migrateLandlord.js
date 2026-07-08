#!/usr/bin/env node
'use strict'
/**
 * scripts/migrateLandlord.js
 *
 * Corre (o revierte) las migraciones de la BD landlord.
 *
 * Uso:
 *   pnpm run migrate:landlord          → aplica todas las pendientes
 *   pnpm run migrate:landlord down     → revierte la última
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') })
const path    = require('path')
const { Sequelize }              = require('sequelize')
const { Umzug, SequelizeStorage } = require('umzug')
const config  = require('../config/config')

const run = async () => {
  const sequelize = new Sequelize(
    config.DB_LANDLORD_NAME, config.DB_USER, config.DB_PASS,
    { host: config.DB_HOST, port: config.DB_PORT, dialect: 'mysql', logging: false }
  )

  await sequelize.authenticate()
  console.log(`✅ Conectado a landlord DB: ${config.DB_LANDLORD_NAME}`)

  const umzug = new Umzug({
    migrations: {
      glob: path.join(__dirname, '../migrations/landlord/*.js').replace(/\\/g, '/'),
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
    logger:  console,
  })

  const arg = process.argv[2]
  if (arg === 'down') {
    await umzug.down()
    console.log('⬇️  Última migración revertida')
  } else {
    await umzug.up()
    console.log('✅ Migraciones landlord completadas')
  }

  await sequelize.close()
  process.exit(0)
}

run().catch((err) => { console.error('❌ Error:', err); process.exit(1) })
