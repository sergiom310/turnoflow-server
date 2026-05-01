const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const AuditLog = sequelize.define('AuditLog', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  business_id: { type: DataTypes.INTEGER, allowNull: true },
  user_id:     { type: DataTypes.INTEGER, allowNull: true },
  action:      { type: DataTypes.STRING(100), allowNull: false }, // 'login', 'create_business', 'upload_logo'…
  entity_type: { type: DataTypes.STRING(50) },                   // 'user', 'business', 'appointment'…
  entity_id:   { type: DataTypes.INTEGER },
  old_values:  { type: DataTypes.JSON },
  new_values:  { type: DataTypes.JSON },
  ip_address:  { type: DataTypes.STRING(45) },
  user_agent:  { type: DataTypes.TEXT },
}, {
  tableName: 'audit_logs',
  underscored: true,
  updatedAt: false,  // audit logs no se modifican
})

module.exports = AuditLog
