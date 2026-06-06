'use strict'
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('superadmin_users', {
      id:            { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      username:      { type: Sequelize.STRING(50), allowNull: false, unique: true },
      email:         { type: Sequelize.STRING(255), unique: true },
      password_hash: { type: Sequelize.STRING(255), allowNull: false },
      first_name:    { type: Sequelize.STRING(100) },
      last_name:     { type: Sequelize.STRING(100) },
      is_active:     { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at:    { type: Sequelize.DATE, allowNull: false },
      updated_at:    { type: Sequelize.DATE, allowNull: false },
    })
  },
  async down(queryInterface) {
    await queryInterface.dropTable('superadmin_users')
  },
}
