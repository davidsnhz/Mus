/* Mus · Contador — lógica de la app (JS puro, sin framework, sin build).
 * Portado del mockup de React manteniendo diseño y comportamiento.
 * El estado se guarda en localStorage por si se cierra el navegador a media partida.
 */

(function () {
  "use strict";

  var STORAGE_KEY = "mus-contador-v1";
  var LANCES = ["Grande", "Chica", "Pares", "Juego", "Punto"];
  var MAX_HISTORIAL = 30;

  // ---------- Iconos SVG (inline, para funcionar sin conexión) ----------
  var ICONS = {
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>',
    minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>',
    reset: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>',
    undo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H8"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>'
  };

  var COLORS = {
    bg: "#000000",
    gold: "#00CEF2",      // Nosotros · sumar (cian)
    goldDark: "#007188",  // Nosotros · restar (cian oscuro)
    wine: "#F22300",      // Ellos · sumar (rojo)
    wineDark: "#8A1400"   // Ellos · restar (rojo oscuro)
  };

  // ---------- Estado ----------
  var state = {
    nosotros: 0,
    ellos: 0,
    amarracosN: 0,
    amarracosE: 0,
    meta: 40,            // objetivo de la partida: 30 o 40
    nombreN: "Nosotros",
    nombreE: "Ellos",
    pendientes: [],      // { id, lance, piedras }
    modalLance: null,    // nombre del lance con el sheet abierto
    modalPiedras: 2,     // valor del stepper en el sheet
    ganador: null,       // "nosotros" | "ellos" | null
    editando: null,      // "nosotros" | "ellos" | null (nombre en edición)
    ordagoTeam: null,    // "nosotros" | "ellos" | null (confirmación de órdago abierta)
    settingsOpen: false, // panel de ajustes abierto
    historial: []        // pila para deshacer la última jugada
  };

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      var s = JSON.parse(raw);
      state.nosotros = s.nosotros || 0;
      state.ellos = s.ellos || 0;
      state.amarracosN = s.amarracosN || 0;
      state.amarracosE = s.amarracosE || 0;
      state.meta = (s.meta === 30 || s.meta === 40) ? s.meta : 40;
      state.nombreN = s.nombreN || "Nosotros";
      state.nombreE = s.nombreE || "Ellos";
      state.pendientes = Array.isArray(s.pendientes) ? s.pendientes : [];
      state.ganador = s.ganador || null;
      state.historial = Array.isArray(s.historial) ? s.historial : [];
    } catch (e) {
      /* si algo falla, empezamos limpio */
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        nosotros: state.nosotros,
        ellos: state.ellos,
        amarracosN: state.amarracosN,
        amarracosE: state.amarracosE,
        meta: state.meta,
        nombreN: state.nombreN,
        nombreE: state.nombreE,
        pendientes: state.pendientes,
        ganador: state.ganador,
        historial: state.historial
      }));
    } catch (e) { /* almacenamiento lleno o bloqueado */ }
  }

  // ---------- Historial / deshacer ----------
  // Guarda una foto de lo que cambia con una jugada, antes de aplicarla.
  function snapshot() {
    return {
      nosotros: state.nosotros,
      ellos: state.ellos,
      amarracosN: state.amarracosN,
      amarracosE: state.amarracosE,
      pendientes: state.pendientes.map(function (p) {
        return { id: p.id, lance: p.lance, piedras: p.piedras };
      }),
      ganador: state.ganador
    };
  }

  function guardarJugada() {
    state.historial.push(snapshot());
    if (state.historial.length > MAX_HISTORIAL) state.historial.shift();
  }

  function deshacer() {
    var prev = state.historial.pop();
    if (!prev) return;
    state.nosotros = prev.nosotros;
    state.ellos = prev.ellos;
    state.amarracosN = prev.amarracosN;
    state.amarracosE = prev.amarracosE;
    state.pendientes = prev.pendientes;
    state.ganador = prev.ganador;
  }

  // ---------- Lógica de juego ----------
  function comprobarMeta() {
    if (state.nosotros >= state.meta) state.ganador = "nosotros";
    else if (state.ellos >= state.meta) state.ganador = "ellos";
  }

  function sumar(equipo, piedras) {
    if (equipo === "nosotros") state.nosotros += piedras;
    else state.ellos += piedras;
    comprobarMeta();
  }

  function restar(equipo) {
    if (equipo === "nosotros") state.nosotros = Math.max(0, state.nosotros - 1);
    else state.ellos = Math.max(0, state.ellos - 1);
  }

  function nuevaPartida() {
    state.nosotros = 0;
    state.ellos = 0;
    state.pendientes = [];
    state.ganador = null;
  }

  function resetTodo() {
    state.nosotros = 0;
    state.ellos = 0;
    state.amarracosN = 0;
    state.amarracosE = 0;
    state.pendientes = [];
    state.ganador = null;
  }

  function confirmarAmarraco() {
    if (state.ganador === "nosotros") state.amarracosN += 1;
    else if (state.ganador === "ellos") state.amarracosE += 1;
    nuevaPartida();
  }

  function confirmarEnvite() {
    state.pendientes.push({
      id: Date.now(),
      lance: state.modalLance,
      piedras: state.modalPiedras
    });
    state.modalLance = null;
  }

  function asignarPendiente(id, equipo) {
    var p = null;
    for (var i = 0; i < state.pendientes.length; i++) {
      if (state.pendientes[i].id === id) { p = state.pendientes[i]; break; }
    }
    if (p) sumar(equipo, p.piedras);
    state.pendientes = state.pendientes.filter(function (x) { return x.id !== id; });
  }

  function setMeta(v) {
    if (v !== 30 && v !== 40) return;
    state.meta = v;
    comprobarMeta(); // si ya se superó el nuevo objetivo, hay ganador
  }

  // ---------- Dispositivo (vibración, pantalla encendida, compartir) ----------
  // Vibración corta al puntuar (donde el navegador la soporte; iOS no vibra).
  function buzz(ms) {
    try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {}
  }

  // Mantener la pantalla encendida mientras se juega.
  var wakeLock = null;
  function pedirWakeLock() {
    try {
      if ("wakeLock" in navigator && document.visibilityState === "visible" && !wakeLock) {
        navigator.wakeLock.request("screen").then(function (lock) {
          wakeLock = lock;
          lock.addEventListener("release", function () { wakeLock = null; });
        }).catch(function () {});
      }
    } catch (e) {}
  }

  // Compartir el enlace de la app (menú nativo; si no, copia al portapapeles).
  function compartir() {
    var url = location.origin + location.pathname;
    if (navigator.share) {
      navigator.share({
        title: "Mus · Contador",
        text: "Marcador de mus gratis, se instala y funciona sin conexión:",
        url: url
      }).catch(function () {});
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () {
        alert("Enlace copiado: " + url);
      }).catch(function () { window.prompt("Copia el enlace:", url); });
    } else {
      window.prompt("Copia el enlace:", url);
    }
  }

  // ---------- Utilidades de render ----------
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // Abreviatura para los botones de asignar pendientes (Nosotros -> "Nos.")
  function abrev(nombre) {
    var base = nombre.trim().slice(0, 3);
    return esc(base ? base + "." : "?");
  }

  function rayasHTML(value, color) {
    var fullGroups = Math.floor(value / 5);
    var remainder = value % 5;
    var groups = [];
    for (var g = 0; g < fullGroups; g++) groups.push(5);
    if (remainder) groups.push(remainder);
    if (groups.length === 0) groups.push(0);

    var html = '<div class="rayas">';
    groups.forEach(function (count) {
      html += '<div class="group">';
      for (var i = 0; i < 4; i++) {
        var on = i < Math.min(count, 4);
        html += '<div class="bar" style="height:' + (on ? "28px" : "10px") +
          ";background:" + (on ? color : "var(--line)") +
          ";opacity:" + (on ? 1 : 0.4) + '"></div>';
      }
      if (count === 5) {
        html += '<div class="cross" style="background:' + color + '"></div>';
      }
      html += "</div>";
    });
    html += "</div>";
    return html;
  }

  function nameHTML(cfg) {
    if (state.editando === cfg.team) {
      return '<input id="name-input" class="name-input" type="text" maxlength="14" ' +
        'autocomplete="off" spellcheck="false" value="' + esc(cfg.name) + '" ' +
        'aria-label="Nombre del equipo" />';
    }
    return '<span class="name editable" data-action="editar" data-team="' + cfg.team +
      '" title="Toca para renombrar">' + esc(cfg.name) + "</span>";
  }

  function teamHTML(cfg) {
    var amarracos = cfg.amarracos > 0
      ? '<span class="amarracos" style="color:' + cfg.color + '">' + cfg.amarracos + "</span>"
      : "";
    return '' +
      '<div class="team">' +
        '<div class="top">' +
          nameHTML(cfg) +
          amarracos +
        "</div>" +
        '<div class="score-block">' +
          '<span class="score tabnum">' + cfg.score + "</span>" +
          rayasHTML(cfg.score, cfg.color) +
        "</div>" +
        '<div class="actions">' +
          '<div class="controls">' +
            '<button class="btn-sub" data-action="sub" data-team="' + cfg.team + '" aria-label="Restar" style="background:' + cfg.colorDark + ';color:#fff">' + ICONS.minus + "</button>" +
            '<button class="btn-add" data-action="add" data-team="' + cfg.team + '" aria-label="Sumar" style="background:' + cfg.color + ';color:' + COLORS.bg + '">' + ICONS.plus + "</button>" +
          "</div>" +
          '<button class="ordago-btn" data-action="ordago" data-team="' + cfg.team + '" style="border-color:' + cfg.color + ';color:' + cfg.color + '">Órdago</button>' +
        "</div>" +
      "</div>";
  }

  function pendientesHTML() {
    if (state.pendientes.length === 0) return "";
    var chips = state.pendientes.map(function (p) {
      return '' +
        '<div class="chip">' +
          '<span style="color:var(--cream-dim)">' + ICONS.clock + "</span>" +
          '<span class="txt">' + esc(p.lance) + " · " + p.piedras + "</span>" +
          '<button class="assign" data-action="asignar" data-id="' + p.id + '" data-team="nosotros" style="background:' + COLORS.gold + ';color:' + COLORS.bg + '">' + abrev(state.nombreN) + "</button>" +
          '<button class="assign" data-action="asignar" data-id="' + p.id + '" data-team="ellos" style="background:' + COLORS.wine + ';color:' + COLORS.bg + '">' + abrev(state.nombreE) + "</button>" +
        "</div>";
    }).join("");
    return '' +
      '<div class="pendientes">' +
        '<span class="lbl">De últimas</span>' +
        chips +
      "</div>";
  }

  function lancesHTML() {
    var btns = LANCES.map(function (l) {
      return '<button class="lance-btn" data-action="lance" data-lance="' + esc(l) + '">' + esc(l) + "</button>";
    }).join("");
    return '<div class="lances">' + btns + "</div>";
  }

  function enviteSheetHTML() {
    if (!state.modalLance) return "";
    return '' +
      '<div class="overlay bottom" data-action="close-sheet">' +
        '<div class="sheet" data-stop="1">' +
          '<div class="row">' +
            '<span class="title">Envite · ' + esc(state.modalLance) + "</span>" +
            '<button class="close" data-action="close-sheet" aria-label="Cerrar" style="color:var(--cream-dim)">' + ICONS.x + "</button>" +
          "</div>" +
          '<p class="sub">Se queda pendiente. Al ver, dices a quién se lo lleva.</p>' +
          '<div class="stepper">' +
            '<span class="cap">Piedras envidadas</span>' +
            '<div class="controls">' +
              '<button class="step-btn" data-action="piedras-menos" style="color:var(--cream-dim)">' + ICONS.minus + "</button>" +
              '<span class="val tabnum">' + state.modalPiedras + "</span>" +
              '<button class="step-btn" data-action="piedras-mas" style="color:var(--cream-dim)">' + ICONS.plus + "</button>" +
            "</div>" +
          "</div>" +
          '<button class="primary-btn" data-action="confirmar-envite" style="background:' + COLORS.gold + '">' +
            ICONS.clock + " Dejar pendiente" +
          "</button>" +
        "</div>" +
      "</div>";
  }

  function winModalHTML() {
    if (!state.ganador) return "";
    var color = state.ganador === "nosotros" ? COLORS.gold : COLORS.wine;
    var nombre = state.ganador === "nosotros" ? state.nombreN : state.nombreE;
    var nuevos = state.ganador === "nosotros" ? state.amarracosN + 1 : state.amarracosE + 1;
    return '' +
      '<div class="overlay center" style="background:rgba(0,0,0,0.7)">' +
        '<div class="win-card" style="border:1px solid ' + color + '">' +
          '<span class="kicker">Partida ganada</span>' +
          '<span class="who" style="color:' + color + '">' + esc(nombre) + "</span>" +
          '<div class="count">' +
            '<span class="n" style="color:' + color + '">' + nuevos + "</span>" +
            '<span class="u">' + (nuevos === 1 ? "amarraco" : "amarracos") + "</span>" +
          "</div>" +
          '<button class="primary-btn" data-action="confirmar-amarraco" style="background:' + color + '">Anotar amarraco y seguir</button>' +
        "</div>" +
      "</div>";
  }

  function ordagoConfirmHTML() {
    if (!state.ordagoTeam) return "";
    var color = state.ordagoTeam === "nosotros" ? COLORS.gold : COLORS.wine;
    var nombre = state.ordagoTeam === "nosotros" ? state.nombreN : state.nombreE;
    return '' +
      '<div class="overlay center" style="background:rgba(0,0,0,0.75)">' +
        '<div class="win-card" style="border:1px solid ' + color + '">' +
          '<span class="kicker">Órdago</span>' +
          '<span class="who" style="color:' + color + ';margin-bottom:12px">' + esc(nombre) + "</span>" +
          '<p class="confirm-msg">Si ' + esc(nombre) + ' gana el órdago, se lleva la partida entera. ¿Confirmas?</p>' +
          '<div class="confirm-actions">' +
            '<button class="btn-ghost" data-action="ordago-cancel">Cancelar</button>' +
            '<button class="primary-btn" data-action="ordago-confirm" style="background:' + color + '">Órdago ganado</button>' +
          "</div>" +
        "</div>" +
      "</div>";
  }

  function settingsSheetHTML() {
    if (!state.settingsOpen) return "";
    return '' +
      '<div class="overlay bottom" data-action="close-settings">' +
        '<div class="sheet" data-stop="1">' +
          '<div class="row">' +
            '<span class="title">Ajustes</span>' +
            '<button class="close" data-action="close-settings" aria-label="Cerrar" style="color:var(--cream-dim)">' + ICONS.x + "</button>" +
          "</div>" +
          '<div class="settings-group">' +
            '<span class="settings-label">Puntos por partida</span>' +
            metaToggleHTML() +
          "</div>" +
          '<button class="share-btn" data-action="share">' + ICONS.share + " Compartir la app</button>" +
          '<nav class="settings-links">' +
            '<a href="./privacidad.html">Privacidad<span aria-hidden="true">&rsaquo;</span></a>' +
            '<a href="./terminos.html">Términos de uso<span aria-hidden="true">&rsaquo;</span></a>' +
          "</nav>" +
        "</div>" +
      "</div>";
  }

  function metaToggleHTML() {
    return '' +
      '<div class="meta-toggle" role="group" aria-label="Puntos por partida">' +
        '<button class="meta-opt' + (state.meta === 30 ? " active" : "") + '" data-action="meta" data-val="30">30</button>' +
        '<button class="meta-opt' + (state.meta === 40 ? " active" : "") + '" data-action="meta" data-val="40">40</button>' +
      "</div>";
  }

  function render() {
    var pctN = Math.min(100, (state.nosotros / state.meta) * 100);
    var pctE = Math.min(100, (state.ellos / state.meta) * 100);
    var puedeDeshacer = state.historial.length > 0;

    var html = '' +
      '<div class="header">' +
        '<div class="brand-group">' +
          '<span class="brand">Mus</span>' +
          '<button class="settings-btn" data-action="settings" aria-label="Ajustes">' + ICONS.settings + "</button>" +
        "</div>" +
        '<div class="right">' +
          '<button class="icon-btn" data-action="undo" aria-label="Deshacer última jugada"' +
            (puedeDeshacer ? "" : " disabled") + ' style="color:var(--cream-dim)">' + ICONS.undo + "</button>" +
          '<button class="icon-btn" data-action="reset" aria-label="Reiniciar" style="color:var(--cream-dim)">' + ICONS.reset + "</button>" +
        "</div>" +
      "</div>" +

      '<div class="progress">' +
        '<div class="track"><div class="fill" style="width:' + pctN + "%;background:" + COLORS.gold + '"></div></div>' +
        '<div class="track right"><div class="fill" style="width:' + pctE + "%;background:" + COLORS.wine + '"></div></div>' +
      "</div>" +

      '<div class="board">' +
        teamHTML({ team: "nosotros", name: state.nombreN, score: state.nosotros, amarracos: state.amarracosN, color: COLORS.gold, colorDark: COLORS.goldDark }) +
        '<div class="divider"><div class="rule"></div><span class="vs">VS</span></div>' +
        teamHTML({ team: "ellos", name: state.nombreE, score: state.ellos, amarracos: state.amarracosE, color: COLORS.wine, colorDark: COLORS.wineDark }) +
      "</div>" +

      pendientesHTML() +
      lancesHTML() +
      enviteSheetHTML() +
      settingsSheetHTML() +
      ordagoConfirmHTML() +
      winModalHTML();

    document.getElementById("app").innerHTML = html;
    setupEditInput();
    save();
  }

  // Prepara el input de edición de nombre tras cada render.
  function setupEditInput() {
    if (!state.editando) return;
    var input = document.getElementById("name-input");
    if (!input) return;
    input.focus();
    input.select();

    var done = false;
    function commit(guardar) {
      if (done) return;
      done = true;
      if (guardar) {
        var v = input.value.trim();
        if (state.editando === "nosotros") state.nombreN = v || "Nosotros";
        else state.nombreE = v || "Ellos";
      }
      state.editando = null;
      render();
    }
    input.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter") { ev.preventDefault(); commit(true); }
      else if (ev.key === "Escape") { ev.preventDefault(); commit(false); }
    });
    input.addEventListener("blur", function () { commit(true); });
  }

  // ---------- Eventos (delegación) ----------
  function onClick(e) {
    var target = e.target.closest("[data-action]");
    if (!target) return;
    var action = target.getAttribute("data-action");

    pedirWakeLock(); // en el primer toque se activa (algunos navegadores lo exigen)

    switch (action) {
      case "add":
        guardarJugada();
        sumar(target.getAttribute("data-team"), 1);
        buzz(12);
        break;
      case "sub":
        guardarJugada();
        restar(target.getAttribute("data-team"));
        buzz(12);
        break;
      case "asignar":
        guardarJugada();
        asignarPendiente(Number(target.getAttribute("data-id")), target.getAttribute("data-team"));
        buzz(12);
        break;
      case "undo":
        deshacer();
        break;
      case "meta":
        setMeta(Number(target.getAttribute("data-val")));
        break;
      case "editar":
        state.editando = target.getAttribute("data-team");
        break;
      case "settings":
        state.settingsOpen = true;
        break;
      case "close-settings":
        if (e.target.closest('[data-stop="1"]') && !e.target.closest('[data-action="close-settings"]')) return;
        state.settingsOpen = false;
        break;
      case "share":
        compartir();
        return; // no hace falta re-render
      case "ordago":
        // Abre la confirmación; el órdago no gana hasta confirmar (evita toques sin querer).
        state.ordagoTeam = target.getAttribute("data-team");
        break;
      case "ordago-cancel":
        state.ordagoTeam = null;
        break;
      case "ordago-confirm":
        guardarJugada();
        state.ganador = state.ordagoTeam; // ese equipo gana la partida directamente
        state.ordagoTeam = null;
        break;
      case "lance":
        state.modalLance = target.getAttribute("data-lance");
        state.modalPiedras = 2;
        break;
      case "piedras-menos":
        state.modalPiedras = Math.max(1, state.modalPiedras - 1);
        break;
      case "piedras-mas":
        state.modalPiedras = state.modalPiedras + 1;
        break;
      case "confirmar-envite":
        guardarJugada();
        confirmarEnvite();
        break;
      case "close-sheet":
        // Solo cerrar si el clic fue en el overlay o el botón cerrar, no dentro del sheet
        if (e.target.closest('[data-stop="1"]') && !e.target.closest('[data-action="close-sheet"]')) return;
        state.modalLance = null;
        break;
      case "confirmar-amarraco":
        guardarJugada();
        confirmarAmarraco();
        break;
      case "reset":
        if (confirm("¿Reiniciar todo el marcador (partida y amarracos)?")) {
          guardarJugada();
          resetTodo();
        } else return;
        break;
      default:
        return;
    }
    render();
  }

  // ---------- Arranque ----------
  load();
  document.getElementById("app").addEventListener("click", onClick);
  render();

  // Mantener la pantalla encendida; re-pedirlo al volver a la app.
  pedirWakeLock();
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") pedirWakeLock();
  });

  // Registrar service worker (offline / instalable)
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("./service-worker.js").catch(function () {});
    });
  }
})();
