'use strict'
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('inventory', {
      id:          { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name:        { type: Sequelize.STRING(255), allowNull: false },
      description: { type: Sequelize.TEXT },
      quantity:    { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      unit_price:  { type: Sequelize.DECIMAL(10, 2) },
      category:    { type: Sequelize.STRING(100) },
      is_active:   { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at:  { type: Sequelize.DATE, allowNull: false },
      updated_at:  { type: Sequelize.DATE, allowNull: false },
    })
    await queryInterface.addIndex('inventory', ['category'])
  },
  async down(queryInterface) { await queryInterface.dropTable('inventory') },
}
