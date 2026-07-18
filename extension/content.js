// LocalRank Radar — Content Script
// Analyzes the current page and extracts business data

(function() {
  "use strict";

  // Extract data from the page
  function analyzePage() {
    const data = {
      url: window.location.href,
      title: document.title,
      domain: window.location.hostname,
      // Company name
      company: extractCompanyName(),
      // Contact info
      phones: extractPhones(),
      emails: extractEmails(),
      // Social links
      socials: extractSocials(),
      // Meta info
      description: extractMetaDescription(),
      category: guessCategory(),
      // Score signals
      signals: analyzeSignals(),
    };

    return data;
  }

  function extractCompanyName() {
    // Try og:site_name, then structured data, then domain
    const ogSite = document.querySelector('meta[property="og:site_name"]');
    if (ogSite) return ogSite.getAttribute("content");
    const schema = document.querySelector('script[type="application/ld+json"]');
    if (schema) {
      try { const j = JSON.parse(schema.textContent); if (j.name) return j.name; } catch(e) {}
    }
    // From title
    const title = document.title.split(/[|\-–—]/)[0].trim();
    if (title.length < 40) return title;
    // From domain
    return window.location.hostname.replace("www.", "").split(".")[0];
  }

  function extractPhones() {
    const text = document.body.innerText;
    const phoneRegex = /(\+?\d{1,3}[\s.-]?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4})/g;
    const matches = text.match(phoneRegex) || [];
    return [...new Set(matches.map(p => p.trim()))].slice(0, 5);
  }

  function extractEmails() {
    const text = document.body.innerText + " " + document.body.innerHTML;
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = text.match(emailRegex) || [];
    // Filter out common non-business emails
    const filtered = matches.filter(e =>
      !e.includes("example.com") &&
      !e.includes("sentry.io") &&
      !e.includes("webpack") &&
      !e.includes(".png") &&
      !e.includes(".jpg")
    );
    return [...new Set(filtered)].slice(0, 5);
  }

  function extractSocials() {
    const links = Array.from(document.querySelectorAll("a[href]"));
    const socials = {};
    links.forEach(a => {
      const href = a.href;
      if (href.includes("facebook.com/") && !href.includes("sharer")) socials.facebook = href;
      if (href.includes("instagram.com/")) socials.instagram = href;
      if (href.includes("linkedin.com/")) socials.linkedin = href;
      if (href.includes("twitter.com/") || href.includes("x.com/")) socials.x = href;
      if (href.includes("tiktok.com/")) socials.tiktok = href;
      if (href.includes("youtube.com/")) socials.youtube = href;
      if (href.includes("wa.me/") || href.includes("whatsapp.com")) socials.whatsapp = href;
    });
    return socials;
  }

  function extractMetaDescription() {
    const meta = document.querySelector('meta[name="description"]') || document.querySelector('meta[property="og:description"]');
    return meta ? meta.getAttribute("content") : "";
  }

  function guessCategory() {
    const text = (document.title + " " + extractMetaDescription()).toLowerCase();
    if (text.includes("dental") || text.includes("odonto") || text.includes("sonrisa")) return "Clínica dental";
    if (text.includes("abogado") || text.includes("legal") || text.includes("jurídico")) return "Legal";
    if (text.includes("restaurant") || text.includes("comida")) return "Restaurante";
    if (text.includes("marketing") || text.includes("agencia") || text.includes("digital")) return "Marketing";
    if (text.includes("software") || text.includes("tech") || text.includes("app")) return "Tecnología";
    if (text.includes("salud") || text.includes("médic") || text.includes("clínic")) return "Salud";
    if (text.includes("inmobil") || text.includes("propiedad")) return "Inmobiliaria";
    if (text.includes("educa") || text.includes("curso") || text.includes("academia")) return "Educación";
    return "General";
  }

  function analyzeSignals() {
    const signals = { score: 50, details: [] };

    // Has website (already on it)
    signals.score += 10;
    signals.details.push("Tiene sitio web (+10)");

    // Has phone
    if (extractPhones().length > 0) { signals.score += 10; signals.details.push("Tiene teléfono (+10)"); }

    // Has email
    if (extractEmails().length > 0) { signals.score += 10; signals.details.push("Tiene email (+10)"); }

    // Has social media
    const socials = extractSocials();
    const socialCount = Object.keys(socials).length;
    if (socialCount >= 3) { signals.score += 15; signals.details.push("3+ redes sociales (+15)"); }
    else if (socialCount >= 1) { signals.score += 5; signals.details.push("Tiene redes sociales (+5)"); }

    // SSL
    if (window.location.protocol === "https:") { signals.score += 5; signals.details.push("SSL activo (+5)"); }

    // Has structured data
    if (document.querySelector('script[type="application/ld+json"]')) { signals.score += 5; signals.details.push("Datos estructurados (+5)"); }

    // Content length (indicates active site)
    if (document.body.innerText.length > 3000) { signals.score += 5; signals.details.push("Contenido extenso (+5)"); }

    // Has WhatsApp
    if (socials.whatsapp) { signals.score += 5; signals.details.push("Tiene WhatsApp (+5)"); }

    return signals;
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "analyzePage") {
      const data = analyzePage();
      sendResponse(data);
    }
    if (request.action === "autoFillForm") {
      autoFillForms(request.data);
      sendResponse({ success: true });
    }
    return true;
  });

  // Auto-fill forms on the page
  function autoFillForms(data) {
    const inputs = document.querySelectorAll("input, textarea, select");
    inputs.forEach(input => {
      const name = (input.name || input.placeholder || input.id || "").toLowerCase();
      if ((name.includes("name") || name.includes("nombre")) && data.name) input.value = data.name;
      if ((name.includes("email") || name.includes("correo")) && data.email) input.value = data.email;
      if ((name.includes("phone") || name.includes("tel") || name.includes("celular")) && data.phone) input.value = data.phone;
      if ((name.includes("company") || name.includes("empresa")) && data.company) input.value = data.company;
      if ((name.includes("web") || name.includes("url") || name.includes("sitio")) && data.url) input.value = data.url;
      if (name.includes("message") || name.includes("mensaje")) {
        if (data.message) input.value = data.message;
      }
      // Trigger change events
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }
})();
