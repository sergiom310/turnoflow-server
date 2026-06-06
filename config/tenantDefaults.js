'use strict'
/**
 * Roles y permisos por defecto que se siembran en cada tenant nuevo.
 * Misma estructura que el seeder de landlord usa para su BD.
 */

const full  = { access: true,  read: true,  write: true,  delete: true  }
const read  = { access: true,  read: true,  write: false, delete: false }
const write = { access: true,  read: true,  write: true,  delete: false }
const none  = { access: false }
const perm  = (c, a) => ({ components: c, actions: a })

const DEFAULT_ROLES = [
  {
    name: 'administrador',
    description: 'Administración del negocio — puede configurar roles y usuarios',
    permissions: perm(
      { dashboard: write, configuration: write, users: full, clients: full, agenda: full,
        servicios: full, turnos: write, cobrar: write, arqueo: write,
        inventario: full, promociones: full, reportes: read },
      { create_appointments: true, cancel_appointments: true, manage_finances: true,
        view_reports: true, manage_users: true, manage_roles: true, manage_business: true }
    ),
  },
  {
    name: 'auditor',
    description: 'Solo lectura en reportes, bitácora, agenda y finanzas',
    permissions: perm(
      { dashboard: read, configuration: none, users: none, clients: read, agenda: read,
        servicios: read, turnos: read, cobrar: read, arqueo: read,
        inventario: read, promociones: read, reportes: read },
      { create_appointments: false, cancel_appointments: false, manage_finances: false,
        view_reports: true, manage_users: false, manage_roles: false, manage_business: false }
    ),
  },
  {
    name: 'vendedor',
    description: 'Ventas, gestión de clientes y agenda',
    permissions: perm(
      { dashboard: read, configuration: none, users: none, clients: write, agenda: write,
        servicios: read, turnos: write, cobrar: none, arqueo: none,
        inventario: read, promociones: write, reportes: none },
      { create_appointments: true, cancel_appointments: false, manage_finances: false,
        view_reports: false, manage_users: false, manage_roles: false, manage_business: false }
    ),
  },
  {
    name: 'cobrador',
    description: 'Operaciones financieras — caja, arqueo y cobros',
    permissions: perm(
      { dashboard: read, configuration: none, users: none, clients: none, agenda: none,
        servicios: none, turnos: write, cobrar: write, arqueo: write,
        inventario: none, promociones: none, reportes: read },
      { create_appointments: false, cancel_appointments: false, manage_finances: true,
        view_reports: true, manage_users: false, manage_roles: false, manage_business: false }
    ),
  },
  {
    name: 'asesor',
    description: 'Atención al cliente y agenda de citas',
    permissions: perm(
      { dashboard: read, configuration: none, users: none, clients: write, agenda: write,
        servicios: none, turnos: write, cobrar: none, arqueo: none,
        inventario: none, promociones: read, reportes: none },
      { create_appointments: true, cancel_appointments: true, manage_finances: false,
        view_reports: false, manage_users: false, manage_roles: false, manage_business: false }
    ),
  },
  {
    name: 'empleado',
    description: 'Funciones básicas — visualizar turnos y clientes',
    permissions: perm(
      { dashboard: read, configuration: none, users: none, clients: read, agenda: none,
        servicios: none, turnos: write, cobrar: none, arqueo: none,
        inventario: none, promociones: none, reportes: none },
      { create_appointments: false, cancel_appointments: false, manage_finances: false,
        view_reports: false, manage_users: false, manage_roles: false, manage_business: false }
    ),
  },
  {
    name: 'cliente',
    description: 'Portal del cliente — agendar citas y ver sus servicios',
    permissions: perm(
      { dashboard: read, configuration: none, users: none, clients: read, agenda: write,
        servicios: read, turnos: read, cobrar: none, arqueo: none,
        inventario: none, promociones: read, reportes: none },
      { create_appointments: true, cancel_appointments: true, manage_finances: false,
        view_reports: false, manage_users: false, manage_roles: false, manage_business: false }
    ),
  },
]

module.exports = { DEFAULT_ROLES }
