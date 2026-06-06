'use strict'
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('promotions', {
      id:                  { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name:                { type: Sequelize.STRING(255), allowNull: false },
      description:         { type: Sequelize.TEXT },
      type:                { type: Sequelize.ENUM('discount', 'raffle', 'event', 'campaign', 'gift'), allowNull: false },
      discount_percentage: { type: Sequelize.DECIMAL(5, 2) },
      start_date:          { type: Sequelize.DATE },
      end_date:            { type: Sequelize.DATE },
      is_active:           { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at:          { type: Sequelize.DATE, allowNull: false },
      updated_at:          { type: Sequelize.DATE, allowNull: false },
    })
    await queryInterface.addIndex('promotions', ['is_active'])
  },
  async down(queryInterface) { await queryInterface.dropTable('promotions') },
}
