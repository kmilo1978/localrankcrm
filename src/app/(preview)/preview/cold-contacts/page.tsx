"use client";

import { useState, useEffect, useRef } from "react";
import { AlertCircle, ChevronDown, ChevronRight, Download, FileSpreadsheet, Filter, Globe, GripVertical, Phone, Plus, Search, Star, Thermometer, Trash2, Upload, X } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";

type ColdContact = {
  id: string;
  name: string;
  phone: string;
  website: string;
  category: string;
  rating: number;
  reviews: number;
  address: string;
  description: string;
  clase: string;
  motivo: string;
  score: number;
  stageId: string;
  notes: string;
  addedAt: string;
  customFields: { id: string; label: string; value: string }[];
};

type ColdStage = { id: string; name: string; color: string };

const COLD_STAGES: ColdStage[] = [
  { id: "cs1", name: "Sin contactar", color: "#94a3b8" },
  { id: "cs2", name: "Primer contacto", color: "#3b82f6" },
  { id: "cs3", name: "Interesado", color: "#8b5cf6" },
  { id: "cs4", name: "Reunión agendada", color: "#f59e0b" },
  { id: "cs5", name: "Propuesta enviada", color: "#e91e8c" },
  { id: "cs6", name: "Convertido", color: "#10b981" },
  { id: "cs7", name: "Descartado", color: "#ef4444" },
];

// Pre-loaded from the Excel data
const IMPORTED_DATA: ColdContact[] = [
  { id: "cc1", name: "Oral Studio", phone: "312 7093687", website: "oralstudio.com.co", category: "Clínica dental", rating: 5, reviews: 924, address: "Cl. 19a #44-25, El Poblado, Medellín", description: "Diseño de sonrisa, implantes, blanqueamiento", clase: "No verificado", motivo: "Ficha no verificada", score: 103, stageId: "cs1", notes: "", addedAt: "2026-07-17", customFields: [] },
  { id: "cc2", name: "Dental Expertos", phone: "300 8938020", website: "instagram.com/dentalexpertos", category: "Clínica dental", rating: 4.9, reviews: 675, address: "Cra. 52 #7-115, Guayabal, Medellín", description: "Clínica odontológica y estética", clase: "Solo red social", motivo: "Su web es un perfil de red social", score: 87, stageId: "cs1", notes: "", addedAt: "2026-07-17", customFields: [] },
  { id: "cc3", name: "Smile Odontólogos", phone: "313 7434048", website: "beacons.ai/odontologos", category: "Clínica dental", rating: 4.9, reviews: 395, address: "Mayorca Mega Plaza, Sabaneta", description: "Turismo odontológico y estética dental", clase: "No verificado", motivo: "Ficha no verificada", score: 102, stageId: "cs1", notes: "", addedAt: "2026-07-17", customFields: [] },
  { id: "cc4", name: "Nova Smile", phone: "301 3951082", website: "novasmile.com.co", category: "Clínica dental", rating: 4.9, reviews: 209, address: "Cl. 19a #44-25, El Poblado, Medellín", description: "Ortodoncia, implantes, endodoncia", clase: "No verificado", motivo: "Ficha no verificada", score: 102, stageId: "cs1", notes: "", addedAt: "2026-07-17", customFields: [] },
  { id: "cc5", name: "Dentart", phone: "301 6510868", website: "dentartodontology.com", category: "Dentista", rating: 4.8, reviews: 23, address: "Cra 50, La Estrella", description: "Dentista con web propia y can_claim", clase: "Cliente caliente", motivo: "Alta reputación y presencia digital", score: 99, stageId: "cs2", notes: "¡CALIENTE! Tiene can_claim y web propia", addedAt: "2026-07-17", customFields: [] },
  { id: "cc6", name: "360 Dental Group IPS", phone: "312 2177371", website: "sonrisas360.com", category: "Clínica dental", rating: 4.9, reviews: 153, address: "C.C. Mayorca Torre Médica, Sabaneta", description: "Implantes, diseño de sonrisa, rehabilitación oral", clase: "No verificado", motivo: "Ficha no verificada", score: 102, stageId: "cs1", notes: "", addedAt: "2026-07-17", customFields: [] },
  { id: "cc7", name: "Clínica Total Harmony", phone: "300 6561575", website: "clinicatotalharmony.com", category: "Dentista", rating: 5, reviews: 106, address: "Cra. 44 #72 sur 42, Sabaneta", description: "Odontología integral y estética médica", clase: "No verificado", motivo: "Ficha no verificada", score: 103, stageId: "cs1", notes: "", addedAt: "2026-07-17", customFields: [] },
  { id: "cc8", name: "Dental clinic soluciones", phone: "305 3640935", website: "instagram.com/dentalclinicsoluciones", category: "Clínica dental", rating: 5, reviews: 136, address: "Cra. 46 #74sur-16, Sabaneta", description: "Diseños de sonrisa, ortodoncia, implantes", clase: "Solo red social", motivo: "Su web es un perfil de red social", score: 88, stageId: "cs1", notes: "", addedAt: "2026-07-17", customFields: [] },
  { id: "cc9", name: "Odontics Sabaneta", phone: "311 4272131", website: "", category: "Clínica dental", rating: 4.9, reviews: 372, address: "Cra. 43B #72s 91, Sabaneta", description: "Odontología general y especializada", clase: "No página web", motivo: "No tiene website", score: 87, stageId: "cs1", notes: "", addedAt: "2026-07-17", customFields: [] },
  { id: "cc10", name: "ORAL DENT", phone: "320 4596856", website: "odontologosmedellin.com", category: "Oficinas de empresa", rating: 4, reviews: 1, address: "Cra. 43A #62sur-41, Sabaneta", description: "Consultorio con can_claim", clase: "Frío", motivo: "Pocas señales comerciales fuertes", score: 85, stageId: "cs1", notes: "", addedAt: "2026-07-17", customFields: [] },
];

