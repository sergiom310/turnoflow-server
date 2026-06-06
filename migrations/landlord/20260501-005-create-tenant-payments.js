'use strict'
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tenant_payments', {
      id:             { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      tenant_id:      {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      plan:           { type: Sequelize.ENUM('free', 'basic', 'professional', 'enterprise'), allowNull: false },
      amount_cop:     { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      payment_method: { type: Sequelize.STRING(50) },
      status:         { type: Sequelize.ENUM('pending', 'completed', 'failed', 'refunded'), defaultValue: 'pending' },
      reference:      { type: Sequelize.STRING(255) },
      period_start:   { type: Sequelize.DATEONLY },
      period_end:     { type: Sequelize.DATEONLY },
      notes:          { type: Sequelize.TEXT },
      created_at:     { type: Sequelize.DATE, allowNull: false },
      updated_at:     { type: Sequelize.DATE, allowNull: false },
    })
    await queryInterface.addIndex('tenant_payments', ['tenant_id'])
    await queryInterface.addIndex('tenant_payments', ['status'])
  },
  async down(queryInterface) {
    await queryInterface.dropTable('tenant_payments')
  },
}
