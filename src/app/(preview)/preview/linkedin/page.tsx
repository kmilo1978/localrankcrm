"use client";
import { useState, useEffect } from "react";
import { Briefcase, Building2, ClipboardCopy, Download, ExternalLink, GraduationCap, Heart, Linkedin, Mail, MapPin, Phone, RefreshCw, Search, Star, Tag, Trash2, X } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";

/* ============================================================
 * Tipos — LinkedInProfile (modelo rico, ver design.md)
 * ============================================================ */

type Experience = { id: string; title: string; company: string; companyUrl: string | null; startDate: string | null; endDate: string | null; location: string | null; description: string | null };
type Education = { id: string; school: string; degree: string | null; field: string | null; startDate: string | null; endDate: string | null };
type Certification = { id: string; name: string; issuer: string | null; date: string | null };

type LocalStatus = "new" | "contacted" | "in_conversation" | "qualified" | "discarded";
type LocalPriority = "low" | "medium" | "high";
type SyncState = "pending" | "queued" | "syncing" | "synced" | "failed";

type LinkedInProfile = {
  id: string;
  linkedinUrn: string;
  profile: { name: string; photoUrl: string | null; headline: string | null; location: string | null; about: string | null };
  contact: { email: string | null; phone: string | null; links: string[] };
  company: { name: string | null; url: string | null } | null;
  experience: Experience[];
  education: Education[];
  skills: string[];
  certifications: Certification[];
  metadata: { capturedAt: string; updatedAt: string; profileHash: string; lastVisited: string; syncStatus: SyncState; changesDetected: string[] };
  local: { notes: string; tags: string[]; favorite: boolean; status: LocalStatus; priority: LocalPriority; color: string | null; score: number | null };
  history: { id: string; action: string; at: string; detail?: string }[];
};

type QueueItem = { id: string; profileId: string; profileName: string; op: "upsert" | "delete"; status: "pending" | "failed" | "completed"; attempts: number; lastError?: string; createdAt: string };

const STATUS_LABELS: Record<LocalStatus, string> = { new: "Nuevo", contacted: "Contactado", in_conversation: "En conversación", qualified: "Calificado", discarded: "Descartado" };
const STATUS_COLORS: Record<LocalStatus, string> = { new: "bg-blue-100 text-blue-700", contacted: "bg-amber-100 text-amber-700", in_conversation: "bg-purple-100 text-purple-700", qualified: "bg-green-100 text-green-700", discarded: "bg-gray-100 text-gray-500" };
const PRIORITY_COLORS: Record<LocalPriority, string> = { low: "text-gray-400", medium: "text-amber-500", high: "text-red-500" };

