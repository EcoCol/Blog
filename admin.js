/* ========================================================================
   ADMIN.JS — EcoPeques
   Panel con generación asistida de carruseles/video y publicación directa a GitHub
   ======================================================================== */

const STORAGE_KEY = "ecopeques_admin_draft_v1";
const GH_STORAGE_KEY = "ecopeques_github_creds";

let state = {
  categories: [],
  posts: [],
  settings: {
    siteName: "EcoPeques",
    logoEmoji: "🌍",
    heroTitle: "Amigos verdes por el cuidado del Medio Ambiente.",
    heroText: "Aventuras para cuidar nuestro planeta",
    aboutText: "",
    contactEmail: "",
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
    } catch (err) {}
  }

  try {
    const response = await fetch("posts.json");
    if (response.ok) {
      const data = await response.json();
      state.categories = data.categories || [];
      state.posts = data.posts || [];
      if (data.settings) state.settings = data.settings;
    }
  } catch (err) {
    showToast("No se encontró posts.json, empezando con datos base");
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
  showToast._timer = setTimeout(() => toast.classList.remove("is-visible"), 3200);
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
  const confirmed = window.confirm(`¿Eliminar la publicación "${post.title}"?`);
  if (!confirmed) return;

  state.posts = state.posts.filter((p) => p.slug !== slug);
  saveDraft();
  renderPostsList();
  showToast("Publicación eliminada del borrador");
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
  slugManuallyEdited = true;

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
    showToast("Ya existe otra publicación con ese slug.");
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
  showToast("Publicación guardada en el borrador local");
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

/* ------------------------- Helpers multimedia --------------------------- */

function insertAtCursor(textarea, text) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const before = textarea.value.substring(0, start);
  const after = textarea.value.substring(end);
  textarea.value = before + text + after;
  textarea.selectionStart = textarea.selectionEnd = start + text.length;
  textarea.focus();
  updatePreview();
}

// Modal Carrusel
const modalCarousel = document.getElementById("modal-carousel");
document.getElementById("btn-helper-carousel").addEventListener("click", () => {
  document.getElementById("input-carousel-images").value = "";
  modalCarousel.classList.add("is-visible");
});

document.getElementById("btn-insert-carousel").addEventListener("click", () => {
  const raw = document.getElementById("input-carousel-images").value;
  const paths = raw.split(/[\n,]/).map((s) => s.trim()).filter(Boolean);

  if (!paths.length) {
    showToast("Escribí al menos una ruta de imagen");
    return;
  }

  const imgsHtml = paths.map((p, i) =>
    `<img src="${p}" alt="Foto ${i + 1}" style="flex:0 0 85%; max-height:420px; object-fit:cover; border-radius:16px; scroll-snap-align:center; box-shadow:0 6px 18px rgba(0,0,0,0.12);">`
  ).join("");

  const carruselSnippet = `\n<div style="display:flex; gap:14px; overflow-x:auto; scroll-snap-type:x mandatory; padding-bottom:12px; margin-bottom:20px; -webkit-overflow-scrolling:touch;">${imgsHtml}</div>\n<p style="text-align:center; font-size:0.85rem; color:#6fcf6e; font-weight:700; margin-top:-10px; margin-bottom:18px;">👉 Desliza para ver más fotos 👈</p>\n`;

  insertAtCursor(fieldContent, carruselSnippet);
  modalCarousel.classList.remove("is-visible");
});

// Modal Video
const modalVideo = document.getElementById("modal-video");
document.getElementById("btn-helper-video").addEventListener("click", () => {
  document.getElementById("input-video-path").value = "";
  modalVideo.classList.add("is-visible");
});

document.getElementById("btn-insert-video").addEventListener("click", () => {
  const path = document.getElementById("input-video-path").value.trim();
  if (!path) {
    showToast("Escribí la ruta del archivo de video");
    return;
  }

  const videoSnippet = `\n<video controls width="100%" style="border-radius:16px; margin-bottom:20px; max-height:480px; width:100%; background:#000;"><source src="${path}" type="video/mp4">Tu navegador no soporta el formato de video.</video>\n`;

  insertAtCursor(fieldContent, videoSnippet);
  modalVideo.classList.remove("is-visible");
});

// Botones de cancelar en todos los modales
document.querySelectorAll(".modal-close").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.target.closest(".modal-overlay").classList.remove("is-visible");
  });
});

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
  showToast("Configuración guardada en el borrador");
});

/* -------------------------- Exportar / Descargar -------------------------- */

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

/* ---------------------- Publicación a GitHub API -------------------------- */

const modalGithub = document.getElementById("modal-github");
const btnGithubPublish = document.getElementById("btn-github-publish");

btnGithubPublish.addEventListener("click", async () => {
  const creds = JSON.parse(localStorage.getItem(GH_STORAGE_KEY) || "{}");
  if (!creds.token || !creds.owner || !creds.repo) {
    if (creds.owner) document.getElementById("gh-owner").value = creds.owner;
    if (creds.repo) document.getElementById("gh-repo").value = creds.repo;
    modalGithub.classList.add("is-visible");
    return;
  }
  await publishToGitHub(creds);
});

document.getElementById("btn-save-github").addEventListener("click", async () => {
  const owner = document.getElementById("gh-owner").value.trim();
  const repo = document.getElementById("gh-repo").value.trim();
  const token = document.getElementById("gh-token").value.trim();

  if (!owner || !repo || !token) {
    showToast("Por favor completá todos los campos");
    return;
  }

  const creds = { owner, repo, token };
  localStorage.setItem(GH_STORAGE_KEY, JSON.stringify(creds));
  modalGithub.classList.remove("is-visible");
  await publishToGitHub(creds);
});

async function publishToGitHub(creds) {
  btnGithubPublish.disabled = true;
  btnGithubPublish.textContent = "⏳ Publicando...";
  showToast("Conectando con GitHub...");

  try {
    const url = `https://api.github.com/repos/${creds.owner}/${creds.repo}/contents/posts.json`;
    
    // 1. Obtener el sha actual del archivo
    let sha = null;
    const getRes = await fetch(url, {
      headers: {
        Authorization: `Bearer ${creds.token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (getRes.status === 401 || getRes.status === 403) {
      localStorage.removeItem(GH_STORAGE_KEY);
      throw new Error("Token inválido o sin permisos suficientes");
    }

    if (getRes.ok) {
      const getData = await getRes.json();
      sha = getData.sha;
    }

    // 2. Codificar contenido a base64 (soporta acentos y emojis)
    const jsonString = JSON.stringify(buildExportData(), null, 2);
    const utf8Bytes = new TextEncoder().encode(jsonString);
    let binary = "";
    utf8Bytes.forEach((b) => (binary += String.fromCharCode(b)));
    const contentBase64 = btoa(binary);

    // 3. Enviar commit
    const putRes = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${creds.token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Actualización de publicaciones desde el Panel Web",
        content: contentBase64,
        sha: sha || undefined,
      }),
    });

    if (!putRes.ok) {
      const errData = await putRes.json();
      throw new Error(errData.message || "Error al subir cambios");
    }

    showToast("🎉 ¡Publicado con éxito! El blog se actualizará en 1-2 minutos.");
  } catch (err) {
    showToast(`❌ Error: ${err.message}`);
  } finally {
    btnGithubPublish.disabled = false;
    btnGithubPublish.textContent = "🚀 Publicar en GitHub";
  }
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