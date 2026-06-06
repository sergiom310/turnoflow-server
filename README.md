# TurnoFlow — Backend (Node.js + Express)

API RESTful para el sistema de gestión de turnos y citas.
Configuración regional Colombia (es-CO, COP, DD/MM/YYYY, UTC-5).

---

## Tecnologías

| Tecnología | Uso |
|---|---|
| Node.js + Express | Framework HTTP |
| Sequelize | ORM para MySQL |
| JWT (jsonwebtoken) | Autenticación |
| bcrypt | Hash de contraseñas |
| Multer + Sharp | Subida y conversión de imágenes a WEBP |
| node-cron | Trabajos programados |
| Helmet | Cabeceras de seguridad HTTP |
| cors | CORS configurable |
| Winston / Morgan | Logging |
| Joi / express-validator | Validación de entrada |

---

## Inicio rápido (primera vez)

```bash
# 1. Instalar dependencias
pnpm install

# 2. Copiar variables de entorno y editar con tus credenciales MySQL
cp .env.example .env

# 3. Crear la BD landlord en MySQL/MariaDB
#    (si usas Docker con MariaDB)
docker exec -it <nombre_contenedor> mariadb -u root -p \
  -e "CREATE DATABASE IF NOT EXISTS turnoflow_landlord CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 4. Correr migraciones landlord (crea las 5 tablas centrales)
pnpm run migrate:landlord

# 5. Sembrar datos iniciales (11 tipos de negocio, 4 planes, superadmin)
pnpm run seed:landlord

# 6. Arrancar en modo desarrollo
pnpm run dev
```

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `pnpm run dev` | Servidor con nodemon (hot-reload) |
| `pnpm start` | Servidor en producción |
| `pnpm run migrate:landlord` | Corre migraciones en la BD landlord |
| `pnpm run migrate:landlord down` | Revierte la última migración landlord |
| `pnpm run migrate:tenant -- --all` | Corre migraciones en todos los tenants activos |
| `pnpm run migrate:tenant -- --db <nombre_bd>` | Corre migraciones en un tenant específico |
| `pnpm run seed:landlord` | Siembra tipos de negocio, planes y superadmin inicial |

> **Superadmin inicial:** usuario `superadmin` / contraseña `super123` — cambiar en producción.

## Variables de entorno

Crear archivo `.env` en la raíz de `/server` (ver `.env.example`):

```env
PORT=3001
NODE_ENV=development

# Base de datos (credenciales compartidas para landlord + todos los tenants)
DB_HOST=127.0.0.1
DB_PORT=3307        # Puerto expuesto por Docker (ajustar según contenedor)
DB_USER=root
DB_PASS=tu_password
DB_LANDLORD_NAME=turnoflow_landlord

# JWT — usar cadenas aleatorias largas en producción
JWT_SECRET=cambia_esto_por_cadena_aleatoria_segura_min32chars
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=otro_secreto_diferente_aleatorio_min32chars
JWT_REFRESH_EXPIRES_IN=7d

# Uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=3145728

# Auditoría
AUDIT_RETENTION_DAYS=90
```

> **Nota sobre JWT_SECRET:** es una clave privada que solo existe en el backend para firmar y verificar tokens. El frontend nunca la necesita ni la ve.

---

## Estructura de carpetas

```
server/
├── app.js                          # Punto de entrada
├── config/
│   ├── database.js                 # Conexión Sequelize
│   ├── config.js                   # Variables de configuración
│   └── cron.js                     # Registra los cron jobs
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── businessController.js
│   ├── clientController.js
│   ├── appointmentController.js
│   ├── serviceController.js
│   ├── inventoryController.js
│   ├── financialController.js
│   ├── promotionController.js
│   ├── reportController.js
│   └── turnController.js
├── models/
│   ├── index.js                    # Instancia Sequelize + asociaciones
│   ├── User.js
│   ├── Role.js
│   ├── Business.js
│   ├── BusinessType.js
│   ├── Client.js
│   ├── Appointment.js
│   ├── Service.js
│   ├── Turn.js
│   ├── Inventory.js
│   ├── FinancialMovement.js
│   ├── Promotion.js
│   ├── Subscription.js
│   ├── AuditLog.js
│   └── DatabaseBackup.js
├── routes/
│   ├── index.js                    # Router principal → /api/v1
│   ├── auth.js
│   ├── users.js
│   ├── businesses.js
│   ├── clients.js
│   ├── appointments.js
│   ├── services.js
│   ├── inventory.js
│   ├── financial.js
│   ├── promotions.js
│   ├── reports.js
│   └── turns.js
├── middleware/
│   ├── auth.js                     # Verifica JWT
│   ├── rbac.js                     # Verifica permisos por componente/acción
│   ├── upload.js                   # Multer + Sharp (conversión WEBP)
│   ├── validation.js               # Esquemas Joi
│   └── errorHandler.js             # Manejo centralizado de errores
├── utils/
│   ├── logger.js                   # Winston
│   ├── helpers.js
│   ├── cronJobs.js                 # Definición de todos los cron jobs
│   └── backup.js                   # Wrapper mysqldump
├── uploads/                        # Archivos subidos (no incluir en git)
│   ├── logo/
│   ├── usuarios/
│   ├── clientes/
│   └── documentos/
├── tests/
├── .env                            # Variables de entorno (no incluir en git)
├── .env.example                    # Plantilla de variables
├── package.json
└── README.md
```

