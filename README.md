# Mus

una app para llevar la cuenta de las partidas de mus con los colegas. la hice
para no andar con papelitos ni piedras por la mesa: la abres en el movil y a jugar.

funciona sin internet una vez la has abierto la primera vez, asi que en el bar o
donde sea da igual que no haya cobertura. y se instala en la pantalla de inicio
como si fuera una app normal.

**pruebala aqui:** https://mus-contador.vercel.app

## que hace

- marcador de los dos equipos (nosotros / ellos) con las rayas de toda la vida
- le pones la meta a 30 o 40, la que jugueis
- cuando un equipo llega a la meta se anota el amarraco y empieza otra partida sola
- los envites que se dejan "de ultimas" los apuntas y luego se los das al que los gane
- boton de ordago: si le das (y confirmas) ese equipo gana la partida directa
- si te equivocas, con deshacer vuelves atras
- para cambiar el nombre de un equipo, tocas encima del nombre y ya
- se guarda todo solo, si cierras el movil a media partida al volver sigue igual

## como instalarla en el movil

abres https://mus-contador.vercel.app y:

- **android (chrome):** menu de los tres puntos, añadir a pantalla de inicio
- **iphone (safari):** el boton de compartir, añadir a pantalla de inicio

la primera vez tienes que abrirla con internet para que se guarde, despues ya
tira sin conexion.

## por dentro

nada raro, es html, css y javascript a pelo, sin frameworks ni cosas que compilar:

- index.html — la pagina
- app.js — toda la logica
- styles.css — los estilos
- manifest.webmanifest — datos de la pwa (nombre, iconos, colores)
- service-worker.js — lo que hace que funcione sin internet
- icons/ — los iconos

esta en vercel: cada vez que subo un cambio a github se actualiza sola.
