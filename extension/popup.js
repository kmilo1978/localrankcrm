// LocalRank Radar — Popup Script v1.2
// Features: CRM Sync, Copy/Paste, Analysis, AI, AutoFill

// ============ SECURITY: HTML Escaping ============
function escapeHtml(str) {
  var div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// ============ UTILITIES ============
function showToast(msg, duration) {
  const toast = document.getElementById("toast");
  document.getElementById("toast-msg").textContent = msg;
  toast.classList.add("show");
  setTimeout(function() { toast.classList.remove("show"); }, duration || 2500);
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(function() {
    showToast("Copiado al portapapeles");
  });
}

function getSettings() {
  return new Promise(function(resolve) {
    chrome.storage.local.get(["radar_settings"], function(result) {
      resolve(result.radar_settings || {
        crmUrl: "https://localrankcrm-livid.vercel.app",
        apiKey: "",
        format: "crm",
        aiProvider: "openrouter",
        autoSync: "on"
      });
    });
  });
}

// ============ CRM SYNC ============
var crmConnected = false;

function updateSyncStatus(status, text) {
  var dot = document.getElementById("sync-dot");
  var label = document.getElementById("sync-text");
  dot.className = "sync-dot " + status;
  label.textContent = text;
}

function showStatusBar(type, msg) {
  var bar = document.getElementById("status-bar");
  bar.style.display = "flex";
  bar.className = "status-bar " + type;
  document.getElementById("status-msg").textContent = msg;
  if (type === "success") {
    setTimeout(function() { bar.style.display = "none"; }, 3000);
  }
}

async function testCRMConnection() {
  var settings = await getSettings();
  var url = settings.crmUrl || "https://localrankcrm-livid.vercel.app";
  try {
    updateSyncStatus("syncing", "Conectando...");
    var response = await fetch(url + "/api/extension/sync", { method: "GET" });
    if (response.ok) {
      var data = await response.json();
      if (data.ok) {
        crmConnected = true;
        updateSyncStatus("connected", "CRM conectado");
        return { ok: true, data: data };
      }
    }
    crmConnected = false;
    updateSyncStatus("disconnected", "Sin conexion");
    return { ok: false };
  } catch (e) {
    crmConnected = false;
    updateSyncStatus("disconnected", "Sin conexion");
    return { ok: false, error: e.message };
  }
}

async function syncToCRM(clip) {
  var settings = await getSettings();
  if (settings.autoSync === "off") return { ok: false, reason: "auto-sync off" };
  
  var url = settings.crmUrl || "https://localrankcrm-livid.vercel.app";
  try {
    updateSyncStatus("syncing", "Sincronizando...");
    var response = await fetch(url + "/api/extension/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "sync_clip", data: clip, apiKey: settings.apiKey })
    });
    var result = await response.json();
    if (result.ok) {
      updateSyncStatus("connected", "Sincronizado");
      showStatusBar("success", "Sincronizado con CRM");
      return { ok: true };
    }
    updateSyncStatus("disconnected", "Error sync");
    return { ok: false };
  } catch (e) {
    updateSyncStatus("disconnected", "Offline");
    return { ok: false, error: e.message };
  }
}

// ============ TAB NAVIGATION ============
document.querySelectorAll(".tabs button").forEach(function(btn) {
  btn.addEventListener("click", function() {
    document.querySelectorAll(".tabs button").forEach(function(b) { b.classList.remove("active"); });
    document.querySelectorAll(".content").forEach(function(c) { c.classList.remove("active"); });
    btn.classList.add("active");
    document.getElementById("tab-" + btn.dataset.tab).classList.add("active");
  });
});

// ============ TAG SELECTION ============
var selectedTags = new Set();
document.querySelectorAll(".tag").forEach(function(tag) {
  tag.addEventListener("click", function() {
    var name = tag.dataset.tag;
    if (selectedTags.has(name)) { selectedTags.delete(name); tag.classList.remove("selected"); }
    else { selectedTags.add(name); tag.classList.add("selected"); }
  });
});

