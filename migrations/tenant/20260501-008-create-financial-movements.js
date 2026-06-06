'use strict'
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('financial_movements', {
      id:                     { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id:                { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      type:                   { type: Sequelize.ENUM('income', 'expense'), allowNull: false },
      amount:                 { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      description:            { type: Sequelize.TEXT },
      payment_method:         { type: Sequelize.STRING(50) },
      related_appointment_id: { type: Sequelize.INTEGER, references: { model: 'appointments', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      related_inventory_id:   { type: Sequelize.INTEGER, references: { model: 'inventory',    key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      movement_date:          { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      created_at:             { type: Sequelize.DATE, allowNull: false },
    })
    await queryInterface.addIndex('financial_movements', ['type'])
    await queryInterface.addIndex('financial_movements', ['movement_date'])
  },
  async down(queryInterface) { await queryInterface.dropTable('financial_movements') },
}
