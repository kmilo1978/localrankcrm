"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, ClipboardList, ExternalLink, FileText, Link2, Plus, Search, Trash2, X } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";

type FormField = { label: string; value: string };

type FormEntry = {
  id: string;
  formId: string;
  fields: FormField[];
  submittedAt: string;
  status: "new" | "reviewed" | "contacted" | "converted";
  notes: string;
};

type ConnectedForm = {
  id: string;
  name: string;
  provider: "tally" | "typeform" | "google_forms" | "jotform" | "webhook" | "manual";
  url: string;
  webhookUrl: string;
  entryCount: number;
  createdAt: string;
};

const PROVIDERS = [
  { id: "tally", name: "Tally", color: "bg-blue-50 text-blue-700", icon: "T" },
  { id: "typeform", name: "Typeform", color: "bg-purple-50 text-purple-700", icon: "Tf" },
  { id: "google_forms", name: "Google Forms", color: "bg-green-50 text-green-700", icon: "G" },
  { id: "jotform", name: "JotForm", color: "bg-orange-50 text-orange-700", icon: "J" },
  { id: "webhook", name: "Webhook genérico", color: "bg-gray-50 text-gray-700", icon: "W" },
  { id: "manual", name: "Manual", color: "bg-amber-50 text-amber-700", icon: "M" },
];

const STATUS_STYLES = {
  new: "bg-blue-100 text-blue-700",
  reviewed: "bg-amber-100 text-amber-700",
  contacted: "bg-purple-100 text-purple-700",
  converted: "bg-green-100 text-green-700",
};
const STATUS_LABELS = { new: "Nuevo", reviewed: "Revisado", contacted: "Contactado", converted: "Convertido" };

const SEED_FORMS: ConnectedForm[] = [
  { id: "frm1", name: "BRIEF — Plantilla General", provider: "tally", url: "https://tally.so/r/1AyxXL", webhookUrl: "", entryCount: 3, createdAt: "2026-07-15" },
];

const SEED_ENTRIES: FormEntry[] = [
  {
    id: "e1", formId: "frm1", submittedAt: "2026-07-17 14:30", status: "new", notes: "",
    fields: [
      { label: "Nombre", value: "Laura Martínez" },
      { label: "Empresa", value: "FitLife Studio" },
      { label: "Qué hace tu empresa", value: "Vendo programas de entrenamiento online y presencial" },
      { label: "Quién es tu cliente", value: "Mujeres 25-40 que quieren tonificar sin ir al gym" },
      { label: "Qué necesitan", value: "Landing page + Funnel de ventas + Ads en Instagram" },
      { label: "Sitio web", value: "instagram.com/fitlifestudio" },
      { label: "Presupuesto", value: "$2,000 - $3,000 USD" },
    ],
  },
  {
    id: "e2", formId: "frm1", submittedAt: "2026-07-16 10:15", status: "reviewed", notes: "Buen perfil, agendar llamada",
    fields: [
      { label: "Nombre", value: "Diego Castillo" },
      { label: "Empresa", value: "Castillo & Asociados" },
      { label: "Qué hace tu empresa", value: "Despacho jurídico especializado en derecho corporativo" },
      { label: "Quién es tu cliente", value: "Empresas medianas que necesitan asesoría legal continua" },
      { label: "Qué necesitan", value: "Sitio web profesional + SEO + Google Ads" },
      { label: "Sitio web", value: "No tienen aún" },
      { label: "Presupuesto", value: "$5,000+ USD" },
    ],
  },
  {
    id: "e3", formId: "frm1", submittedAt: "2026-07-15 18:45", status: "contacted", notes: "Llamada realizada, enviar cotización",
    fields: [
      { label: "Nombre", value: "Valentina Rojas" },
      { label: "Empresa", value: "Sweet Valentina Bakery" },
      { label: "Qué hace tu empresa", value: "Pastelería artesanal con envío a domicilio" },
      { label: "Quién es tu cliente", value: "Personas que buscan pasteles personalizados para eventos" },
      { label: "Qué necesitan", value: "Catálogo online + WhatsApp integrado + Redes sociales" },
      { label: "Sitio web", value: "instagram.com/sweetvalentina" },
      { label: "Presupuesto", value: "$1,000 - $1,500 USD" },
    ],
  },
];

