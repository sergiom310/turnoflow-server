'use strict'
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('roles', {
      id:          { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name:        { type: Sequelize.STRING(50), allowNull: false, unique: true },
      description: { type: Sequelize.TEXT },
      permissions: { type: Sequelize.JSON },
      created_at:  { type: Sequelize.DATE, allowNull: false },
      updated_at:  { type: Sequelize.DATE, allowNull: false },
    })
  },
  async down(queryInterface) { await queryInterface.dropTable('roles') },
}
