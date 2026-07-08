#!/usr/bin/env node
'use strict'
/**
 * scripts/seedLandlord.js
 *
 * Siembra datos iniciales en la BD landlord:
 *   - 11 tipos de negocio
 *   - 4 planes de suscripción
 *   - 1 usuario superadmin
 *
 * Es idempotente (usa findOrCreate).
 * Uso: pnpm run seed:landlord
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') })
const bcrypt = require('bcrypt')
const { landlordDb, BusinessType, SubscriptionPlan, SuperadminUser } = require('../models/landlord')

// ── Tipos de negocio ─────────────────────────────────────────
const BUSINESS_TYPES = [
  { slug: 'beauty',       name: 'Belleza y Cuidado Personal', icon: '💇', description: 'Salones de belleza, peluquerías, barberías, estética, manicuristas, spa.', default_colors: { primary: '#E91E63', secondary: '#F48FB1', accent: '#FFEB3B' } },
  { slug: 'health',       name: 'Salud y Bienestar',           icon: '🏥', description: 'Consultorios médicos, clínicas, psicólogos, odontólogos, nutricionistas.', default_colors: { primary: '#1976D2', secondary: '#42A5F5', accent: '#4CAF50' } },
  { slug: 'fitness',      name: 'Actividad Física y Formación',icon: '🏋️', description: 'Gimnasios, entrenadores personales, yoga, baile, pilates, profesores.', default_colors: { primary: '#FF5722', secondary: '#FF9800', accent: '#FFC107' } },
  { slug: 'professional', name: 'Servicios Profesionales',     icon: '🧾', description: 'Abogados, contadores, asesores financieros, consultores, inmobiliarias.', default_colors: { primary: '#9C27B0', secondary: '#BA68C8', accent: '#E1BEE7' } },
  { slug: 'technical',    name: 'Servicios Técnicos',          icon: '🛠️', description: 'Talleres de reparación, mecánicos automotrices, diagnóstico vehicular.', default_colors: { primary: '#607D8B', secondary: '#90A4AE', accent: '#B0BEC5' } },
  { slug: 'restaurant',   name: 'Gastronomía',                 icon: '🧑‍🍳', description: 'Restaurantes, cafés con espacios limitados, food trucks.', default_colors: { primary: '#FF6F00', secondary: '#FFB74D', accent: '#FFF3E0' } },
  { slug: 'public',       name: 'Sector Público y Trámites',   icon: '🏢', description: 'Notarías, oficinas de tránsito, EPS/IPS, centros de atención ciudadana.', default_colors: { primary: '#2E7D32', secondary: '#4CAF50', accent: '#81C784' } },
  { slug: 'veterinary',   name: 'Veterinarias y Spa Animales', icon: '🐾', description: 'Clínicas veterinarias, grooming, baños medicados, hoteles para mascotas.', default_colors: { primary: '#795548', secondary: '#A1887F', accent: '#D7CCC8' } },
  { slug: 'education',    name: 'Educación',                   icon: '🎓', description: 'Instituciones educativas, academias, cursos y capacitación.', default_colors: { primary: '#FF9800', secondary: '#FFB74D', accent: '#FFF3E0' } },
  { slug: 'retail',       name: 'Comercio Minorista',          icon: '🛍️', description: 'Tiendas, boutiques, comercios minoristas y servicios comerciales.', default_colors: { primary: '#7B1FA2', secondary: '#BA68C8', accent: '#E1BEE7' } },
  { slug: 'other',        name: 'Otros Servicios',             icon: '🔧', description: 'Otros tipos de negocio que requieren sistema de turnos.', default_colors: { primary: '#546E7A', secondary: '#78909C', accent: '#B0BEC5' } },
]

// ── Planes ───────────────────────────────────────────────────
const PLANS = [
  { name: 'free',         display_name: 'Gratuito',      price_cop: 0,      max_users: 3,   max_appointments_month: 50,   features: { support: 'community' } },
  { name: 'basic',        display_name: 'Básico',        price_cop: 49900,  max_users: 10,  max_appointments_month: 300,  features: { support: 'email' } },
  { name: 'professional', display_name: 'Profesional',   price_cop: 119900, max_users: 30,  max_appointments_month: 1000, features: { support: 'priority', reports: true } },
  { name: 'enterprise',   display_name: 'Empresarial',   price_cop: 299900, max_users: 999, max_appointments_month: 99999,features: { support: 'dedicated', reports: true, api_access: true } },
]

const SUPERADMIN = {
  username:   'superadmin',
  first_name: 'Super',
  last_name:  'Admin',
  email:      'superadmin@turnoflow.co',
}

const seed = async () => {
  try {
    await landlordDb.authenticate()
    console.log(`✅ Conectado a landlord: ${require('../config/config').DB_LANDLORD_NAME}`)

    // Tipos de negocio
    console.log('\n📌 Tipos de negocio...')
    for (const bt of BUSINESS_TYPES) {
      const [, created] = await BusinessType.findOrCreate({ where: { slug: bt.slug }, defaults: bt })
      console.log(`  ${created ? '✚' : '·'} ${bt.name}`)
    }

    // Planes de suscripción
    console.log('\n📌 Planes de suscripción...')
    for (const plan of PLANS) {
      const [, created] = await SubscriptionPlan.findOrCreate({ where: { name: plan.name }, defaults: plan })
      console.log(`  ${created ? '✚' : '·'} ${plan.display_name} — $${plan.price_cop.toLocaleString('es-CO')} COP`)
    }

    // Superadmin
    console.log('\n📌 Usuario superadmin...')
    const hash = await bcrypt.hash(SUPERADMIN.password, 12)
    const [user, created] = await SuperadminUser.findOrCreate({
      where:    { username: SUPERADMIN.username },
      defaults: { ...SUPERADMIN, password_hash: hash, is_active: true },
    })
    console.log(`  ${created ? '✚' : '·'} ${user.username} (${created ? 'creado' : 'ya existía'})`)

    console.log('\n🎉 Seed landlord completado')
    console.log('─────────────────────────────────────')
    console.log(`  Login: ${SUPERADMIN.username} / ${SUPERADMIN.password}`)
    console.log('─────────────────────────────────────\n')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error en seed:', error)
    process.exit(1)
  }
}

seed()