function getScoreColor(score: number) {
  if (score >= 100) return "text-green-700 bg-green-100";
  if (score >= 85) return "text-blue-700 bg-blue-100";
  if (score >= 70) return "text-amber-700 bg-amber-100";
  return "text-gray-700 bg-gray-100";
}

function getClaseColor(clase: string) {
  if (clase === "Cliente caliente") return "bg-red-100 text-red-700";
  if (clase === "No verificado") return "bg-amber-100 text-amber-700";
  if (clase === "Solo red social") return "bg-purple-100 text-purple-700";
  if (clase === "No página web") return "bg-gray-100 text-gray-700";
  if (clase === "Frío") return "bg-blue-100 text-blue-700";
  return "bg-gray-100 text-gray-700";
}

export default function ColdContactsPage() {
  const [contacts, setContacts] = useState<ColdContact[]>([]);
  const [stages] = useState<ColdStage[]>(COLD_STAGES);
  const [view, setView] = useState<"list" | "pipeline">("list");
  const [search, setSearch] = useState("");
  const [filterClase, setFilterClase] = useState("all");
  const [sortBy, setSortBy] = useState<"score" | "reviews" | "rating">("score");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [fieldForms, setFieldForms] = useState<Record<string, { label: string; value: string }>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setContacts(loadFromStorage("cold_contacts", IMPORTED_DATA)); }, []);
  function save(u: ColdContact[]) { setContacts(u); saveToStorage("cold_contacts", u); }

  function moveStage(contactId: string, stageId: string) {
    save(contacts.map((c) => c.id === contactId ? { ...c, stageId } : c));
  }

  function updateNotes(contactId: string, notes: string) {
    save(contacts.map((c) => c.id === contactId ? { ...c, notes } : c));
  }

  function deleteContact(id: string) { save(contacts.filter((c) => c.id !== id)); }

  function getFieldForm(id: string) { return fieldForms[id] || { label: "", value: "" }; }
  function setFieldForm(id: string, data: { label: string; value: string }) { setFieldForms((p) => ({ ...p, [id]: data })); }
  function addCustomField(contactId: string) {
    const ff = getFieldForm(contactId);
    if (!ff.label.trim()) return;
    save(contacts.map((c) => c.id === contactId ? { ...c, customFields: [...(c.customFields || []), { id: generateId(), label: ff.label, value: ff.value }] } : c));
    setFieldForm(contactId, { label: "", value: "" });
  }
  function removeCustomField(contactId: string, fieldId: string) {
    save(contacts.map((c) => c.id === contactId ? { ...c, customFields: (c.customFields || []).filter((f) => f.id !== fieldId) } : c));
  }

  function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Simulate CSV/Excel parsing — in production would use xlsx library
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (!text) return;
      const lines = text.split("\n").filter(Boolean);
      if (lines.length < 2) return;
      const headers = lines[0]!.split("\t").map((h) => h.trim().toLowerCase());
      const nameIdx = headers.findIndex((h) => h.includes("name") || h.includes("nombre"));
      const phoneIdx = headers.findIndex((h) => h.includes("phone") || h.includes("teléfono") || h.includes("telefono"));
      const webIdx = headers.findIndex((h) => h.includes("website") || h.includes("web") || h.includes("sitio"));
      const catIdx = headers.findIndex((h) => h.includes("category") || h.includes("categoría") || h.includes("main_category"));
      const ratingIdx = headers.findIndex((h) => h.includes("rating"));
      const reviewsIdx = headers.findIndex((h) => h.includes("reviews") || h.includes("reseñas"));
      const addressIdx = headers.findIndex((h) => h.includes("address") || h.includes("dirección") || h.includes("direccion"));
      const descIdx = headers.findIndex((h) => h.includes("description") || h.includes("descripción"));
      const claseIdx = headers.findIndex((h) => h.includes("clase"));
      const motivoIdx = headers.findIndex((h) => h.includes("motivo"));
      const scoreIdx = headers.findIndex((h) => h.includes("score"));

      const newContacts: ColdContact[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i]!.split("\t");
        const name = nameIdx >= 0 ? cols[nameIdx]?.trim() : "";
        if (!name) continue;
        newContacts.push({
          id: generateId(),
          name,
          phone: phoneIdx >= 0 ? cols[phoneIdx]?.trim() || "" : "",
          website: webIdx >= 0 ? cols[webIdx]?.trim() || "" : "",
          category: catIdx >= 0 ? cols[catIdx]?.trim() || "" : "",
          rating: ratingIdx >= 0 ? parseFloat(cols[ratingIdx] || "0") || 0 : 0,
          reviews: reviewsIdx >= 0 ? parseInt(cols[reviewsIdx] || "0") || 0 : 0,
          address: addressIdx >= 0 ? cols[addressIdx]?.trim() || "" : "",
          description: descIdx >= 0 ? cols[descIdx]?.trim().slice(0, 200) || "" : "",
          clase: claseIdx >= 0 ? cols[claseIdx]?.trim() || "" : "",
          motivo: motivoIdx >= 0 ? cols[motivoIdx]?.trim() || "" : "",
          score: scoreIdx >= 0 ? parseInt(cols[scoreIdx] || "0") || 0 : 50,
          stageId: "cs1",
          notes: "",
          addedAt: new Date().toISOString().split("T")[0]!,
          customFields: [],
        });
      }
      if (newContacts.length > 0) {
        save([...newContacts, ...contacts]);
        setShowImport(false);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  const clases = [...new Set(contacts.map((c) => c.clase).filter(Boolean))];
  const filtered = contacts
    .filter((c) => filterClase === "all" || c.clase === filterClase)
    .filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search) || c.category.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortBy === "score" ? b.score - a.score : sortBy === "reviews" ? b.reviews - a.reviews : b.rating - a.rating);

  const hotCount = contacts.filter((c) => c.clase === "Cliente caliente").length;
  const totalScore = contacts.length > 0 ? Math.round(contacts.reduce((s, c) => s + c.score, 0) / contacts.length) : 0;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-blue-500" />Contactos Fríos
            </h1>
            <p className="text-sm text-muted-foreground">
              {contacts.length} leads · {hotCount} calientes · Score promedio: {totalScore}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-md border">
              <button onClick={() => setView("list")} className={`px-3 py-1.5 text-xs font-medium ${view === "list" ? "bg-brand text-white" : "hover:bg-gray-50"}`}>Lista</button>
              <button onClick={() => setView("pipeline")} className={`px-3 py-1.5 text-xs font-medium ${view === "pipeline" ? "bg-brand text-white" : "hover:bg-gray-50"}`}>Pipeline</button>
            </div>
            <button onClick={() => setShowImport(!showImport)} className="flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover transition-colors">
              <Upload className="h-4 w-4" />Importar archivo
            </button>
          </div>
        </div>

        {/* Import area */}
        {showImport && (
          <div className="mt-4 rounded-lg border border-dashed bg-gray-50 p-4">
            <div className="flex items-center gap-4">
              <FileSpreadsheet className="h-8 w-8 text-brand" />
              <div className="flex-1">
                <p className="text-sm font-medium">Importar leads desde archivo</p>
                <p className="text-xs text-muted-foreground">Soporta archivos .CSV o .TSV con columnas: name, phone, website, category, rating, reviews, address, description, clase, motivo, score</p>
              </div>
              <input type="file" ref={fileRef} onChange={handleFileImport} accept=".csv,.tsv,.txt,.xlsx" className="hidden" />
              <button onClick={() => fileRef.current?.click()} className="rounded-md border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
                <Download className="h-4 w-4" />Seleccionar archivo
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Filters */}
      {view === "list" && (
        <div className="flex items-center gap-3 border-b px-6 py-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-52 rounded-md border bg-white py-2 pl-8 pr-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
          </div>
          <select value={filterClase} onChange={(e) => setFilterClase(e.target.value)} className="rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none">
            <option value="all">Todas las clases</option>
            {clases.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none">
            <option value="score">Ordenar por Score</option>
            <option value="reviews">Ordenar por Reseñas</option>
            <option value="rating">Ordenar por Rating</option>
          </select>
        </div>
      )}

      {/* Pipeline view */}
      {view === "pipeline" && (
        <div className="flex flex-1 gap-3 overflow-x-auto p-4">
          {stages.map((stage) => {
            const stageContacts = contacts.filter((c) => c.stageId === stage.id);
            return (
              <div key={stage.id} className="flex w-64 shrink-0 flex-col rounded-lg border bg-gray-50/50" style={{ borderTopColor: stage.color, borderTopWidth: 3 }}>
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-sm font-semibold">{stage.name}</span>
                  <span className="rounded-full bg-gray-200 px-1.5 text-xs font-medium">{stageContacts.length}</span>
                </div>
                <div className="flex-1 space-y-2 overflow-y-auto px-2 pb-2">
                  {stageContacts.sort((a, b) => b.score - a.score).map((c) => (
                    <div key={c.id} className="group rounded-md border bg-white p-2.5 shadow-sm">
                      <div className="flex items-start justify-between">
                        <p className="text-xs font-medium">{c.name}</p>
                        <span className={`rounded px-1 py-0.5 text-[10px] font-medium ${getScoreColor(c.score)}`}>{c.score}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{c.category}</p>
                      <div className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Star className="h-3 w-3 text-amber-400" />{c.rating} · {c.reviews} rev.
                      </div>
                      <select value={c.stageId} onChange={(e) => moveStage(c.id, e.target.value)} className="mt-1.5 w-full rounded border px-1 py-0.5 text-[10px] focus:outline-none">
                        {stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                  ))}
                  {stageContacts.length === 0 && <div className="flex h-16 items-center justify-center rounded border border-dashed text-xs text-muted-foreground">Vacío</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List view */}
      {view === "list" && (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1.5">
            {filtered.map((contact) => {
              const isExp = expanded === contact.id;
              return (
                <div key={contact.id} className="rounded-lg border bg-white overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50/50" onClick={() => setExpanded(isExp ? null : contact.id)}>
                    {isExp ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{contact.name}</span>
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${getClaseColor(contact.clase)}`}>{contact.clase}</span>
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${getScoreColor(contact.score)}`}>Score: {contact.score}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span>{contact.category}</span>
                        <span className="flex items-center gap-0.5"><Star className="h-3 w-3 text-amber-400" />{contact.rating} ({contact.reviews})</span>
                        {contact.phone && <span className="flex items-center gap-0.5"><Phone className="h-3 w-3" />{contact.phone}</span>}
                        {contact.website && <span className="flex items-center gap-0.5"><Globe className="h-3 w-3" />{contact.website}</span>}
                      </div>
                    </div>
                    <select value={contact.stageId} onChange={(e) => { e.stopPropagation(); moveStage(contact.id, e.target.value); }} onClick={(e) => e.stopPropagation()} className="rounded border px-2 py-1 text-xs focus:outline-none">
                      {stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <button onClick={(e) => { e.stopPropagation(); deleteContact(contact.id); }} className="rounded p-1 hover:bg-red-50 text-muted-foreground hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                  </div>
                  {isExp && (
                    <div className="border-t px-4 pb-3 pt-2">
                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div><span className="font-medium text-muted-foreground">Dirección:</span> {contact.address || "—"}</div>
                            <div><span className="font-medium text-muted-foreground">Motivo:</span> {contact.motivo || "—"}</div>
                          </div>
                          {contact.description && <p className="text-xs text-muted-foreground border-l-2 pl-2">{contact.description}</p>}
                        </div>
                        {/* Custom fields */}
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">Campos personalizados</label>
                          {(contact.customFields || []).length > 0 && (
                            <div className="mb-2 space-y-1">
                              {(contact.customFields || []).map((f) => (
                                <div key={f.id} className="flex items-center gap-1 rounded bg-gray-50 px-2 py-1 text-xs">
                                  <span className="font-medium">{f.label}:</span>
                                  <span className="flex-1 truncate">{f.value}</span>
                                  <button onClick={() => removeCustomField(contact.id, f.id)} className="text-muted-foreground hover:text-red-500"><X className="h-3 w-3" /></button>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="flex gap-1.5">
                            <input value={getFieldForm(contact.id).label} onChange={(e) => setFieldForm(contact.id, { ...getFieldForm(contact.id), label: e.target.value })} placeholder="Campo" className="w-20 rounded border px-2 py-1 text-xs focus:border-brand focus:outline-none" />
                            <input value={getFieldForm(contact.id).value} onChange={(e) => setFieldForm(contact.id, { ...getFieldForm(contact.id), value: e.target.value })} placeholder="Valor" className="flex-1 rounded border px-2 py-1 text-xs focus:border-brand focus:outline-none" />
                            <button onClick={() => addCustomField(contact.id)} className="rounded bg-brand px-2 py-1 text-xs text-white hover:bg-brand-hover">+</button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">Notas de seguimiento</label>
                          <textarea value={contact.notes} onChange={(e) => updateNotes(contact.id, e.target.value)} placeholder="Agregar notas..." rows={3} className="w-full rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {filtered.length === 0 && <div className="py-12 text-center text-muted-foreground text-sm">Sin contactos fríos. Importa un archivo para comenzar.</div>}
          </div>
        </div>
      )}
    </div>
  );
}
