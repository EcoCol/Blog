/* ========================================================================
   ADMIN.JS
   ------------------------------------------------------------------------
   Panel de administración del blog (Fase 1: sin conexión a GitHub).

   Cómo funciona:
   1. Al abrir el panel, carga posts.json (los datos publicados actualmente).
   2. Mientras trabajás, los cambios se guardan en este navegador
      (localStorage), para que no se pierdan si recargás la página por error.
   3. Cuando estás conforme, hacés clic en "Descargar posts.json" y subís
      ese archivo a tu repositorio (reemplazando el que ya está), para
      publicar los cambios de verdad.

   Este panel NO se conecta a internet ni modifica el repositorio por sí
   solo. Es un asistente para armar el archivo correctamente.
   ======================================================================== */

const STORAGE_KEY = "ecopeques_admin_draft_v1";

let state = {
  categories: [],
  posts: [],
  settings: {
    siteName: "EcoPeques",
    logoEmoji: "🌍",
    heroTitle: "Aventuras para cuidar nuestro planeta",
    heroText: "Cuentos, datos curiosos y manualidades para que cuidar la naturaleza sea parte del juego de todos los días.",
    aboutText: "¡Hola! Somos EcoPeques, un rincón pensado para que las infancias descubran, jugando, lo importante que es cuidar nuestro planeta.\n\nAcá vas a encontrar historias, datos curiosos sobre animales y plantas, ideas para ahorrar energía y manualidades para crear cosas nuevas con materiales que ya tenés en casa.",
    contactEmail: "hola@ecopeques.example",
    instagram: "",
    youtube: "",
  },
};

/* ---------------------------- Carga inicial ---------------------------- */

async function loadInitialState() {
  const draft = localStorage.getItem(STORAGE_KEY);
  if (draft) {
    try {
      state = JSON.parse(draft);
      showToast("Se restauró un borrador sin publicar de este navegador");
      return;
    } catch (err) {
      // Si el borrador está corrupto, seguimos y cargamos posts.json
    }
  }

  try {
    const response = await fetch("posts.json");
    if (response.ok) {
      const data = await response.json();
      state.categories = data.categories || [];
      state.posts = data.posts || [];
    }
  } catch (err) {
    showToast("No se encontró posts.json todavía, empezando de cero");
  }
}

function saveDraft() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/* ------------------------------ Utilidades ------------------------------ */

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function categoryInfo(name) {
  return state.categories.find((c) => c.name === name) || { color: "leaf", emoji: "🌱" };
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function formatDate(isoDate) {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-").map(Number);
  return `${day} de ${MONTHS[month - 1]} de ${year}`;
}

/* -------------------------------- Tabs --------------------------------- */

const tabs = document.querySelectorAll(".admin-tab");
const panels = document.querySelectorAll(".admin-panel");

function showPanel(panelId) {
  panels.forEach((panel) => panel.classList.toggle("is-active", panel.id === `panel-${panelId}`));
  tabs.forEach((tab) => tab.classList.toggle("is-active", tab.dataset.tab === panelId));
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => showPanel(tab.dataset.tab));
});

/* --------------------------- Lista de posts ----------------------------- */

function renderPostsList() {
  const container = document.getElementById("posts-list");

  if (!state.posts.length) {
    container.innerHTML = `<div class="admin-empty">Todavía no hay publicaciones. ¡Creá la primera! 🌱</div>`;
    return;
  }

  const sorted = [...state.posts].sort((a, b) => new Date(b.date) - new Date(a.date));

  container.innerHTML = sorted.map((post) => {
    const cat = categoryInfo(post.category);
    return `
      <div class="admin-post-row" data-accent="${cat.color}">
        <div class="row-emoji" aria-hidden="true">${post.emoji || "🌱"}</div>
        <div class="row-info">
          <p class="row-title">${post.title}</p>
          <p class="row-meta">${cat.emoji} ${post.category} · ${formatDate(post.date)}</p>
        </div>
        <div class="row-actions">
          <button data-action="edit" data-slug="${post.slug}">✏️ Editar</button>
          <button data-action="delete" data-slug="${post.slug}">🗑️ Eliminar</button>
        </div>
      </div>
    `;
  }).join("");

  container.querySelectorAll("[data-action='edit']").forEach((btn) => {
    btn.addEventListener("click", () => openEditor(btn.dataset.slug));
  });

  container.querySelectorAll("[data-action='delete']").forEach((btn) => {
    btn.addEventListener("click", () => deletePost(btn.dataset.slug));
  });
}

function deletePost(slug) {
  const post = state.posts.find((p) => p.slug === slug);
  if (!post) return;
  const confirmed = window.confirm(`¿Eliminar la publicación "${post.title}"? Esta acción no se puede deshacer.`);
  if (!confirmed) return;

  state.posts = state.posts.filter((p) => p.slug !== slug);
  saveDraft();
  renderPostsList();
  showToast("Publicación eliminada (recordá descargar posts.json para publicarlo)");
}

