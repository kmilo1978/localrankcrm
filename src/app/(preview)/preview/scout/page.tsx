"use client";
import { useState, useEffect } from "react";
import { AlertCircle, ArrowRight, Check, Download, ExternalLink, Globe, Loader2, Plus, RefreshCw, Search, Send, Settings, Sparkles, Upload, X, Zap } from "lucide-react";
import { generateId } from "@/lib/local-storage";

type ScoutResult = {
  id: string;
  platform: string;
  username: string;
  name: string;
  bio: string;
  followers: number;
  email: string;
  phone: string;
  website: string;
  company: string;
  score: number;
  verified: boolean;
  links: string[];
  scrapedAt: string;
};

type ScoutConfig = {
  apiUrl: string;
  linkedinCookie: string;
  proxy: string;
  hunterApiKey: string;
};

const PLATFORMS = [
  { id: "instagram", name: "Instagram", icon: "📷", auth: "Ninguno", color: "bg-pink-100 text-pink-700" },
  { id: "tiktok", name: "TikTok", icon: "🎵", auth: "Ninguno", color: "bg-gray-100 text-gray-700" },
  { id: "linkedin", name: "LinkedIn", icon: "💼", auth: "Cookie li_at", color: "bg-blue-100 text-blue-700" },
  { id: "github", name: "GitHub", icon: "🐙", auth: "Ninguno", color: "bg-gray-100 text-gray-800" },
  { id: "youtube", name: "YouTube", icon: "▶️", auth: "Ninguno", color: "bg-red-100 text-red-700" },
  { id: "twitch", name: "Twitch", icon: "🟣", auth: "Ninguno", color: "bg-purple-100 text-purple-700" },
  { id: "pinterest", name: "Pinterest", icon: "📌", auth: "Ninguno", color: "bg-red-100 text-red-600" },
  { id: "linktree", name: "Linktree", icon: "🌳", auth: "Ninguno", color: "bg-green-100 text-green-700" },
];

const DEMO_RESULTS: ScoutResult[] = [
  { id: "sr1", platform: "instagram", username: "carlosruiz.dev", name: "Carlos Ruiz", bio: "CTO at TechCorp · Fullstack dev · Building SaaS", followers: 12400, email: "carlos@techcorp.io", phone: "", website: "techcorp.io", company: "TechCorp", score: 92, verified: true, links: ["https://techcorp.io", "https://linkedin.com/in/carlosruiz"], scrapedAt: "2026-07-24" },
  { id: "sr2", platform: "linkedin", username: "maria-garcia-logistic", name: "María García", bio: "VP Operations at LogiNext · Supply chain optimization · MBA", followers: 8900, email: "mgarcia@loginext.co", phone: "+57 300 123 4567", website: "loginext.co", company: "LogiNext", score: 88, verified: true, links: ["https://loginext.co"], scrapedAt: "2026-07-24" },
  { id: "sr3", platform: "tiktok", username: "roberto.mendez", name: "Roberto Méndez", bio: "Marketing digital | Ayudo a pymes a vender más", followers: 45000, email: "roberto@mediagroup.com.co", phone: "", website: "mediagroup.com.co", company: "MediaGroup", score: 78, verified: false, links: ["https://mediagroup.com.co", "https://wa.me/573001234567"], scrapedAt: "2026-07-24" },
  { id: "sr4", platform: "github", username: "lucivega", name: "Lucía Vega", bio: "Backend engineer · Rust & Go · Open source contributor", followers: 2300, email: "lucia@finserv.dev", phone: "", website: "finserv.dev", company: "FinServ", score: 85, verified: true, links: ["https://finserv.dev"], scrapedAt: "2026-07-24" },
  { id: "sr5", platform: "youtube", username: "DiegoMoralesMarketing", name: "Diego Morales", bio: "Marketing digital para Latam | +50K suscriptores | Consultor SEO", followers: 52000, email: "diego@dmorales.com", phone: "+57 311 987 6543", website: "dmorales.com", company: "DM Consulting", score: 95, verified: true, links: ["https://dmorales.com", "https://calendly.com/dmorales"], scrapedAt: "2026-07-24" },
  { id: "sr6", platform: "twitch", username: "anadev_co", name: "Ana Torres", bio: "Streamer dev | Programación en vivo | Comunidad tech Latam", followers: 18000, email: "ana@innovatelab.co", phone: "", website: "innovatelab.co", company: "InnovateLab", score: 72, verified: false, links: ["https://innovatelab.co", "https://discord.gg/anadev"], scrapedAt: "2026-07-24" },
];

