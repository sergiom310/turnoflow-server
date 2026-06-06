'use strict'
/** @type {import('umzug').MigrationFn} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('business_types', {
      id:             { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name:           { type: Sequelize.STRING(100), allowNull: false, unique: true },
      slug:           { type: Sequelize.STRING(50),  allowNull: false, unique: true },
      description:    { type: Sequelize.TEXT },
      icon:           { type: Sequelize.STRING(10) },
      default_colors: { type: Sequelize.JSON },
      is_active:      { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at:     { type: Sequelize.DATE, allowNull: false },
      updated_at:     { type: Sequelize.DATE, allowNull: false },
    })
    await queryInterface.addIndex('business_types', ['slug'])
  },
  async down(queryInterface) {
    await queryInterface.dropTable('business_types')
  },
}
