# Deploy de ALL ROADS — Vercel + Railway

Guía paso a paso para poner la plataforma online y acceder desde una URL pública.

**Arquitectura:**
- **Frontend (Next.js)** → Vercel
- **Backend (NestJS) + PostgreSQL** → Railway
- **Repo Git** → GitHub (`danelolarte-spec/ALL-ROADS`)

Tiempo estimado: **15–20 minutos**.

---

## Pre-requisitos

- Cuenta en [GitHub](https://github.com) (ya la tienes)
- Cuenta en [Railway](https://railway.app) — login con GitHub
- Cuenta en [Vercel](https://vercel.com) — login con GitHub
- Branch mergeada a `main` (al final de esta guía hay un PR listo)

---

## Parte 1 — Backend + PostgreSQL en Railway

### 1.1 Crear el proyecto

1. Ve a https://railway.app/new
2. Click **"Deploy from GitHub repo"**
3. Autoriza Railway a leer tu repo y selecciona **`danelolarte-spec/ALL-ROADS`**
4. Railway detecta el `railway.json` y el `Dockerfile`. Confírmalo.

### 1.2 Agregar PostgreSQL

1. En el dashboard del proyecto, click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
2. Espera 30s a que se cree. Railway automáticamente expone la variable `DATABASE_URL` dentro de la red interna.

### 1.3 Conectar la API a la base de datos

1. En tu servicio **API**, ve a **Variables**
2. Agrega:

   | Variable | Valor |
   |---|---|
   | `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` *(referencia a la DB)* |
   | `JWT_SECRET` | *(genera uno fuerte:* `openssl rand -base64 32` *)* |
   | `JWT_EXPIRES_IN` | `7d` |
   | `PORT` | `4000` |
   | `CORS_ORIGIN` | `https://TU-PROYECTO.vercel.app` *(lo pones después de Vercel)* |
   | `GOOGLE_MAPS_API_KEY` | *(opcional, si tienes)* |

3. Click **Deploy**. Railway hará build con Docker (~3 min).

### 1.4 Exponer la API públicamente

1. En el servicio API, ve a **Settings** → **Networking**
2. Click **"Generate Domain"**
3. Te dan algo como `all-roads-api-production.up.railway.app`
4. Visita `https://all-roads-api-production.up.railway.app/api/docs` — deberías ver Swagger ✅

### 1.5 Cargar datos demo (seed)

Una sola vez, desde la consola de Railway o tu terminal:

```bash
# Desde Railway CLI (recomendado)
railway login
railway link  # selecciona el proyecto
railway run --service api npm --workspace apps/api run prisma:seed
```

O ejecuta el seed manualmente con la `DATABASE_URL` pública de Railway.

---

## Parte 2 — Frontend en Vercel

### 2.1 Importar el repo

1. Ve a https://vercel.com/new
2. Selecciona **`danelolarte-spec/ALL-ROADS`** y click **Import**

### 2.2 Configurar el proyecto

En la pantalla de configuración:

- **Framework Preset:** Next.js *(auto-detectado)*
- **Root Directory:** `apps/web` *(click "Edit" y selecciona la carpeta)*
- **Build Command:** *(deja el default, `vercel.json` lo cubre)*
- **Output Directory:** *(default)*
- **Install Command:** *(default)*

### 2.3 Variables de entorno

Click **"Environment Variables"** y agrega:

| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://all-roads-api-production.up.railway.app/api` *(la URL de Railway + `/api`)* |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | *(opcional)* |

### 2.4 Deploy

Click **"Deploy"**. Vercel hará build (~2 min). Te darán una URL tipo `https://all-roads.vercel.app`.

### 2.5 Activar CORS en el backend

Vuelve a Railway → variables del servicio API y actualiza:

```
CORS_ORIGIN=https://all-roads.vercel.app
```

Railway redespliega automáticamente. ✅

---

## Parte 3 — Verificar

1. Abre **`https://all-roads.vercel.app`**
2. Login con `admin@allroads.co` / `Admin123!`
3. Debes ver el dashboard con los datos del seed

Si Vercel devuelve error de CORS al hacer login: revisa que `CORS_ORIGIN` en Railway coincida exactamente con la URL de Vercel (sin `/` al final).

---

## Costos estimados

| Servicio | Free tier | Costo si crece |
|---|---|---|
| Vercel | Hobby gratis (suficiente para SaaS pequeño) | $20/mes Pro |
| Railway | $5 trial al registrarse, luego $5/mes mínimo | uso/recursos |
| Total inicio | **~$5/mes** | escala con tráfico |

> Para 100% gratis al inicio puedes usar **Render** (free tier con sleep tras 15 min de inactividad) en lugar de Railway. Mismos pasos pero usando un `render.yaml`.

---

## Pasar a `prisma migrate deploy` (recomendado en producción real)

El Dockerfile usa `prisma db push` (más simple, sin archivos de migración). Para tener historial de cambios:

1. En local: `cd apps/api && npx prisma migrate dev --name init`
2. Commitea la carpeta `apps/api/prisma/migrations/`
3. Cambia el `CMD` del Dockerfile a:
   ```
   CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
   ```

---

## Dominio personalizado

- **Vercel:** Project Settings → Domains → agrega `app.tudominio.com`
- **Railway:** Settings → Networking → Custom Domain → `api.tudominio.com`
- Actualiza `NEXT_PUBLIC_API_URL` y `CORS_ORIGIN` para usar los nuevos dominios.

---

## Troubleshooting

- **Build de Railway falla por workspaces:** asegúrate que el `package.json` raíz tiene `"workspaces": ["apps/*"]` (ya está configurado).
- **Vercel no encuentra módulos:** Root Directory debe ser `apps/web`. El monorepo se resuelve via el `buildCommand` del `vercel.json`.
- **`PrismaClientInitializationError`:** la variable `DATABASE_URL` del servicio API debe referenciar `${{Postgres.DATABASE_URL}}` (con las llaves dobles).
- **CORS error:** sincroniza `CORS_ORIGIN` con la URL exacta de Vercel.