export default function FormsPage() {
  const [forms, setForms] = useState<ConnectedForm[]>([]);
  const [entries, setEntries] = useState<FormEntry[]>([]);
  const [search, setSearch] = useState("");
  const [showConnectForm, setShowConnectForm] = useState(false);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | FormEntry["status"]>("all");
  const [filterFormId, setFilterFormId] = useState<string>("all");
  const [connectForm, setConnectForm] = useState({ name: "", provider: "tally" as ConnectedForm["provider"], url: "" });
  // Manual entry
  const [manualFields, setManualFields] = useState<FormField[]>([{ label: "", value: "" }]);

  useEffect(() => {
    setForms(loadFromStorage("crm_forms", SEED_FORMS));
    setEntries(loadFromStorage("crm_form_entries", SEED_ENTRIES));
  }, []);

  function saveForms(u: ConnectedForm[]) { setForms(u); saveToStorage("crm_forms", u); }
  function saveEntries(u: FormEntry[]) { setEntries(u); saveToStorage("crm_form_entries", u); }

  function handleConnectForm() {
    if (!connectForm.name.trim()) return;
    const webhookUrl = `${window.location.origin}/api/webhooks/forms/${generateId()}`;
    const newForm: ConnectedForm = { id: generateId(), name: connectForm.name, provider: connectForm.provider, url: connectForm.url, webhookUrl, entryCount: 0, createdAt: new Date().toISOString().split("T")[0]! };
    saveForms([newForm, ...forms]);
    setConnectForm({ name: "", provider: "tally", url: "" });
    setShowConnectForm(false);
  }

  function deleteForm(id: string) {
    saveForms(forms.filter((f) => f.id !== id));
    saveEntries(entries.filter((e) => e.formId !== id));
  }

  function addManualEntry() {
    const filledFields = manualFields.filter((f) => f.label.trim() && f.value.trim());
    if (filledFields.length === 0) return;
    const formId = forms[0]?.id || "manual";
    const entry: FormEntry = { id: generateId(), formId, fields: filledFields, submittedAt: new Date().toLocaleString("es"), status: "new", notes: "" };
    saveEntries([entry, ...entries]);
    setManualFields([{ label: "", value: "" }]);
    setShowAddEntry(false);
  }

  function updateEntryStatus(entryId: string, status: FormEntry["status"]) {
    saveEntries(entries.map((e) => e.id === entryId ? { ...e, status } : e));
  }

  function updateEntryNotes(entryId: string, notes: string) {
    saveEntries(entries.map((e) => e.id === entryId ? { ...e, notes } : e));
  }

  function deleteEntry(id: string) { saveEntries(entries.filter((e) => e.id !== id)); }

  function addManualFieldRow() { setManualFields([...manualFields, { label: "", value: "" }]); }
  function updateManualField(index: number, field: "label" | "value", val: string) {
    const updated = [...manualFields];
    updated[index] = { ...updated[index]!, [field]: val };
    setManualFields(updated);
  }

  const filtered = entries
    .filter((e) => filterFormId === "all" || e.formId === filterFormId)
    .filter((e) => filterStatus === "all" || e.status === filterStatus)
    .filter((e) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return e.fields.some((f) => f.value.toLowerCase().includes(s) || f.label.toLowerCase().includes(s));
    });

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Formularios</h1>
            <p className="text-sm text-muted-foreground">{entries.length} respuestas · {forms.length} formulario{forms.length !== 1 ? "s" : ""} conectado{forms.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowAddEntry(!showAddEntry)} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-gray-50 transition-colors">
              <FileText className="h-4 w-4" />Agregar entrada
            </button>
            <button onClick={() => setShowConnectForm(!showConnectForm)} className="flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover transition-colors">
              <Link2 className="h-4 w-4" />Conectar formulario
            </button>
          </div>
        </div>

        {/* Connect form modal */}
        {showConnectForm && (
          <div className="mb-6 rounded-lg border bg-white p-5">
            <h3 className="mb-4 font-semibold">Conectar formulario externo</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <input value={connectForm.name} onChange={(e) => setConnectForm({ ...connectForm, name: e.target.value })} placeholder="Nombre del formulario *" className="rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              <select value={connectForm.provider} onChange={(e) => setConnectForm({ ...connectForm, provider: e.target.value as ConnectedForm["provider"] })} className="rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand">
                {PROVIDERS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <input value={connectForm.url} onChange={(e) => setConnectForm({ ...connectForm, url: e.target.value })} placeholder="URL del formulario" className="rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
            </div>
            <div className="mt-3 rounded border border-dashed bg-gray-50 p-3 text-xs text-muted-foreground">
              <p className="font-medium mb-1">¿Cómo conectar?</p>
              <p>1. En Tally/Typeform/etc, ve a <strong>Integraciones → Webhook</strong></p>
              <p>2. Pega esta URL como endpoint del webhook:</p>
              <code className="mt-1 block rounded bg-white border px-2 py-1 text-brand select-all">{typeof window !== "undefined" ? window.location.origin : ""}/api/webhooks/forms/[tu-id]</code>
              <p className="mt-1">3. Cada respuesta nueva llegará organizada aquí automáticamente.</p>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={handleConnectForm} className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover">Conectar</button>
              <button onClick={() => setShowConnectForm(false)} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50">Cancelar</button>
            </div>
          </div>
        )}

        {/* Manual entry form */}
        {showAddEntry && (
          <div className="mb-6 rounded-lg border bg-white p-5">
            <h3 className="mb-4 font-semibold">Agregar entrada manual</h3>
            <div className="space-y-2">
              {manualFields.map((f, i) => (
                <div key={i} className="flex gap-2">
                  <input value={f.label} onChange={(e) => updateManualField(i, "label", e.target.value)} placeholder="Campo (ej: Nombre)" className="w-40 rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
                  <input value={f.value} onChange={(e) => updateManualField(i, "value", e.target.value)} placeholder="Valor" className="flex-1 rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
                </div>
              ))}
            </div>
            <button onClick={addManualFieldRow} className="mt-2 text-xs text-brand hover:underline">+ Agregar campo</button>
            <div className="mt-4 flex gap-2">
              <button onClick={addManualEntry} className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover">Guardar</button>
              <button onClick={() => setShowAddEntry(false)} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50">Cancelar</button>
            </div>
          </div>
        )}

        {/* Connected forms summary */}
        {forms.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {forms.map((form) => {
              const prov = PROVIDERS.find((p) => p.id === form.provider);
              return (
                <div key={form.id} className="group flex items-center gap-2 rounded-lg border bg-white px-3 py-2">
                  <span className={`flex h-6 w-6 items-center justify-center rounded text-xs font-bold ${prov?.color || "bg-gray-50"}`}>{prov?.icon || "?"}</span>
                  <div className="text-xs">
                    <span className="font-medium">{form.name}</span>
                    <span className="ml-1 text-muted-foreground">· {entries.filter((e) => e.formId === form.id).length} resp.</span>
                  </div>
                  {form.url && <a href={form.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-brand"><ExternalLink className="h-3 w-3" /></a>}
                  <button onClick={() => deleteForm(form.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                </div>
              );
            })}
          </div>
        )}

        {/* Filters */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input placeholder="Buscar en respuestas..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-56 rounded-md border bg-white py-2 pl-8 pr-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)} className="rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand">
            <option value="all">Todos los estados</option>
            <option value="new">Nuevos</option>
            <option value="reviewed">Revisados</option>
            <option value="contacted">Contactados</option>
            <option value="converted">Convertidos</option>
          </select>
          {forms.length > 1 && (
            <select value={filterFormId} onChange={(e) => setFilterFormId(e.target.value)} className="rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand">
              <option value="all">Todos los formularios</option>
              {forms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          )}
        </div>

        {/* Entries */}
        <div className="space-y-2">
          {filtered.map((entry) => {
            const isExpanded = expandedEntry === entry.id;
            const nameField = entry.fields.find((f) => f.label.toLowerCase().includes("nombre"));
            const companyField = entry.fields.find((f) => f.label.toLowerCase().includes("empresa") || f.label.toLowerCase().includes("negocio"));
            return (
              <div key={entry.id} className="rounded-lg border bg-white overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50/50" onClick={() => setExpandedEntry(isExpanded ? null : entry.id)}>
                  {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                  <ClipboardList className="h-4 w-4 text-brand shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{nameField?.value || "Sin nombre"}</span>
                      {companyField && <span className="text-xs text-muted-foreground">— {companyField.value}</span>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {entry.fields.filter((f) => f !== nameField && f !== companyField).slice(0, 2).map((f) => f.value).join(" · ")}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{entry.submittedAt}</span>
                  <select
                    value={entry.status}
                    onChange={(e) => { e.stopPropagation(); updateEntryStatus(entry.id, e.target.value as FormEntry["status"]); }}
                    onClick={(e) => e.stopPropagation()}
                    className={`rounded-full px-2 py-0.5 text-xs font-medium border-0 cursor-pointer ${STATUS_STYLES[entry.status]}`}
                  >
                    {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                  <button onClick={(e) => { e.stopPropagation(); deleteEntry(entry.id); }} className="rounded p-1 hover:bg-red-50 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" title="Eliminar">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {isExpanded && (
                  <div className="border-t px-4 pb-4 pt-3">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                      {/* Fields */}
                      <div className="lg:col-span-2">
                        <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Información del formulario</h4>
                        <div className="rounded border divide-y">
                          {entry.fields.map((f, i) => (
                            <div key={i} className="flex gap-3 px-3 py-2 text-sm">
                              <span className="w-32 shrink-0 font-medium text-muted-foreground">{f.label}</span>
                              <span className="flex-1">{f.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Notes + actions */}
                      <div>
                        <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Notas internas</h4>
                        <textarea
                          value={entry.notes}
                          onChange={(e) => updateEntryNotes(entry.id, e.target.value)}
                          placeholder="Agregar notas sobre este lead..."
                          rows={4}
                          className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                        />
                        <div className="mt-3 space-y-2">
                          <button className="w-full rounded-md border px-3 py-2 text-xs font-medium hover:bg-gray-50 text-left">
                            → Convertir a Contacto
                          </button>
                          <button className="w-full rounded-md border px-3 py-2 text-xs font-medium hover:bg-gray-50 text-left">
                            → Crear Oportunidad
                          </button>
                          <button className="w-full rounded-md border px-3 py-2 text-xs font-medium hover:bg-gray-50 text-left">
                            → Agregar a Compañía
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              <ClipboardList className="mx-auto h-10 w-10 text-muted-foreground/30" />
              <p className="mt-2 text-sm">Sin respuestas de formulario</p>
              <p className="text-xs">Conecta un formulario o agrega entradas manualmente.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
