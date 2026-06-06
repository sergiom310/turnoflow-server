'use strict'
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('appointments', {
      id:               { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      client_id:        { type: Sequelize.INTEGER, allowNull: false, references: { model: 'clients',  key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      service_id:       { type: Sequelize.INTEGER, allowNull: false, references: { model: 'services', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      user_id:          { type: Sequelize.INTEGER, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      appointment_date: { type: Sequelize.DATE, allowNull: false },
      status:           { type: Sequelize.ENUM('pending', 'confirmed', 'completed', 'cancelled'), defaultValue: 'pending' },
      notes:            { type: Sequelize.TEXT },
      extra_fields:     { type: Sequelize.JSON },
      created_by:       { type: Sequelize.INTEGER, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      created_at:       { type: Sequelize.DATE, allowNull: false },
      updated_at:       { type: Sequelize.DATE, allowNull: false },
    })
    await queryInterface.addIndex('appointments', ['appointment_date'])
    await queryInterface.addIndex('appointments', ['status'])
    await queryInterface.addIndex('appointments', ['client_id'])
  },
  async down(queryInterface) { await queryInterface.dropTable('appointments') },
}