// ============ COPY BUTTONS (individual fields) ============
document.querySelectorAll(".copy-btn[data-copy]").forEach(function(btn) {
  btn.addEventListener("click", function() {
    var el = document.getElementById(btn.dataset.copy);
    var text = el.textContent || el.innerText;
    copyToClipboard(text);
    btn.textContent = "OK";
    btn.classList.add("copied");
    setTimeout(function() { btn.textContent = "Copiar"; btn.classList.remove("copied"); }, 1500);
  });
});

// ============ COPY ALL (complete prospect data) ============
document.getElementById("btn-copy-all").addEventListener("click", function() {
  var data = window._analyzedData;
  if (!data) { showToast("No hay datos para copiar"); return; }
  var text = "PROSPECTO: " + (data.company || "Sin nombre") + "\n" +
    "URL: " + data.url + "\n" +
    "Categoria: " + (data.category || "General") + "\n" +
    "Telefonos: " + (data.phones || []).join(", ") + "\n" +
    "Emails: " + (data.emails || []).join(", ") + "\n" +
    "WhatsApp: " + (data.socials.whatsapp || "No") + "\n" +
    "Score: " + data.signals.score + "/100\n" +
    "Fecha: " + new Date().toLocaleDateString();
  copyToClipboard(text);
});

// Copy contact info
document.getElementById("btn-copy-contact").addEventListener("click", function() {
  var data = window._analyzedData;
  if (!data) { showToast("No hay datos"); return; }
  var text = (data.phones || []).join(", ") + " | " + (data.emails || []).join(", ");
  copyToClipboard(text);
});

// Copy as JSON
document.getElementById("btn-copy-json").addEventListener("click", function() {
  var data = window._analyzedData;
  if (!data) { showToast("No hay datos"); return; }
  var obj = {
    company: data.company, url: data.url, category: data.category,
    phones: data.phones, emails: data.emails, socials: data.socials,
    score: data.signals.score, date: new Date().toISOString()
  };
  copyToClipboard(JSON.stringify(obj, null, 2));
  showToast("JSON copiado al portapapeles");
});

// Copy as CSV
document.getElementById("btn-copy-csv").addEventListener("click", function() {
  var data = window._analyzedData;
  if (!data) { showToast("No hay datos"); return; }
  var csv = "Empresa,URL,Categoria,Telefonos,Emails,Score,Fecha\n" +
    '"' + (data.company || "") + '",' +
    '"' + data.url + '",' +
    '"' + (data.category || "") + '",' +
    '"' + (data.phones || []).join("; ") + '",' +
    '"' + (data.emails || []).join("; ") + '",' +
    data.signals.score + ',' +
    '"' + new Date().toLocaleDateString() + '"';
  copyToClipboard(csv);
  showToast("CSV copiado al portapapeles");
});

// Copy AI result
document.getElementById("btn-copy-ai").addEventListener("click", function() {
  var text = document.getElementById("ai-result-text").textContent;
  copyToClipboard(text);
});

// Copy URL
document.getElementById("btn-copy-url").addEventListener("click", function() {
  var url = document.getElementById("save-url").value;
  copyToClipboard(url);
  var btn = document.getElementById("btn-copy-url");
  btn.textContent = "OK";
  setTimeout(function() { btn.textContent = "Copiar"; }, 1500);
});

// ============ PASTE DATA ============
document.getElementById("btn-paste-data").addEventListener("click", function() {
  navigator.clipboard.readText().then(function(text) {
    try {
      var data = JSON.parse(text);
      if (data.title) document.getElementById("save-title").value = data.title;
      if (data.url) document.getElementById("save-url").value = data.url;
      if (data.notes) document.getElementById("save-notes").value = data.notes;
      showToast("Datos pegados desde portapapeles");
    } catch (e) {
      // If not JSON, paste as notes
      document.getElementById("save-notes").value = text;
      showToast("Texto pegado en notas");
    }
  }).catch(function() {
    showToast("No se pudo acceder al portapapeles");
  });
});

