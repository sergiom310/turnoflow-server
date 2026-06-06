'use strict'
const { DataTypes } = require('sequelize')
module.exports = (sequelize) =>
  sequelize.define('AuditLog', {
    id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id:     { type: DataTypes.INTEGER },
    action:      { type: DataTypes.STRING(100), allowNull: false },
    entity_type: { type: DataTypes.STRING(50) },
    entity_id:   { type: DataTypes.INTEGER },
    old_values:  { type: DataTypes.JSON },
    new_values:  { type: DataTypes.JSON },
    ip_address:  { type: DataTypes.STRING(45) },
    user_agent:  { type: DataTypes.TEXT },
  }, { tableName: 'audit_logs', underscored: true, updatedAt: false })
