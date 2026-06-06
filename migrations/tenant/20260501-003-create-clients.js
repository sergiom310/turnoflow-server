'use strict'
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('clients', {
      id:             { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      first_name:     { type: Sequelize.STRING(100), allowNull: false },
      last_name:      { type: Sequelize.STRING(100), allowNull: false },
      identification: { type: Sequelize.STRING(50) },
      address:        { type: Sequelize.TEXT },
      phone:          { type: Sequelize.STRING(20) },
      email:          { type: Sequelize.STRING(255) },
      extra_fields:   { type: Sequelize.JSON },
      created_by:     { type: Sequelize.INTEGER, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      is_active:      { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at:     { type: Sequelize.DATE, allowNull: false },
      updated_at:     { type: Sequelize.DATE, allowNull: false },
    })
    await queryInterface.addIndex('clients', ['email'])
    await queryInterface.addIndex('clients', ['identification'])
  },
  async down(queryInterface) { await queryInterface.dropTable('clients') },
}