---

## API RESTful — Endpoints

Base URL: `/api/v1`

### Auth
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/auth/login` | Login con username/password → JWT |
| POST | `/auth/refresh` | Renovar token con refresh token |
| POST | `/auth/logout` | Invalidar token |
| GET | `/auth/me` | Datos del usuario autenticado |

### Usuarios
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/users` | Listar usuarios del negocio |
| POST | `/users` | Crear usuario |
| GET | `/users/:id` | Detalle de usuario |
| PUT | `/users/:id` | Actualizar usuario |
| DELETE | `/users/:id` | Desactivar usuario |
| POST | `/users/:id/photo` | Subir foto |
| POST | `/users/:id/documents` | Subir documentos |

### Clientes
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/clients` | Listar clientes del negocio |
| POST | `/clients` | Crear cliente |
| GET | `/clients/:id` | Detalle |
| PUT | `/clients/:id` | Actualizar |
| DELETE | `/clients/:id` | Eliminar |

### Agenda (Citas)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/appointments` | Listar citas (filtros por fecha, estado, cliente) |
| POST | `/appointments` | Crear cita |
| GET | `/appointments/:id` | Detalle |
| PUT | `/appointments/:id` | Actualizar / cambiar estado |
| DELETE | `/appointments/:id` | Cancelar |

### Turnos
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/turns` | Turnos activos del día |
| POST | `/turns` | Generar turno desde cita |
| PUT | `/turns/:id/call` | Llamar turno |
| PUT | `/turns/:id/complete` | Completar turno |
| PUT | `/turns/:id/miss` | Marcar como perdido |

### Servicios
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/services` | Listar servicios |
| POST | `/services` | Crear servicio |
| PUT | `/services/:id` | Actualizar |
| DELETE | `/services/:id` | Desactivar |

### Inventario
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/inventory` | Listar productos |
| POST | `/inventory` | Crear producto |
| PUT | `/inventory/:id` | Actualizar |
| DELETE | `/inventory/:id` | Desactivar |

### Finanzas (Arqueo / Cobrar)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/financial` | Listar movimientos (filtros por fecha, tipo) |
| POST | `/financial` | Registrar movimiento |
| GET | `/financial/summary` | Resumen del día / cierre de caja |

### Promociones
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/promotions` | Listar promociones |
| POST | `/promotions` | Crear promoción |
| PUT | `/promotions/:id` | Actualizar |
| DELETE | `/promotions/:id` | Desactivar |

### Reportes
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/reports/daily` | Reporte diario |
| GET | `/reports/weekly` | Reporte semanal |
| GET | `/reports/monthly` | Reporte mensual |
| GET | `/reports/custom` | Reporte por rango de fechas |

### Negocios (Super Admin)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/businesses` | Listar empresas |
| POST | `/businesses` | Crear empresa |
| PUT | `/businesses/:id` | Actualizar empresa |
| GET | `/businesses/:id/config` | Obtener config del negocio |
| PUT | `/businesses/:id/config` | Actualizar config / tipo negocio |
| POST | `/businesses/:id/logo` | Subir logo |

### Roles y permisos
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/roles` | Listar roles |
| POST | `/roles` | Crear rol |
| PUT | `/roles/:id` | Actualizar permisos (JSON) |

### Bitácora (Audit Log)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/audit-logs` | Consultar bitácora (solo admin/auditor) |

---

## Formato de respuesta estándar

```json
{
  "success": true,
  "data": { ... },
  "message": "Mensaje opcional",
  "error": null
}
```

Errores:
```json
{
  "success": false,
  "data": null,
  "message": "Descripción del error",
  "error": "CÓDIGO_ERROR"
}
```

---

## Base de datos — MySQL

El esquema completo está en `database_schema.sql` (raíz del monorepo durante el desarrollo inicial).

### Campo `business_subtype` en tabla `businesses`

> **IMPORTANTE**: La tabla `businesses` necesita la columna `business_subtype` además de `business_type_id`.
> El **tipo** controla qué módulos aparecen en el sidebar.
> El **subtipo** controla los campos de formulario, etiquetas y catálogo de servicios por defecto.

```sql
ALTER TABLE businesses
  ADD COLUMN business_subtype VARCHAR(50) NULL COMMENT 'Subtipo del negocio (ej: barberia, spa_unas, odontologia)'
  AFTER business_type_id;
```

### Tabla `service_catalog` (catálogo maestro de servicios por subtipo)

Esta tabla almacena los servicios predefinidos por subtipo. Se usa al crear un nuevo negocio para pre-poblar sus servicios automáticamente.

```sql
CREATE TABLE service_catalog (
  id INT PRIMARY KEY AUTO_INCREMENT,
  business_type VARCHAR(50) NOT NULL,   -- ej: 'beauty'
  business_subtype VARCHAR(50) NOT NULL, -- ej: 'barberia'
  name VARCHAR(255) NOT NULL,
  duration_minutes INT,
  price DECIMAL(10,2),
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_type_subtype (business_type, business_subtype)
);
```