const SEED_PROFILES: LinkedInProfile[] = [
  { id: "li1", linkedinUrn: "urn:li:member:1001", profile: { name: "Carlos Ruiz", photoUrl: null, headline: "CTO at TechCorp Solutions · Cloud & Enterprise Architecture", location: "Ciudad de México, México", about: "15 años liderando equipos de ingeniería. Apasionado por la migración a cloud y arquitecturas escalables." },
    contact: { email: "carlos.ruiz@techcorp.com", phone: "+52 55 1234 5678", links: ["https://techcorp.com"] },
    company: { name: "TechCorp Solutions", url: "https://linkedin.com/company/techcorp" },
    experience: [{ id: "e1", title: "CTO", company: "TechCorp Solutions", companyUrl: null, startDate: "2021-03", endDate: null, location: "CDMX", description: "Liderando la transformación digital y migración cloud." }, { id: "e2", title: "VP Engineering", company: "DataFlow Inc", companyUrl: null, startDate: "2018-01", endDate: "2021-02", location: "CDMX", description: null }],
    education: [{ id: "ed1", school: "ITESM", degree: "Ingeniería en Sistemas", field: "Computación", startDate: "2005", endDate: "2009" }],
    skills: ["Cloud Architecture", "AWS", "Kubernetes", "Liderazgo técnico", "DevOps"],
    certifications: [{ id: "c1", name: "AWS Solutions Architect Professional", issuer: "Amazon", date: "2022" }],
    metadata: { capturedAt: "2026-07-17T14:30:00", updatedAt: "2026-07-17T14:30:00", profileHash: "a1b2c3", lastVisited: "2026-07-20T09:00:00", syncStatus: "synced", changesDetected: [] },
    local: { notes: "Decisor técnico principal. Interesado en migración cloud completa. Contactar por LinkedIn primero.", tags: ["Prioridad alta", "B2B", "Decisor"], favorite: true, status: "in_conversation", priority: "high", color: "#e91e8c", score: 92 },
    history: [{ id: "h1", action: "save", at: "2026-07-17T14:30:00" }, { id: "h2", action: "sync", at: "2026-07-17T14:31:00" }, { id: "h3", action: "note_add", at: "2026-07-19T10:00:00" }],
  },
  { id: "li2", linkedinUrn: "urn:li:member:1002", profile: { name: "María García", photoUrl: null, headline: "VP Operations at LogiNext International", location: "Miami, USA", about: null },
    contact: { email: "maria@loginext.io", phone: "+1 305 555 0123", links: [] },
    company: { name: "LogiNext International", url: null },
    experience: [{ id: "e3", title: "VP Operations", company: "LogiNext International", companyUrl: null, startDate: "2019-06", endDate: null, location: "Miami", description: null }],
    education: [], skills: ["Supply Chain", "Logística", "Operaciones"], certifications: [],
    metadata: { capturedAt: "2026-07-15T11:00:00", updatedAt: "2026-07-15T11:00:00", profileHash: "d4e5f6", lastVisited: "2026-07-15T11:00:00", syncStatus: "synced", changesDetected: [] },
    local: { notes: "Prefiere comunicación por email.", tags: ["Seguimiento"], favorite: false, status: "contacted", priority: "medium", color: null, score: 78 },
    history: [{ id: "h4", action: "save", at: "2026-07-15T11:00:00" }],
  },
  { id: "li3", linkedinUrn: "urn:li:member:1003", profile: { name: "Ana Torres", photoUrl: null, headline: "CEO at InnovateLab | Startup Founder", location: "Monterrey, México", about: "Construyendo el futuro de la innovación en Latam." },
    contact: { email: null, phone: null, links: ["https://innovatelab.co"] },
    company: { name: "InnovateLab", url: null },
    experience: [{ id: "e4", title: "CEO & Founder", company: "InnovateLab", companyUrl: null, startDate: "2020-01", endDate: null, location: "Monterrey", description: null }],
    education: [{ id: "ed2", school: "UDEM", degree: "MBA", field: "Negocios", startDate: "2016", endDate: "2018" }],
    skills: ["Startups", "Fundraising", "Product"], certifications: [],
    metadata: { capturedAt: "2026-07-10T09:00:00", updatedAt: "2026-07-10T09:00:00", profileHash: "g7h8i9", lastVisited: "2026-07-10T09:00:00", syncStatus: "pending", changesDetected: [] },
    local: { notes: "", tags: [], favorite: false, status: "new", priority: "low", color: null, score: null },
    history: [{ id: "h5", action: "save", at: "2026-07-10T09:00:00" }],
  },
];

const SEED_QUEUE: QueueItem[] = [
  { id: "q1", profileId: "li3", profileName: "Ana Torres", op: "upsert", status: "pending", attempts: 1, createdAt: "2026-07-10T09:00:00" },
];

