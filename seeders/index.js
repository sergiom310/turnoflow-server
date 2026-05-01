/**
 * seeders/index.js
 *
 * Pobla la base de datos con datos iniciales necesarios para arrancar:
 *   1. Tipos de negocio (11)
 *   2. Roles con matrices de permisos (8)
 *   3. Usuario superadmin
 *
 * Uso: node seeders/index.js
 *
 * Es idempotente — usa findOrCreate, se puede ejecutar varias veces sin duplicar datos.
 */

require('dotenv').config()
const bcrypt = require('bcrypt')
const { sequelize, BusinessType, Role, User } = require('../models')

// ─────────────────────────────────────────────────────────────
// 1. TIPOS DE NEGOCIO
// ─────────────────────────────────────────────────────────────
const BUSINESS_TYPES = [
  {
    slug: 'beauty',       name: 'Belleza y Cuidado Personal', icon: '💇',
    description: 'Salones de belleza, peluquerías, barberías, centros de estética, manicuristas, pedicuristas, spa y masajistas.',
    default_colors: { primary: '#E91E63', secondary: '#F48FB1', accent: '#FFEB3B' },
  },
  {
    slug: 'health',       name: 'Salud y Bienestar', icon: '🏥',
    description: 'Consultorios médicos, clínicas, psicólogos, odontólogos, nutricionistas, terapias alternativas.',
    default_colors: { primary: '#1976D2', secondary: '#42A5F5', accent: '#4CAF50' },
  },
  {
    slug: 'fitness',      name: 'Actividad Física y Formación', icon: '🏋️',
    description: 'Gimnasios, entrenadores personales, clases grupales (yoga, baile, pilates, boxeo), profesores particulares.',
    default_colors: { primary: '#FF5722', secondary: '#FF9800', accent: '#FFC107' },
  },
  {
    slug: 'professional', name: 'Servicios Profesionales', icon: '🧾',
    description: 'Abogados, contadores, asesores financieros, consultores, agentes inmobiliarios.',
    default_colors: { primary: '#9C27B0', secondary: '#BA68C8', accent: '#E1BEE7' },
  },
  {
    slug: 'technical',    name: 'Servicios Técnicos', icon: '🛠️',
    description: 'Talleres de reparación, mecánicos automotrices, centros de diagnóstico vehicular.',
    default_colors: { primary: '#607D8B', secondary: '#90A4AE', accent: '#B0BEC5' },
  },
  {
    slug: 'restaurant',   name: 'Gastronomía', icon: '🧑‍🍳',
    description: 'Restaurantes con alta demanda, cafés con espacios limitados, food trucks.',
    default_colors: { primary: '#FF6F00', secondary: '#FFB74D', accent: '#FFF3E0' },
  },
  {
    slug: 'public',       name: 'Sector Público y Trámites', icon: '🏢',
    description: 'Notarías, oficinas de tránsito, EPS/IPS, centros de atención ciudadana.',
    default_colors: { primary: '#2E7D32', secondary: '#4CAF50', accent: '#81C784' },
  },
  {
    slug: 'veterinary',   name: 'Veterinarias y Spa Animales', icon: '🐾',
    description: 'Clínicas veterinarias, grooming, baños medicados, guarderías y hoteles para mascotas.',
    default_colors: { primary: '#795548', secondary: '#A1887F', accent: '#D7CCC8' },
  },
  {
    slug: 'education',    name: 'Educación', icon: '🎓',
    description: 'Instituciones educativas, academias, cursos y capacitación.',
    default_colors: { primary: '#FF9800', secondary: '#FFB74D', accent: '#FFF3E0' },
  },
  {
    slug: 'retail',       name: 'Comercio Minorista', icon: '🛍️',
    description: 'Tiendas, boutiques, comercios minoristas y servicios comerciales.',
    default_colors: { primary: '#7B1FA2', secondary: '#BA68C8', accent: '#E1BEE7' },
  },
  {
    slug: 'other',        name: 'Otros Servicios', icon: '🔧',
    description: 'Otros tipos de negocio que requieren sistema de turnos.',
    default_colors: { primary: '#546E7A', secondary: '#78909C', accent: '#B0BEC5' },
  },
]

