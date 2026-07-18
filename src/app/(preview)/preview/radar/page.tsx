"use client";
import { useState, useEffect } from "react";
import { Bookmark, ExternalLink, Folder, Globe, Plus, Search, Tag, Trash2, X } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";

type ClipTag = { id: string; name: string; color: string };
type ClipFolder = { id: string; name: string; color: string };
type WebClip = {
  id: string;
  url: string;
  title: string;
  description: string;
  image: string;
  folderId: string;
  tags: string[];
  notes: string;
  savedAt: string;
  source: "extension" | "manual";
};

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#e91e8c", "#8b5cf6", "#ef4444", "#06b6d4"];

const SEED_FOLDERS: ClipFolder[] = [
  { id: "rf1", name: "Prospectos LinkedIn", color: "#0A66C2" },
  { id: "rf2", name: "Competencia", color: "#ef4444" },
  { id: "rf3", name: "Recursos útiles", color: "#10b981" },
  { id: "rf4", name: "Leads potenciales", color: "#f59e0b" },
];

const SEED_TAGS: ClipTag[] = [
  { id: "rt1", name: "Prioridad alta", color: "#ef4444" },
  { id: "rt2", name: "Revisar después", color: "#f59e0b" },
  { id: "rt3", name: "B2B", color: "#3b82f6" },
  { id: "rt4", name: "SaaS", color: "#8b5cf6" },
  { id: "rt5", name: "Medellín", color: "#10b981" },
];

const SEED_CLIPS: WebClip[] = [
  { id: "rc1", url: "https://linkedin.com/in/carlos-ruiz-cto", title: "Carlos Ruiz — CTO at TechCorp", description: "CTO con 15 años de experiencia en cloud computing. Decisor técnico para Enterprise.", image: "", folderId: "rf1", tags: ["Prioridad alta", "B2B"], notes: "Contactar por LinkedIn primero. Interesado en migración cloud.", savedAt: "2026-07-17 14:30", source: "extension" },
  { id: "rc2", url: "https://www.competidor.com/pricing", title: "Competidor X — Página de precios", description: "Plan Pro $199/mes, Enterprise $499/mes. Sin pipeline visual.", image: "", folderId: "rf2", tags: ["Revisar después"], notes: "Nuestro pricing es más competitivo. Podemos diferenciarnos con omnicanal.", savedAt: "2026-07-16 10:15", source: "extension" },
  { id: "rc3", url: "https://blog.hubspot.com/sales/cold-email-templates", title: "21 Cold Email Templates That Actually Work", description: "Guía de HubSpot con plantillas de cold outreach para B2B SaaS.", image: "", folderId: "rf3", tags: ["B2B", "SaaS"], notes: "", savedAt: "2026-07-15 09:00", source: "manual" },
  { id: "rc4", url: "https://dentart.com", title: "Dentart Odontology — Website", description: "Clínica dental con web propia en La Estrella. Score 99, can_claim.", image: "", folderId: "rf4", tags: ["Prioridad alta", "Medellín"], notes: "Lead caliente del scraping. Tiene web propia pero ficha de GMB no verificada.", savedAt: "2026-07-14 16:45", source: "extension" },
  { id: "rc5", url: "https://www.oralstudio.com.co", title: "Oral Studio — Clínica dental Medellín", description: "924 reseñas, rating 5.0. Diseño de sonrisa, implantes, blanqueamiento.", image: "", folderId: "rf4", tags: ["Medellín", "B2B"], notes: "Score 103. No verificado en GMB. Oportunidad de servicio.", savedAt: "2026-07-13 11:20", source: "extension" },
];