// Paste prospect data into AutoFill
document.getElementById("btn-paste-prospect").addEventListener("click", function() {
  var data = window._analyzedData;
  if (data) {
    if (data.company) document.getElementById("af-company").value = data.company;
    if (data.emails && data.emails[0]) document.getElementById("af-email").value = data.emails[0];
    if (data.phones && data.phones[0]) document.getElementById("af-phone").value = data.phones[0];
    showToast("Datos del prospecto pegados");
  } else {
    // Try from clipboard
    navigator.clipboard.readText().then(function(text) {
      try {
        var parsed = JSON.parse(text);
        if (parsed.company) document.getElementById("af-company").value = parsed.company;
        if (parsed.emails && parsed.emails[0]) document.getElementById("af-email").value = parsed.emails[0];
        if (parsed.phones && parsed.phones[0]) document.getElementById("af-phone").value = parsed.phones[0];
        showToast("Datos pegados del portapapeles");
      } catch (e) { showToast("No hay datos de prospecto"); }
    });
  }
});

// ============ AUTO-FILL + ANALYZE PAGE ============
chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
  var tab = tabs[0];
  if (!tab) return;

  document.getElementById("save-title").value = tab.title || "";
  document.getElementById("save-url").value = tab.url || "";

  // Request page analysis from content script
  chrome.tabs.sendMessage(tab.id, { action: "analyzePage" }, function(response) {
    if (chrome.runtime.lastError || !response) {
      document.getElementById("analyze-loading").textContent = "No se pudo analizar (pagina restringida)";
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
  
  // Sanitize URL before inserting as link
  var safeUrl = escapeHtml(data.url || "");
  var safeDomain = escapeHtml(data.domain || "");
  var urlEl = document.getElementById("r-url");
  urlEl.textContent = "";
  var urlLink = document.createElement("a");
  urlLink.href = safeUrl;
  urlLink.target = "_blank";
  urlLink.textContent = safeDomain;
  urlEl.appendChild(urlLink);
  
  document.getElementById("r-phones").textContent = data.phones.length > 0 ? data.phones.join(", ") : "No encontrado";
  document.getElementById("r-emails").textContent = data.emails.length > 0 ? data.emails.join(", ") : "No encontrado";

  // WhatsApp
  var wa = data.socials.whatsapp;
  var waEl = document.getElementById("r-whatsapp");
  if (wa) {
    waEl.textContent = "";
    var waLink = document.createElement("a");
    waLink.href = escapeHtml(wa);
    waLink.target = "_blank";
    waLink.textContent = "Si";
    waEl.appendChild(waLink);
  } else {
    waEl.textContent = "No";
  }

  // Socials (safe DOM creation)
  var socialsEl = document.getElementById("r-socials");
  var socialEntries = Object.entries(data.socials);
  if (socialEntries.length > 0) {
    socialsEl.textContent = "";
    socialEntries.forEach(function(entry) {
      var row = document.createElement("div");
      row.className = "data-row";
      var label = document.createElement("span");
      label.className = "data-label";
      label.textContent = entry[0];
      var val = document.createElement("span");
      val.className = "data-value";
      var link = document.createElement("a");
      link.href = entry[1];
      link.target = "_blank";
      link.textContent = entry[0];
      val.appendChild(link);
      var copyBtn = document.createElement("button");
      copyBtn.className = "copy-btn";
      copyBtn.textContent = "Copiar";
      copyBtn.addEventListener("click", function() { navigator.clipboard.writeText(entry[1]); });
      row.appendChild(label);
      row.appendChild(val);
      row.appendChild(copyBtn);
      socialsEl.appendChild(row);
    });
  } else {
    socialsEl.textContent = "Ninguna detectada";
  }

  // Score
  var score = data.signals.score;
  var badge = document.getElementById("r-score-badge");
  badge.textContent = score;
  badge.className = "score-badge " + (score >= 80 ? "score-high" : score >= 50 ? "score-mid" : "score-low");

  // Signals (safe DOM)
  var signalsEl = document.getElementById("r-signals");
  signalsEl.textContent = "";
  data.signals.details.forEach(function(s) {
    var div = document.createElement("div");
    div.className = "signal";
    div.textContent = s;
    signalsEl.appendChild(div);
  });

  // Store for saving
  window._analyzedData = data;
}

// ============ SAVE + SYNC ============
document.getElementById("btn-save-analyzed").addEventListener("click", async function() {
  var data = window._analyzedData;
  if (!data) return;

  var clip = {
    id: Date.now().toString(),
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

  // Save to chrome.storage (offline-first)
  chrome.storage.local.get(["radar_clips"], function(result) {
    var clips = result.radar_clips || [];
    clips.unshift(clip);
    chrome.storage.local.set({ radar_clips: clips });
  });

  // Sync to CRM
  var syncResult = await syncToCRM(clip);
  
  var btn = document.getElementById("btn-save-analyzed");
  if (syncResult.ok) {
    btn.textContent = "Guardado y sincronizado";
  } else {
    btn.textContent = "Guardado local (sync pendiente)";
  }
  btn.disabled = true;
});

// Save tab (manual)
document.getElementById("btn-save").addEventListener("click", function() {
  saveClip(Array.from(selectedTags));
});

// Quick save as favorite
document.getElementById("btn-save-fav").addEventListener("click", function() {
  saveClip(["Favorita"]);
  document.getElementById("btn-save-fav").textContent = "Guardada";
});

// Quick save for review
document.getElementById("btn-save-review").addEventListener("click", function() {
  saveClip(["Revisar despues"]);
  document.getElementById("btn-save-review").textContent = "Marcada";
});

async function saveClip(tags) {
  var clip = {
    id: Date.now().toString(),
    url: document.getElementById("save-url").value,
    title: document.getElementById("save-title").value,
    folderId: document.getElementById("save-folder").value,
    tags: tags,
    notes: document.getElementById("save-notes").value,
    source: "extension",
    savedAt: new Date().toISOString(),
  };

  // Save locally
  chrome.storage.local.get(["radar_clips"], function(result) {
    var clips = result.radar_clips || [];
    clips.unshift(clip);
    chrome.storage.local.set({ radar_clips: clips });
  });

  // Sync to CRM
  var syncResult = await syncToCRM(clip);
  
  var btn = document.getElementById("btn-save");
  if (syncResult.ok) {
    btn.textContent = "Guardado y sincronizado";
  } else {
    btn.textContent = "Guardado (offline)";
  }
  btn.disabled = true;
}

// ============ AI ANALYSIS ============
document.getElementById("btn-ai-analyze").addEventListener("click", function() {
  var btn = document.getElementById("btn-ai-analyze");
  var resultDiv = document.getElementById("ai-result");
  var resultText = document.getElementById("ai-result-text");
  var prompt = document.getElementById("ai-prompt").value;
  var data = window._analyzedData;

  btn.disabled = true;
  btn.textContent = "Analizando...";
  resultDiv.style.display = "block";
  resultText.textContent = "Procesando con IA...";

  // Simulated AI response (in production would call OpenRouter)
  setTimeout(function() {
    var company = data ? data.company : "esta empresa";
    var category = data ? data.category : "general";
    var hasWeb = data && data.url ? "Si" : "No";
    var phoneCount = data && data.phones ? data.phones.length : 0;

    resultText.textContent = "BRIEF DE PROSPECCION - " + company + "\n\n" +
      "Industria: " + category + "\n" +
      "Presencia digital: " + (hasWeb ? "Tiene web" : "Sin web") + "\n" +
      "Contactos encontrados: " + phoneCount + " telefono(s)\n" +
      "Score: " + (data ? data.signals.score : 50) + "/100\n\n" +
      "OPORTUNIDAD:\n" +
      "- Posible cliente para servicios digitales\n" +
      "- " + (phoneCount > 0 ? "Contacto directo disponible" : "Buscar email o red social") + "\n\n" +
      "PROXIMO PASO SUGERIDO:\n" +
      "Contactar por " + (data && data.socials && data.socials.whatsapp ? "WhatsApp" : "email") + " con plantilla de primer contacto.";

    btn.disabled = false;
    btn.textContent = "Analizar con IA";
  }, 2000);
});

// ============ AUTOFILL ============
document.getElementById("btn-autofill").addEventListener("click", function() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    var data = {
      name: document.getElementById("af-name").value,
      email: document.getElementById("af-email").value,
      phone: document.getElementById("af-phone").value,
      company: document.getElementById("af-company").value,
      message: document.getElementById("af-message").value,
      url: tabs[0] ? tabs[0].url : "",
    };
    chrome.tabs.sendMessage(tabs[0].id, { action: "autoFillForm", data: data });
    showToast("Formularios rellenados en la pagina");
  });
});

