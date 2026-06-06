'use strict'
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tenants', {
      id:               { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name:             { type: Sequelize.STRING(255), allowNull: false },
      subdomain:        { type: Sequelize.STRING(100), allowNull: false, unique: true },
      db_name:          { type: Sequelize.STRING(100), allowNull: false, unique: true },
      email:            { type: Sequelize.STRING(255) },
      phone:            { type: Sequelize.STRING(20) },
      business_type_id: {
        type: Sequelize.INTEGER,
        references: { model: 'business_types', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'SET NULL',
      },
      business_subtype: { type: Sequelize.STRING(50) },
      plan:             { type: Sequelize.ENUM('free', 'basic', 'professional', 'enterprise'), defaultValue: 'free' },
      is_active:        { type: Sequelize.BOOLEAN, defaultValue: true },
      notes:            { type: Sequelize.TEXT },
      created_at:       { type: Sequelize.DATE, allowNull: false },
      updated_at:       { type: Sequelize.DATE, allowNull: false },
    })
    await queryInterface.addIndex('tenants', ['subdomain'])
    await queryInterface.addIndex('tenants', ['is_active'])
  },
  async down(queryInterface) {
    await queryInterface.dropTable('tenants')
  },
}
