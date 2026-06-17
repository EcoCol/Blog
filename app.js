/* ========================================================================
   APP.JS
   Router muy simple basado en el "hash" de la URL (#home, #post/slug, etc.)
   Lee todo el contenido de POSTS y CATEGORIES desde posts.json
   y arma cada página. No necesitás tocar este archivo para agregar posts:
   eso se hace desde admin.html (o editando posts.json directamente).
   ======================================================================== */

const app = document.getElementById("app");
const navLinks = document.querySelectorAll(".nav-link");
const navToggle = document.querySelector(".nav-toggle");
const mainNav = document.querySelector(".main-nav");

const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

let CATEGORIES = [];
let POSTS = [];
let SETTINGS = {};

const DEFAULT_SETTINGS = {
  siteName: "EcoPeques",
  logoEmoji: "🌍",
  heroTitle: "Aventuras para cuidar nuestro planeta",
  heroText: "Cuentos, datos curiosos y manualidades para que cuidar la naturaleza sea parte del juego de todos los días.",
  aboutText: "¡Hola! Somos EcoPeques, un rincón pensado para que las infancias descubran, jugando, lo importante que es cuidar nuestro planeta.",
  contactEmail: "hola@ecopeques.example",
  instagram: "",
  youtube: "",
};

async function loadData() {
  const response = await fetch("posts.json");
  if (!response.ok) {
    throw new Error("No se pudo cargar posts.json");
  }
  const data = await response.json();
  CATEGORIES = data.categories || [];
  POSTS = data.posts || [];
  SETTINGS = { ...DEFAULT_SETTINGS, ...(data.settings || {}) };
}

function applySiteSettings() {
  document.title = `${SETTINGS.siteName} – ${SETTINGS.heroTitle}`;

  const logoMark = document.querySelector(".logo-mark");
  const logoText = document.querySelector(".logo-text");
  if (logoMark) logoMark.textContent = SETTINGS.logoEmoji;
  if (logoText) logoText.textContent = SETTINGS.siteName;

  const footerText = document.querySelector(".footer-inner p");
  if (footerText) {
    footerText.textContent = `${SETTINGS.logoEmoji} ${SETTINGS.siteName} — Cuidando el planeta, una aventura a la vez.`;
  }
}

function formatDate(isoDate) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return `${day} de ${MONTHS[month - 1]} de ${year}`;
}

function categoryInfo(name) {
  return CATEGORIES.find((c) => c.name === name) || { color: "leaf", emoji: "🌱" };
}

function postCard(post) {
  const cat = categoryInfo(post.category);
  const image = post.image
    ? `<img class="post-card-image" src="${post.image}" alt="" loading="lazy">`
    : "";
  return `
    <a class="post-card" href="#post/${post.slug}" data-accent="${cat.color}">
      ${image}
      <div class="post-card-emoji" aria-hidden="true">${post.emoji}</div>
      <div class="post-meta">
        <span>${cat.emoji} ${post.category}</span>
        <span class="dot" aria-hidden="true"></span>
        <span>${formatDate(post.date)}</span>
      </div>
      <h3>${post.title}</h3>
      <p class="post-excerpt">${post.excerpt}</p>
      <span class="read-more">Leer más →</span>
    </a>
  `;
}

/* ---------- Páginas ---------- */

function renderHome() {
  const recentPosts = [...POSTS]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  app.innerHTML = `
    <section class="hero">
      <div class="hero-blobs" aria-hidden="true">
        <div class="blob blob--leaf"></div>
        <div class="blob blob--sun"></div>
        <div class="blob blob--coral"></div>
      </div>
      <div class="hero-content">
        <span class="hero-eyebrow">${SETTINGS.logoEmoji} Bienvenido a ${SETTINGS.siteName}</span>
        <h1>${SETTINGS.heroTitle}</h1>
        <p>${SETTINGS.heroText}</p>
      </div>
    </section>

    <div class="section-heading">
      <h2>Últimas publicaciones</h2>
      <a class="see-all" href="#categorias">Ver todas →</a>
    </div>

    <div class="posts-grid">
      ${recentPosts.map(postCard).join("")}
    </div>
  `;
}

function renderCategorias(activeCategory) {
  const filtered = activeCategory
    ? POSTS.filter((p) => p.category === activeCategory)
    : POSTS;

  const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

  const chips = [
    `<button class="chip ${!activeCategory ? "is-active" : ""}" data-category="">Todas</button>`,
    ...CATEGORIES.map((cat) => `
      <button class="chip ${activeCategory === cat.name ? "is-active" : ""}"
              data-accent="${cat.color}"
              data-category="${cat.name}">
        ${cat.emoji} ${cat.name}
      </button>
    `),
  ].join("");

  app.innerHTML = `
    <div class="page-header">
      <span class="hero-eyebrow">🗂️ Categorías</span>
      <h1>Explorá por tema</h1>
      <p>Elegí una categoría para ver todas las publicaciones relacionadas.</p>
    </div>

    <div class="chip-row" role="group" aria-label="Filtrar por categoría">
      ${chips}
    </div>

    <div class="posts-grid">
      ${
        sorted.length
          ? sorted.map(postCard).join("")
          : `<div class="empty-state">Todavía no hay publicaciones en esta categoría. ¡Pronto habrá novedades! 🌱</div>`
      }
    </div>
  `;

  app.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const category = chip.dataset.category;
      window.location.hash = category ? `categorias/${encodeURIComponent(category)}` : "categorias";
    });
  });
}