// ─────────────────────────────────────────────────────────────
// 2. ROLES CON MATRICES DE PERMISOS
//    Fuente: auth_rbac_design.md
// ─────────────────────────────────────────────────────────────
const perm = (components, actions) => ({ components, actions })

const fullAccess  = { access: true, read: true, write: true,  delete: true  }
const readOnly    = { access: true, read: true, write: false, delete: false }
const writeAccess = { access: true, read: true, write: true,  delete: false }
const noAccess    = { access: false }

const ROLES = [
  {
    name: 'superadmin',
    description: 'Acceso total al sistema incluyendo Super Admin',
    permissions: perm(
      {
        dashboard: fullAccess, configuration: fullAccess, users: fullAccess,
        clients: fullAccess, agenda: fullAccess, servicios: fullAccess,
        turnos: fullAccess, cobrar: fullAccess, arqueo: fullAccess,
        inventario: fullAccess, promociones: fullAccess, reportes: fullAccess,
        superadmin: fullAccess,
      },
      { create_appointments: true, cancel_appointments: true, manage_finances: true,
        view_reports: true, manage_users: true, manage_roles: true, manage_business: true }
    ),
  },
  {
    name: 'administrador',
    description: 'Administración del negocio — puede configurar roles y usuarios',
    permissions: perm(
      {
        dashboard: writeAccess, configuration: writeAccess, users: fullAccess,
        clients: fullAccess, agenda: fullAccess, servicios: fullAccess,
        turnos: writeAccess, cobrar: writeAccess, arqueo: writeAccess,
        inventario: fullAccess, promociones: fullAccess, reportes: readOnly,
        superadmin: noAccess,
      },
      { create_appointments: true, cancel_appointments: true, manage_finances: true,
        view_reports: true, manage_users: true, manage_roles: true, manage_business: true }
    ),
  },
  {
    name: 'auditor',
    description: 'Solo lectura en reportes, bitácora, agenda y finanzas',
    permissions: perm(
      {
        dashboard: readOnly, configuration: noAccess, users: noAccess,
        clients: readOnly, agenda: readOnly, servicios: readOnly,
        turnos: readOnly, cobrar: readOnly, arqueo: readOnly,
        inventario: readOnly, promociones: readOnly, reportes: readOnly,
        superadmin: noAccess,
      },
      { create_appointments: false, cancel_appointments: false, manage_finances: false,
        view_reports: true, manage_users: false, manage_roles: false, manage_business: false }
    ),
  },
  {
    name: 'vendedor',
    description: 'Ventas, gestión de clientes y agenda',
    permissions: perm(
      {
        dashboard: readOnly, configuration: noAccess, users: noAccess,
        clients: writeAccess, agenda: writeAccess, servicios: readOnly,
        turnos: writeAccess, cobrar: noAccess, arqueo: noAccess,
        inventario: readOnly, promociones: writeAccess, reportes: noAccess,
        superadmin: noAccess,
      },
      { create_appointments: true, cancel_appointments: false, manage_finances: false,
        view_reports: false, manage_users: false, manage_roles: false, manage_business: false }
    ),
  },
  {
    name: 'cobrador',
    description: 'Operaciones financieras — caja, arqueo y cobros',
    permissions: perm(
      {
        dashboard: readOnly, configuration: noAccess, users: noAccess,
        clients: noAccess, agenda: noAccess, servicios: noAccess,
        turnos: writeAccess, cobrar: writeAccess, arqueo: writeAccess,
        inventario: noAccess, promociones: noAccess, reportes: readOnly,
        superadmin: noAccess,
      },
      { create_appointments: false, cancel_appointments: false, manage_finances: true,
        view_reports: true, manage_users: false, manage_roles: false, manage_business: false }
    ),
  },
  {
    name: 'asesor',
    description: 'Atención al cliente y agenda de citas',
    permissions: perm(
      {
        dashboard: readOnly, configuration: noAccess, users: noAccess,
        clients: writeAccess, agenda: writeAccess, servicios: noAccess,
        turnos: writeAccess, cobrar: noAccess, arqueo: noAccess,
        inventario: noAccess, promociones: readOnly, reportes: noAccess,
        superadmin: noAccess,
      },
      { create_appointments: true, cancel_appointments: true, manage_finances: false,
        view_reports: false, manage_users: false, manage_roles: false, manage_business: false }
    ),
  },
  {
    name: 'empleado',
    description: 'Funciones básicas — visualizar turnos y clientes',
    permissions: perm(
      {
        dashboard: readOnly, configuration: noAccess, users: noAccess,
        clients: readOnly, agenda: noAccess, servicios: noAccess,
        turnos: writeAccess, cobrar: noAccess, arqueo: noAccess,
        inventario: noAccess, promociones: noAccess, reportes: noAccess,
        superadmin: noAccess,
      },
      { create_appointments: false, cancel_appointments: false, manage_finances: false,
        view_reports: false, manage_users: false, manage_roles: false, manage_business: false }
    ),
  },
  {
    name: 'cliente',
    description: 'Portal del cliente — agendar citas y ver sus servicios',
    permissions: perm(
      {
        dashboard: readOnly, configuration: noAccess, users: noAccess,
        clients: readOnly, agenda: writeAccess, servicios: readOnly,
        turnos: readOnly, cobrar: noAccess, arqueo: noAccess,
        inventario: noAccess, promociones: readOnly, reportes: noAccess,
        superadmin: noAccess,
      },
      { create_appointments: true, cancel_appointments: true, manage_finances: false,
        view_reports: false, manage_users: false, manage_roles: false, manage_business: false }
    ),
  },
]

