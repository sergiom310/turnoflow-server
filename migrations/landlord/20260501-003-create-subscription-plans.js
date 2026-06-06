'use strict'
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('subscription_plans', {
      id:                     { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name:                   { type: Sequelize.STRING(50), allowNull: false, unique: true },
      display_name:           { type: Sequelize.STRING(100), allowNull: false },
      price_cop:              { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      max_users:              { type: Sequelize.INTEGER, defaultValue: 3 },
      max_appointments_month: { type: Sequelize.INTEGER, defaultValue: 50 },
      features:               { type: Sequelize.JSON },
      is_active:              { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at:             { type: Sequelize.DATE, allowNull: false },
      updated_at:             { type: Sequelize.DATE, allowNull: false },
    })
  },
  async down(queryInterface) {
    await queryInterface.dropTable('subscription_plans')
  },
}
