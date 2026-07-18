"use client";
import { useState, useEffect } from "react";
import { Building2, ClipboardCopy, Copy, Edit3, Mail, Phone, Plus, Search, Tag, Trash2, X } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";

type SupplierNote = { id: string; text: string; date: string };
type Supplier = {
  id: string; name: string; contact: string; phone: string; email: string; website: string;
  category: string; rating: number; notes: SupplierNote[]; tags: string[]; createdAt: string;
};

const CATEGORIES = ["Tecnologia", "Marketing", "Logistica", "Legal", "Financiero", "Diseno", "Desarrollo", "Hosting", "Otro"];

const SEED: Supplier[] = [
  { id: "sp1", name: "CloudServ Hosting", contact: "Pedro Martinez", phone: "+57 300 555 1234", email: "pedro@cloudserv.co", website: "https://cloudserv.co", category: "Hosting", rating: 5, tags: ["Premium", "Soporte 24/7"], notes: [{ id: "sn1", text: "Excelente uptime. Contrato renovado hasta dic 2026.", date: "2026-07-15" }], createdAt: "2026-06-01" },
  { id: "sp2", name: "DigitalBoost Agency", contact: "Laura Gomez", phone: "+57 311 888 4567", email: "laura@digitalboost.co", website: "https://digitalboost.co", category: "Marketing", rating: 4, tags: ["SEO", "Ads"], notes: [{ id: "sn2", text: "Maneja campanas Google Ads y Meta. Buenos resultados Q2.", date: "2026-07-10" }], createdAt: "2026-05-15" },
  { id: "sp3", name: "LegalPro Abogados", contact: "Dr. Andres Rios", phone: "+57 4 444 3322", email: "arios@legalpro.com", website: "", category: "Legal", rating: 4, tags: ["Contratos", "RGPD"], notes: [], createdAt: "2026-04-20" },
];

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editSup, setEditSup] = useState<Supplier | null>(null);
  const [form, setForm] = useState({ name: "", contact: "", phone: "", email: "", website: "", category: "Tecnologia", tags: "" });
  const [expanded, setExpanded] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState<Record<string, string>>({});
  const [toast, setToast] = useState("");

  useEffect(() => { setSuppliers(loadFromStorage("suppliers", SEED)); }, []);
  function save(u: Supplier[]) { setSuppliers(u); saveToStorage("suppliers", u); }
  function notify(m: string) { setToast(m); setTimeout(() => setToast(""), 2500); }

  function addSupplier() {
    if (!form.name.trim()) return;
    const s: Supplier = { id: generateId(), name: form.name, contact: form.contact, phone: form.phone, email: form.email, website: form.website, category: form.category, rating: 3, tags: form.tags.split(",").map(t => t.trim()).filter(Boolean), notes: [], createdAt: new Date().toISOString().split("T")[0]! };
    save([s, ...suppliers]); resetForm(); setShowForm(false); notify("Proveedor agregado");
  }

  function openEdit(s: Supplier) {
    setEditSup(s);
    setForm({ name: s.name, contact: s.contact, phone: s.phone, email: s.email, website: s.website, category: s.category, tags: s.tags.join(", ") });
  }

  function handleUpdate() {
    if (!editSup) return;
    save(suppliers.map(s => s.id === editSup.id ? { ...s, name: form.name, contact: form.contact, phone: form.phone, email: form.email, website: form.website, category: form.category, tags: form.tags.split(",").map(t => t.trim()).filter(Boolean) } : s));
    setEditSup(null); resetForm(); notify("Actualizado");
  }

  function resetForm() { setForm({ name: "", contact: "", phone: "", email: "", website: "", category: "Tecnologia", tags: "" }); }
  function deleteSupplier(id: string) { save(suppliers.filter(s => s.id !== id)); }

  function duplicateSupplier(s: Supplier) {
    const copy: Supplier = { ...s, id: generateId(), name: s.name + " (copia)", notes: [], createdAt: new Date().toISOString().split("T")[0]! };
    save([copy, ...suppliers]); notify("Duplicado");
  }

  function copySupplier(s: Supplier) {
    navigator.clipboard.writeText(JSON.stringify(s, null, 2)); notify("Copiado al portapapeles");
  }

  function addNote(supplierId: string) {
    const text = noteInput[supplierId]?.trim();
    if (!text) return;
    save(suppliers.map(s => s.id === supplierId ? { ...s, notes: [{ id: generateId(), text, date: new Date().toISOString().split("T")[0]! }, ...s.notes] } : s));
    setNoteInput({ ...noteInput, [supplierId]: "" });
  }

  function deleteNote(supplierId: string, noteId: string) {
    save(suppliers.map(s => s.id === supplierId ? { ...s, notes: s.notes.filter(n => n.id !== noteId) } : s));
  }

  function setRating(id: string, rating: number) {
    save(suppliers.map(s => s.id === id ? { ...s, rating } : s));
  }

  const filtered = suppliers
    .filter(s => filterCat === "all" || s.category === filterCat)
    .filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.contact.toLowerCase().includes(search.toLowerCase()) || s.tags.some(t => t.toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2"><Building2 className="h-5 w-5 text-brand" />Proveedores</h1>
            <p className="text-xs text-muted-foreground">{suppliers.length} proveedores registrados</p>
          </div>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-1.5 rounded-md bg-brand px-3 py-2 text-xs font-medium text-white hover:bg-brand-hover"><Plus className="h-3.5 w-3.5" />Nuevo proveedor</button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative"><Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="w-44 rounded border py-1.5 pl-8 pr-3 text-xs focus:border-brand focus:outline-none" /></div>
          <div className="flex gap-1 flex-wrap">
            <button onClick={() => setFilterCat("all")} className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${filterCat === "all" ? "bg-brand text-white" : "border hover:bg-gray-50"}`}>Todos</button>
            {CATEGORIES.map(c => <button key={c} onClick={() => setFilterCat(c)} className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${filterCat === c ? "bg-brand text-white" : "border hover:bg-gray-50"}`}>{c}</button>)}
          </div>
        </div>

        {/* Suppliers list */}
        <div className="space-y-3">
          {filtered.map(sup => (
            <div key={sup.id} className="rounded-lg border bg-white overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50/50" onClick={() => setExpanded(expanded === sup.id ? null : sup.id)}>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 shrink-0"><Building2 className="h-4 w-4 text-brand" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold truncate">{sup.name}</h4>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[9px] font-medium text-gray-600">{sup.category}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span>{sup.contact}</span>
                    {sup.phone && <span className="flex items-center gap-0.5"><Phone className="h-2.5 w-2.5" />{sup.phone}</span>}
                    {sup.email && <span className="flex items-center gap-0.5"><Mail className="h-2.5 w-2.5" />{sup.email}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {[1,2,3,4,5].map(star => <button key={star} onClick={e => { e.stopPropagation(); setRating(sup.id, star); }} className={`text-sm ${star <= sup.rating ? "text-amber-400" : "text-gray-200"}`}>★</button>)}
                </div>
                <div className="flex gap-0.5 shrink-0" onClick={e => e.stopPropagation()}>
                  <button onClick={() => openEdit(sup)} className="rounded p-1 text-muted-foreground hover:text-brand hover:bg-gray-100"><Edit3 className="h-3 w-3" /></button>
                  <button onClick={() => duplicateSupplier(sup)} className="rounded p-1 text-muted-foreground hover:text-brand hover:bg-gray-100"><Copy className="h-3 w-3" /></button>
                  <button onClick={() => copySupplier(sup)} className="rounded p-1 text-muted-foreground hover:text-brand hover:bg-gray-100"><ClipboardCopy className="h-3 w-3" /></button>
                  <button onClick={() => deleteSupplier(sup.id)} className="rounded p-1 text-muted-foreground hover:text-red-500 hover:bg-red-50"><Trash2 className="h-3 w-3" /></button>
                </div>
              </div>

              {/* Expanded: tags + notes */}
              {expanded === sup.id && (
                <div className="border-t px-4 py-3 space-y-3">
                  {sup.tags.length > 0 && <div className="flex gap-1 flex-wrap">{sup.tags.map((t, i) => <span key={i} className="rounded-full bg-brand/10 px-2 py-0.5 text-[9px] font-medium text-brand">{t}</span>)}</div>}
                  {sup.website && <a href={sup.website} target="_blank" rel="noopener noreferrer" className="text-xs text-brand hover:underline">{sup.website}</a>}
                  <div>
                    <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-2">Notas ({sup.notes.length})</p>
                    {sup.notes.map(n => (
                      <div key={n.id} className="group flex gap-2 rounded bg-gray-50 p-2 mb-1 text-xs">
                        <div className="flex-1"><p>{n.text}</p><span className="text-[9px] text-muted-foreground">{n.date}</span></div>
                        <button onClick={() => deleteNote(sup.id, n.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 shrink-0"><Trash2 className="h-2.5 w-2.5" /></button>
                      </div>
                    ))}
                    <div className="flex gap-1.5 mt-2">
                      <input value={noteInput[sup.id] || ""} onChange={e => setNoteInput({...noteInput, [sup.id]: e.target.value})} onKeyDown={e => { if (e.key === "Enter") addNote(sup.id); }} placeholder="Agregar nota..." className="flex-1 rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none" />
                      <button onClick={() => addNote(sup.id)} className="rounded bg-brand px-2.5 py-1.5 text-xs text-white hover:bg-brand-hover">+</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filtered.length === 0 && <div className="py-16 text-center text-muted-foreground text-sm">Sin proveedores. Agrega uno con el boton "Nuevo proveedor".</div>}
      </div>

      {/* Add/Edit Modal */}
      {(showForm || editSup) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl mx-4">
            <div className="flex justify-between mb-4"><h3 className="text-sm font-bold">{editSup ? "Editar proveedor" : "Nuevo proveedor"}</h3><button onClick={() => { setShowForm(false); setEditSup(null); resetForm(); }} className="rounded p-1 hover:bg-gray-100"><X className="h-4 w-4" /></button></div>
            <div className="space-y-3">
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Nombre empresa/proveedor *" className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <input value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} placeholder="Persona de contacto" className="rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
                <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Telefono" className="rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="Email" className="rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
                <input value={form.website} onChange={e => setForm({...form, website: e.target.value})} placeholder="Website" className="rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none">{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select>
                <input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="Tags (separar con ,)" className="rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              </div>
              <button onClick={editSup ? handleUpdate : addSupplier} disabled={!form.name.trim()} className="w-full rounded-md bg-brand py-2.5 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50">{editSup ? "Guardar" : "Agregar proveedor"}</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-lg">{toast}</div>}
    </div>
  );
}