// Save autofill preset
document.getElementById("btn-save-af").addEventListener("click", function() {
  var preset = {
    name: document.getElementById("af-name").value,
    email: document.getElementById("af-email").value,
    phone: document.getElementById("af-phone").value,
    company: document.getElementById("af-company").value,
    message: document.getElementById("af-message").value,
  };
  chrome.storage.local.set({ autofill_preset: preset });
  showToast("Preset guardado");
});

// Load autofill preset
chrome.storage.local.get(["autofill_preset"], function(result) {
  if (result.autofill_preset) {
    var p = result.autofill_preset;
    if (p.name) document.getElementById("af-name").value = p.name;
    if (p.email) document.getElementById("af-email").value = p.email;
    if (p.phone) document.getElementById("af-phone").value = p.phone;
    if (p.company) document.getElementById("af-company").value = p.company;
    if (p.message) document.getElementById("af-message").value = p.message;
  }
});

// ============ SETTINGS ============
document.getElementById("btn-save-settings").addEventListener("click", function() {
  var settings = {
    crmUrl: document.getElementById("set-url").value,
    apiKey: document.getElementById("set-apikey").value,
    format: document.getElementById("set-format").value,
    aiProvider: document.getElementById("set-ai").value,
    autoSync: document.getElementById("set-autosync").value,
  };
  chrome.storage.local.set({ radar_settings: settings });
  showToast("Configuracion guardada");
  // Re-test connection with new settings
  testCRMConnection();
});

