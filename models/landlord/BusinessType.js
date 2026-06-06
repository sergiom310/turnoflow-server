'use strict'
const { DataTypes } = require('sequelize')
const landlordDb = require('../../config/landlordDb')

const BusinessType = landlordDb.define('BusinessType', {
  id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:           { type: DataTypes.STRING(100), allowNull: false, unique: true },
  slug:           { type: DataTypes.STRING(50),  allowNull: false, unique: true },
  description:    { type: DataTypes.TEXT },
  icon:           { type: DataTypes.STRING(10) },
  default_colors: { type: DataTypes.JSON },
  is_active:      { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'business_types', underscored: true })

module.exports = BusinessType
