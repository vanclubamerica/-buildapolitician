/* =========================================================================
   app.js — site-wide behavior shared by every page:
   theme toggle, mobile nav, storage helpers, confetti, sound toggles.
   ========================================================================= */

const Storage = {
  KEY_PLAYER: "bap_player_candidate",
  KEY_OPPONENT: "bap_opponent_candidate",
  KEY_RESULT: "bap_last_result",
  KEY_THEME: "bap_theme",
  KEY_SOUND: "bap_sound_enabled",
  KEY_MUSIC: "bap_music_enabled",

  save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { console.warn("Storage save failed", e); }
  },
  load(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { console.warn("Storage load failed", e); return null; }
  },
  remove(key) { try { localStorage.removeItem(key); } catch (e) {} }
};

/* ---------------------------- Theme toggle ---------------------------- */
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  Storage.save(Storage.KEY_THEME, theme);
  document.querySelectorAll("[data-theme-toggle]").forEach(btn => {
    btn.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
    const label = btn.querySelector(".theme-label");
    if (label) label.textContent = theme === "light" ? "Light Mode" : "Dark Mode";
  });
}

function initTheme() {
  const saved = Storage.load(Storage.KEY_THEME) || "dark";
  applyTheme(saved);
  document.querySelectorAll("[data-theme-toggle]").forEach(btn => {
    btn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      applyTheme(current === "light" ? "dark" : "light");
    });
  });
}

/* ---------------------------- Mobile nav ---------------------------- */
function initMobileNav() {
  const toggle = document.querySelector(".nav-burger");
  const menu = document.querySelector(".nav-links");
  if (!toggle || !menu) return;
  toggle.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  menu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* ---------------------------- Sound / music toggles ---------------------------- */
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) audioCtx = new Ctx();
  }
  return audioCtx;
}

/* Generates a short synthesized blip so the site needs zero external audio
   files while still supporting a "sound effects" toggle. */
function playBlip(freq = 440, duration = 0.12, type = "sine") {
  if (Storage.load(Storage.KEY_SOUND) === false) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}
window.playBlip = playBlip;

/* Simple ambient "hum" loop for the background-music toggle. Built from
   oscillators only — no external audio files, keeping the project 100%
   self-contained for GitHub Pages. */
let musicNodes = null;
function startMusic() {
  const ctx = getAudioCtx();
  if (!ctx || musicNodes) return;
  const master = ctx.createGain();
  master.gain.value = 0.035;
  master.connect(ctx.destination);
  const freqs = [130.81, 164.81, 196.0];
  const oscs = freqs.map(f => {
    const o = ctx.createOscillator();
    o.type = "triangle";
    o.frequency.value = f;
    o.connect(master);
    o.start();
    return o;
  });
  musicNodes = { master, oscs };
}
function stopMusic() {
  if (!musicNodes) return;
  musicNodes.oscs.forEach(o => { try { o.stop(); } catch (e) {} });
  musicNodes.master.disconnect();
  musicNodes = null;
}

function initToggleButtons() {
  const soundBtn = document.querySelector("[data-sound-toggle]");
  const musicBtn = document.querySelector("[data-music-toggle]");

  if (soundBtn) {
    const enabled = Storage.load(Storage.KEY_SOUND) !== false;
    soundBtn.setAttribute("aria-pressed", String(enabled));
    soundBtn.classList.toggle("is-on", enabled);
    soundBtn.addEventListener("click", () => {
      const now = Storage.load(Storage.KEY_SOUND) !== false;
      Storage.save(Storage.KEY_SOUND, !now);
      soundBtn.setAttribute("aria-pressed", String(!now));
      soundBtn.classList.toggle("is-on", !now);
      if (!now) playBlip(520, 0.1);
    });
  }

  if (musicBtn) {
    const enabled = Storage.load(Storage.KEY_MUSIC) === true;
    musicBtn.setAttribute("aria-pressed", String(enabled));
    musicBtn.classList.toggle("is-on", enabled);
    if (enabled) {
      document.body.addEventListener("click", function starter() {
        startMusic();
        document.body.removeEventListener("click", starter);
      }, { once: true });
    }
    musicBtn.addEventListener("click", () => {
      const now = Storage.load(Storage.KEY_MUSIC) === true;
      Storage.save(Storage.KEY_MUSIC, !now);
      musicBtn.setAttribute("aria-pressed", String(!now));
      musicBtn.classList.toggle("is-on", !now);
      if (!now) startMusic(); else stopMusic();
    });
  }
}

/* ---------------------------- Confetti ---------------------------- */
function launchConfetti(container, count = 90) {
  if (!container) return;
  const colors = ["#c8102e", "#d4af37", "#ffffff", "#0a2540", "#e63950"];
  for (let i = 0; i < count; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = Math.random() * 100 + "%";
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = (Math.random() * 0.6) + "s";
    piece.style.animationDuration = (2.5 + Math.random() * 2) + "s";
    piece.style.setProperty("--drift", (Math.random() * 160 - 80) + "px");
    piece.style.setProperty("--rot", (Math.random() * 720 - 360) + "deg");
    container.appendChild(piece);
    setTimeout(() => piece.remove(), 5200);
  }
}
window.launchConfetti = launchConfetti;

/* ---------------------------- Footer year + loading screen ---------------------------- */
function initFooterYear() {
  document.querySelectorAll("[data-year]").forEach(el => { el.textContent = new Date().getFullYear(); });
}

function initLoadingScreen() {
  const loader = document.querySelector(".loading-screen");
  if (!loader) return;
  window.addEventListener("load", () => {
    setTimeout(() => {
      loader.classList.add("loading-screen--hidden");
      setTimeout(() => loader.remove(), 700);
    }, 450);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initMobileNav();
  initToggleButtons();
  initFooterYear();
  initLoadingScreen();
});