### Endpoint: obtener catálogo de servicios por subtipo

```
GET /api/v1/service-catalog?type=beauty&subtype=barberia
```

Respuesta:
```json
{
  "success": true,
  "data": [
    { "name": "Corte de cabello", "duration_minutes": 30, "price": 15000, "category": "Corte" },
    { "name": "Corte + Barba", "duration_minutes": 45, "price": 25000, "category": "Combo" }
  ]
}
```

### Endpoint: configuración del negocio (tipo + subtipo + labels + campos extra)

```
GET /api/v1/businesses/:id/config
```

Respuesta:
```json
{
  "success": true,
  "data": {
    "business_type": "beauty",
    "business_subtype": "barberia",
    "labels": {
      "client": "Cliente",
      "clients": "Clientes",
      "appointment": "Turno",
      "service": "Servicio"
    },
    "clientExtraFields": [],
    "appointmentExtraFields": [],
    "showInventory": true,
    "showTurnos": true
  }
}
```

> **Nota de arquitectura**: Los `labels`, `clientExtraFields` y `appointmentExtraFields` son configuración
> derivada del subtipo. Se pueden devolver desde el backend consultando la tabla `business_types` + lógica,
> o simplemente el frontend los resuelve con `businessConfig.js` una vez conoce el subtipo guardado.
> La segunda opción es más eficiente y es la implementada actualmente en el frontend.

### Tablas principales (15 + 1 nueva)

| Tabla | Descripción |
|---|---|
| `businesses` | Empresas registradas (incluye `business_subtype`) |
| `business_types` | Tipos de negocio con config y colores |
| `service_catalog` | Catálogo maestro de servicios por tipo+subtipo |
| `roles` | Roles con permisos JSON |
| `users` | Usuarios del sistema |
| `clients` | Clientes del negocio |
| `services` | Catálogo de servicios del negocio (personalizable) |
| `appointments` | Citas agendadas |
| `turns` | Turnos generados de citas |
| `inventory` | Productos/insumos |
| `financial_movements` | Ingresos y gastos |
| `promotions` | Promociones, rifas, eventos |
| `subscriptions` | Suscripciones por negocio |
| `audit_logs` | Bitácora de acciones |
| `database_backups` | Registro de backups |

### Crear la base de datos

```sql
CREATE DATABASE turnoflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Luego ejecutar `database_schema.sql`.

---

## Autenticación y RBAC

- JWT con expiración configurable (default 24h) + refresh token (7d)
- Permisos almacenados como JSON en `roles.permissions`
- Middleware `auth.js` valida el token en rutas protegidas
- Middleware `rbac.js` verifica acceso al componente/acción según rol

### Estructura de permisos por rol

```json
{
  "components": {
    "dashboard":     { "access": true,  "read": true, "write": false, "delete": false },
    "users":         { "access": true,  "read": true, "write": true,  "delete": true  },
    "clients":       { "access": true,  "read": true, "write": true,  "delete": false },
    "agenda":        { "access": true,  "read": true, "write": true,  "delete": false },
    "servicios":     { "access": true,  "read": true, "write": false, "delete": false },
    "turnos":        { "access": true,  "read": true, "write": true,  "delete": false },
    "cobrar":        { "access": false },
    "arqueo":        { "access": false },
    "inventario":    { "access": false },
    "promociones":   { "access": true,  "read": true, "write": false, "delete": false },
    "reportes":      { "access": false },
    "configuration": { "access": false },
    "superadmin":    { "access": false }
  },
  "actions": {
    "create_appointments": true,
    "cancel_appointments": false,
    "manage_finances": false,
    "view_reports": false
  }
}
```

---

## Subida de archivos

- Imágenes → convertidas a WEBP (calidad 80%, max 1200x1200) con Sharp
- Documentos (PDF, DOC, DOCX, TXT) → guardados tal cual
- Tamaño máximo: 3MB por archivo
- Máximo 5 archivos por request
- Servidos estáticamente desde `/uploads/`

---

## CRON Jobs

| Job | Schedule | Descripción |
|---|---|---|
| Backup automático BD | `0 2 * * *` | Diario a las 2am |
| Verificar suscripciones | `0 0 * * *` | Bloquea negocios con suscripción vencida |
| Limpieza audit logs | `0 3 * * 0` | Semanal, retención configurable |
| Reportes automáticos | `0 6 * * *` | Diario / semanal / mensual |
| Recordatorios de citas | `*/15 * * * *` | Cada 15 min (1h antes de la cita) |
| Health check | `0 * * * *` | Cada hora |

---

## Seguridad (OWASP)

- Helmet para cabeceras HTTP seguras
- Rate limiting en endpoints de auth
- bcrypt para hash de contraseñas (saltRounds ≥ 12)
- Validación de entrada en todos los endpoints (Joi)
- CORS restrictivo (solo origen frontend)
- Sin datos sensibles en logs
- CSRF: tokens httpOnly para ambientes de producción
- Auditoría de cambios de permisos en bitácora
