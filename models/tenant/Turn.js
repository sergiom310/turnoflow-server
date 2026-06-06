'use strict'
const { DataTypes } = require('sequelize')
module.exports = (sequelize) =>
  sequelize.define('Turn', {
    id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    appointment_id: { type: DataTypes.INTEGER, allowNull: false },
    turn_number:    { type: DataTypes.STRING(20), allowNull: false },
    status:         { type: DataTypes.ENUM('waiting', 'in_progress', 'completed', 'missed'), defaultValue: 'waiting' },
    called_at:      { type: DataTypes.DATE },
    completed_at:   { type: DataTypes.DATE },
  }, { tableName: 'turns', underscored: true, updatedAt: false })
