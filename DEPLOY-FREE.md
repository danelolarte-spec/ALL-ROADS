# Deploy 100% gratis — Vercel + Render + Neon

Guía para tener ALL ROADS online **sin pagar nada, sin tarjeta de crédito**.

| Componente | Plataforma | Costo |
|---|---|---|
| Frontend (Next.js) | **Vercel** | Gratis para siempre |
| Backend (NestJS) | **Render** | Gratis (duerme tras 15 min sin uso) |
| Base de datos PostgreSQL | **Neon** | Gratis (0.5 GB, sin caducidad) |

**Tiempo estimado: 20 minutos** (la mayor parte es esperar builds).

---

## ⚠️ Limitaciones del modo gratis

- **Render free duerme**: tras 15 min de inactividad, la primera petición tarda ~30 seg en despertar al servidor. Después va rápido.
- **Neon free**: 0.5 GB de almacenamiento, suficiente para 50.000+ servicios.
- **Vercel free**: 100 GB de transferencia/mes, suficiente para ti.

Si más adelante quieres quitar el sleep de Render: $7/mes upgrade. Por ahora, gratis.

---

## Paso 1 — Crear base de datos en Neon (3 min)

1. Ve a **https://console.neon.tech/signup**
2. Click en **"Sign up with GitHub"** (te ahorras crear contraseña)
3. Autoriza acceso a tu cuenta de GitHub
4. Una vez dentro, te pide crear un proyecto:
   - **Project name:** `all-roads`
   - **Postgres version:** deja la default (16 o 17)
   - **Region:** elige la más cercana a ti (US East / EU)
   - Click **"Create project"**
5. Te muestra una pantalla con un comando de conexión. Busca el bloque **"Connection string"** y copia la URL completa que empieza con `postgresql://`.
   - Se ve así: `postgresql://allroads_owner:abc...@ep-cool-name-12345.us-east-2.aws.neon.tech/all-roads?sslmode=require`
   - **Guárdala**, la usaremos en el Paso 2.

✅ Listo. Ya tienes Postgres en la nube gratis para siempre.

---

## Paso 2 — Deploy del backend en Render (8 min)

### 2.1 Crear cuenta

1. Ve a **https://dashboard.render.com/register**
2. Click en **"GitHub"**
3. Autoriza a Render a leer tus repos
4. Confirma tu email si te lo pide

### 2.2 Crear el servicio web

1. En el dashboard click en **"+ New"** (arriba a la derecha) → **"Web Service"**
2. **"Connect a repository"** → busca y selecciona **`ALL-ROADS`**
   - Si no aparece: click "Configure account" → da permiso al repo en GitHub
3. **Configura el servicio:**
   - **Name:** `all-roads-api` (o el que quieras)
   - **Region:** la más cercana a Neon (si Neon está en US East, aquí también)
   - **Branch:** `main`
   - **Root Directory:** déjalo vacío
   - **Runtime:** Selecciona **`Docker`**
   - **Dockerfile Path:** `apps/api/Dockerfile`
   - **Instance Type:** **Free**
4. **NO le des "Create Web Service" todavía**. Baja hasta **"Environment Variables"** y agrega:

| Key | Value |
|---|---|
| `DATABASE_URL` | (la URL que copiaste de Neon en el Paso 1.5) |
| `JWT_SECRET` | (cualquier texto largo random, ej: `mi-secreto-super-random-allroads-2026`) |
| `JWT_EXPIRES_IN` | `7d` |
| `PORT` | `4000` |
| `CORS_ORIGIN` | `*` (temporal, lo cambiamos al final) |

5. Ahora sí, click **"Create Web Service"** abajo
6. Render empieza el build. Toma **5–8 minutos** la primera vez (construye Docker image, instala deps, hace prisma push).

### 2.3 Verificar

1. Cuando el deploy diga **"Live"** (punto verde arriba), te dan una URL tipo:
   ```
   https://all-roads-api.onrender.com
   ```
2. Ábrela en tu navegador con `/api/docs` al final:
   ```
   https://all-roads-api.onrender.com/api/docs
   ```
3. Debes ver **Swagger** con la lista de endpoints. ✅

### 2.4 Cargar datos demo

Render no ejecuta el seed automáticamente. Para cargar los 2 usuarios + 2 vehículos + datos demo:

**Opción A — Desde Render Shell (incluido en free):**