export default function LinkedInPage() {
  const [profiles, setProfiles] = useState<LinkedInProfile[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [view, setView] = useState<"list" | "queue">("list");
  const [selected, setSelected] = useState<LinkedInProfile | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTag, setFilterTag] = useState("all");
  const [filterCompany, setFilterCompany] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [noteInput, setNoteInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [toast, setToast] = useState("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;

  useEffect(() => {
    setProfiles(loadFromStorage("linkedin_profiles", SEED_PROFILES));
    setQueue(loadFromStorage("linkedin_queue", SEED_QUEUE));
    syncExtensionLinkedInProfiles();
  }, []);

  function save(u: LinkedInProfile[]) { setProfiles(u); saveToStorage("linkedin_profiles", u); }
  function saveQueue(u: QueueItem[]) { setQueue(u); saveToStorage("linkedin_queue", u); }
  function notify(m: string) { setToast(m); setTimeout(() => setToast(""), 2500); }

  // Sincroniza perfiles capturados por la extensión — usa clave propia, nunca extension_leads/radar_clips
  function syncExtensionLinkedInProfiles() {
    try {
      const extProfiles: Record<string, unknown>[] = JSON.parse(localStorage.getItem("extension_linkedin_profiles") || "[]");
      if (extProfiles.length === 0) return;
      const current: LinkedInProfile[] = loadFromStorage("linkedin_profiles", SEED_PROFILES);
      const existingUrns = new Set(current.map(p => p.linkedinUrn));
      const incoming = extProfiles.filter(p => p.linkedinUrn && !existingUrns.has(p.linkedinUrn as string));
      if (incoming.length === 0) return;
      const mapped: LinkedInProfile[] = incoming.map(raw => ({
        id: generateId(),
        linkedinUrn: raw.linkedinUrn as string,
        profile: (raw.profile as LinkedInProfile["profile"]) || { name: "Sin nombre", photoUrl: null, headline: null, location: null, about: null },
        contact: (raw.contact as LinkedInProfile["contact"]) || { email: null, phone: null, links: [] },
        company: (raw.company as LinkedInProfile["company"]) || null,
        experience: (raw.experience as Experience[]) || [],
        education: (raw.education as Education[]) || [],
        skills: (raw.skills as string[]) || [],
        certifications: (raw.certifications as Certification[]) || [],
        metadata: { capturedAt: new Date().toISOString(), updatedAt: new Date().toISOString(), profileHash: generateId(), lastVisited: new Date().toISOString(), syncStatus: "synced", changesDetected: [] },
        local: { notes: "", tags: [], favorite: false, status: "new", priority: "medium", color: null, score: null },
        history: [{ id: generateId(), action: "sync", at: new Date().toISOString(), detail: "Importado desde la extensión" }],
      }));
      const merged = [...mapped, ...current];
      save(merged);
      localStorage.setItem("extension_linkedin_profiles", "[]");
      notify(`${mapped.length} perfil(es) de LinkedIn sincronizados desde la extensión`);
    } catch {}
  }

  function updateLocal(profileId: string, updates: Partial<LinkedInProfile["local"]>) {
    save(profiles.map(p => p.id === profileId ? { ...p, local: { ...p.local, ...updates } } : p));
    if (selected?.id === profileId) setSelected(prev => prev ? { ...prev, local: { ...prev.local, ...updates } } : prev);
  }

  function addNote(profileId: string) {
    if (!noteInput.trim()) return;
    const p = profiles.find(pr => pr.id === profileId);
    if (!p) return;
    const newNotes = p.local.notes ? `${p.local.notes}\n\n${noteInput.trim()}` : noteInput.trim();
    updateLocal(profileId, { notes: newNotes });
    save(profiles.map(pr => pr.id === profileId ? { ...pr, history: [{ id: generateId(), action: "note_add", at: new Date().toISOString() }, ...pr.history] } : pr));
    setNoteInput("");
    notify("Nota agregada");
  }

  function addTag(profileId: string) {
    const tag = tagInput.trim();
    if (!tag) return;
    const p = profiles.find(pr => pr.id === profileId);
    if (!p || p.local.tags.includes(tag)) return;
    updateLocal(profileId, { tags: [...p.local.tags, tag] });
    setTagInput("");
  }

  function removeTag(profileId: string, tag: string) {
    const p = profiles.find(pr => pr.id === profileId);
    if (!p) return;
    updateLocal(profileId, { tags: p.local.tags.filter(t => t !== tag) });
  }

  function deleteProfile(id: string) {
    save(profiles.filter(p => p.id !== id));
    if (selected?.id === id) setSelected(null);
    notify("Perfil eliminado");
  }

  function bulkAction(action: "tag" | "status" | "delete" | "export") {
    if (selectedIds.size === 0) return;
    if (action === "delete") {
      save(profiles.filter(p => !selectedIds.has(p.id)));
      notify(`${selectedIds.size} perfiles eliminados`);
    } else if (action === "tag") {
      const tag = prompt("Etiqueta a agregar a los perfiles seleccionados:");
      if (!tag?.trim()) return;
      save(profiles.map(p => selectedIds.has(p.id) && !p.local.tags.includes(tag.trim()) ? { ...p, local: { ...p.local, tags: [...p.local.tags, tag.trim()] } } : p));
      notify(`Etiqueta agregada a ${selectedIds.size} perfiles`);
    } else if (action === "status") {
      const status = prompt("Nuevo estado (new, contacted, in_conversation, qualified, discarded):") as LocalStatus;
      if (!status || !STATUS_LABELS[status]) return;
      save(profiles.map(p => selectedIds.has(p.id) ? { ...p, local: { ...p.local, status } } : p));
      notify(`Estado actualizado en ${selectedIds.size} perfiles`);
    } else if (action === "export") {
      exportProfiles(profiles.filter(p => selectedIds.has(p.id)));
    }
    setSelectedIds(new Set());
  }

  function exportProfiles(list: LinkedInProfile[]) {
    const data = list.map(p => ({
      nombre: p.profile.name, headline: p.profile.headline, ubicacion: p.profile.location,
      empresa: p.company?.name, email: p.contact.email, telefono: p.contact.phone,
      etiquetas: p.local.tags.join(", "), estado: STATUS_LABELS[p.local.status], notas: p.local.notes,
    }));
    const headers = Object.keys(data[0] || {});
    const csv = [headers.join(","), ...data.map(row => headers.map(h => `"${String((row as Record<string, unknown>)[h] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `linkedin-perfiles-${new Date().toISOString().split("T")[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
    notify(`${list.length} perfiles exportados a CSV`);
  }

  function retryQueueItem(itemId: string) {
    saveQueue(queue.map(q => q.id === itemId ? { ...q, status: "pending" as const, attempts: 0 } : q));
    notify("Reintento programado");
  }

  function toggleSelect(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  }

  const allTags = [...new Set(profiles.flatMap(p => p.local.tags))].sort();
  const allCompanies = [...new Set(profiles.map(p => p.company?.name).filter(Boolean))] as string[];

  const filtered = profiles
    .filter(p => filterStatus === "all" || p.local.status === filterStatus)
    .filter(p => filterTag === "all" || p.local.tags.includes(filterTag))
    .filter(p => filterCompany === "all" || p.company?.name === filterCompany)
    .filter(p => !search || p.profile.name.toLowerCase().includes(search.toLowerCase()) || (p.profile.headline || "").toLowerCase().includes(search.toLowerCase()) || (p.company?.name || "").toLowerCase().includes(search.toLowerCase()));

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const pendingCount = queue.filter(q => q.status === "pending" || q.status === "failed").length;

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2"><Linkedin className="h-5 w-5 text-[#0A66C2]" />LinkedIn</h1>
            <p className="text-xs text-muted-foreground">{profiles.length} perfiles capturados · Sincronizado con la extensión</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-md border">
              <button onClick={() => setView("list")} className={`px-3 py-1.5 text-xs font-medium ${view === "list" ? "bg-brand text-white" : "hover:bg-gray-50"}`}>Perfiles</button>
              <button onClick={() => setView("queue")} className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1 ${view === "queue" ? "bg-brand text-white" : "hover:bg-gray-50"}`}>
                Cola{pendingCount > 0 && <span className="rounded-full bg-amber-500 text-white text-[9px] px-1.5">{pendingCount}</span>}
              </button>
            </div>
            <button onClick={() => { syncExtensionLinkedInProfiles(); notify("Sincronización verificada"); }} className="flex items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100">
              <RefreshCw className="h-3.5 w-3.5" />Sincronizar
            </button>
          </div>
        </div>

        {view === "list" && (
          <>
            {/* Filters */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <div className="relative"><Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" /><input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar por nombre, cargo o empresa..." className="w-60 rounded border py-1.5 pl-8 pr-3 text-xs focus:border-brand focus:outline-none" /></div>
              <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} className="rounded border px-2.5 py-1.5 text-[10px] focus:border-brand focus:outline-none">
                <option value="all">Todos los estados</option>
                {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <select value={filterCompany} onChange={e => { setFilterCompany(e.target.value); setPage(1); }} className="rounded border px-2.5 py-1.5 text-[10px] focus:border-brand focus:outline-none">
                <option value="all">Todas las empresas</option>
                {allCompanies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={filterTag} onChange={e => { setFilterTag(e.target.value); setPage(1); }} className="rounded border px-2.5 py-1.5 text-[10px] focus:border-brand focus:outline-none">
                <option value="all">Todas las etiquetas</option>
                {allTags.map(t => <option key={t} value={t}>🏷️ {t}</option>)}
              </select>
            </div>

            {/* Bulk actions bar */}
            {selectedIds.size > 0 && (
              <div className="mb-3 flex items-center gap-2 rounded-lg border border-brand/30 bg-brand-tint/30 px-3 py-2">
                <span className="text-xs font-medium">{selectedIds.size} seleccionados</span>
                <button onClick={() => bulkAction("tag")} className="rounded border px-2.5 py-1 text-[10px] font-medium hover:bg-white">+ Etiqueta</button>
                <button onClick={() => bulkAction("status")} className="rounded border px-2.5 py-1 text-[10px] font-medium hover:bg-white">Cambiar estado</button>
                <button onClick={() => bulkAction("export")} className="rounded border px-2.5 py-1 text-[10px] font-medium hover:bg-white flex items-center gap-1"><Download className="h-3 w-3" />Exportar</button>
                <button onClick={() => bulkAction("delete")} className="rounded border border-red-200 px-2.5 py-1 text-[10px] font-medium text-red-600 hover:bg-red-50 flex items-center gap-1"><Trash2 className="h-3 w-3" />Eliminar</button>
                <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-[10px] text-muted-foreground hover:text-foreground">Deseleccionar</button>
              </div>
            )}

            {/* Profile cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {paginated.map(p => (
                <div key={p.id} className="rounded-lg border bg-white p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start gap-3">
                    <input type="checkbox" checked={selectedIds.has(p.id)} onChange={() => toggleSelect(p.id)} className="mt-1 accent-[var(--accent)]" onClick={e => e.stopPropagation()} />
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0A66C2]/10 text-[#0A66C2] font-bold text-sm">
                      {p.profile.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                    </div>
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setSelected(p)}>
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold truncate">{p.profile.name}</p>
                        {p.local.favorite && <Heart className="h-3 w-3 text-red-500 shrink-0 fill-red-500" />}
                        <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-medium ${STATUS_COLORS[p.local.status]}`}>{STATUS_LABELS[p.local.status]}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{p.profile.headline}</p>
                      {p.profile.location && <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 mt-0.5"><MapPin className="h-2.5 w-2.5" />{p.profile.location}</p>}
                      <div className="flex items-center gap-1 flex-wrap mt-1.5">
                        {p.local.tags.slice(0, 3).map(t => <span key={t} className="flex items-center gap-0.5 rounded-full bg-brand/10 px-1.5 py-0.5 text-[9px] text-brand"><Tag className="h-2 w-2" />{t}</span>)}
                        {p.metadata.syncStatus !== "synced" && <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] text-amber-700">{p.metadata.syncStatus}</span>}
                      </div>
                    </div>
                    <button onClick={() => deleteProfile(p.id)} className="rounded p-1 text-muted-foreground hover:text-red-500 hover:bg-red-50 shrink-0"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>

            {filtered.length === 0 && <div className="py-16 text-center text-muted-foreground text-sm">Sin perfiles de LinkedIn capturados. Usa la extensión para capturar perfiles mientras navegas.</div>}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="rounded border px-3 py-1.5 text-xs font-medium disabled:opacity-40 hover:bg-gray-50">Anterior</button>
                <span className="text-xs text-muted-foreground">Página {page} de {totalPages} ({filtered.length} perfiles)</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded border px-3 py-1.5 text-xs font-medium disabled:opacity-40 hover:bg-gray-50">Siguiente</button>
              </div>
            )}
          </>
        )}

        {/* Queue view */}
        {view === "queue" && (
          <div className="rounded-lg border bg-white">
            <div className="border-b px-4 py-3">
              <h3 className="text-sm font-semibold">Cola de sincronización</h3>
              <p className="text-xs text-muted-foreground">Perfiles pendientes o fallidos de enviar al CRM</p>
            </div>
            <div className="divide-y">
              {queue.map(q => (
                <div key={q.id} className="flex items-center gap-3 px-4 py-3">
                  <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${q.status === "completed" ? "bg-green-400" : q.status === "failed" ? "bg-red-400" : "bg-amber-400"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{q.profileName}</p>
                    <p className="text-[10px] text-muted-foreground">{q.op === "upsert" ? "Actualizar/crear" : "Eliminar"} · Intentos: {q.attempts} · {q.createdAt}</p>
                    {q.lastError && <p className="text-[10px] text-red-500 mt-0.5">{q.lastError}</p>}
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${q.status === "completed" ? "bg-green-100 text-green-700" : q.status === "failed" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{q.status}</span>
                  {(q.status === "failed" || q.status === "pending") && <button onClick={() => retryQueueItem(q.id)} className="rounded border px-2.5 py-1 text-[10px] font-medium hover:bg-gray-50">Reintentar</button>}
                </div>
              ))}
              {queue.length === 0 && <div className="py-12 text-center text-muted-foreground text-sm">Cola vacía. Todo está sincronizado.</div>}
            </div>
          </div>
        )}
      </div>

      {/* Profile detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-xl bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-start justify-between z-10">
              <div className="flex items-start gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#0A66C2]/10 text-[#0A66C2] font-bold text-lg">
                  {selected.profile.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold">{selected.profile.name}</h2>
                    <button onClick={() => updateLocal(selected.id, { favorite: !selected.local.favorite })}><Heart className={`h-4 w-4 ${selected.local.favorite ? "fill-red-500 text-red-500" : "text-gray-300"}`} /></button>
                  </div>
                  <p className="text-sm text-muted-foreground">{selected.profile.headline}</p>
                  {selected.profile.location && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" />{selected.profile.location}</p>}
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="rounded p-1 hover:bg-gray-100"><X className="h-5 w-5" /></button>
            </div>

            <div className="p-6 space-y-5">
              {/* Local fields: status, priority, tags */}
              <div className="rounded-lg border bg-gray-50 p-4 space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground block mb-1">Estado</label>
                    <select value={selected.local.status} onChange={e => updateLocal(selected.id, { status: e.target.value as LocalStatus })} className="rounded border px-2 py-1 text-xs focus:border-brand focus:outline-none">
                      {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground block mb-1">Prioridad</label>
                    <select value={selected.local.priority} onChange={e => updateLocal(selected.id, { priority: e.target.value as LocalPriority })} className={`rounded border px-2 py-1 text-xs focus:border-brand focus:outline-none font-medium ${PRIORITY_COLORS[selected.local.priority]}`}>
                      <option value="low">Baja</option><option value="medium">Media</option><option value="high">Alta</option>
                    </select>
                  </div>
                  {selected.local.score !== null && (
                    <div>
                      <label className="text-[10px] font-medium text-muted-foreground block mb-1">Score</label>
                      <span className="flex items-center gap-1 text-sm font-bold"><Star className="h-3.5 w-3.5 text-amber-400" />{selected.local.score}</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground block mb-1">Etiquetas</label>
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {selected.local.tags.map(t => (
                      <span key={t} className="flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-medium text-brand"><Tag className="h-2.5 w-2.5" />{t}<button onClick={() => removeTag(selected.id, t)} className="hover:text-red-500"><X className="h-2.5 w-2.5" /></button></span>
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") addTag(selected.id); }} placeholder="Agregar etiqueta..." className="flex-1 rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none" />
                    <button onClick={() => addTag(selected.id)} className="rounded bg-brand px-3 py-1.5 text-xs text-white hover:bg-brand-hover">+</button>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div>
                <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Contacto</h4>
                <div className="flex flex-wrap gap-3 text-xs">
                  {selected.contact.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3 text-brand" />{selected.contact.email}</span>}
                  {selected.contact.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3 text-brand" />{selected.contact.phone}</span>}
                  {selected.contact.links.map((l, i) => <a key={i} href={l} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-brand hover:underline"><ExternalLink className="h-3 w-3" />{l}</a>)}
                  {!selected.contact.email && !selected.contact.phone && selected.contact.links.length === 0 && <span className="text-muted-foreground">Sin datos de contacto capturados</span>}
                </div>
              </div>

              {/* About */}
              {selected.profile.about && (
                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Acerca de</h4>
                  <p className="text-xs text-gray-700 whitespace-pre-wrap">{selected.profile.about}</p>
                </div>
              )}

              {/* Experience */}
              {selected.experience.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />Experiencia</h4>
                  <div className="space-y-2">
                    {selected.experience.map(exp => (
                      <div key={exp.id} className="rounded border-l-2 border-brand pl-3 py-1">
                        <p className="text-sm font-medium">{exp.title}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1"><Building2 className="h-3 w-3" />{exp.company}{exp.location ? ` · ${exp.location}` : ""}</p>
                        <p className="text-[10px] text-muted-foreground">{exp.startDate || "?"} — {exp.endDate || "Actual"}</p>
                        {exp.description && <p className="text-xs text-gray-600 mt-1">{exp.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {selected.education.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" />Educación</h4>
                  <div className="space-y-1.5">
                    {selected.education.map(ed => (
                      <div key={ed.id} className="text-xs">
                        <span className="font-medium">{ed.school}</span>{ed.degree && ` · ${ed.degree}`}{ed.field && ` (${ed.field})`}
                        <span className="text-muted-foreground"> · {ed.startDate}—{ed.endDate}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {selected.skills.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-1.5">{selected.skills.map((s, i) => <span key={i} className="rounded-full border px-2 py-0.5 text-[10px]">{s}</span>)}</div>
                </div>
              )}

              {/* Certifications */}
              {selected.certifications.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Certificaciones</h4>
                  <div className="space-y-1">{selected.certifications.map(c => <p key={c.id} className="text-xs">{c.name}{c.issuer && ` · ${c.issuer}`}{c.date && ` (${c.date})`}</p>)}</div>
                </div>
              )}

              {/* Notes */}
              <div>
                <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Notas del CRM</h4>
                {selected.local.notes && <p className="text-xs bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-2 whitespace-pre-wrap">{selected.local.notes}</p>}
                <div className="flex gap-1.5">
                  <input value={noteInput} onChange={e => setNoteInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") addNote(selected.id); }} placeholder="Agregar nota..." className="flex-1 rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none" />
                  <button onClick={() => addNote(selected.id)} className="rounded bg-brand px-3 py-1.5 text-xs text-white hover:bg-brand-hover">+</button>
                </div>
              </div>

              {/* History */}
              <div>
                <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Historial</h4>
                <div className="space-y-1">
                  {selected.history.slice(0, 8).map(h => (
                    <div key={h.id} className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span className="rounded bg-gray-100 px-1.5 py-0.5">{h.action}</span>
                      <span>{new Date(h.at).toLocaleString("es")}</span>
                      {h.detail && <span>· {h.detail}</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t">
                <button onClick={() => exportProfiles([selected])} className="flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-medium hover:bg-gray-50"><Download className="h-3.5 w-3.5" />Exportar CSV</button>
                <button onClick={() => { navigator.clipboard.writeText(JSON.stringify(selected, null, 2)); notify("JSON copiado"); }} className="flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-medium hover:bg-gray-50"><ClipboardCopy className="h-3.5 w-3.5" />Copiar JSON</button>
                <button onClick={() => { deleteProfile(selected.id); }} className="flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 ml-auto"><Trash2 className="h-3.5 w-3.5" />Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-lg">{toast}</div>}
    </div>
  );
}