function getScoreColor(score: number) {
  if (score >= 90) return "bg-green-100 text-green-700";
  if (score >= 75) return "bg-blue-100 text-blue-700";
  if (score >= 50) return "bg-amber-100 text-amber-700";
  return "bg-gray-100 text-gray-600";
}

export default function ScoutPage() {
  const [results, setResults] = useState<ScoutResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [platform, setPlatform] = useState("instagram");
  const [username, setUsername] = useState("");
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkList, setBulkList] = useState("");
  const [showConfig, setShowConfig] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [config, setConfig] = useState<ScoutConfig>({ apiUrl: "", linkedinCookie: "", proxy: "", hunterApiKey: "" });
  const [toast, setToast] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("localrank_scout_config");
      if (saved) setConfig(JSON.parse(saved));
      const savedResults = localStorage.getItem("localrank_scout_results");
      if (savedResults) setResults(JSON.parse(savedResults));
    } catch {}
  }, []);

  function saveConfig() {
    localStorage.setItem("localrank_scout_config", JSON.stringify(config));
    setShowConfig(false);
    showToast("✓ Configuración guardada");
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function runSearch() {
    if (!username.trim() && !bulkMode) return;
    setLoading(true);

    if (config.apiUrl) {
      // Real Scout API call
      try {
        const usernames = bulkMode ? bulkList.split("\n").map(u => u.trim()).filter(Boolean) : [username.trim()];
        const res = await fetch(`${config.apiUrl}/scrape`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ platform, usernames, linkedin_cookie: config.linkedinCookie || undefined, proxy: config.proxy || undefined }),
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        const mapped: ScoutResult[] = (data.results || []).map((r: Record<string, unknown>) => ({
          id: generateId(), platform, username: (r.username as string) || "", name: (r.name as string) || "", bio: (r.bio as string) || "",
          followers: (r.followers as number) || 0, email: (r.email as string) || "", phone: (r.phone as string) || "",
          website: (r.website as string) || "", company: (r.company as string) || "", score: (r.score as number) || 50,
          verified: (r.verified as boolean) || false, links: (r.links as string[]) || [], scrapedAt: new Date().toISOString().split("T")[0]!,
        }));
        setResults(prev => [...mapped, ...prev]);
        localStorage.setItem("localrank_scout_results", JSON.stringify([...mapped, ...results]));
        showToast(`✓ ${mapped.length} leads encontrados`);
      } catch (err) {
        showToast(`❌ Error: ${err instanceof Error ? err.message : "No se pudo conectar con Scout API"}`);
      }
    } else {
      // Demo mode — generate realistic data based on input username
      await new Promise(r => setTimeout(r, 1500));
      const usernames = bulkMode ? bulkList.split("\n").map(u => u.trim()).filter(Boolean) : [username.trim()];
      const bios = ["CEO & Founder", "Marketing Digital | Consultor", "Desarrollador Full Stack", "Diseñadora UX/UI", "Growth Hacker | SaaS", "Community Manager", "Emprendedor | Speaker", "Data Scientist", "Product Manager", "Freelancer & Creador de contenido"];
      const companies = ["", "TechCorp", "Digital Media", "StartupX", "AgenciaPro", "InnovateHQ", "CloudBase", "NextLevel", "CreativeLab", "DataVentures"];
      const domains = ["gmail.com", "outlook.com", "hotmail.com"];

      const generated: ScoutResult[] = usernames.map(u => {
        const clean = u.replace(/[@_.-]/g, " ").trim();
        const parts = clean.split(/\s+/);
        const firstName = parts[0] || u;
        const lastName = parts[1] || "";
        const displayName = lastName ? `${firstName.charAt(0).toUpperCase() + firstName.slice(1)} ${lastName.charAt(0).toUpperCase() + lastName.slice(1)}` : firstName.charAt(0).toUpperCase() + firstName.slice(1);
        const randBio = bios[Math.floor(Math.random() * bios.length)]!;
        const randCompany = companies[Math.floor(Math.random() * companies.length)]!;
        const score = Math.floor(Math.random() * 40) + 55;
        const followers = Math.floor(Math.random() * 50000) + 200;
        const hasEmail = Math.random() > 0.3;
        const domain = randCompany ? `${randCompany.toLowerCase().replace(/\s/g, "")}.com` : domains[Math.floor(Math.random() * domains.length)]!;
        const email = hasEmail ? `${firstName.toLowerCase()}${lastName ? "." + lastName.toLowerCase() : ""}@${domain}` : "";
        const hasPhone = Math.random() > 0.6;
        const phone = hasPhone ? `+57 3${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}` : "";
        const website = randCompany ? `${randCompany.toLowerCase().replace(/\s/g, "")}.com` : "";

        return {
          id: generateId(), platform, username: u, name: displayName, bio: randBio,
          followers, email, phone, website, company: randCompany, score,
          verified: hasEmail && score > 75, links: website ? [`https://${website}`] : [],
          scrapedAt: new Date().toISOString().split("T")[0]!,
        };
      });

      setResults(prev => [...generated, ...prev]);
      localStorage.setItem("localrank_scout_results", JSON.stringify([...generated, ...results]));
      showToast(`✓ ${generated.length} leads encontrados (modo demo — conecta Scout API para datos reales)`);
    }
    setLoading(false);
    setUsername("");
    setBulkList("");
  }

  function sendToColdContacts(result: ScoutResult) {
    try {
      const contacts = JSON.parse(localStorage.getItem("localrank_cold_contacts") || localStorage.getItem("cold_contacts") || "[]");
      const exists = contacts.some((c: { name: string }) => c.name === result.name);
      if (exists) { showToast(`⚠️ "${result.name}" ya existe en Contactos Fríos`); return; }
      contacts.unshift({
        id: generateId(), name: result.name, phone: result.phone, website: result.website,
        category: result.company || result.platform, rating: 0, reviews: 0, address: "",
        description: result.bio, clase: result.verified ? "Cliente caliente" : "No verificado",
        motivo: `Scout: ${result.platform} · Score ${result.score}`, score: result.score,
        stageId: "cs1", notes: `Scrapeado desde ${result.platform} (@${result.username})\nEmail: ${result.email}\nLinks: ${result.links.join(", ")}`,
        addedAt: new Date().toISOString().split("T")[0]!, customFields: [
          { id: generateId(), label: "Email", value: result.email },
          { id: generateId(), label: "Plataforma", value: result.platform },
          { id: generateId(), label: "Username", value: `@${result.username}` },
          { id: generateId(), label: "Seguidores", value: result.followers.toLocaleString() },
        ], outreachChannel: result.platform === "linkedin" ? "linkedin" : result.platform === "instagram" ? "instagram" : "email", followUps: [],
      });
      localStorage.setItem("cold_contacts", JSON.stringify(contacts));
      showToast(`✓ "${result.name}" enviado a Contactos Fríos`);
    } catch { showToast("❌ Error al enviar"); }
  }

  function sendToContacts(result: ScoutResult) {
    try {
      const contacts = JSON.parse(localStorage.getItem("localrank_contacts") || localStorage.getItem("contacts") || "[]");
      contacts.unshift({ id: generateId(), name: result.name, phone: result.phone, email: result.email, company: result.company, role: result.bio.slice(0, 50), image: "", archived: false, createdAt: new Date().toISOString().split("T")[0]!, customFields: [], notes: [], reminders: [] });
      localStorage.setItem("contacts", JSON.stringify(contacts));
      showToast(`✓ "${result.name}" enviado a Contactos`);
    } catch { showToast("❌ Error al enviar"); }
  }

  function exportCSV() {
    if (results.length === 0) return;
    const headers = ["Plataforma", "Username", "Nombre", "Email", "Teléfono", "Website", "Empresa", "Bio", "Seguidores", "Score", "Verificado"];
    const rows = results.map(r => [r.platform, r.username, r.name, r.email, r.phone, r.website, r.company, r.bio.replace(/,/g, ";"), r.followers, r.score, r.verified ? "Sí" : "No"]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `scout-leads-${new Date().toISOString().split("T")[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  function clearResults() { setResults([]); localStorage.removeItem("localrank_scout_results"); }

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2"><Search className="h-5 w-5 text-brand" />Scout — Lead Scraper</h1>
            <p className="text-xs md:text-sm text-muted-foreground">Scrapea perfiles de 8 plataformas, enriquece con email verificado y exporta.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setShowInfo(!showInfo)} className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-gray-50">
              <Sparkles className="h-3.5 w-3.5" />Info & Alcance
            </button>
            <button onClick={() => setShowConfig(!showConfig)} className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-gray-50">
              <Settings className="h-3.5 w-3.5" />Configurar API
            </button>
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${config.apiUrl ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
              {config.apiUrl ? "✓ API conectada" : "⚡ Modo demo"}
            </span>
          </div>
        </div>

        {/* Info & Alcance Panel */}
        {showInfo && (
          <div className="mb-6 rounded-lg border bg-white p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">📡 Scout — Alcance y Servicios</h3>
              <button onClick={() => setShowInfo(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            <p className="text-xs text-muted-foreground">Scout es un scraper de leads que extrae perfiles públicos de 8 plataformas, busca emails verificados vía SMTP, y genera un score de calidad.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {PLATFORMS.map(p => (
                <div key={p.id} className={`rounded-lg p-3 ${p.color}`}>
                  <div className="text-lg mb-1">{p.icon}</div>
                  <p className="text-xs font-semibold">{p.name}</p>
                  <p className="text-[10px] opacity-80">Auth: {p.auth}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <h4 className="font-semibold mb-1">🔍 Datos extraídos por perfil:</h4>
                <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                  <li>Nombre, bio, seguidores</li>
                  <li>Email (desde bio, website, SMTP verify)</li>
                  <li>Teléfono (si está en bio/links)</li>
                  <li>Website personal/empresa</li>
                  <li>Empresa (detectada desde headline)</li>
                  <li>Links externos (Linktree, WhatsApp, etc.)</li>
                  <li>Lead Score 0-100</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-1">⚡ Enrichment (sin API de pago):</h4>
                <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                  <li>Extrae email/phone de la bio</li>
                  <li>Scrapea /contact y /about del website</li>
                  <li>Detecta empresa desde headline</li>
                  <li>Busca dominio via DNS MX lookup</li>
                  <li>Genera candidatos de email (first.last@, first@)</li>
                  <li>Verifica via SMTP (gratis)</li>
                  <li>Opcional: Hunter.io como respaldo</li>
                </ul>
              </div>
            </div>

            <div className="rounded-lg border bg-gray-50 p-4 space-y-2">
              <h4 className="font-semibold text-xs">🚀 Instrucciones de instalación (backend)</h4>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-muted-foreground">
                <li>Clona el repo: <code className="bg-white px-1 py-0.5 rounded border text-[10px]">git clone https://github.com/kiryano/Scout.git</code></li>
                <li>Instala dependencias: <code className="bg-white px-1 py-0.5 rounded border text-[10px]">pip install -r requirements.txt</code></li>
                <li>Copia <code className="bg-white px-1 py-0.5 rounded border text-[10px]">.env.example</code> a <code className="bg-white px-1 py-0.5 rounded border text-[10px]">.env</code> y configura</li>
                <li>Monta como API con FastAPI (wrapper) en Railway/Render/VPS</li>
                <li>Pon la URL del servicio en <strong>Configurar API</strong> arriba</li>
              </ol>
              <div className="mt-2 rounded border bg-white p-3">
                <p className="text-[10px] font-mono text-muted-foreground mb-1"># Ejemplo FastAPI wrapper (main.py):</p>
                <pre className="text-[10px] font-mono whitespace-pre-wrap">{`from fastapi import FastAPI
from app.scrapers import instagram, tiktok, linkedin, github, youtube, twitch, pinterest, linktree

app = FastAPI()

@app.post("/scrape")
async def scrape(platform: str, usernames: list[str]):
    scraper = {"instagram": instagram, "tiktok": tiktok, "linkedin": linkedin,
               "github": github, "youtube": youtube, "twitch": twitch,
               "pinterest": pinterest, "linktree": linktree}[platform]
    results = [scraper.scrape(u) for u in usernames]
    return {"results": results}`}</pre>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                <strong>Limitaciones:</strong> Instagram puede requerir reintentos por IP · TikTok puede mostrar CAPTCHA · LinkedIn cookies expiran · GitHub: 60 req/hr sin token · SMTP puede ser bloqueado por algunos servidores
              </p>
            </div>
          </div>
        )}

        {/* Config Panel */}
        {showConfig && (
          <div className="mb-6 rounded-lg border border-brand/30 bg-brand-tint/20 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">⚙️ Configurar Scout API</h3>
              <button onClick={() => setShowConfig(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">URL del servidor Scout</label>
                <input value={config.apiUrl} onChange={e => setConfig({...config, apiUrl: e.target.value})} placeholder="https://scout-api.railway.app" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
                <p className="text-[9px] text-muted-foreground mt-0.5">Déjalo vacío para modo demo</p>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">LinkedIn Cookie (li_at)</label>
                <input value={config.linkedinCookie} onChange={e => setConfig({...config, linkedinCookie: e.target.value})} type="password" placeholder="AQEDAxxxxx..." className="w-full rounded-md border px-3 py-2 text-sm font-mono focus:border-brand focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Proxy (opcional)</label>
                <input value={config.proxy} onChange={e => setConfig({...config, proxy: e.target.value})} placeholder="http://user:pass@host:port" className="w-full rounded-md border px-3 py-2 text-sm font-mono focus:border-brand focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Hunter.io API Key (opcional)</label>
                <input value={config.hunterApiKey} onChange={e => setConfig({...config, hunterApiKey: e.target.value})} type="password" placeholder="tu-api-key" className="w-full rounded-md border px-3 py-2 text-sm font-mono focus:border-brand focus:outline-none" />
              </div>
            </div>
            <button onClick={saveConfig} className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover">Guardar configuración</button>
          </div>
        )}

        {/* Search form */}
        <div className="mb-6 rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex gap-1">
              {PLATFORMS.map(p => (
                <button key={p.id} onClick={() => setPlatform(p.id)} className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${platform === p.id ? "bg-brand text-white" : "border hover:bg-gray-50"}`} title={p.name}>
                  {p.icon}
                </button>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {PLATFORMS.find(p => p.id === platform)?.name} · Auth: {PLATFORMS.find(p => p.id === platform)?.auth}
            </span>
            <label className="ml-auto flex items-center gap-1.5 text-xs">
              <input type="checkbox" checked={bulkMode} onChange={e => setBulkMode(e.target.checked)} className="accent-[var(--accent)]" />
              Bulk (lista)
            </label>
          </div>

          {bulkMode ? (
            <div className="space-y-2">
              <textarea value={bulkList} onChange={e => setBulkList(e.target.value)} rows={4} placeholder="Un username por línea:&#10;carlosruiz.dev&#10;maria_garcia&#10;roberto.mendez" className="w-full rounded-md border px-3 py-2 text-sm font-mono focus:border-brand focus:outline-none" />
              <div className="flex items-center gap-2">
                <button onClick={runSearch} disabled={!bulkList.trim() || loading} className="flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                  Scrapear {bulkList.split("\n").filter(Boolean).length} perfiles
                </button>
                <span className="text-[10px] text-muted-foreground">Máx 50 por lote</span>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <input value={username} onChange={e => setUsername(e.target.value)} onKeyDown={e => { if (e.key === "Enter") runSearch(); }} placeholder={`Username de ${PLATFORMS.find(p => p.id === platform)?.name} (sin @)...`} className="flex-1 rounded-md border px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              <button onClick={runSearch} disabled={!username.trim() || loading} className="flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Buscar
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">{results.length} leads encontrados</h3>
              <div className="flex gap-2">
                <button onClick={exportCSV} className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-gray-50"><Download className="h-3.5 w-3.5" />Exportar CSV</button>
                <button onClick={clearResults} className="flex items-center gap-1 rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"><X className="h-3.5 w-3.5" />Limpiar</button>
              </div>
            </div>

            <div className="space-y-2">
              {results.map(r => (
                <div key={r.id} className="rounded-lg border bg-white p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base">{PLATFORMS.find(p => p.id === r.platform)?.icon}</span>
                        <span className="text-sm font-semibold">{r.name}</span>
                        <span className="text-[10px] text-muted-foreground">@{r.username}</span>
                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${getScoreColor(r.score)}`}>Score: {r.score}</span>
                        {r.verified && <span className="flex items-center gap-0.5 rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] text-green-700"><Check className="h-3 w-3" />Verificado</span>}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{r.bio}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        {r.email && <span className="flex items-center gap-1">📧 {r.email}</span>}
                        {r.phone && <span className="flex items-center gap-1">📱 {r.phone}</span>}
                        {r.website && <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{r.website}</span>}
                        {r.company && <span className="flex items-center gap-1">🏢 {r.company}</span>}
                        <span className="flex items-center gap-1">👥 {r.followers.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button onClick={() => sendToColdContacts(r)} className="rounded border border-brand/30 px-2.5 py-1 text-[10px] font-medium text-brand hover:bg-brand-tint">→ Prospección</button>
                      <button onClick={() => sendToContacts(r)} className="rounded border px-2.5 py-1 text-[10px] font-medium hover:bg-gray-50">→ Contactos</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {results.length === 0 && !loading && (
          <div className="text-center py-16">
            <Search className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground mb-1">Busca un username para empezar</p>
            <p className="text-xs text-muted-foreground">Los resultados se guardan localmente. Exporta a CSV o envía directo a Prospección.</p>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-gray-900 px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
