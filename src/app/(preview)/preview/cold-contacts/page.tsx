"use client";

import { useState, useEffect, useRef } from "react";
import { AlertCircle, ChevronDown, ChevronRight, Download, FileSpreadsheet, Filter, Globe, GripVertical, Phone, Plus, Search, Star, Thermometer, Trash2, Upload, X } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";

type FollowUp = { id: string; channel: string; date: string; note: string; done: boolean };

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
  outreachChannel: string;
  followUps: FollowUp[];
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
  { id: "cc1", name: "Oral Studio", phone: "312 7093687", website: "oralstudio.com.co", category: "Clínica dental", rating: 5, reviews: 924, address: "Cl. 19a #44-25, El Poblado, Medellín", description: "Diseño de sonrisa, implantes, blanqueamiento", clase: "No verificado", motivo: "Ficha no verificada", score: 103, stageId: "cs1", notes: "", addedAt: "2026-07-17", customFields: [], outreachChannel: "", followUps: [] },
  { id: "cc2", name: "Dental Expertos", phone: "300 8938020", website: "instagram.com/dentalexpertos", category: "Clínica dental", rating: 4.9, reviews: 675, address: "Cra. 52 #7-115, Guayabal, Medellín", description: "Clínica odontológica y estética", clase: "Solo red social", motivo: "Su web es un perfil de red social", score: 87, stageId: "cs1", notes: "", addedAt: "2026-07-17", customFields: [], outreachChannel: "instagram", followUps: [] },
  { id: "cc3", name: "Smile Odontólogos", phone: "313 7434048", website: "beacons.ai/odontologos", category: "Clínica dental", rating: 4.9, reviews: 395, address: "Mayorca Mega Plaza, Sabaneta", description: "Turismo odontológico y estética dental", clase: "No verificado", motivo: "Ficha no verificada", score: 102, stageId: "cs1", notes: "", addedAt: "2026-07-17", customFields: [], outreachChannel: "", followUps: [] },
  { id: "cc4", name: "Nova Smile", phone: "301 3951082", website: "novasmile.com.co", category: "Clínica dental", rating: 4.9, reviews: 209, address: "Cl. 19a #44-25, El Poblado, Medellín", description: "Ortodoncia, implantes, endodoncia", clase: "No verificado", motivo: "Ficha no verificada", score: 102, stageId: "cs1", notes: "", addedAt: "2026-07-17", customFields: [], outreachChannel: "", followUps: [] },
  { id: "cc5", name: "Dentart", phone: "301 6510868", website: "dentartodontology.com", category: "Dentista", rating: 4.8, reviews: 23, address: "Cra 50, La Estrella", description: "Dentista con web propia y can_claim", clase: "Cliente caliente", motivo: "Alta reputación y presencia digital", score: 99, stageId: "cs2", notes: "¡CALIENTE! Tiene can_claim y web propia", addedAt: "2026-07-17", customFields: [], outreachChannel: "whatsapp", followUps: [{ id: "fu1", channel: "whatsapp", date: "2026-07-17", note: "Primer mensaje enviado", done: true }] },
  { id: "cc6", name: "360 Dental Group IPS", phone: "312 2177371", website: "sonrisas360.com", category: "Clínica dental", rating: 4.9, reviews: 153, address: "C.C. Mayorca Torre Médica, Sabaneta", description: "Implantes, diseño de sonrisa, rehabilitación oral", clase: "No verificado", motivo: "Ficha no verificada", score: 102, stageId: "cs1", notes: "", addedAt: "2026-07-17", customFields: [], outreachChannel: "", followUps: [] },
  { id: "cc7", name: "Clínica Total Harmony", phone: "300 6561575", website: "clinicatotalharmony.com", category: "Dentista", rating: 5, reviews: 106, address: "Cra. 44 #72 sur 42, Sabaneta", description: "Odontología integral y estética médica", clase: "No verificado", motivo: "Ficha no verificada", score: 103, stageId: "cs1", notes: "", addedAt: "2026-07-17", customFields: [], outreachChannel: "email", followUps: [] },
  { id: "cc8", name: "Dental clinic soluciones", phone: "305 3640935", website: "instagram.com/dentalclinicsoluciones", category: "Clínica dental", rating: 5, reviews: 136, address: "Cra. 46 #74sur-16, Sabaneta", description: "Diseños de sonrisa, ortodoncia, implantes", clase: "Solo red social", motivo: "Su web es un perfil de red social", score: 88, stageId: "cs1", notes: "", addedAt: "2026-07-17", customFields: [], outreachChannel: "", followUps: [] },
  { id: "cc9", name: "Odontics Sabaneta", phone: "311 4272131", website: "", category: "Clínica dental", rating: 4.9, reviews: 372, address: "Cra. 43B #72s 91, Sabaneta", description: "Odontología general y especializada", clase: "No página web", motivo: "No tiene website", score: 87, stageId: "cs1", notes: "", addedAt: "2026-07-17", customFields: [], outreachChannel: "", followUps: [] },
  { id: "cc10", name: "ORAL DENT", phone: "320 4596856", website: "odontologosmedellin.com", category: "Oficinas de empresa", rating: 4, reviews: 1, address: "Cra. 43A #62sur-41, Sabaneta", description: "Consultorio con can_claim", clase: "Frío", motivo: "Pocas señales comerciales fuertes", score: 85, stageId: "cs1", notes: "", addedAt: "2026-07-17", customFields: [], outreachChannel: "", followUps: [] },
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
  const [filterWeb, setFilterWeb] = useState("all");
  const [filterVerified, setFilterVerified] = useState("all");
  const [sortBy, setSortBy] = useState<"score" | "reviews" | "rating">("score");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [showExtLeads, setShowExtLeads] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickForm, setQuickForm] = useState({ name: "", phone: "", website: "", category: "", notes: "" });
  const [extLeads, setExtLeads] = useState<Record<string, unknown>[]>([]);
  const [fieldForms, setFieldForms] = useState<Record<string, { label: string; value: string }>>({});
  const [pipelineModal, setPipelineModal] = useState<ColdContact | null>(null);
  const [pipelineStageId, setPipelineStageId] = useState("s1");
  const [pipelineValue, setPipelineValue] = useState("$0");
  const [pipelineToast, setPipelineToast] = useState("");
  const [pipelineStages, setPipelineStages] = useState<{ id: string; name: string }[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setContacts(loadFromStorage("cold_contacts", IMPORTED_DATA)); }, []);
  // Load extension leads from localStorage (synced by content script)
  useEffect(() => {
    try { setExtLeads(JSON.parse(localStorage.getItem("extension_leads") || "[]")); } catch { setExtLeads([]); }
  }, []);
  // Load pipeline stages for the "Send to Pipeline" modal
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("localrank_pipeline_stages") || localStorage.getItem("pipeline_stages") || "[]");
      if (stored.length > 0) {
        setPipelineStages(stored);
        setPipelineStageId(stored[0].id);
      } else {
        // Default stages if pipeline hasn't been opened yet
        const defaults = [
          { id: "s1", name: "Nuevo" },
          { id: "s2", name: "Contactado" },
          { id: "s3", name: "Propuesta" },
          { id: "s4", name: "Negociación" },
          { id: "s5", name: "Ganado" },
          { id: "s6", name: "Perdido" },
        ];
        setPipelineStages(defaults);
        setPipelineStageId("s1");
      }
    } catch {
      setPipelineStages([{ id: "s1", name: "Nuevo" }, { id: "s2", name: "Contactado" }, { id: "s3", name: "Propuesta" }, { id: "s4", name: "Negociación" }]);
      setPipelineStageId("s1");
    }
  }, []);
  function save(u: ColdContact[]) { setContacts(u); saveToStorage("cold_contacts", u); }

  function quickAddContact() {
    if (!quickForm.name.trim()) return;
    const c: ColdContact = { id: generateId(), name: quickForm.name, phone: quickForm.phone, website: quickForm.website, category: quickForm.category || "General", rating: 0, reviews: 0, address: "", description: "", clase: "", motivo: "", score: 50, stageId: "cs1", notes: quickForm.notes, addedAt: new Date().toISOString().split("T")[0]!, customFields: [], outreachChannel: "", followUps: [] };
    save([c, ...contacts]);
    setQuickForm({ name: "", phone: "", website: "", category: "", notes: "" });
    setShowQuickAdd(false);
  }

  function importExtLead(lead: Record<string, unknown>) {
    const c: ColdContact = { id: generateId(), name: (lead.company as string) || (lead.title as string) || "Sin nombre", phone: ((lead.phones as string[]) || [])[0] || "", website: (lead.url as string) || "", category: (lead.category as string) || "General", rating: 0, reviews: 0, address: "", description: (lead.description as string) || "", clase: "", motivo: "", score: (lead.score as number) || 50, stageId: "cs1", notes: "Importado desde extension", addedAt: new Date().toISOString().split("T")[0]!, customFields: [], outreachChannel: "", followUps: [] };
    save([c, ...contacts]);
    // Remove from extension leads
    const updated = extLeads.filter(l => l.id !== lead.id);
    setExtLeads(updated);
    localStorage.setItem("extension_leads", JSON.stringify(updated));
  }

  function deleteExtLead(lead: Record<string, unknown>) {
    const updated = extLeads.filter(l => l.id !== lead.id);
    setExtLeads(updated);
    localStorage.setItem("extension_leads", JSON.stringify(updated));
  }

  function sendExtToContacts(lead: Record<string, unknown>) {
    const contacts2 = JSON.parse(localStorage.getItem("contacts") || "[]");
    contacts2.unshift({ id: generateId(), name: (lead.company as string) || (lead.title as string) || "Sin nombre", phone: ((lead.phones as string[]) || [])[0] || "", email: ((lead.emails as string[]) || [])[0] || "", company: (lead.company as string) || "", role: "", image: "", archived: false, createdAt: new Date().toISOString().split("T")[0]!, customFields: [], notes: [], reminders: [] });
    localStorage.setItem("contacts", JSON.stringify(contacts2));
    deleteExtLead(lead);
  }

  function sendExtToCompanies(lead: Record<string, unknown>) {
    const companies = JSON.parse(localStorage.getItem("companies") || "[]");
    companies.unshift({ id: generateId(), name: (lead.company as string) || (lead.title as string) || "Sin nombre", website: (lead.url as string) || "", industry: (lead.category as string) || "", notes: [], customFields: [] });
    localStorage.setItem("companies", JSON.stringify(companies));
    deleteExtLead(lead);
  }

  function importAllExtLeads() {
    const newContacts = extLeads.map((lead) => ({
      id: generateId(), name: (lead.company as string) || (lead.title as string) || "Sin nombre", phone: ((lead.phones as string[]) || [])[0] || "", website: (lead.url as string) || "", category: (lead.category as string) || "General", rating: 0, reviews: 0, address: "", description: "", clase: "", motivo: "", score: (lead.score as number) || 50, stageId: "cs1", notes: "Importado desde extension", addedAt: new Date().toISOString().split("T")[0]!, customFields: [], outreachChannel: "", followUps: [],
    } as ColdContact));
    save([...newContacts, ...contacts]);
    setExtLeads([]);
    localStorage.setItem("extension_leads", "[]");
    setShowExtLeads(false);
  }

  function moveStage(contactId: string, stageId: string) {
    save(contacts.map((c) => c.id === contactId ? { ...c, stageId } : c));
  }

  function updateNotes(contactId: string, notes: string) {
    save(contacts.map((c) => c.id === contactId ? { ...c, notes } : c));
  }

  function deleteContact(id: string) { save(contacts.filter((c) => c.id !== id)); }

  function sendToPipeline(contact: ColdContact) {
    // Open modal to choose pipeline stage
    setPipelineModal(contact);
    setPipelineValue("$0");
  }

  function confirmSendToPipeline() {
    if (!pipelineModal) return;
    try {
      const leads = JSON.parse(localStorage.getItem("localrank_pipeline_leads") || localStorage.getItem("pipeline_leads") || "[]");
      const exists = leads.some((l: { name: string }) => l.name === pipelineModal.name);
      if (exists) {
        setPipelineToast(`⚠️ "${pipelineModal.name}" ya está en el Pipeline`);
        setPipelineModal(null);
        setTimeout(() => setPipelineToast(""), 3000);
        return;
      }
      const newLead = {
        id: Date.now().toString(),
        name: pipelineModal.name,
        company: pipelineModal.category || pipelineModal.website || "",
        value: pipelineValue || "$0",
        stageId: pipelineStageId,
      };
      leads.unshift(newLead);
      // Save to both possible keys for compatibility
      localStorage.setItem("localrank_pipeline_leads", JSON.stringify(leads));
      localStorage.setItem("pipeline_leads", JSON.stringify(leads));
      const stageName = pipelineStages.find(s => s.id === pipelineStageId)?.name || pipelineStageId;
      setPipelineToast(`✅ "${pipelineModal.name}" enviado al Pipeline → ${stageName}`);
      setTimeout(() => setPipelineToast(""), 3000);
    } catch {
      setPipelineToast("❌ Error al enviar al Pipeline");
      setTimeout(() => setPipelineToast(""), 3000);
    }
    setPipelineModal(null);
  }

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

  // Channel & follow-up
  function setOutreachChannel(contactId: string, channel: string) {
    save(contacts.map((c) => c.id === contactId ? { ...c, outreachChannel: channel } : c));
  }
  function addFollowUp(contactId: string, channel: string, note: string) {
    if (!note.trim()) return;
    const fu: FollowUp = { id: generateId(), channel, date: new Date().toISOString().split("T")[0]!, note, done: false };
    save(contacts.map((c) => c.id === contactId ? { ...c, followUps: [...(c.followUps || []), fu] } : c));
  }
  function toggleFollowUp(contactId: string, fuId: string) {
    save(contacts.map((c) => c.id === contactId ? { ...c, followUps: (c.followUps || []).map((f) => f.id === fuId ? { ...f, done: !f.done } : f) } : c));
  }
  function removeFollowUp(contactId: string, fuId: string) {
    save(contacts.map((c) => c.id === contactId ? { ...c, followUps: (c.followUps || []).filter((f) => f.id !== fuId) } : c));
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
          outreachChannel: "",
          followUps: [],
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
    .filter((c) => {
      if (filterWeb === "with") return c.website && !c.website.includes("instagram") && !c.website.includes("facebook") && !c.website.includes("wa.me") && !c.website.includes("beacons") && !c.website.includes("doctoralia");
      if (filterWeb === "without") return !c.website;
      if (filterWeb === "social_only") return c.website && (c.website.includes("instagram") || c.website.includes("facebook") || c.website.includes("beacons"));
      return true;
    })
    .filter((c) => {
      if (filterVerified === "verified") return c.clase !== "No verificado";
      if (filterVerified === "unverified") return c.clase === "No verificado";
      if (filterVerified === "gmb_optimized") return c.reviews > 50 && c.rating >= 4.5 && c.description.length > 50;
      if (filterVerified === "no_images") return !c.description || c.description.length < 20;
      return true;
    })
    .filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search) || c.category.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortBy === "score" ? b.score - a.score : sortBy === "reviews" ? b.reviews - a.reviews : b.rating - a.rating);

  // Pagination
  const [page, setPage] = useState(1);
  const PER_PAGE = 15;
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

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
            <button onClick={() => setShowQuickAdd(!showQuickAdd)} className="flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium hover:bg-gray-50">
              <Plus className="h-3.5 w-3.5" />Agregar uno
            </button>
            {extLeads.length > 0 && (
              <button onClick={() => setShowExtLeads(!showExtLeads)} className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-xs font-medium text-green-700 hover:bg-green-100">
                <Download className="h-3.5 w-3.5" />Extension ({extLeads.length})
              </button>
            )}
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

        {/* Quick Add one contact */}
        {showQuickAdd && (
          <div className="mt-4 rounded-lg border bg-white p-4">
            <h4 className="text-sm font-semibold mb-3">Agregar contacto manualmente</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input value={quickForm.name} onChange={e => setQuickForm({...quickForm, name: e.target.value})} placeholder="Nombre / Empresa *" className="rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              <input value={quickForm.phone} onChange={e => setQuickForm({...quickForm, phone: e.target.value})} placeholder="Telefono" className="rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              <input value={quickForm.website} onChange={e => setQuickForm({...quickForm, website: e.target.value})} placeholder="Website / URL" className="rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              <input value={quickForm.category} onChange={e => setQuickForm({...quickForm, category: e.target.value})} placeholder="Categoria" className="rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              <input value={quickForm.notes} onChange={e => setQuickForm({...quickForm, notes: e.target.value})} placeholder="Notas" className="rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              <button onClick={quickAddContact} disabled={!quickForm.name.trim()} className="rounded bg-brand px-4 py-2 text-sm text-white hover:bg-brand-hover disabled:opacity-50">Agregar</button>
            </div>
          </div>
        )}

        {/* Extension leads */}
        {showExtLeads && extLeads.length > 0 && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-green-800">Leads desde la extension ({extLeads.length})</h4>
              <button onClick={importAllExtLeads} className="rounded bg-green-600 px-3 py-1.5 text-xs text-white hover:bg-green-700">Importar todos</button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {extLeads.map((lead, i) => (
                <div key={i} className="flex items-center justify-between rounded border border-green-200 bg-white px-3 py-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{(lead.company as string) || (lead.title as string) || "Sin nombre"}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{(lead.url as string) || ""} · Score: {(lead.score as number) || 0}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => importExtLead(lead)} className="rounded bg-brand px-2 py-1 text-[9px] text-white hover:bg-brand-hover">Prospeccion</button>
                    <button onClick={() => sendExtToContacts(lead)} className="rounded border px-2 py-1 text-[9px] hover:bg-gray-50">Contactos</button>
                    <button onClick={() => sendExtToCompanies(lead)} className="rounded border px-2 py-1 text-[9px] hover:bg-gray-50">Compania</button>
                    <button onClick={() => deleteExtLead(lead)} className="rounded px-1.5 py-1 text-[9px] text-red-500 hover:bg-red-50">✕</button>
                  </div>
                </div>
              ))}
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
          <select value={filterWeb} onChange={(e) => setFilterWeb(e.target.value)} className="rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none">
            <option value="all">Web: Todos</option>
            <option value="with">Con página web</option>
            <option value="without">Sin página web</option>
            <option value="social_only">Solo red social</option>
          </select>
          <select value={filterVerified} onChange={(e) => setFilterVerified(e.target.value)} className="rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none">
            <option value="all">Verificación: Todos</option>
            <option value="verified">Verificados</option>
            <option value="unverified">No verificados</option>
            <option value="gmb_optimized">GMB Optimizado</option>
            <option value="no_images">Sin imágenes/descripción</option>
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
                      <button onClick={() => sendToPipeline(c)} className="mt-1 w-full rounded border border-green-200 py-0.5 text-[10px] font-medium text-green-600 hover:bg-green-50">→ Pipeline CRM</button>
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
            {paginated.map((contact) => {
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
                      {contact.outreachChannel && <span className="rounded-full bg-brand/10 px-1.5 py-0.5 text-[10px] font-medium text-brand">{contact.outreachChannel}</span>}
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
                    <button onClick={(e) => { e.stopPropagation(); sendToPipeline(contact); }} className="rounded px-2 py-1 text-[10px] text-green-600 border border-green-200 hover:bg-green-50">Pipeline</button>
                    <button onClick={(e) => { e.stopPropagation(); deleteContact(contact.id); }} className="rounded p-1 hover:bg-red-50 text-muted-foreground hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                  </div>
                  {isExp && (
                    <div className="border-t px-4 pb-3 pt-2">
                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                        {/* Info */}
                        <div className="space-y-2">
                          <div className="text-xs"><span className="font-medium text-muted-foreground">Dirección:</span> {contact.address || "—"}</div>
                          <div className="text-xs"><span className="font-medium text-muted-foreground">Motivo:</span> {contact.motivo || "—"}</div>
                          {contact.description && <p className="text-xs text-muted-foreground border-l-2 pl-2">{contact.description}</p>}
                        </div>

                        {/* Outreach Channel */}
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">Canal de prospección</label>
                          <select value={contact.outreachChannel || ""} onChange={(e) => setOutreachChannel(contact.id, e.target.value)} className="w-full rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none">
                            <option value="">Sin asignar</option>
                            <option value="whatsapp">WhatsApp</option>
                            <option value="email">Email</option>
                            <option value="instagram">Instagram DM</option>
                            <option value="linkedin">LinkedIn</option>
                            <option value="telegram">Telegram</option>
                            <option value="phone">Llamada</option>
                            <option value="facebook">Facebook</option>
                            <option value="x">X (Twitter)</option>
                          </select>
                          {contact.outreachChannel && <span className="mt-1 inline-block rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-medium text-brand">{contact.outreachChannel}</span>}

                          {/* Follow-ups */}
                          <div className="mt-3">
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Seguimientos</label>
                            {(contact.followUps || []).length > 0 && (
                              <div className="space-y-1 mb-2">
                                {(contact.followUps || []).map((fu) => (
                                  <div key={fu.id} className="group flex items-center gap-1.5 rounded bg-gray-50 px-2 py-1 text-[10px]">
                                    <input type="checkbox" checked={fu.done} onChange={() => toggleFollowUp(contact.id, fu.id)} className="accent-[var(--accent)]" />
                                    <span className="rounded bg-brand/10 px-1 py-0.5 text-brand font-medium">{fu.channel}</span>
                                    <span className={`flex-1 ${fu.done ? "line-through text-muted-foreground" : ""}`}>{fu.note}</span>
                                    <span className="text-muted-foreground">{fu.date}</span>
                                    <button onClick={() => removeFollowUp(contact.id, fu.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500"><X className="h-3 w-3" /></button>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="flex gap-1">
                              <input id={`fu-${contact.id}`} placeholder="Agregar seguimiento..." className="flex-1 rounded border px-2 py-1 text-xs focus:border-brand focus:outline-none" onKeyDown={(e) => { if (e.key === "Enter") { const inp = e.target as HTMLInputElement; addFollowUp(contact.id, contact.outreachChannel || "general", inp.value); inp.value = ""; } }} />
                              <button onClick={() => { const inp = document.getElementById(`fu-${contact.id}`) as HTMLInputElement; if (inp?.value) { addFollowUp(contact.id, contact.outreachChannel || "general", inp.value); inp.value = ""; } }} className="rounded bg-brand px-2 py-1 text-xs text-white hover:bg-brand-hover">+</button>
                            </div>
                          </div>
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

                        {/* Notes */}
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">Notas</label>
                          <textarea value={contact.notes} onChange={(e) => updateNotes(contact.id, e.target.value)} placeholder="Agregar notas..." rows={4} className="w-full rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {filtered.length === 0 && <div className="py-12 text-center text-muted-foreground text-sm">Sin contactos fríos. Importa un archivo para comenzar.</div>}
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="rounded border px-3 py-1.5 text-xs font-medium disabled:opacity-40 hover:bg-gray-50">Anterior</button>
                <span className="text-xs text-muted-foreground">Pagina {page} de {totalPages} ({filtered.length} contactos)</span>
                <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="rounded border px-3 py-1.5 text-xs font-medium disabled:opacity-40 hover:bg-gray-50">Siguiente</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pipeline stage picker modal */}
      {pipelineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setPipelineModal(null)}>
          <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">Enviar al Pipeline</h3>
              <button onClick={() => setPipelineModal(null)} className="rounded p-1 hover:bg-gray-100"><X className="h-4 w-4" /></button>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              <span className="font-medium text-foreground">{pipelineModal.name}</span> · {pipelineModal.category}
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1">Etapa del embudo</label>
                <select value={pipelineStageId} onChange={e => setPipelineStageId(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand">
                  {pipelineStages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Valor estimado (opcional)</label>
                <input value={pipelineValue} onChange={e => setPipelineValue(e.target.value)} placeholder="$0" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setPipelineModal(null)} className="flex-1 rounded-md border px-3 py-2 text-sm font-medium hover:bg-gray-50">Cancelar</button>
                <button onClick={confirmSendToPipeline} className="flex-1 rounded-md bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-hover">Enviar al Pipeline</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {pipelineToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-gray-900 px-4 py-2.5 text-sm text-white shadow-lg animate-in fade-in slide-in-from-bottom-4">
          {pipelineToast}
        </div>
      )}
    </div>
  );
}
