# Imágenes del sitio

Sube tus archivos aquí (carpeta `public/`) con **estos nombres exactos** para que aparezcan automáticamente:

| Archivo a subir aquí | Renombrar desde |
|---|---|
| `hero.jpg` | `iPBT035 (1).jpg` (portada principal) |
| `logo.png` | `LOGOO_Mesa de trabajo 1` (logo principal) |
| `guatape-1.jpg` | 1ª foto de Guatapé (también portada del tour) |
| `guatape-2.jpg` | 2ª foto de Guatapé |
| `guatape-3.jpg` | 3ª foto de Guatapé |
| `guatape-4.jpg` | 4ª foto de Guatapé |

Si un archivo no existe, el sitio cae automáticamente a una imagen de Unsplash como fallback.

## Recomendaciones

- **Hero (`hero.jpg`)**: 1920×1080 px o más, `.jpg`, <500 KB
- **Logo (`logo.png`)**: fondo transparente, mínimo 400 px de alto
- **Guatapé (`guatape-*.jpg`)**: 1200 px de ancho, `.jpg`, <300 KB cada una

Optimiza tus imágenes en https://squoosh.app antes de subirlas para que el sitio cargue rápido.

## ¿Cómo subir?

1. En GitHub, abre la carpeta `public/`
2. Click en **Add file → Upload files**
3. Arrastra tus imágenes, **renombradas** según la tabla de arriba
4. Commit a la rama `claude/all-roads-tourism-site-1wPTD`
5. GitHub Actions desplegará automáticamente a Pages

## Otros cambios

Para reemplazar otras fotos (tours, galería, experiencias adicionales) edita las URLs en:

```
src/data/tours.js
```
