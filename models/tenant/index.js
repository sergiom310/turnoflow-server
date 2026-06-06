'use strict'
const defineRole              = require('./Role')
const defineUser              = require('./User')
const defineClient            = require('./Client')
const defineService           = require('./Service')
const defineAppointment       = require('./Appointment')
const defineTurn              = require('./Turn')
const defineInventory         = require('./Inventory')
const defineFinancialMovement = require('./FinancialMovement')
const definePromotion         = require('./Promotion')
const defineAuditLog          = require('./AuditLog')

/**
 * Factory — recibe una instancia Sequelize conectada a la BD de un tenant
 * y retorna todos los modelos con sus asociaciones.
 *
 * Uso:
 *   const { getTenantConnection } = require('../config/tenantDb')
 *   const { models } = await getTenantConnection(tenant.db_name)
 *   const clients = await models.Client.findAll()
 */
const defineTenantModels = (sequelize) => {
  const Role              = defineRole(sequelize)
  const User              = defineUser(sequelize)
  const Client            = defineClient(sequelize)
  const Service           = defineService(sequelize)
  const Appointment       = defineAppointment(sequelize)
  const Turn              = defineTurn(sequelize)
  const Inventory         = defineInventory(sequelize)
  const FinancialMovement = defineFinancialMovement(sequelize)
  const Promotion         = definePromotion(sequelize)
  const AuditLog          = defineAuditLog(sequelize)

  // Role ↔ User
  Role.hasMany(User, { foreignKey: 'role_id', as: 'users' })
  User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' })

  // User → Client (creador)
  User.hasMany(Client, { foreignKey: 'created_by', as: 'createdClients' })
  Client.belongsTo(User, { foreignKey: 'created_by', as: 'creator' })

  // Client ↔ Appointment
  Client.hasMany(Appointment, { foreignKey: 'client_id', as: 'appointments' })
  Appointment.belongsTo(Client, { foreignKey: 'client_id', as: 'client' })

  // Service ↔ Appointment
  Service.hasMany(Appointment, { foreignKey: 'service_id', as: 'appointments' })
  Appointment.belongsTo(Service, { foreignKey: 'service_id', as: 'service' })

  // User (empleado) ↔ Appointment
  User.hasMany(Appointment, { foreignKey: 'user_id', as: 'assignedAppointments' })
  Appointment.belongsTo(User, { foreignKey: 'user_id', as: 'assignedUser' })

  // Appointment ↔ Turn (1:1)
  Appointment.hasOne(Turn, { foreignKey: 'appointment_id', as: 'turn' })
  Turn.belongsTo(Appointment, { foreignKey: 'appointment_id', as: 'appointment' })

  // Appointment ↔ FinancialMovement
  Appointment.hasMany(FinancialMovement, { foreignKey: 'related_appointment_id', as: 'payments' })
  FinancialMovement.belongsTo(Appointment, { foreignKey: 'related_appointment_id', as: 'appointment' })

  // Inventory ↔ FinancialMovement
  Inventory.hasMany(FinancialMovement, { foreignKey: 'related_inventory_id', as: 'movements' })
  FinancialMovement.belongsTo(Inventory, { foreignKey: 'related_inventory_id', as: 'inventory' })

  return {
    Role, User, Client, Service, Appointment,
    Turn, Inventory, FinancialMovement, Promotion, AuditLog,
  }
}

module.exports = defineTenantModels
