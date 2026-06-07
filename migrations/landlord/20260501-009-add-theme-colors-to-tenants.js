'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('tenants', 'theme_colors', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: null,
      comment: 'Colores personalizados del tenant. Si es null se usan los default_colors del business_type.',
    })
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('tenants', 'theme_colors')
  },
}
