const sequelize   = require('../config/database')
const BusinessType = require('./BusinessType')
const Role         = require('./Role')
const Business     = require('./Business')
const User         = require('./User')
const Subscription = require('./Subscription')
const AuditLog     = require('./AuditLog')

// ── Asociaciones ────────────────────────────────────────────

// BusinessType ↔ Business
BusinessType.hasMany(Business, { foreignKey: 'business_type_id', as: 'businesses' })
Business.belongsTo(BusinessType, { foreignKey: 'business_type_id', as: 'businessType' })

// Business ↔ User
Business.hasMany(User, { foreignKey: 'business_id', as: 'users' })
User.belongsTo(Business, { foreignKey: 'business_id', as: 'business' })

// Role ↔ User
Role.hasMany(User, { foreignKey: 'role_id', as: 'users' })
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' })

// Business ↔ Subscription (1:1)
Business.hasOne(Subscription, { foreignKey: 'business_id', as: 'subscription' })
Subscription.belongsTo(Business, { foreignKey: 'business_id', as: 'business' })

// AuditLog
Business.hasMany(AuditLog, { foreignKey: 'business_id', as: 'auditLogs' })
User.hasMany(AuditLog,     { foreignKey: 'user_id',     as: 'auditLogs' })

module.exports = { sequelize, BusinessType, Role, Business, User, Subscription, AuditLog }
