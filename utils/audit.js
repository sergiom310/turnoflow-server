'use strict'
const logger = require('./logger')

/**
 * Registra una acción en la tabla audit_logs del tenant (fire-and-forget).
 * Nunca interrumpe el flujo de la petición aunque falle.
 *
 * @param {object} models  — req.models (conexión al tenant)
 * @param {object} data
 * @param {number}  [data.user_id]
 * @param {string}   data.action
 * @param {string}  [data.entity_type]
 * @param {number}  [data.entity_id]
 * @param {object}  [data.old_values]
 * @param {object}  [data.new_values]
 * @param {string}  [data.ip_address]
 * @param {string}  [data.user_agent]
 */
const createAuditLog = async (models, data) => {
  if (!models?.AuditLog) return
  try {
    await models.AuditLog.create({
      user_id:     data.user_id     ?? null,
      action:      data.action,
      entity_type: data.entity_type ?? null,
      entity_id:   data.entity_id   ?? null,
      old_values:  data.old_values  ?? null,
      new_values:  data.new_values  ?? null,
      ip_address:  data.ip_address  ?? null,
      user_agent:  data.user_agent  ?? null,
    })
  } catch (error) {
    logger.error('Error al crear audit log:', error)
  }
}

module.exports = { createAuditLog }
