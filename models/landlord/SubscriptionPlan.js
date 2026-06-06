'use strict'
const { DataTypes } = require('sequelize')
const landlordDb = require('../../config/landlordDb')

/** Catálogo de planes disponibles — gestionado desde el panel SuperAdmin. */
const SubscriptionPlan = landlordDb.define('SubscriptionPlan', {
  id:                     { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  icon:                   { type: DataTypes.STRING(10) },
  name:                   { type: DataTypes.STRING(50),  allowNull: false, unique: true },  // 'free','basic'...
  display_name:           { type: DataTypes.STRING(100), allowNull: false },
  description:            { type: DataTypes.STRING(255) },
  price_cop:              { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
  max_users:              { type: DataTypes.INTEGER, defaultValue: 3 },
  max_appointments_month: { type: DataTypes.INTEGER, defaultValue: 50 },
  features:               { type: DataTypes.JSON },
  is_active:              { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'subscription_plans', underscored: true })

module.exports = SubscriptionPlan