// Test connection button
document.getElementById("btn-test-connection").addEventListener("click", async function() {
  var resultEl = document.getElementById("connection-result");
  resultEl.textContent = "Probando...";
  resultEl.style.color = "#757684";
  
  var result = await testCRMConnection();
  if (result.ok) {
    resultEl.textContent = "Conectado a " + result.data.app + " v" + result.data.version;
    resultEl.style.color = "#16a34a";
  } else {
    resultEl.textContent = "No se pudo conectar. Verifica la URL.";
    resultEl.style.color = "#dc2626";
  }
});

// Load settings
chrome.storage.local.get(["radar_settings"], function(result) {
  if (result.radar_settings) {
    var s = result.radar_settings;
    if (s.crmUrl) document.getElementById("set-url").value = s.crmUrl;
    if (s.apiKey) document.getElementById("set-apikey").value = s.apiKey;
    if (s.format) document.getElementById("set-format").value = s.format;
    if (s.aiProvider) document.getElementById("set-ai").value = s.aiProvider;
    if (s.autoSync) document.getElementById("set-autosync").value = s.autoSync;
  }
});

// ============ EXPORT DATA ============
document.getElementById("btn-export-all").addEventListener("click", function() {
  chrome.storage.local.get(["radar_clips"], function(result) {
    var clips = result.radar_clips || [];
    var json = JSON.stringify(clips, null, 2);
    copyToClipboard(json);
    showToast(clips.length + " clips copiados como JSON");
  });
});

document.getElementById("btn-export-csv").addEventListener("click", function() {
  chrome.storage.local.get(["radar_clips"], function(result) {
    var clips = result.radar_clips || [];
    var csv = "ID,Titulo,URL,Empresa,Telefonos,Emails,Categoria,Score,Tags,Fecha\n";
    clips.forEach(function(c) {
      csv += '"' + c.id + '","' + (c.title || "") + '","' + (c.url || "") + '","' + (c.company || "") + '","' + (c.phones || []).join("; ") + '","' + (c.emails || []).join("; ") + '","' + (c.category || "") + '",' + (c.score || 0) + ',"' + (c.tags || []).join("; ") + '","' + (c.savedAt || "") + '"\n';
    });
    copyToClipboard(csv);
    showToast(clips.length + " clips copiados como CSV");
  });
});

document.getElementById("btn-clear-data").addEventListener("click", function() {
  if (confirm("Borrar todos los datos guardados? Esta accion no se puede deshacer.")) {
    chrome.storage.local.remove(["radar_clips"], function() {
      showToast("Datos borrados");
    });
  }
});

// ============ INITIAL CONNECTION CHECK ============
testCRMConnection();
