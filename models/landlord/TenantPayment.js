'use strict'
const { DataTypes } = require('sequelize')
const landlordDb = require('../../config/landlordDb')

/** Historial de pagos de suscripción por tenant. */
const TenantPayment = landlordDb.define('TenantPayment', {
  id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tenant_id:      { type: DataTypes.INTEGER, allowNull: false },
  plan:           { type: DataTypes.ENUM('free', 'basic', 'professional', 'enterprise'), allowNull: false },
  amount_cop:     { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
  payment_method: { type: DataTypes.STRING(50) },
  status:         { type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'), defaultValue: 'pending' },
  reference:      { type: DataTypes.STRING(255) },   // referencia pago externo
  period_start:   { type: DataTypes.DATEONLY },
  period_end:     { type: DataTypes.DATEONLY },
  notes:          { type: DataTypes.TEXT },
}, { tableName: 'tenant_payments', underscored: true })

module.exports = TenantPayment
