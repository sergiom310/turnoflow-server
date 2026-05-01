const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const BusinessType = sequelize.define('BusinessType', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:        { type: DataTypes.STRING(100), allowNull: false, unique: true },
  slug:        { type: DataTypes.STRING(50),  allowNull: false, unique: true }, // 'beauty', 'health'…
  description: { type: DataTypes.TEXT },
  icon:        { type: DataTypes.STRING(10) },                                  // emoji
  default_colors: { type: DataTypes.JSON },                                     // { primary, secondary, accent }
  is_active:   { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'business_types',
  underscored: true,
})

module.exports = BusinessType