export default function RadarPage() {
  const [clips, setClips] = useState<WebClip[]>([]);
  const [folders, setFolders] = useState<ClipFolder[]>([]);
  const [tags, setTags] = useState<ClipTag[]>([]);
  const [search, setSearch] = useState("");
  const [filterFolder, setFilterFolder] = useState("all");
  const [filterTag, setFilterTag] = useState("all");
  const [showAddClip, setShowAddClip] = useState(false);
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [clipForm, setClipForm] = useState({ url: "", title: "", description: "", folderId: "", notes: "" });
  const [folderForm, setFolderForm] = useState({ name: "", color: COLORS[0]! });

  useEffect(() => {
    setClips(loadFromStorage("radar_clips", SEED_CLIPS));
    setFolders(loadFromStorage("radar_folders", SEED_FOLDERS));
    setTags(loadFromStorage("radar_tags", SEED_TAGS));
  }, []);
  function saveClips(u: WebClip[]) { setClips(u); saveToStorage("radar_clips", u); }
  function saveFolders(u: ClipFolder[]) { setFolders(u); saveToStorage("radar_folders", u); }

  function addClip() {
    if (!clipForm.url.trim()) return;
    saveClips([{ id: generateId(), url: clipForm.url, title: clipForm.title || clipForm.url, description: clipForm.description, image: "", folderId: clipForm.folderId || folders[0]?.id || "", tags: [], notes: clipForm.notes, savedAt: new Date().toLocaleString("es"), source: "manual" }, ...clips]);
    setClipForm({ url: "", title: "", description: "", folderId: "", notes: "" }); setShowAddClip(false);
  }
  function addFolder() {
    if (!folderForm.name.trim()) return;
    saveFolders([...folders, { id: generateId(), name: folderForm.name, color: folderForm.color }]);
    setFolderForm({ name: "", color: COLORS[(folders.length + 1) % COLORS.length]! }); setShowAddFolder(false);
  }
  function deleteClip(id: string) { saveClips(clips.filter((c) => c.id !== id)); }
  function toggleTag(clipId: string, tagName: string) {
    saveClips(clips.map((c) => c.id === clipId ? { ...c, tags: c.tags.includes(tagName) ? c.tags.filter((t) => t !== tagName) : [...c.tags, tagName] } : c));
  }

  const filtered = clips
    .filter((c) => filterFolder === "all" || c.folderId === filterFolder)
    .filter((c) => filterTag === "all" || c.tags.includes(filterTag))
    .filter((c) => !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.url.toLowerCase().includes(search.toLowerCase()) || c.notes.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Bookmark className="h-6 w-6 text-brand" />Radar</h1>
            <p className="text-sm text-muted-foreground">Captura páginas web, organiza por carpetas y etiquetas. Sincronizado con la extensión del navegador.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowAddFolder(!showAddFolder)} className="flex items-center gap-1 rounded-md border px-3 py-2 text-xs font-medium hover:bg-gray-50"><Folder className="h-3.5 w-3.5" />Carpeta</button>
            <button onClick={() => setShowAddClip(true)} className="flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"><Plus className="h-4 w-4" />Guardar página</button>
          </div>
        </div>

        {/* Add folder */}
        {showAddFolder && (
          <div className="mb-4 flex gap-2 items-center rounded border bg-white p-3">
            <input value={folderForm.name} onChange={(e) => setFolderForm({ ...folderForm, name: e.target.value })} placeholder="Nombre carpeta" className="flex-1 rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none" />
            <div className="flex gap-1">{COLORS.map((c) => <button key={c} onClick={() => setFolderForm({ ...folderForm, color: c })} className={`h-5 w-5 rounded-full border-2 ${folderForm.color === c ? "border-gray-800 scale-110" : "border-transparent"}`} style={{ backgroundColor: c }} />)}</div>
            <button onClick={addFolder} className="rounded bg-brand px-3 py-1.5 text-xs text-white">Crear</button>
            <button onClick={() => setShowAddFolder(false)} className="text-xs text-muted-foreground">✕</button>
          </div>
        )}

        {/* Add clip */}
        {showAddClip && (
          <div className="mb-4 rounded-lg border bg-white p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input value={clipForm.url} onChange={(e) => setClipForm({ ...clipForm, url: e.target.value })} placeholder="URL de la página *" className="col-span-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              <input value={clipForm.title} onChange={(e) => setClipForm({ ...clipForm, title: e.target.value })} placeholder="Título" className="rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              <select value={clipForm.folderId} onChange={(e) => setClipForm({ ...clipForm, folderId: e.target.value })} className="rounded-md border px-3 py-2 text-sm">
                <option value="">Carpeta...</option>
                {folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            <textarea value={clipForm.notes} onChange={(e) => setClipForm({ ...clipForm, notes: e.target.value })} placeholder="Notas..." rows={2} className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
            <div className="flex gap-2"><button onClick={addClip} className="rounded bg-brand px-4 py-2 text-sm text-white hover:bg-brand-hover">Guardar</button><button onClick={() => setShowAddClip(false)} className="rounded border px-4 py-2 text-sm">Cancelar</button></div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." className="w-48 rounded-md border bg-white py-2 pl-8 pr-3 text-sm focus:border-brand focus:outline-none" /></div>
          <div className="flex gap-1.5">
            <button onClick={() => setFilterFolder("all")} className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${filterFolder === "all" ? "bg-brand text-white" : "border hover:bg-gray-50"}`}>Todas</button>
            {folders.map((f) => (
              <button key={f.id} onClick={() => setFilterFolder(f.id)} className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium ${filterFolder === f.id ? "text-white" : "border hover:bg-gray-50"}`} style={filterFolder === f.id ? { backgroundColor: f.color } : {}}>
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: f.color }} />{f.name}
              </button>
            ))}
          </div>
          <select value={filterTag} onChange={(e) => setFilterTag(e.target.value)} className="rounded-md border px-2 py-1 text-xs">
            <option value="all">Etiqueta: Todas</option>
            {tags.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
          </select>
        </div>

        {/* Clips grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((clip) => {
            const folder = folders.find((f) => f.id === clip.folderId);
            return (
              <div key={clip.id} className="group rounded-lg border bg-white p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                    <a href={clip.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium truncate text-brand hover:underline">{clip.title}</a>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                    <a href={clip.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-brand"><ExternalLink className="h-3.5 w-3.5" /></a>
                    <button onClick={() => deleteClip(clip.id)} className="text-muted-foreground hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
                {clip.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{clip.description}</p>}
                {clip.notes && <p className="text-xs bg-amber-50 border border-amber-200 rounded px-2 py-1 mb-2">{clip.notes}</p>}
                <div className="flex items-center gap-2 flex-wrap">
                  {folder && <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-medium text-white" style={{ backgroundColor: folder.color }}><Folder className="h-2.5 w-2.5" />{folder.name}</span>}
                  {clip.tags.map((t) => {
                    const tag = tags.find((tg) => tg.name === t);
                    return <span key={t} className="rounded-full px-2 py-0.5 text-[9px] font-medium" style={{ backgroundColor: `${tag?.color || "#6b7280"}20`, color: tag?.color || "#6b7280" }}>{t}</span>;
                  })}
                </div>
                <div className="mt-2 flex items-center justify-between text-[9px] text-muted-foreground">
                  <span>{clip.savedAt}</span>
                  <span className="rounded bg-gray-100 px-1.5 py-0.5">{clip.source === "extension" ? "🔌 Extensión" : "✍️ Manual"}</span>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && <div className="py-12 text-center text-muted-foreground text-sm">Sin clips guardados. Usa el botón "Guardar página" o la extensión del navegador.</div>}

        {/* Extension info */}
        <div className="mt-8 rounded-lg border border-dashed bg-gray-50 p-5">
          <h4 className="font-medium mb-2 flex items-center gap-2"><Bookmark className="h-4 w-4 text-brand" />Extensión de navegador</h4>
          <p className="text-xs text-muted-foreground mb-3">Instala la extensión de LocalRank Radar para guardar páginas con un click mientras navegas.</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
            <div className="rounded border bg-white p-3 text-center"><span className="block text-xl mb-1">🔌</span><p className="font-medium">1. Instala</p><p className="text-muted-foreground">Chrome Web Store</p></div>
            <div className="rounded border bg-white p-3 text-center"><span className="block text-xl mb-1">📌</span><p className="font-medium">2. Captura</p><p className="text-muted-foreground">Click en cualquier página</p></div>
            <div className="rounded border bg-white p-3 text-center"><span className="block text-xl mb-1">📂</span><p className="font-medium">3. Organiza</p><p className="text-muted-foreground">Carpetas + etiquetas aquí</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}
