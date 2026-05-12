# ALL ROADS

Plataforma SaaS modular de **gestión operativa y logística** para transporte empresarial.

> Diseñada con arquitectura escalable: monorepo, backend NestJS desacoplado, frontend Next.js (App Router), Prisma como ORM y SQLite por defecto para desarrollo (cambio trivial a PostgreSQL en producción).

---

## Stack

| Capa            | Tecnología                                           |
|-----------------|------------------------------------------------------|
| Frontend        | Next.js 14 (App Router) + React 18 + TailwindCSS    |
| UI              | Componentes propios estilo Shadcn/UI                |
| Backend         | NestJS 10 + TypeScript                              |
| ORM             | Prisma                                              |
| Base de datos   | SQLite (dev) / PostgreSQL (prod)                    |
| Autenticación   | JWT + Passport + Roles & permisos                   |
| Mapas           | Google Maps API (placeholder, listo para conectar)  |
| Excel           | SheetJS (XLSX)                                      |
| Hosting sugerido| Vercel (web) + Railway/Render (api) + Supabase (db) |

---

## Estructura del monorepo

```
all-roads/
├── apps/
│   ├── api/                # NestJS — backend modular
│   │   ├── prisma/         # schema.prisma + seed
│   │   └── src/
│   │       ├── auth/
│   │       ├── vehicles/
│   │       ├── drivers/
│   │       ├── hr/
│   │       ├── documents/
│   │       ├── maintenance/
│   │       ├── contracts/
│   │       ├── services/
│   │       ├── excel/
│   │       ├── operations/
│   │       ├── routes/     # rutas + Google Maps
│   │       ├── financial/
│   │       ├── dashboard/
│   │       ├── common/     # audit log, guards, decorators
│   │       └── prisma/     # PrismaService
│   └── web/                # Next.js — frontend SaaS
│       ├── app/
│       │   ├── (auth)/login
│       │   └── (dashboard)/
│       │       ├── dashboard
│       │       ├── vehicles
│       │       ├── drivers
│       │       ├── contracts
│       │       ├── services
│       │       ├── operations
│       │       ├── maintenance
│       │       └── financial
│       ├── components/     # sidebar, topbar, ui primitives
│       └── lib/            # api client, utils
└── package.json            # workspaces
```

---

## Quick start

```bash
# 1. Instalar dependencias
npm install

# 2. Crear DB, ejecutar migraciones y seed
npm run db:migrate
npm run db:seed

# 3. Levantar API + Web en paralelo
npm run dev
```

- API: http://localhost:4000/api
- Web: http://localhost:3000
- Swagger: http://localhost:4000/api/docs

### Credenciales seed
- **admin@allroads.co** / `Admin123!` (Administrador)
- **operaciones@allroads.co** / `Operaciones123!` (Operaciones)

---

## Módulos implementados

| # | Módulo                       | Backend | Frontend | Notas |
|---|------------------------------|---------|----------|-------|
| 1 | Vehículos                    | ✅      | ✅       | CRUD + documentos + semáforo vencimientos |
| 2 | Conductores                  | ✅      | ✅       | CRUD + geo residencia + asignación |
| 3 | Gestión humana               | ✅      | ✅       | Expediente digital con vencimientos |
| 4 | Operaciones (tablero)        | ✅      | ✅       | Kanban + motor de sugerencia |
| 5 | Contratos dinámicos          | ✅      | ✅       | Form builder con tipos de campo |
| 6 | Servicios                    | ✅      | ✅       | Formulario dinámico por contrato |
| 7 | Carga masiva Excel           | ✅      | ✅       | Plantilla auto-generada + validación |
| 8 | Rutas y georreferenciación   | ✅      | ✅       | Wrapper Google Maps + ruta manual |
| 9 | Financiero / producido       | ✅      | ✅       | Productos tarifarios + cálculo |
| 10| Dashboard gerencial          | ✅      | ✅       | KPIs + alertas + semáforos |

Todos los endpoints requieren JWT (excepto `/auth/login`) y validan roles vía `@Roles()`.

---

## Roles y permisos

`ADMIN`, `OPERACIONES`, `GESTION_HUMANA`, `MANTENIMIENTO`, `CONSULTA`.

Cada cambio sensible registra una entrada en `AuditLog` (quién, qué, cuándo).

---

## Pasar a PostgreSQL

En `apps/api/prisma/schema.prisma` cambiar:

```prisma
datasource db {
  provider = "postgresql"  // antes: "sqlite"
  url      = env("DATABASE_URL")
}
```

y definir `DATABASE_URL` en `.env`. Luego `npm run db:migrate`.

---

## Variables de entorno

`apps/api/.env`:
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="cambia-esto-en-produccion"
PORT=4000
GOOGLE_MAPS_API_KEY=""
```

`apps/web/.env.local`:
```
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=""
```

---

## Roadmap

- [ ] App móvil (React Native) para conductores
- [ ] Integración WhatsApp Business (notificaciones)
- [ ] Integración GPS real (tracking en vivo)
- [ ] Multiempresa (tenant isolation)
- [ ] Reportes PDF / exportación contable
- [ ] WebSockets para tablero de operaciones en tiempo real
