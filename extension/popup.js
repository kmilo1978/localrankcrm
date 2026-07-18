// LocalRank Radar — Chrome Extension popup script

const CRM_BASE_URL = "https://localrankcrm-livid.vercel.app";
const API_ENDPOINT = `${CRM_BASE_URL}/api/radar/clips`;

// Auto-fill current tab info
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const tab = tabs[0];
  if (tab) {
    document.getElementById("title").value = tab.title || "";
    document.getElementById("url").value = tab.url || "";
  }
});

// Tag selection
const selectedTags = new Set();
document.querySelectorAll(".tag").forEach((tag) => {
  tag.addEventListener("click", () => {
    const name = tag.dataset.tag;
    if (selectedTags.has(name)) {
      selectedTags.delete(name);
      tag.classList.remove("selected");
    } else {
      selectedTags.add(name);
      tag.classList.add("selected");
    }
  });
});

// Save clip
document.getElementById("save").addEventListener("click", async () => {
  const btn = document.getElementById("save");
  const status = document.getElementById("status");
  const form = document.getElementById("form");

  const clip = {
    url: document.getElementById("url").value,
    title: document.getElementById("title").value,
    folderId: document.getElementById("folder").value,
    tags: Array.from(selectedTags),
    notes: document.getElementById("notes").value,
    source: "extension",
    savedAt: new Date().toISOString(),
  };

  btn.disabled = true;
  btn.textContent = "Guardando...";

  try {
    // Try to send to CRM API
    const res = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clip),
    });

    if (res.ok) {
      form.style.display = "none";
      status.style.display = "block";
      status.className = "status success";
      status.textContent = "✓ Guardado en LocalRank CRM";
    } else {
      // Fallback: save to chrome.storage.local
      saveToLocal(clip);
    }
  } catch (err) {
    // Offline fallback: save to chrome.storage.local
    saveToLocal(clip);
  }
});

function saveToLocal(clip) {
  chrome.storage.local.get(["radar_clips"], (result) => {
    const clips = result.radar_clips || [];
    clips.unshift({ ...clip, id: Date.now().toString() });
    chrome.storage.local.set({ radar_clips: clips }, () => {
      const form = document.getElementById("form");
      const status = document.getElementById("status");
      form.style.display = "none";
      status.style.display = "block";
      status.className = "status success";
      status.textContent = "✓ Guardado localmente (se sincronizará)";
    });
  });
}
