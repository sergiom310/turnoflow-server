'use strict'
const { DataTypes } = require('sequelize')
module.exports = (sequelize) =>
  sequelize.define('Inventory', {
    id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name:        { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT },
    quantity:    { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    unit_price:  { type: DataTypes.DECIMAL(10, 2) },
    category:    { type: DataTypes.STRING(100) },
    is_active:   { type: DataTypes.BOOLEAN, defaultValue: true },
  }, { tableName: 'inventory', underscored: true })
