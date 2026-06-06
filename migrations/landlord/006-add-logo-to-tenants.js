'use strict'

/** Agrega la columna logo_url a la tabla tenants del landlord */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('tenants', 'logo_url', {
      type:         Sequelize.STRING(500),
      allowNull:    true,
      defaultValue: null,
      after:        'phone',
    })
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('tenants', 'logo_url')
  },
}
