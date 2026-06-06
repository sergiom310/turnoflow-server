'use strict'
const { DataTypes } = require('sequelize')
module.exports = (sequelize) =>
  sequelize.define('Client', {
    id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    first_name:     { type: DataTypes.STRING(100), allowNull: false },
    last_name:      { type: DataTypes.STRING(100), allowNull: false },
    identification: { type: DataTypes.STRING(50) },
    address:        { type: DataTypes.TEXT },
    phone:          { type: DataTypes.STRING(20) },
    email:          { type: DataTypes.STRING(255) },
    extra_fields:   { type: DataTypes.JSON },  // campos dinámicos por subtipo de negocio
    created_by:     { type: DataTypes.INTEGER },
    is_active:      { type: DataTypes.BOOLEAN, defaultValue: true },
  }, { tableName: 'clients', underscored: true })
