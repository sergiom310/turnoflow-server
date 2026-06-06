'use strict'
const { DataTypes } = require('sequelize')
const landlordDb = require('../../config/landlordDb')

/** Usuarios del panel SuperAdmin (solo nosotros — no pertenecen a ningún tenant). */
const SuperadminUser = landlordDb.define('SuperadminUser', {
  id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username:      { type: DataTypes.STRING(50),  allowNull: false, unique: true },
  email:         { type: DataTypes.STRING(255), unique: true },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  first_name:    { type: DataTypes.STRING(100) },
  last_name:     { type: DataTypes.STRING(100) },
  is_active:     { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'superadmin_users', underscored: true })

module.exports = SuperadminUser
