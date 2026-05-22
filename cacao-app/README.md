# 🌱 Smart Cacao — Sistema de Gestión de Recolección de Cacao

Aplicación web **100% local** para administrar fincas productoras, órdenes de servicio, planificación de rutas, vehículos, notas de recolección, prefacturas y consolidado histórico de cacao.

> Diseñada específicamente para operación en Arauquita, Arauca, Colombia.

---

## ⚡ Cómo ejecutar

**Doble clic** sobre `index.html` y la aplicación se abre en el navegador. No requiere servidor.

> Recomendado: Chrome, Edge, Firefox o Safari modernos.

Si la consola del navegador muestra advertencias sobre CORS al cargar como `file://`, puedes servirla con cualquier servidor estático:

```bash
# Opción 1 (Python)
python3 -m http.server 8080

# Opción 2 (Node)
npx serve .
```

Y abrir `http://localhost:8080`.

---

## 📁 Estructura del proyecto

```
smart-cacao/
├── index.html                  # Página principal (SPA)
├── css/
│   └── styles.css              # Estilos completos (paleta cacao/verde/beige)
├── js/
│   ├── app.js                  # Orquestador principal (router + init)
│   ├── data/
│   │   └── mock.js             # Datos simulados (fincas Arauquita, vehículos, órdenes)
│   ├── utils/
│   │   ├── helpers.js          # Utilidades (fechas, números, geo, validación)
│   │   ├── storage.js          # Persistencia LocalStorage (CRUD genérico)
│   │   ├── ui.js               # Modal, Toast, Confirm, Loader
│   │   └── pdf.js              # Generación de PDFs profesionales (jsPDF + autoTable)
│   └── modules/
│       ├── dashboard.js        # Dashboard ejecutivo con KPIs y gráficos
│       ├── fincas.js           # CRUD fincas (tabla, tarjetas, mapa, clones)
│       ├── ordenes.js          # CRUD órdenes (tabla, agenda, calendario)
│       ├── rutas.js            # Planificador automático de rutas (TSP NN)
│       ├── vehiculos.js        # CRUD vehículos (semáforo SOAT/Tecno)
│       ├── notas.js            # Notas de recolección (heredan de orden)
│       ├── prefacturas.js      # Prefacturas (auto desde notas)
│       ├── historico.js        # Histórico analítico por finca
│       └── config.js           # Configuración empresa, precios, punto salida
└── assets/                     # Carpeta para recursos estáticos
```

---

## 🧩 Módulos implementados

| # | Módulo | Descripción |
|---|--------|-------------|
| 1 | **Fincas** | CRUD completo con tabla, tarjetas, mapa interactivo Leaflet. Selector múltiple de clones + creación dinámica. |
| 2 | **Órdenes de Servicio** | Tabla con filtros, agenda agrupada por fecha, calendario mensual. |
| 3 | **Confirmación** | Estado pendiente/confirmada, checkbox "día anterior", semáforo visual. |
| 4 | **Planificador de Rutas** | Cálculo automático por vecino más cercano, mapa con polyline, cronograma horario. |
| 5 | **Vehículos** | CRUD con semáforos verde/amarillo/rojo según vigencia de SOAT y Tecnomecánica. |
| 6 | **Validación logística** | Alerta `EL VEHÍCULO NO CUMPLE CON LA CAPACIDAD REQUERIDA` con detalle de exceso. |
| 7 | **Notas de Recolección** | Documento independiente vinculado a la orden, historial de cambios. |
| 8 | **Histórico por Finca** | Total, mensual, anual, por clon. Chart.js (bar, line, doughnut). |
| 9 | **Prefacturas** | Generación automática al crear nota. Cálculo `cantidad × precio`. |
| 10 | **Generación PDF** | Órdenes, notas, prefacturas, históricos, cronogramas. Encabezado corporativo. |
| 11 | **Dashboard** | KPIs (fincas, kg, órdenes activas, vehículos, rutas, prefacturado, alertas). |

---

## 🛠️ Librerías externas (CDN)

| Librería | Uso |
|----------|-----|
| **Leaflet 1.9.4** | Mapas interactivos (OpenStreetMap) |
| **Chart.js 4.4** | Gráficos estadísticos |
| **jsPDF 2.5 + autoTable** | Generación de PDFs |
| **SheetJS (XLSX)** | Exportación Excel |
| **Font Awesome 6.4** | Iconografía |
| **Inter (Google Fonts)** | Tipografía corporativa |

---

## ✨ Funcionalidades adicionales

- **Modo oscuro** (toggle en la topbar, persistente).
- **Búsqueda global** en topbar (fincas, órdenes, vehículos).
- **Notificaciones** con badge automático (documentos vencidos, órdenes pendientes).
- **Exportar/Importar JSON** del estado completo (módulo Configuración).
- **Exportar Excel** en cada módulo principal.
- **Diseño responsive** (sidebar colapsable en móvil).
- **Toast notifications** con animaciones.
- **Modales** de formulario, confirmación y detalle.
- **Validaciones de formulario** y manejo de errores.
- **Loader animado** en arranque.
- **Routing por hash** (URL persistente por vista).

---

## 🎨 Paleta de colores

| Color | Hex | Uso |
|-------|-----|-----|
| Verde cacao | `#3b7a48` | Acciones primarias, botones |
| Marrón cacao | `#5c3a1e` | Encabezados, sidebar |
| Beige natural | `#faf6ee` | Fondo principal |
| Verde claro | `#e6f3e8` | Highlights, hover |

---

## 🗺️ Punto de salida por defecto

```
Centro de Acopio El Troncal
Lat:  7.0292
Lng: -71.4475
Arauquita, Arauca, Colombia
```

(Modificable desde **Configuración → Punto de salida**.)

---

## 💾 Persistencia

Toda la información se almacena en **LocalStorage** del navegador bajo el prefijo `cacaoflow_`. Para hacer respaldo:

`Configuración → Exportar datos` (descarga un `.json`).

Para restaurar/importar: `Configuración → Importar datos`.

---

## 🚀 Flujo operativo sugerido

1. Crea/edita tus fincas en **Fincas**.
2. Registra tu flota en **Vehículos**.
3. Programa **Órdenes de servicio** para una fecha.
4. Confírmalas (llamada / día anterior).
5. Ve a **Planificador de rutas**, selecciona fecha y vehículo → `Calcular ruta` → `Guardar`.
6. Cuando recolectes en la finca, genera la **Nota de recolección** (auto-prefactura).
7. Consulta el **Histórico por finca** para analítica visual.
8. Genera PDFs y Excel en cualquier momento.

---

> Hecho con ❤ para los productores de cacao de Arauquita.
