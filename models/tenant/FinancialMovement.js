'use strict'
const { DataTypes } = require('sequelize')
module.exports = (sequelize) =>
  sequelize.define('FinancialMovement', {
    id:                     { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id:                { type: DataTypes.INTEGER, allowNull: false },
    type:                   { type: DataTypes.ENUM('income', 'expense'), allowNull: false },
    amount:                 { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    description:            { type: DataTypes.TEXT },
    payment_method:         { type: DataTypes.STRING(50) },
    related_appointment_id: { type: DataTypes.INTEGER },
    related_inventory_id:   { type: DataTypes.INTEGER },
    movement_date:          { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, { tableName: 'financial_movements', underscored: true, updatedAt: false })
