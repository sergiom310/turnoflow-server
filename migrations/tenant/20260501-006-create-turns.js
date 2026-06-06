'use strict'
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('turns', {
      id:             { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      appointment_id: { type: Sequelize.INTEGER, allowNull: false, unique: true, references: { model: 'appointments', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      turn_number:    { type: Sequelize.STRING(20), allowNull: false },
      status:         { type: Sequelize.ENUM('waiting', 'in_progress', 'completed', 'missed'), defaultValue: 'waiting' },
      called_at:      { type: Sequelize.DATE },
      completed_at:   { type: Sequelize.DATE },
      created_at:     { type: Sequelize.DATE, allowNull: false },
    })
    await queryInterface.addIndex('turns', ['status'])
    await queryInterface.addIndex('turns', ['turn_number'])
  },
  async down(queryInterface) { await queryInterface.dropTable('turns') },
}
