'use strict'
const { DataTypes } = require('sequelize')
module.exports = (sequelize) =>
  sequelize.define('Promotion', {
    id:                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name:                { type: DataTypes.STRING(255), allowNull: false },
    description:         { type: DataTypes.TEXT },
    type:                { type: DataTypes.ENUM('discount', 'raffle', 'event', 'campaign', 'gift'), allowNull: false },
    discount_percentage: { type: DataTypes.DECIMAL(5, 2) },
    start_date:          { type: DataTypes.DATE },
    end_date:            { type: DataTypes.DATE },
    is_active:           { type: DataTypes.BOOLEAN, defaultValue: true },
  }, { tableName: 'promotions', underscored: true })
