'use strict'
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id:             { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      role_id:        { type: Sequelize.INTEGER, allowNull: false, references: { model: 'roles', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      first_name:     { type: Sequelize.STRING(100), allowNull: false },
      last_name:      { type: Sequelize.STRING(100), allowNull: false },
      identification: { type: Sequelize.STRING(50) },
      address:        { type: Sequelize.TEXT },
      phone:          { type: Sequelize.STRING(20) },
      email:          { type: Sequelize.STRING(255), unique: true },
      username:       { type: Sequelize.STRING(50), allowNull: false, unique: true },
      password_hash:  { type: Sequelize.STRING(255), allowNull: false },
      photo_url:      { type: Sequelize.STRING(500) },
      documents:      { type: Sequelize.JSON },
      is_active:      { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at:     { type: Sequelize.DATE, allowNull: false },
      updated_at:     { type: Sequelize.DATE, allowNull: false },
    })
    await queryInterface.addIndex('users', ['email'])
    await queryInterface.addIndex('users', ['username'])
  },
  async down(queryInterface) { await queryInterface.dropTable('users') },
}
