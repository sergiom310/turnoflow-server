'use strict'
const { DataTypes } = require('sequelize')
module.exports = (sequelize) =>
  sequelize.define('Role', {
    id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name:        { type: DataTypes.STRING(50), allowNull: false, unique: true },
    description: { type: DataTypes.TEXT },
    permissions: { type: DataTypes.JSON },
  }, { tableName: 'roles', underscored: true })