/* ------------------------------- Editor --------------------------------- */

const postForm = document.getElementById("post-form");
const fieldOriginalSlug = document.getElementById("field-original-slug");
const fieldTitle = document.getElementById("field-title");
const fieldSlug = document.getElementById("field-slug");
const fieldCategory = document.getElementById("field-category");
const fieldDate = document.getElementById("field-date");
const fieldEmoji = document.getElementById("field-emoji");
const fieldImage = document.getElementById("field-image");
const fieldExcerpt = document.getElementById("field-excerpt");
const fieldContent = document.getElementById("field-content");

let slugManuallyEdited = false;

function populateCategorySelect() {
  fieldCategory.innerHTML = state.categories.map(
    (cat) => `<option value="${cat.name}">${cat.emoji} ${cat.name}</option>`
  ).join("");
}

function openEditor(slug) {
  populateCategorySelect();
  slugManuallyEdited = true; // editing an existing post: never auto-touch its slug

  const post = state.posts.find((p) => p.slug === slug);
  document.getElementById("editor-title").textContent = post ? "Editar publicación" : "Nueva publicación";

  fieldOriginalSlug.value = post ? post.slug : "";
  fieldTitle.value = post ? post.title : "";
  fieldSlug.value = post ? post.slug : "";
  fieldCategory.value = post ? post.category : (state.categories[0] ? state.categories[0].name : "");
  fieldDate.value = post ? post.date : new Date().toISOString().slice(0, 10);
  fieldEmoji.value = post ? post.emoji : "🌱";
  fieldImage.value = post && post.image ? post.image : "";
  fieldExcerpt.value = post ? post.excerpt : "";
  fieldContent.value = post ? post.content.trim() : "";

  document.getElementById("btn-delete-post").style.display = post ? "inline-block" : "none";

  updatePreview();
  showPanel("editor");
}

function openNewPostEditor() {
  slugManuallyEdited = false;
  openEditor(null);
}

fieldTitle.addEventListener("input", () => {
  if (!slugManuallyEdited) {
    fieldSlug.value = slugify(fieldTitle.value);
  }
  updatePreview();
});

fieldSlug.addEventListener("input", () => {
  slugManuallyEdited = true;
  fieldSlug.value = slugify(fieldSlug.value);
});

[fieldCategory, fieldDate, fieldEmoji, fieldImage, fieldExcerpt, fieldContent].forEach((field) => {
  field.addEventListener("input", updatePreview);
});

function buildPostFromForm() {
  return {
    slug: fieldSlug.value.trim(),
    title: fieldTitle.value.trim(),
    category: fieldCategory.value,
    date: fieldDate.value,
    emoji: fieldEmoji.value.trim() || "🌱",
    image: fieldImage.value.trim() || undefined,
    excerpt: fieldExcerpt.value.trim(),
    content: fieldContent.value,
  };
}

function updatePreview() {
  const post = buildPostFromForm();
  const cat = categoryInfo(post.category);
  const frame = document.getElementById("preview-frame");

  const image = post.image
    ? `<img class="post-card-image" src="${post.image}" alt="" loading="lazy" onerror="this.style.display='none'">`
    : "";

  frame.innerHTML = `
    <a class="post-card" data-accent="${cat.color}" style="pointer-events:none;">
      ${image}
      <div class="post-card-emoji" aria-hidden="true">${post.emoji}</div>
      <div class="post-meta">
        <span>${cat.emoji} ${post.category || "Sin categoría"}</span>
        <span class="dot" aria-hidden="true"></span>
        <span>${formatDate(post.date)}</span>
      </div>
      <h3>${post.title || "Título del post"}</h3>
      <p class="post-excerpt">${post.excerpt || "El resumen aparece acá..."}</p>
      <span class="read-more">Leer más →</span>
    </a>
  `;
}

postForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const post = buildPostFromForm();

  if (!post.slug) {
    showToast("El slug no puede estar vacío");
    return;
  }

  const duplicate = state.posts.find((p) => p.slug === post.slug && p.slug !== fieldOriginalSlug.value);
  if (duplicate) {
    showToast("Ya existe otra publicación con ese slug. Elegí uno distinto.");
    return;
  }

  const originalSlug = fieldOriginalSlug.value;
  if (originalSlug) {
    const index = state.posts.findIndex((p) => p.slug === originalSlug);
    if (index !== -1) state.posts[index] = post;
  } else {
    state.posts.push(post);
  }

  saveDraft();
  renderPostsList();
  showToast("Publicación guardada en el navegador. ¡No olvides descargar posts.json!");
  showPanel("posts");
});

document.getElementById("btn-delete-post").addEventListener("click", () => {
  const slug = fieldOriginalSlug.value;
  if (!slug) return;
  deletePost(slug);
  showPanel("posts");
});

