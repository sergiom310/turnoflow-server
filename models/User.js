const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const User = sequelize.define('User', {
  id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  business_id:   { type: DataTypes.INTEGER, allowNull: true }, // null = superadmin global
  role_id:       { type: DataTypes.INTEGER, allowNull: false },
  first_name:    { type: DataTypes.STRING(100), allowNull: false },
  last_name:     { type: DataTypes.STRING(100), allowNull: false },
  identification:{ type: DataTypes.STRING(50) },
  address:       { type: DataTypes.TEXT },
  phone:         { type: DataTypes.STRING(20) },
  email:         { type: DataTypes.STRING(255), unique: true },
  username:      { type: DataTypes.STRING(50), allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  photo_url:     { type: DataTypes.STRING(500) },
  documents:     { type: DataTypes.JSON, defaultValue: [] },  // array de URLs de documentos
  is_active:     { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'users',
  underscored: true,
})

module.exports = User
