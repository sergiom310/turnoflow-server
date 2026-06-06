'use strict'
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('audit_logs', {
      id:          { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id:     { type: Sequelize.INTEGER },
      action:      { type: Sequelize.STRING(100), allowNull: false },
      entity_type: { type: Sequelize.STRING(50) },
      entity_id:   { type: Sequelize.INTEGER },
      old_values:  { type: Sequelize.JSON },
      new_values:  { type: Sequelize.JSON },
      ip_address:  { type: Sequelize.STRING(45) },
      user_agent:  { type: Sequelize.TEXT },
      created_at:  { type: Sequelize.DATE, allowNull: false },
    })
    await queryInterface.addIndex('audit_logs', ['action'])
    await queryInterface.addIndex('audit_logs', ['entity_type', 'entity_id'])
  },
  async down(queryInterface) { await queryInterface.dropTable('audit_logs') },
}
