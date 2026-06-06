'use strict'

/** Agrega icon y description a la tabla subscription_plans */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('subscription_plans', 'icon', {
      type:         Sequelize.STRING(10),
      allowNull:    true,
      defaultValue: null,
      after:        'id',
    })
    await queryInterface.addColumn('subscription_plans', 'description', {
      type:         Sequelize.STRING(255),
      allowNull:    true,
      defaultValue: null,
      after:        'display_name',
    })
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('subscription_plans', 'icon')
    await queryInterface.removeColumn('subscription_plans', 'description')
  },
}
