'use strict'
const landlordDb       = require('../../config/landlordDb')
const BusinessType     = require('./BusinessType')
const Tenant           = require('./Tenant')
const TenantPayment    = require('./TenantPayment')
const SubscriptionPlan = require('./SubscriptionPlan')
const SuperadminUser   = require('./SuperadminUser')
const PaymentMethod    = require('./PaymentMethod')

// ── Asociaciones ─────────────────────────────────────────────

BusinessType.hasMany(Tenant, { foreignKey: 'business_type_id', as: 'tenants' })
Tenant.belongsTo(BusinessType, { foreignKey: 'business_type_id', as: 'businessType' })

Tenant.hasMany(TenantPayment, { foreignKey: 'tenant_id', as: 'payments' })
TenantPayment.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' })

module.exports = {
  landlordDb,
  BusinessType,
  Tenant,
  TenantPayment,
  SubscriptionPlan,
  SuperadminUser,
  PaymentMethod,
}
