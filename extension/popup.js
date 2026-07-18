// LocalRank Radar — Enhanced Popup Script v1.1

// Tab navigation
document.querySelectorAll(".tabs button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tabs button").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".content").forEach(c => c.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active");
  });
});

// Tag selection
const selectedTags = new Set();
document.querySelectorAll(".tag").forEach(tag => {
  tag.addEventListener("click", () => {
    const name = tag.dataset.tag;
    if (selectedTags.has(name)) { selectedTags.delete(name); tag.classList.remove("selected"); }
    else { selectedTags.add(name); tag.classList.add("selected"); }
  });
});

// Auto-fill tab info and analyze
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const tab = tabs[0];
  if (!tab) return;

  document.getElementById("save-title").value = tab.title || "";
  document.getElementById("save-url").value = tab.url || "";

  // Request page analysis from content script
  chrome.tabs.sendMessage(tab.id, { action: "analyzePage" }, (response) => {
    if (chrome.runtime.lastError || !response) {
      document.getElementById("analyze-loading").textContent = "No se pudo analizar (página restringida)";
      return;
    }
    displayAnalysis(response);
  });
});

function displayAnalysis(data) {
  document.getElementById("analyze-loading").style.display = "none";
  document.getElementById("analyze-results").style.display = "block";

  document.getElementById("r-company").textContent = data.company || "No detectado";
  document.getElementById("r-category").textContent = data.category || "General";
  document.getElementById("r-url").innerHTML = `<a href="${data.url}" target="_blank">${data.domain}</a>`;
  document.getElementById("r-phones").textContent = data.phones.length > 0 ? data.phones.join(", ") : "No encontrado";
  document.getElementById("r-emails").textContent = data.emails.length > 0 ? data.emails.join(", ") : "No encontrado";

  // WhatsApp
  const wa = data.socials.whatsapp;
  document.getElementById("r-whatsapp").innerHTML = wa ? `<a href="${wa}" target="_blank">Sí ✓</a>` : "No";

  // Socials
  const socialsEl = document.getElementById("r-socials");
  const socialEntries = Object.entries(data.socials);
  if (socialEntries.length > 0) {
    socialsEl.innerHTML = socialEntries.map(([k, v]) =>
      `<div class="data-row"><span class="data-label">${k}</span><span class="data-value"><a href="${v}" target="_blank">${k}</a></span></div>`
    ).join("");
  } else {
    socialsEl.textContent = "Ninguna detectada";
  }

  // Score
  const score = data.signals.score;
  const badge = document.getElementById("r-score-badge");
  badge.textContent = score;
  badge.className = `score-badge ${score >= 80 ? "score-high" : score >= 50 ? "score-mid" : "score-low"}`;

  // Signals
  const signalsEl = document.getElementById("r-signals");
  signalsEl.innerHTML = data.signals.details.map(s => `<div class="signal">✓ ${s}</div>`).join("");

  // Store for saving
  window._analyzedData = data;
}

// Save analyzed data as prospect
document.getElementById("btn-save-analyzed").addEventListener("click", () => {
  const data = window._analyzedData;
  if (!data) return;

  const clip = {
    url: data.url,
    title: data.company || data.title,
    description: data.description,
    company: data.company,
    phones: data.phones,
    emails: data.emails,
    socials: data.socials,
    category: data.category,
    score: data.signals.score,
    tags: [data.category],
    source: "extension",
    savedAt: new Date().toISOString(),
  };

  // Save to chrome.storage
  chrome.storage.local.get(["radar_clips"], (result) => {
    const clips = result.radar_clips || [];
    clips.unshift({ ...clip, id: Date.now().toString() });
    chrome.storage.local.set({ radar_clips: clips });
  });

  document.getElementById("btn-save-analyzed").textContent = "✓ Guardado como prospecto";
  document.getElementById("btn-save-analyzed").disabled = true;
});

// Save tab (manual)
document.getElementById("btn-save").addEventListener("click", () => {
  saveClip(Array.from(selectedTags));
});

// Quick save as favorite
document.getElementById("btn-save-fav").addEventListener("click", () => {
  saveClip(["Favorita"]);
  document.getElementById("btn-save-fav").textContent = "✓ Favorita guardada";
});

// Quick save for review
document.getElementById("btn-save-review").addEventListener("click", () => {
  saveClip(["Revisar después"]);
  document.getElementById("btn-save-review").textContent = "✓ Para revisar";
});

// Copy URL to clipboard
document.getElementById("btn-copy-url").addEventListener("click", () => {
  const url = document.getElementById("save-url").value;
  navigator.clipboard.writeText(url);
  document.getElementById("btn-copy-url").textContent = "✓";
  setTimeout(() => { document.getElementById("btn-copy-url").textContent = "📋"; }, 1500);
});

