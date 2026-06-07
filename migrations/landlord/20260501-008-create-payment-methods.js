'use strict'

/** Tabla de métodos de pago disponibles para registrar cobros a tenants */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payment_methods', {
      id:          { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name:        { type: Sequelize.STRING(50),  allowNull: false, unique: true },
      display_name:{ type: Sequelize.STRING(100), allowNull: false },
      icon:        { type: Sequelize.STRING(10),  allowNull: true },
      description: { type: Sequelize.STRING(255), allowNull: true },
      is_active:   { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at:  { type: Sequelize.DATE, allowNull: false },
      updated_at:  { type: Sequelize.DATE, allowNull: false },
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('payment_methods')
  },
}