function renderPost(slug) {
  const post = POSTS.find((p) => p.slug === slug);

  if (!post) {
    renderNotFound();
    return;
  }

  const cat = categoryInfo(post.category);
  const image = post.image
    ? `<img class="post-detail-image" src="${post.image}" alt="" loading="lazy">`
    : "";

  app.innerHTML = `
    <div class="post-detail">
      <a class="back-link" href="#categorias">← Volver a las publicaciones</a>

      <div class="post-detail-header" data-accent="${cat.color}">
        ${image}
        <div class="post-detail-emoji" aria-hidden="true">${post.emoji}</div>
        <div class="post-meta">
          <span>${cat.emoji} ${post.category}</span>
          <span class="dot" aria-hidden="true"></span>
          <span>${formatDate(post.date)}</span>
        </div>
        <h1>${post.title}</h1>
      </div>

      <div class="post-detail-body">
        ${post.content}
      </div>
    </div>
  `;
}

function renderSobre() {
  const paragraphs = (SETTINGS.aboutText || "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${p}</p>`)
    .join("");

  app.innerHTML = `
    <div class="page-header">
      <span class="hero-eyebrow">💚 Nuestra misión</span>
      <h1>Sobre ${SETTINGS.siteName}</h1>
    </div>

    <div class="about-wrap">
      <div class="about-emoji-row" aria-hidden="true">
        <span>🌍</span><span>🌱</span><span>🦋</span><span>♻️</span>
      </div>
      ${paragraphs}
    </div>
  `;
}

function renderContacto() {
  const socialLinks = [
    SETTINGS.instagram ? `<a href="${SETTINGS.instagram}" target="_blank" rel="noopener">📷 Instagram</a>` : "",
    SETTINGS.youtube ? `<a href="${SETTINGS.youtube}" target="_blank" rel="noopener">🎥 YouTube</a>` : "",
    SETTINGS.contactEmail ? `<a href="mailto:${SETTINGS.contactEmail}">📧 ${SETTINGS.contactEmail}</a>` : "",
  ].join("");

  app.innerHTML = `
    <div class="page-header">
      <span class="hero-eyebrow">✉️ Hablemos</span>
      <h1>Contacto</h1>
      <p>¿Tenés una idea para un post, una pregunta o quieres compartir tu
      manualidad? ¡Escribinos!</p>
    </div>

    <div class="contact-wrap">
      <form id="contact-form" novalidate>
        <div class="form-field">
          <label for="contact-name">Tu nombre</label>
          <input type="text" id="contact-name" name="name" required>
        </div>
        <div class="form-field">
          <label for="contact-email">Tu correo</label>
          <input type="email" id="contact-email" name="email" required>
        </div>
        <div class="form-field">
          <label for="contact-message">Mensaje</label>
          <textarea id="contact-message" name="message" rows="4" required></textarea>
        </div>
        <button type="submit" class="btn">Enviar mensaje</button>
        <div class="form-success" id="form-success">
          ¡Gracias por escribirnos! 🌟 Pronto te responderemos.
        </div>
      </form>

      <div class="contact-socials">
        ${socialLinks}
      </div>
    </div>
  `;

  const form = document.getElementById("contact-form");
  const success = document.getElementById("form-success");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    success.classList.add("is-visible");
    form.reset();
  });
}

function renderNotFound() {
  app.innerHTML = `
    <div class="page-header">
      <span class="hero-eyebrow">🧭 Ups...</span>
      <h1>No encontramos esa página</h1>
      <p>Parece que esta aventura todavía no existe.</p>
      <p><a class="btn" href="#home">Volver al inicio</a></p>
    </div>
  `;
}

function renderLoadError() {
  app.innerHTML = `
    <div class="page-header">
      <span class="hero-eyebrow">⚠️ Ups...</span>
      <h1>No pudimos cargar las publicaciones</h1>
      <p>Revisá que el archivo <code>posts.json</code> esté en la misma
      carpeta que <code>index.html</code> y que el sitio se esté sirviendo
      desde un servidor web (no abriendo el archivo directamente con
      doble clic).</p>
    </div>
  `;
}

/* ---------- Router ---------- */

function setActiveNav(route) {
  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.dataset.route === route);
  });
}

function router() {
  const hash = window.location.hash.replace(/^#\/?/, "");
  const [path, param] = hash.split("/");

  window.scrollTo({ top: 0, behavior: "instant" in window.scrollTo ? "instant" : "auto" });

  switch (path) {
    case "":
    case "home":
      renderHome();
      setActiveNav("home");
      break;
    case "categorias":
      renderCategorias(param ? decodeURIComponent(param) : null);
      setActiveNav("categorias");
      break;
    case "post":
      renderPost(param);
      setActiveNav("categorias");
      break;
    case "sobre":
      renderSobre();
      setActiveNav("sobre");
      break;
    case "contacto":
      renderContacto();
      setActiveNav("contacto");
      break;
    default:
      renderNotFound();
      setActiveNav("");
  }

  if (mainNav.classList.contains("is-open")) {
    mainNav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }
}

window.addEventListener("hashchange", router);

(async function init() {
  try {
    await loadData();
  } catch (err) {
    renderLoadError();
    return;
  }
  applySiteSettings();
  router();
})();

navToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});