function saveClip(tags) {
  const clip = {
    id: Date.now().toString(),
    url: document.getElementById("save-url").value,
    title: document.getElementById("save-title").value,
    folderId: document.getElementById("save-folder").value,
    tags: tags,
    notes: document.getElementById("save-notes").value,
    source: "extension",
    savedAt: new Date().toISOString(),
  };

  chrome.storage.local.get(["radar_clips"], (result) => {
    const clips = result.radar_clips || [];
    clips.unshift(clip);
    chrome.storage.local.set({ radar_clips: clips });
  });

  document.getElementById("btn-save").textContent = "✓ Guardado";
  document.getElementById("btn-save").disabled = true;
}

// AI Analysis
document.getElementById("btn-ai-analyze").addEventListener("click", () => {
  const btn = document.getElementById("btn-ai-analyze");
  const result = document.getElementById("ai-result");
  const prompt = document.getElementById("ai-prompt").value;
  const data = window._analyzedData;

  btn.disabled = true;
  btn.textContent = "Analizando...";
  result.style.display = "block";
  result.textContent = "Procesando con IA...";

  // Simulated AI response (in production would call OpenRouter)
  setTimeout(() => {
    const company = data?.company || "esta empresa";
    const category = data?.category || "general";
    const hasWeb = data?.url ? "Sí" : "No";
    const phoneCount = data?.phones?.length || 0;

    result.textContent = `📋 BRIEF DE PROSPECCIÓN — ${company}\n\n` +
      `Industria: ${category}\n` +
      `Presencia digital: ${hasWeb ? "Tiene web" : "Sin web"}\n` +
      `Contactos encontrados: ${phoneCount} teléfono(s)\n` +
      `Score: ${data?.signals?.score || 50}/100\n\n` +
      `OPORTUNIDAD:\n` +
      `- ${category === "Clínica dental" ? "Puede necesitar marketing digital, GMB optimization" : "Posible cliente para servicios digitales"}\n` +
      `- ${phoneCount > 0 ? "Contacto directo disponible" : "Buscar email o red social para primer contacto"}\n\n` +
      `PRÓXIMO PASO SUGERIDO:\n` +
      `→ Contactar por ${data?.socials?.whatsapp ? "WhatsApp" : data?.socials?.linkedin ? "LinkedIn" : "email"} con plantilla de primer contacto.`;

    btn.disabled = false;
    btn.textContent = "✨ Analizar con IA";
  }, 2000);
});

// Auto-fill
document.getElementById("btn-autofill").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const data = {
      name: document.getElementById("af-name").value,
      email: document.getElementById("af-email").value,
      phone: document.getElementById("af-phone").value,
      company: document.getElementById("af-company").value,
      message: document.getElementById("af-message").value,
      url: tabs[0]?.url || "",
    };
    chrome.tabs.sendMessage(tabs[0].id, { action: "autoFillForm", data });
    document.getElementById("btn-autofill").textContent = "✓ Formularios rellenados";
    setTimeout(() => { document.getElementById("btn-autofill").textContent = "Rellenar formularios en esta página"; }, 2000);
  });
});

// Save autofill preset
document.getElementById("btn-save-af").addEventListener("click", () => {
  const preset = {
    name: document.getElementById("af-name").value,
    email: document.getElementById("af-email").value,
    phone: document.getElementById("af-phone").value,
    company: document.getElementById("af-company").value,
    message: document.getElementById("af-message").value,
  };
  chrome.storage.local.set({ autofill_preset: preset });
  document.getElementById("btn-save-af").textContent = "✓ Preset guardado";
  setTimeout(() => { document.getElementById("btn-save-af").textContent = "Guardar estos datos como preset"; }, 2000);
});

// Load autofill preset
chrome.storage.local.get(["autofill_preset"], (result) => {
  if (result.autofill_preset) {
    const p = result.autofill_preset;
    if (p.name) document.getElementById("af-name").value = p.name;
    if (p.email) document.getElementById("af-email").value = p.email;
    if (p.phone) document.getElementById("af-phone").value = p.phone;
    if (p.company) document.getElementById("af-company").value = p.company;
    if (p.message) document.getElementById("af-message").value = p.message;
  }
});

// Save settings
document.getElementById("btn-save-settings").addEventListener("click", () => {
  const settings = {
    crmUrl: document.getElementById("set-url").value,
    apiKey: document.getElementById("set-apikey").value,
    format: document.getElementById("set-format").value,
    aiProvider: document.getElementById("set-ai").value,
  };
  chrome.storage.local.set({ radar_settings: settings });
  document.getElementById("btn-save-settings").textContent = "✓ Guardado";
  setTimeout(() => { document.getElementById("btn-save-settings").textContent = "Guardar configuración"; }, 2000);
});

// Load settings
chrome.storage.local.get(["radar_settings"], (result) => {
  if (result.radar_settings) {
    const s = result.radar_settings;
    if (s.crmUrl) document.getElementById("set-url").value = s.crmUrl;
    if (s.apiKey) document.getElementById("set-apikey").value = s.apiKey;
    if (s.format) document.getElementById("set-format").value = s.format;
    if (s.aiProvider) document.getElementById("set-ai").value = s.aiProvider;
  }
});
