# Mus · Contador

Marcador de mus para la mesa. **PWA instalable**, funciona **sin conexión** una vez cargada,
guarda la partida en el navegador y se ve bien en cualquier móvil. Sin build, sin dependencias.

## Qué hace

- **Marcador Nosotros / Ellos** con las rayas tradicionales (grupos de 5).
- **Envites pendientes** ("de últimas"): dejas un envite en espera y, al ver, lo asignas a un equipo.
- **Meta 40 puntos**: al llegar, se anota un amarraco y empieza otra partida.
- **Se guarda solo** en `localStorage`: si cierras el navegador a media partida, al volver sigue igual.
- **Botón de reinicio** (pide confirmación) para borrar partida y amarracos.

## Archivos

```
index.html              Página principal
app.js                  Lógica y render (JS puro)
styles.css              Estilos
manifest.webmanifest    Datos de la PWA (nombre, iconos, colores)
service-worker.js       Cache offline
icons/                  Iconos de la app (192, 512, maskable)
```

## Cómo instalarla en el móvil

Al abrir el enlace en el móvil:

- **Android (Chrome):** menú ⋮ → **"Añadir a pantalla de inicio"** / "Instalar app".
- **iPhone (Safari):** botón **Compartir** → **"Añadir a pantalla de inicio"**.

Una vez añadida, se abre a pantalla completa y **funciona aunque no haya wifi ni datos**
(hay que abrirla con conexión **la primera vez** para que se guarde).

## Probarla en local (opcional)

Los service workers necesitan `http(s)`, no valen abriendo el `index.html` directamente.
Con cualquier servidor estático, por ejemplo:

```bash
npx serve .
```

y abre la URL que te indique.

## Actualizar la app

Si cambias algún archivo, sube el número de versión en dos sitios para que a todos
se les actualice la copia guardada:

- `service-worker.js` → `var CACHE = "mus-contador-v1";` (pon `-v2`, etc.)
- El nombre de la caché nuevo hace que se borre la antigua al recargar.
