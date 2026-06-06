'use strict'
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('services', {
      id:               { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name:             { type: Sequelize.STRING(255), allowNull: false },
      description:      { type: Sequelize.TEXT },
      price:            { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      duration_minutes: { type: Sequelize.INTEGER },
      category:         { type: Sequelize.STRING(100) },
      is_active:        { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at:       { type: Sequelize.DATE, allowNull: false },
      updated_at:       { type: Sequelize.DATE, allowNull: false },
    })
    await queryInterface.addIndex('services', ['is_active'])
  },
  async down(queryInterface) { await queryInterface.dropTable('services') },
}
