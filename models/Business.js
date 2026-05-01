const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Business = sequelize.define('Business', {
  id:                   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  // Datos generales
  name:                 { type: DataTypes.STRING(255), allowNull: false },
  nit:                  { type: DataTypes.STRING(50) },
  tax_regime:           { type: DataTypes.STRING(50) },
  phone:                { type: DataTypes.STRING(20) },
  address:              { type: DataTypes.TEXT },
  city:                 { type: DataTypes.STRING(100) },
  email:                { type: DataTypes.STRING(255) },
  // Representante legal
  legal_representative: { type: DataTypes.STRING(255) },
  legal_id:             { type: DataTypes.STRING(50) },
  legal_phone:          { type: DataTypes.STRING(20) },
  // Redes sociales / web
  whatsapp:             { type: DataTypes.STRING(20) },
  instagram:            { type: DataTypes.STRING(100) },
  facebook:             { type: DataTypes.STRING(100) },
  website:              { type: DataTypes.STRING(500) },
  // Horarios
  opening_time:         { type: DataTypes.STRING(5) },   // "HH:MM"
  closing_time:         { type: DataTypes.STRING(5) },
  // Branding y descripción
  description:          { type: DataTypes.TEXT },
  logo_url:             { type: DataTypes.STRING(500) },  // ruta relativa a /uploads
  // Tipo y subtipo de negocio
  business_type_id:     { type: DataTypes.INTEGER },
  business_subtype:     { type: DataTypes.STRING(50) },   // 'barberia', 'odontologia'…
  // Config regional
  region:               { type: DataTypes.STRING(10), defaultValue: 'CO' },
  is_active:            { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'businesses',
  underscored: true,
})

module.exports = Business
