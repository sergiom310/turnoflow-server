'use strict'
const { DataTypes } = require('sequelize')
const landlordDb    = require('../../config/landlordDb')

const PaymentMethod = landlordDb.define('PaymentMethod', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:         { type: DataTypes.STRING(50),  allowNull: false, unique: true },
  display_name: { type: DataTypes.STRING(100), allowNull: false },
  icon:         { type: DataTypes.STRING(10) },
  description:  { type: DataTypes.STRING(255) },
  is_active:    { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'payment_methods', underscored: true })

module.exports = PaymentMethod
