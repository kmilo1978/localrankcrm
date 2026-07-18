"use client";

import { useState, useEffect } from "react";
import { Building2, ChevronDown, ChevronRight, Globe, MapPin, Phone, Plus, Search, StickyNote, Trash2, Users, X } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";

type CustomField = { id: string; label: string; value: string };
type CompanyNote = { id: string; content: string; createdAt: string };

type Company = {
  id: string;
  name: string;
  industry: string;
  website: string;
  phone: string;
  location: string;
  employees: number;
  customFields: CustomField[];
  notes: CompanyNote[];
};

const SEED: Company[] = [
  { id: "c1", name: "TechCorp Solutions", industry: "Tecnología", website: "techcorp.com", phone: "+52 55 1234 5678", location: "CDMX, México", employees: 150, customFields: [{ id: "cf1", label: "NIT", value: "900123456-7" }], notes: [{ id: "cn1", content: "Interesados en plan Enterprise. Reunión programada para agosto.", createdAt: "2026-07-17" }] },
  { id: "c2", name: "MediaGroup Digital", industry: "Marketing", website: "mediagroup.mx", phone: "+52 33 9876 5432", location: "Guadalajara, México", employees: 45, customFields: [], notes: [] },
  { id: "c3", name: "LogiNext International", industry: "Logística", website: "loginext.io", phone: "+1 305 555 0123", location: "Miami, FL", employees: 320, customFields: [{ id: "cf2", label: "Región", value: "LATAM + USA" }], notes: [{ id: "cn2", content: "Contacto principal: María García, VP Ops.", createdAt: "2026-07-16" }] },
];

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", industry: "", website: "", phone: "", location: "", employees: "" });
  const [formExtraFields, setFormExtraFields] = useState<{ label: string; value: string }[]>([]);
  // Per-company inline forms
  const [fieldForms, setFieldForms] = useState<Record<string, { label: string; value: string }>>({});
  const [noteForms, setNoteForms] = useState<Record<string, string>>({});

  useEffect(() => { setCompanies(loadFromStorage("companies", SEED)); }, []);
  function save(u: Company[]) { setCompanies(u); saveToStorage("companies", u); }

  function handleAdd() {
    if (!form.name.trim()) return;
    const extraFields = formExtraFields.filter((f) => f.label.trim()).map((f) => ({ id: generateId(), label: f.label, value: f.value }));
    const c: Company = { id: generateId(), name: form.name, industry: form.industry || "Sin clasificar", website: form.website, phone: form.phone, location: form.location, employees: Number(form.employees) || 0, customFields: extraFields, notes: [] };
    save([c, ...companies]);
    setForm({ name: "", industry: "", website: "", phone: "", location: "", employees: "" });
    setFormExtraFields([]);
    setShowForm(false);
  }

  function handleDelete(id: string) { save(companies.filter((c) => c.id !== id)); }

  function getFieldForm(id: string) { return fieldForms[id] || { label: "", value: "" }; }
  function setFieldForm(id: string, data: { label: string; value: string }) { setFieldForms((p) => ({ ...p, [id]: data })); }
  function addCustomField(companyId: string) {
    const ff = getFieldForm(companyId);
    if (!ff.label.trim()) return;
    save(companies.map((c) => c.id === companyId ? { ...c, customFields: [...c.customFields, { id: generateId(), label: ff.label, value: ff.value }] } : c));
    setFieldForm(companyId, { label: "", value: "" });
  }

  function removeCustomField(companyId: string, fieldId: string) {
    save(companies.map((c) => c.id === companyId ? { ...c, customFields: c.customFields.filter((f) => f.id !== fieldId) } : c));
  }

  function getNoteForm(id: string) { return noteForms[id] || ""; }
  function setNoteForm(id: string, val: string) { setNoteForms((p) => ({ ...p, [id]: val })); }
  function addNote(companyId: string) {
    const text = getNoteForm(companyId);
    if (!text.trim()) return;
    const note: CompanyNote = { id: generateId(), content: text, createdAt: new Date().toISOString().split("T")[0]! };
    save(companies.map((c) => c.id === companyId ? { ...c, notes: [note, ...c.notes] } : c));
    setNoteForm(companyId, "");
  }

  function removeNote(companyId: string, noteId: string) {
    save(companies.map((c) => c.id === companyId ? { ...c, notes: c.notes.filter((n) => n.id !== noteId) } : c));
  }

  const filtered = companies.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.industry.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Compañías</h1>
            <p className="text-sm text-muted-foreground">{companies.length} empresas</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover transition-colors">
            <Plus className="h-4 w-4" />Nueva compañía
          </button>
        </div>

        {showForm && (
          <div className="mb-6 rounded-lg border bg-white p-5">
            <h3 className="mb-4 font-semibold">Agregar nueva compañía</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nombre *" className="rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              <input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} placeholder="Industria" className="rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="Sitio web" className="rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Teléfono" className="rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Ubicación" className="rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              <input value={form.employees} onChange={(e) => setForm({ ...form, employees: e.target.value })} placeholder="Empleados" type="number" className="rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
            </div>
            {/* Dynamic custom fields at creation */}
            {formExtraFields.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Campos personalizados:</p>
                {formExtraFields.map((f, i) => (
                  <div key={i} className="flex gap-2">
                    <input value={f.label} onChange={(e) => { const u = [...formExtraFields]; u[i] = { ...u[i]!, label: e.target.value }; setFormExtraFields(u); }} placeholder="Nombre del campo" className="w-40 rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
                    <input value={f.value} onChange={(e) => { const u = [...formExtraFields]; u[i] = { ...u[i]!, value: e.target.value }; setFormExtraFields(u); }} placeholder="Valor" className="flex-1 rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
                    <button onClick={() => setFormExtraFields(formExtraFields.filter((_, idx) => idx !== i))} className="rounded-md border px-2 py-2 text-sm text-muted-foreground hover:text-red-500 hover:bg-red-50">✕</button>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setFormExtraFields([...formExtraFields, { label: "", value: "" }])} className="mt-3 text-sm text-brand hover:underline font-medium">+ Agregar campo personalizado</button>
            <div className="mt-4 flex gap-2">
              <button onClick={handleAdd} className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover">Guardar</button>
              <button onClick={() => setShowForm(false)} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50">Cancelar</button>
            </div>
          </div>
        )}

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-md border bg-white py-2 pl-10 pr-4 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
        </div>

        <div className="space-y-3">
          {filtered.map((company) => {
            const isExpanded = expanded === company.id;
            return (
              <div key={company.id} className="rounded-lg border bg-white overflow-hidden">
                {/* Header row */}
                <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50/50" onClick={() => setExpanded(isExpanded ? null : company.id)}>
                  {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-tint text-brand">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">{company.name}</h3>
                      <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-muted-foreground">{company.industry}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-0.5 text-xs text-muted-foreground">
                      {company.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{company.location}</span>}
                      {company.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{company.phone}</span>}
                      {company.website && <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{company.website}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {company.notes.length > 0 && <span className="flex items-center gap-1 text-xs text-muted-foreground"><StickyNote className="h-3 w-3" />{company.notes.length}</span>}
                    {company.customFields.length > 0 && <span className="text-xs text-muted-foreground">{company.customFields.length} campos</span>}
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(company.id); }} className="rounded p-1 hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-all" title="Eliminar">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t px-4 pb-4 pt-3">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      {/* Custom Fields */}
                      <div>
                        <h4 className="mb-2 text-sm font-semibold">Campos personalizados</h4>
                        {company.customFields.length > 0 && (
                          <div className="mb-3 space-y-1.5">
                            {company.customFields.map((f) => (
                              <div key={f.id} className="flex items-center gap-2 rounded border bg-gray-50 px-3 py-1.5 text-sm">
                                <span className="font-medium text-muted-foreground">{f.label}:</span>
                                <span className="flex-1">{f.value}</span>
                                <button onClick={() => removeCustomField(company.id, f.id)} className="text-muted-foreground hover:text-red-500"><X className="h-3.5 w-3.5" /></button>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <input value={getFieldForm(company.id).label} onChange={(e) => setFieldForm(company.id, { ...getFieldForm(company.id), label: e.target.value })} placeholder="Campo" className="w-28 rounded-md border px-2 py-1.5 text-xs focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
                          <input value={getFieldForm(company.id).value} onChange={(e) => setFieldForm(company.id, { ...getFieldForm(company.id), value: e.target.value })} placeholder="Valor" className="flex-1 rounded-md border px-2 py-1.5 text-xs focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
                          <button onClick={() => addCustomField(company.id)} className="rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-hover">+</button>
                        </div>
                      </div>

                      {/* Notes */}
                      <div>
                        <h4 className="mb-2 text-sm font-semibold flex items-center gap-1"><StickyNote className="h-3.5 w-3.5" /> Notas</h4>
                        {company.notes.length > 0 && (
                          <div className="mb-3 max-h-40 space-y-2 overflow-y-auto">
                            {company.notes.map((n) => (
                              <div key={n.id} className="group flex gap-2 rounded border bg-gray-50 p-2 text-xs">
                                <div className="flex-1">
                                  <p>{n.content}</p>
                                  <span className="text-muted-foreground">{n.createdAt}</span>
                                </div>
                                <button onClick={() => removeNote(company.id, n.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 shrink-0"><X className="h-3.5 w-3.5" /></button>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <input value={getNoteForm(company.id)} onChange={(e) => setNoteForm(company.id, e.target.value)} placeholder="Agregar nota..." className="flex-1 rounded-md border px-2 py-1.5 text-xs focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" onKeyDown={(e) => { if (e.key === "Enter") addNote(company.id); }} />
                          <button onClick={() => addNote(company.id)} className="rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-hover">+</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && <div className="py-12 text-center text-muted-foreground">No hay compañías. Crea una con el botón "Nueva compañía".</div>}
        </div>
      </div>
    </div>
  );
}