// ─────────────────────────────────────────────────────────────
// 3. USUARIO SUPERADMIN INICIAL
// ─────────────────────────────────────────────────────────────
const SUPERADMIN = {
  username:   'superadmin',
  password:   'super123',   // ← cambiar en producción
  first_name: 'Super',
  last_name:  'Admin',
  email:      'superadmin@turnoflow.co',
}

// ─────────────────────────────────────────────────────────────
// EJECUTAR
// ─────────────────────────────────────────────────────────────
const seed = async () => {
  try {
    await sequelize.authenticate()
    console.log('✅ Conexión a MySQL establecida')

    await sequelize.sync({ alter: true })
    console.log('✅ Tablas sincronizadas')

    // 1. Business types
    console.log('\n📌 Creando tipos de negocio...')
    for (const bt of BUSINESS_TYPES) {
      const [record, created] = await BusinessType.findOrCreate({
        where: { slug: bt.slug },
        defaults: bt,
      })
      console.log(`  ${created ? '  ✚' : '  ·'} ${record.name}`)
    }

    // 2. Roles
    console.log('\n📌 Creando roles...')
    for (const r of ROLES) {
      const [record, created] = await Role.findOrCreate({
        where: { name: r.name },
        defaults: r,
      })
      if (!created) {
        // Actualizar permisos si ya existía
        await record.update({ permissions: r.permissions, description: r.description })
      }
      console.log(`  ${created ? '  ✚' : '  ↻'} ${record.name}`)
    }

    // 3. Superadmin user
    console.log('\n📌 Creando usuario superadmin...')
    const superadminRole = await Role.findOne({ where: { name: 'superadmin' } })
    const passwordHash   = await bcrypt.hash(SUPERADMIN.password, 12)

    const [superUser, created] = await User.findOrCreate({
      where: { username: SUPERADMIN.username },
      defaults: {
        ...SUPERADMIN,
        password_hash: passwordHash,
        role_id:       superadminRole.id,
        business_id:   null,
        is_active:     true,
      },
    })
    console.log(`  ${created ? '  ✚' : '  ·'} ${superUser.username} (${created ? 'creado' : 'ya existía'})`)

    console.log('\n🎉 Seed completado exitosamente')
    console.log('─────────────────────────────────────────')
    console.log('  Login superadmin:')
    console.log(`  Usuario:   ${SUPERADMIN.username}`)
    console.log(`  Contraseña: ${SUPERADMIN.password}`)
    console.log('─────────────────────────────────────────\n')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error en seed:', error)
    process.exit(1)
  }
}

seed()
