'use strict'
const { DataTypes } = require('sequelize')
module.exports = (sequelize) =>
  sequelize.define('Appointment', {
    id:               { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    client_id:        { type: DataTypes.INTEGER, allowNull: false },
    service_id:       { type: DataTypes.INTEGER, allowNull: false },
    user_id:          { type: DataTypes.INTEGER },                  // empleado asignado
    appointment_date: { type: DataTypes.DATE, allowNull: false },
    status:           { type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled'), defaultValue: 'pending' },
    notes:            { type: DataTypes.TEXT },
    extra_fields:     { type: DataTypes.JSON },  // campos dinámicos (ej: placa vehículo, mascota)
    created_by:       { type: DataTypes.INTEGER },
  }, { tableName: 'appointments', underscored: true })
