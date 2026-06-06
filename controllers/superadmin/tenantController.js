'use strict'
const { Tenant, BusinessType, TenantPayment } = require('../../models/landlord')
const { provisionTenant, getDbName }          = require('../../utils/tenantProvisioner')
const { sendSuccess, sendError, sendCreated } = require('../../utils/response')
const logger = require('../../utils/logger')

const getAll = async (req, res) => {
  try {
    const tenants = await Tenant.findAll({
      include: [{ model: BusinessType, as: 'businessType', attributes: ['id', 'name', 'slug', 'icon'] }],
      order: [['created_at', 'DESC']],
    })
    return sendSuccess(res, tenants)
  } catch (error) {
    logger.error('Error en getAll tenants:', error)
    return sendError(res, 'Error al obtener tenants', 500, 'SERVER_ERROR')
  }
}

const getOne = async (req, res) => {
  try {
    const tenant = await Tenant.findByPk(req.params.id, {
      include: [{ model: BusinessType, as: 'businessType' }, { model: TenantPayment, as: 'payments' }],
    })
    if (!tenant) return sendError(res, 'Tenant no encontrado', 404, 'NOT_FOUND')
    return sendSuccess(res, tenant)
  } catch (error) {
    logger.error('Error en getOne tenant:', error)
    return sendError(res, 'Error al obtener el tenant', 500, 'SERVER_ERROR')
  }
}

const create = async (req, res) => {
  try {
    const { name, subdomain, email, phone, business_type_id, business_subtype, plan, admin_user } = req.body

    const existing = await Tenant.findOne({ where: { subdomain } })
    if (existing) return sendError(res, 'El subdominio ya está en uso', 409, 'SUBDOMAIN_TAKEN')

    const db_name = getDbName(subdomain)
    const tenant  = await Tenant.create({
      name, subdomain, db_name, email, phone,
      business_type_id, business_subtype,
      plan: plan || 'free',
      is_active: true,
    })

    // Provisionar: crea BD + migraciones + roles + admin inicial
    await provisionTenant(tenant, admin_user || null)

    const result = await Tenant.findByPk(tenant.id, {
      include: [{ model: BusinessType, as: 'businessType' }],
    })
    return sendCreated(res, result, `Tenant creado. BD: ${db_name}`)
  } catch (error) {
    logger.error('Error en create tenant:', error)
    return sendError(res, 'Error al crear el tenant', 500, 'SERVER_ERROR')
  }
}

const update = async (req, res) => {
  try {
    const tenant = await Tenant.findByPk(req.params.id)
    if (!tenant) return sendError(res, 'Tenant no encontrado', 404, 'NOT_FOUND')

    // Subdomain y db_name son inmutables una vez creados
    const { subdomain: _s, db_name: _d, ...updateData } = req.body
    await tenant.update(updateData)
    return sendSuccess(res, tenant, 'Tenant actualizado')
  } catch (error) {
    logger.error('Error en update tenant:', error)
    return sendError(res, 'Error al actualizar el tenant', 500, 'SERVER_ERROR')
  }
}

const toggleActive = async (req, res) => {
  try {
    const tenant = await Tenant.findByPk(req.params.id)
    if (!tenant) return sendError(res, 'Tenant no encontrado', 404, 'NOT_FOUND')
    await tenant.update({ is_active: !tenant.is_active })
    return sendSuccess(res, tenant, tenant.is_active ? 'Tenant activado' : 'Tenant desactivado')
  } catch (error) {
    logger.error('Error en toggleActive:', error)
    return sendError(res, 'Error al cambiar estado del tenant', 500, 'SERVER_ERROR')
  }
}

const getPayments = async (req, res) => {
  try {
    const payments = await TenantPayment.findAll({
      where: { tenant_id: req.params.id },
      order: [['created_at', 'DESC']],
    })
    return sendSuccess(res, payments)
  } catch (error) {
    logger.error('Error en getPayments:', error)
    return sendError(res, 'Error al obtener pagos', 500, 'SERVER_ERROR')
  }
}

const registerPayment = async (req, res) => {
  try {
    const tenant = await Tenant.findByPk(req.params.id)
    if (!tenant) return sendError(res, 'Tenant no encontrado', 404, 'NOT_FOUND')

    const payment = await TenantPayment.create({ ...req.body, tenant_id: tenant.id })

    // Actualizar plan en tenant si el pago es completado
    if (payment.status === 'completed') {
      await tenant.update({ plan: payment.plan })
    }
    return sendCreated(res, payment, 'Pago registrado')
  } catch (error) {
    logger.error('Error en registerPayment:', error)
    return sendError(res, 'Error al registrar el pago', 500, 'SERVER_ERROR')
  }
}

const deleteTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findByPk(req.params.id)
    if (!tenant) return sendError(res, 'Tenant no encontrado', 404, 'NOT_FOUND')
    // Solo eliminamos el registro del landlord; la BD del tenant queda como respaldo
    await TenantPayment.destroy({ where: { tenant_id: tenant.id } })
    await tenant.destroy()
    return sendSuccess(res, null, 'Tenant eliminado')
  } catch (error) {
    logger.error('Error en deleteTenant:', error)
    return sendError(res, 'Error al eliminar el tenant', 500, 'SERVER_ERROR')
  }
}

const getAllPayments = async (req, res) => {
  try {
    const payments = await TenantPayment.findAll({
      include: [{ model: Tenant, as: 'tenant', attributes: ['id', 'name', 'subdomain', 'plan'] }],
      order: [['created_at', 'DESC']],
      limit: 100,
    })
    return sendSuccess(res, payments)
  } catch (error) {
    logger.error('Error en getAllPayments:', error)
    return sendError(res, 'Error al obtener pagos', 500, 'SERVER_ERROR')
  }
}

module.exports = { getAll, getOne, create, update, toggleActive, getPayments, registerPayment, deleteTenant, getAllPayments }