document.getElementById("btn-new-post").addEventListener("click", openNewPostEditor);
document.getElementById("btn-cancel-edit").addEventListener("click", () => showPanel("posts"));

/* ------------------------------ Categorías -------------------------------- */

const COLOR_OPTIONS = ["leaf", "coral", "sun", "berry", "sky"];

function renderCategoriesList() {
  const container = document.getElementById("categories-list");

  if (!state.categories.length) {
    container.innerHTML = `<div class="admin-empty">Todavía no hay categorías.</div>`;
    return;
  }

  container.innerHTML = state.categories.map((cat, index) => `
    <div class="admin-category-row" data-accent="${cat.color}">
      <input type="text" value="${cat.name}" data-field="name" data-index="${index}" placeholder="Nombre">
      <input type="text" value="${cat.emoji}" data-field="emoji" data-index="${index}" placeholder="Emoji" maxlength="4">
      <select data-field="color" data-index="${index}">
        ${COLOR_OPTIONS.map((c) => `<option value="${c}" ${c === cat.color ? "selected" : ""}>${c}</option>`).join("")}
      </select>
      <button data-action="delete-category" data-index="${index}">🗑️ Eliminar</button>
    </div>
  `).join("");

  container.querySelectorAll("input, select").forEach((input) => {
    input.addEventListener("input", (event) => {
      const index = Number(event.target.dataset.index);
      const field = event.target.dataset.field;
      state.categories[index][field] = event.target.value;
      saveDraft();
    });
  });

  container.querySelectorAll("[data-action='delete-category']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = Number(btn.dataset.index);
      const cat = state.categories[index];
      const inUse = state.posts.some((p) => p.category === cat.name);
      if (inUse) {
        showToast(`No se puede eliminar "${cat.name}": hay publicaciones que la usan`);
        return;
      }
      state.categories.splice(index, 1);
      saveDraft();
      renderCategoriesList();
      showToast("Categoría eliminada");
    });
  });
}

document.getElementById("btn-new-category").addEventListener("click", () => {
  state.categories.push({ name: "Nueva categoría", color: "leaf", emoji: "🌱" });
  saveDraft();
  renderCategoriesList();
});

/* ----------------------------- Configuración ------------------------------ */

function populateSettingsForm() {
  document.getElementById("setting-site-name").value = state.settings.siteName || "";
  document.getElementById("setting-logo-emoji").value = state.settings.logoEmoji || "";
  document.getElementById("setting-hero-title").value = state.settings.heroTitle || "";
  document.getElementById("setting-hero-text").value = state.settings.heroText || "";
  document.getElementById("setting-about-text").value = state.settings.aboutText || "";
  document.getElementById("setting-contact-email").value = state.settings.contactEmail || "";
  document.getElementById("setting-instagram").value = state.settings.instagram || "";
  document.getElementById("setting-youtube").value = state.settings.youtube || "";
}

document.getElementById("settings-form").addEventListener("submit", (event) => {
  event.preventDefault();
  state.settings = {
    siteName: document.getElementById("setting-site-name").value.trim(),
    logoEmoji: document.getElementById("setting-logo-emoji").value.trim(),
    heroTitle: document.getElementById("setting-hero-title").value.trim(),
    heroText: document.getElementById("setting-hero-text").value.trim(),
    aboutText: document.getElementById("setting-about-text").value.trim(),
    contactEmail: document.getElementById("setting-contact-email").value.trim(),
    instagram: document.getElementById("setting-instagram").value.trim(),
    youtube: document.getElementById("setting-youtube").value.trim(),
  };
  saveDraft();
  showToast("Configuración guardada en el navegador. ¡No olvides descargar posts.json!");
});

/* -------------------------- Exportar / descargar --------------------------- */

function buildExportData() {
  return {
    categories: state.categories,
    posts: state.posts.map((p) => {
      const clean = { ...p };
      if (!clean.image) delete clean.image;
      return clean;
    }),
    settings: state.settings,
  };
}

function downloadJSON() {
  const data = buildExportData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "posts.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const exportModal = document.getElementById("export-modal");

document.getElementById("btn-download-file").addEventListener("click", downloadJSON);
document.getElementById("btn-close-modal").addEventListener("click", () => {
  exportModal.classList.remove("is-visible");
});

/* Botón flotante de exportación, agregado dinámicamente al sidebar */
function addExportButtonToTabs() {
  const button = document.createElement("button");
  button.className = "admin-tab";
  button.style.marginTop = "16px";
  button.style.background = "var(--color-sun)";
  button.style.color = "var(--color-ink)";
  button.textContent = "⬇️ Descargar posts.json";
  button.addEventListener("click", () => exportModal.classList.add("is-visible"));
  document.querySelector(".admin-tabs").appendChild(button);
}

/* ---------------------------------- Init ----------------------------------- */

(async function init() {
  await loadInitialState();
  populateCategorySelect();
  renderPostsList();
  renderCategoriesList();
  populateSettingsForm();
  addExportButtonToTabs();
})();
