const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Subscription = sequelize.define('Subscription', {
  id:                      { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  business_id:             { type: DataTypes.INTEGER, allowNull: false },
  plan:                    {
    type: DataTypes.ENUM('free', 'basic', 'professional', 'enterprise'),
    defaultValue: 'free',
  },
  status:                  {
    type: DataTypes.ENUM('active', 'expired', 'pending', 'cancelled'),
    defaultValue: 'active',
  },
  start_date:              { type: DataTypes.DATEONLY },
  end_date:                { type: DataTypes.DATEONLY },
  price_cop:               { type: DataTypes.DECIMAL(10, 2) },
  max_users:               { type: DataTypes.INTEGER, defaultValue: 5 },
  max_appointments_month:  { type: DataTypes.INTEGER, defaultValue: 100 },
  features:                { type: DataTypes.JSON, defaultValue: {} },
  notes:                   { type: DataTypes.TEXT },
}, {
  tableName: 'subscriptions',
  underscored: true,
})

module.exports = Subscription
