# ALL ROADS — Instalación en Windows

Guía paso a paso para correr la plataforma en tu PC con Windows 10 / 11.

**Tiempo estimado:** 15–20 minutos (la mayor parte es descargar instaladores).

---

## Paso 1 — Instalar los pre-requisitos

Necesitas tres programas. Instálalos en este orden:

### 1.1 Node.js (motor de JavaScript)

1. Ve a **https://nodejs.org**
2. Descarga la versión **LTS** (botón verde, izquierda) — actualmente Node 22
3. Ejecuta el instalador, dale **Siguiente** a todo (acepta el default)
4. Cuando termine, abre **PowerShell** (botón Inicio → escribe "PowerShell" → Enter) y verifica:
   ```powershell
   node --version
   npm --version
   ```
   Deben mostrar versiones como `v22.x.x` y `10.x.x`.

### 1.2 Git (para clonar el repositorio)

1. Ve a **https://git-scm.com/download/win**
2. Descarga e instala con los defaults (todas las pantallas → Siguiente)
3. Verifica en PowerShell:
   ```powershell
   git --version
   ```

### 1.3 PostgreSQL (base de datos)

1. Ve a **https://www.postgresql.org/download/windows/**
2. Click "Download the installer" → elige **PostgreSQL 16** (Windows x86-64)
3. Ejecuta el instalador:
   - **Installation Directory:** dale Siguiente
   - **Components:** marca **PostgreSQL Server**, **pgAdmin 4** y **Command Line Tools**
   - **Password:** pon una contraseña que recuerdes para el usuario `postgres` (ejemplo: `postgres123`). **Anótala**.
   - **Port:** déjalo en `5432`
   - **Locale:** deja el default
   - Termina el wizard. **No es necesario** ejecutar Stack Builder al final (puedes saltarlo).
4. Verifica en PowerShell:
   ```powershell
   psql --version
   ```
   Si dice "psql no se reconoce", agrega Postgres al PATH:
   - Botón Inicio → "Editar las variables de entorno del sistema" → Variables de entorno → Path (Sistema) → Editar → Nuevo → pega `C:\Program Files\PostgreSQL\16\bin` → Aceptar todo.
   - Cierra PowerShell y abre uno nuevo. Reintenta `psql --version`.

---

## Paso 2 — Clonar el repositorio

En PowerShell, ubícate donde quieras tener el proyecto (ejemplo: tu carpeta de Documentos):

```powershell
cd $HOME\Documents
git clone https://github.com/danelolarte-spec/ALL-ROADS.git
cd ALL-ROADS
git checkout claude/logistics-management-platform-5PNbF
```

> Cuando el PR #1 esté mergeado a `main`, puedes saltarte el `git checkout`.

---

## Paso 3 — Instalación automática (RECOMENDADO)

Hemos preparado un script que hace todo por ti.

### 3.1 Permitir scripts en PowerShell (solo la primera vez)

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```
Cuando pregunte, responde **S** y Enter.

### 3.2 Ejecutar el setup

```powershell
.\setup-windows.ps1
```

El script:
- Verifica Node, Git, psql
- Crea el usuario `allroads` y la DB `allroads` en Postgres
- Instala todas las dependencias (`npm install`)
- Crea los archivos `.env`
- Aplica el schema de Prisma
- Carga los datos demo

Si pide contraseña de Postgres, usa la que pusiste en el paso 1.3.

> Si te da error al crear el usuario, hazlo manualmente (ver Paso 4 más abajo).

### 3.3 Arrancar la plataforma

```powershell
.\start-windows.ps1
```

Se abren dos ventanas de PowerShell (una para la API, otra para el Web) y al cabo de unos segundos se abre tu navegador en `http://localhost:3000`.

**Login:** `admin@allroads.co` / `Admin123!`

---

## Paso 4 — Instalación manual (si prefieres comandos a mano)

Si el script te dio error o quieres entender qué hace cada comando:

### 4.1 Crear la DB en Postgres

Abre **SQL Shell (psql)** desde el menú Inicio. Te pide:
- Server: `localhost` *(Enter)*
- Database: `postgres` *(Enter)*
- Port: `5432` *(Enter)*
- Username: `postgres` *(Enter)*
- Password: *(la que pusiste al instalar)*

Una vez dentro, ejecuta:

```sql
CREATE USER allroads WITH PASSWORD 'allroads' SUPERUSER;
CREATE DATABASE allroads OWNER allroads;
\q
```

### 4.2 Instalar dependencias

En PowerShell, dentro de la carpeta `ALL-ROADS`:

```powershell
npm install
```

(tarda ~1-2 min)

### 4.3 Crear archivos de configuración

Crea `apps\api\.env` con el siguiente contenido:

```
DATABASE_URL="postgresql://allroads:allroads@localhost:5432/allroads?schema=public"
JWT_SECRET="dev-secret-change-me-in-prod"
JWT_EXPIRES_IN="7d"
PORT=4000
GOOGLE_MAPS_API_KEY=""
```

Crea `apps\web\.env.local` con:

```
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=""
```

### 4.4 Aplicar schema y cargar datos demo

```powershell
npm run db:migrate
npm run db:seed
```

### 4.5 Arrancar

```powershell
npm run dev
```

Abre `http://localhost:3000` en tu navegador.

---

## Troubleshooting

### "psql: command not found" o "no se reconoce"
Postgres no está en el PATH. Ver paso 1.3 final.

### Error "ECONNREFUSED" al hacer `db:migrate`
Postgres no está corriendo. Verifica en el menú Inicio → Servicios → busca `postgresql-x64-16` → click derecho → Iniciar.
También puedes verificarlo desde PowerShell:
```powershell
Get-Service postgresql*
```

### Puerto 3000 o 4000 ya en uso
Otra app los está usando. Para liberarlos:
```powershell
# Ver qué proceso usa el puerto:
Get-NetTCPConnection -LocalPort 3000 | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Get-Process -Id $_ }

# Para usar otros puertos, edita apps\api\.env (PORT=) y apps\web\.env.local (NEXT_PUBLIC_API_URL=)
```

### "npm install" se queda colgado o falla
- Asegúrate que tienes Node.js 18 o superior (`node --version`)
- Borra `node_modules` y `package-lock.json` y reintenta:
  ```powershell
  Remove-Item -Recurse -Force node_modules, apps\api\node_modules, apps\web\node_modules
  Remove-Item package-lock.json
  npm install
  ```

### Quiero detener todo
- Si arrancaste con `start-windows.ps1`: cierra las dos ventanas de PowerShell que se abrieron.
- Si arrancaste con `npm run dev`: en la ventana donde corre, presiona `Ctrl + C` y luego `S`.

### Quiero borrar la DB y empezar de cero
```powershell
psql -U postgres -c "DROP DATABASE allroads;"
psql -U postgres -c "CREATE DATABASE allroads OWNER allroads;"
npm run db:migrate
npm run db:seed
```

---

## Resumen visual

```
+-----------------------+         +---------------------+
|  http://localhost:3000 | <----> | http://localhost:4000 |
|  Next.js (web)         |  API   |  NestJS (api)         |
+-----------------------+         +-----------+-----------+
                                              | Prisma
                                              v
                                  +---------------------+
                                  |  PostgreSQL 16      |
                                  |  localhost:5432     |
                                  |  DB: allroads       |
                                  +---------------------+
```

¿Algo no te funciona? Vuelve a Claude y dime el error exacto que ves en la pantalla.
