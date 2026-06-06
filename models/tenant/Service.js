'use strict'
const { DataTypes } = require('sequelize')
module.exports = (sequelize) =>
  sequelize.define('Service', {
    id:               { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name:             { type: DataTypes.STRING(255), allowNull: false },
    description:      { type: DataTypes.TEXT },
    price:            { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    duration_minutes: { type: DataTypes.INTEGER },
    category:         { type: DataTypes.STRING(100) },
    is_active:        { type: DataTypes.BOOLEAN, defaultValue: true },
  }, { tableName: 'services', underscored: true })
