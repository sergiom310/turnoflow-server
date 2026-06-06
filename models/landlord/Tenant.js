'use strict'
const { DataTypes } = require('sequelize')
const landlordDb = require('../../config/landlordDb')

/**
 * Cada fila = un cliente SaaS con su propia BD de tenant.
 * El campo `subdomain` es lo que llega en el Host header para identificarlo.
 * El campo `db_name` es el nombre exacto de la BD MySQL del tenant.
 */
const Tenant = landlordDb.define('Tenant', {
  id:               { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:             { type: DataTypes.STRING(255), allowNull: false },
  subdomain:        { type: DataTypes.STRING(100), allowNull: false, unique: true },
  db_name:          { type: DataTypes.STRING(100), allowNull: false, unique: true },
  email:            { type: DataTypes.STRING(255) },
  phone:            { type: DataTypes.STRING(20) },
  logo_url:         { type: DataTypes.STRING(500) },
  theme_colors:     { type: DataTypes.JSON },
  business_type_id: { type: DataTypes.INTEGER },
  business_subtype: { type: DataTypes.STRING(50) },
  plan:             { type: DataTypes.ENUM('free', 'basic', 'professional', 'enterprise'), defaultValue: 'free' },
  is_active:        { type: DataTypes.BOOLEAN, defaultValue: true },
  notes:            { type: DataTypes.TEXT },
}, { tableName: 'tenants', underscored: true })

module.exports = Tenant
