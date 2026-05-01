const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Role = sequelize.define('Role', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:        { type: DataTypes.STRING(50), allowNull: false, unique: true },
  description: { type: DataTypes.TEXT },
  // Matriz de permisos JSON — ver auth_rbac_design.md para estructura completa
  permissions: { type: DataTypes.JSON, defaultValue: {} },
}, {
  tableName: 'roles',
  underscored: true,
})

module.exports = Role