1. En el dashboard del servicio, ve a la pestaña **"Shell"**
2. Pega y ejecuta:
   ```
   cd apps/api && npx ts-node prisma/seed.ts
   ```
3. Debes ver `✅ Seed completado.`

**Opción B — Desde tu PC (si la Shell no carga):**

1. Asegúrate de tener Node 18+ instalado en tu PC
2. En PowerShell:
   ```powershell
   git clone https://github.com/danelolarte-spec/ALL-ROADS.git
   cd ALL-ROADS\apps\api
   npm install
   $env:DATABASE_URL="postgresql://...(la URL de Neon)..."
   npx ts-node prisma/seed.ts
   ```

✅ Ya tienes datos demo en la DB.

---

## Paso 3 — Deploy del frontend en Vercel (5 min)

### 3.1 Crear cuenta

1. Ve a **https://vercel.com/signup**
2. Click en **"Continue with GitHub"**
3. Autoriza acceso

### 3.2 Importar el proyecto

1. En el dashboard click **"Add New..."** → **"Project"**
2. Busca **`ALL-ROADS`** en la lista de repos → click **"Import"**
3. **Configura:**
   - **Project Name:** déjalo como está (`all-roads`)
   - **Framework Preset:** Next.js *(auto-detectado)*
   - **Root Directory:** click en **"Edit"** → selecciona la carpeta **`apps/web`** → Continue
   - **Build and Output Settings:** déjalos en default
4. Expande **"Environment Variables"** y agrega:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://all-roads-api.onrender.com/api` *(la URL de Render del paso 2.3 + `/api`)* |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | (déjalo vacío o agrega tu key si tienes) |

5. Click **"Deploy"**
6. Vercel hace build (~2 min). Cuando termine te dan una URL tipo:
   ```
   https://all-roads-xxxx.vercel.app
   ```

---

## Paso 4 — Conectar el círculo (1 min)

Falta decirle a Render que solo acepte peticiones desde tu Vercel:

1. Vuelve a **Render** → tu servicio `all-roads-api` → pestaña **"Environment"**
2. Edita la variable `CORS_ORIGIN`:
   - Cambia el valor `*` por la URL de Vercel: `https://all-roads-xxxx.vercel.app`
3. **Save Changes**. Render redespliega automáticamente (~2 min).

---

## Paso 5 — ¡Úsalo!

1. Abre tu URL de Vercel: `https://all-roads-xxxx.vercel.app`
2. Verás la pantalla de login
3. Entra con:
   - **Email:** `admin@allroads.co`
   - **Password:** `Admin123!`

🎉 **Estás dentro.** Comparte la URL con quien quieras.

> ⏰ **Tip:** si entras tras un rato sin usarla, el primer login tarda ~30 seg porque Render despierta el servidor. Es normal en el plan gratis.

---

## Troubleshooting

### Render muestra "Build failed"
- Ve a **Logs** y mira la última línea de error
- Lo más común: variables de entorno mal escritas. Verifica que `DATABASE_URL` empieza con `postgresql://` y NO tiene espacios.

### Login dice "Network error" o "Failed to fetch"
- Es CORS o la URL del API. Verifica:
  - En Vercel: `NEXT_PUBLIC_API_URL` debe ser **`https://...onrender.com/api`** (con `/api` al final)
  - En Render: `CORS_ORIGIN` debe coincidir con la URL exacta de Vercel (sin `/` al final)

### "Página no carga" tras 30 segundos
- El servidor de Render está despertando. Espera 30–60 segundos y refresca.

### Login con admin@allroads.co dice "Credenciales inválidas"
- El seed no se ejecutó. Vuelve al Paso 2.4 y carga los datos demo.

### Quiero datos diferentes / borrar todo
- Ve a Neon → tu proyecto → "Tables" → borra registros o usa SQL
- O reinicia: `DROP TABLE` todas las tablas y vuelve a correr `npm run db:migrate` + seed

---

## Resumen de URLs que tendrás

| Servicio | URL |
|---|---|
| Plataforma | `https://all-roads-xxxx.vercel.app` |
| API directa | `https://all-roads-api.onrender.com/api` |
| Swagger | `https://all-roads-api.onrender.com/api/docs` |
| DB Neon | (interno, conectado via DATABASE_URL) |

¿Algo no funciona? Pégale a Claude el error exacto y te ayudo.
