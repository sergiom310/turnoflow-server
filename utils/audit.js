const { AuditLog } = require('../models')
const logger = require('./logger')

/**
 * Crea un registro de auditoría sin interrumpir el flujo principal.
 * Si falla, solo registra el error en el logger — no propaga la excepción.
 *
 * @param {Object} params
 * @param {number}  params.business_id
 * @param {number}  params.user_id
 * @param {string}  params.action       - 'login' | 'create_business' | 'upload_logo' | etc.
 * @param {string}  [params.entity_type]
 * @param {number}  [params.entity_id]
 * @param {Object}  [params.old_values]
 * @param {Object}  [params.new_values]
 * @param {string}  [params.ip_address]
 * @param {string}  [params.user_agent]
 */
const createAuditLog = async ({
  business_id = null,
  user_id     = null,
  action,
  entity_type = null,
  entity_id   = null,
  old_values  = null,
  new_values  = null,
  ip_address  = null,
  user_agent  = null,
}) => {
  try {
    await AuditLog.create({
      business_id,
      user_id,
      action,
      entity_type,
      entity_id,
      old_values,
      new_values,
      ip_address,
      user_agent,
    })
  } catch (err) {
    logger.error('Error al crear audit log:', err)
  }
}

module.exports = { createAuditLog }
