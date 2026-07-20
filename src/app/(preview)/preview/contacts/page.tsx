"use client";

import { useState, useEffect } from "react";
import { Archive, ArchiveRestore, AlertCircle, ArrowRightLeft, Bell, ChevronDown, ChevronRight, ImagePlus, Mail, Phone, Plus, Search, StickyNote, Trash2, Users, X } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";
import { openImagePicker } from "@/lib/image-upload";

type CustomField = { id: string; label: string; value: string };
type ContactNote = { id: string; content: string; createdAt: string };
type Reminder = { id: string; text: string; date: string; done: boolean };

type Contact = {
  id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  role: string;
  image: string;
  archived: boolean;
  createdAt: string;
  customFields: CustomField[];
  notes: ContactNote[];
  reminders: Reminder[];
};

const SEED: Contact[] = [
  { id: "ct1", name: "Carlos Ruiz", phone: "+52 55 1234 5678", email: "carlos@techcorp.com", company: "TechCorp Solutions", role: "CTO", image: "", archived: false, createdAt: "2026-07-10", customFields: [{ id: "f1", label: "LinkedIn", value: "linkedin.com/in/cruiz" }], notes: [{ id: "n1", content: "Decisor principal. Interesado en plan Enterprise.", createdAt: "2026-07-17" }], reminders: [{ id: "r1", text: "Llamar para confirmar propuesta", date: "2026-07-18", done: false }] },
  { id: "ct2", name: "María García", phone: "+1 305 555 0123", email: "maria@loginext.io", company: "LogiNext International", role: "VP Operaciones", image: "", archived: false, createdAt: "2026-07-08", customFields: [], notes: [{ id: "n2", content: "Prefiere comunicación por email.", createdAt: "2026-07-15" }], reminders: [] },
  { id: "ct3", name: "Roberto Méndez", phone: "+52 33 9876 5432", email: "roberto@mediagroup.mx", company: "MediaGroup Digital", role: "Director Marketing", image: "", archived: false, createdAt: "2026-07-05", customFields: [{ id: "f2", label: "Presupuesto anual", value: "$200K" }], notes: [], reminders: [{ id: "r2", text: "Enviar demo grabada", date: "2026-07-20", done: false }] },
  { id: "ct4", name: "Ana Sofía Torres", phone: "+52 81 2345 6789", email: "ana@innovatelab.co", company: "InnovateLab", role: "CEO", image: "", archived: false, createdAt: "2026-06-28", customFields: [], notes: [], reminders: [] },
  { id: "ct5", name: "Jorge Hernández", phone: "+52 55 8765 4321", email: "jorge@retailmax.com.mx", company: "RetailMax", role: "Gerente Compras", image: "", archived: true, createdAt: "2026-06-15", customFields: [], notes: [{ id: "n3", content: "Sin respuesta últimas 2 semanas", createdAt: "2026-07-01" }], reminders: [] },
];

export default function ContactsPreviewPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", company: "", role: "" });
  const [formExtraFields, setFormExtraFields] = useState<{ label: string; value: string }[]>([]);
  // Inline forms - per contact
  const [fieldForms, setFieldForms] = useState<Record<string, { label: string; value: string }>>({});
  const [noteForms, setNoteForms] = useState<Record<string, string>>({});
  const [reminderForms, setReminderForms] = useState<Record<string, { text: string; date: string }>>({});
  const [toast, setToast] = useState("");

  useEffect(() => { setContacts(loadFromStorage("contacts", SEED)); }, []);
  function save(u: Contact[]) { setContacts(u); saveToStorage("contacts", u); }
  function notify(m: string) { setToast(m); setTimeout(() => setToast(""), 2500); }

  // Duplicate detection
  function findDuplicates(): { a: Contact; b: Contact; reason: string }[] {
    const dupes: { a: Contact; b: Contact; reason: string }[] = [];
    for (let i = 0; i < contacts.length; i++) {
      for (let j = i + 1; j < contacts.length; j++) {
        const a = contacts[i]!, b = contacts[j]!;
        if (a.phone && b.phone && a.phone.replace(/\D/g, "").slice(-8) === b.phone.replace(/\D/g, "").slice(-8)) {
          dupes.push({ a, b, reason: "Mismo teléfono" });
        } else if (a.email && b.email && a.email.toLowerCase() === b.email.toLowerCase()) {
          dupes.push({ a, b, reason: "Mismo email" });
        } else if (a.name && b.name && a.name.toLowerCase() === b.name.toLowerCase() && a.company.toLowerCase() === b.company.toLowerCase()) {
          dupes.push({ a, b, reason: "Mismo nombre y empresa" });
        }
      }
    }
    return dupes;
  }

  function mergeContacts(keepId: string, removeId: string) {
    const keep = contacts.find(c => c.id === keepId);
    const remove = contacts.find(c => c.id === removeId);
    if (!keep || !remove) return;
    const merged: Contact = { ...keep, notes: [...keep.notes, ...remove.notes], customFields: [...keep.customFields, ...remove.customFields.filter(f => !keep.customFields.some(kf => kf.label === f.label))], reminders: [...keep.reminders, ...remove.reminders] };
    if (!merged.phone && remove.phone) merged.phone = remove.phone;
    if (!merged.email && remove.email) merged.email = remove.email;
    save(contacts.map(c => c.id === keepId ? merged : c).filter(c => c.id !== removeId));
    notify("Contactos fusionados");
  }

  // Transfer to cold contacts / pipeline
  function transferToProspection(contact: Contact) {
    const coldContacts = loadFromStorage<Array<{id:string;name:string;phone:string;[key:string]:unknown}>>("cold_contacts", []);
    const exists = coldContacts.some(c => c.phone?.replace(/\D/g, "").slice(-8) === contact.phone.replace(/\D/g, "").slice(-8));
    if (exists) { notify("Ya existe en prospección"); return; }
    const newCold = { id: generateId(), name: contact.name, phone: contact.phone, website: "", category: contact.company, rating: 0, reviews: 0, address: "", description: contact.role, clase: "Transferido", motivo: "Desde contactos", score: 50, stageId: "cs1", notes: contact.notes.map(n => n.content).join("; "), addedAt: new Date().toISOString().split("T")[0]!, customFields: [], outreachChannel: "", followUps: [] };
    saveToStorage("cold_contacts", [newCold, ...coldContacts]);
    notify(`"${contact.name}" transferido a Prospección`);
  }

  function handleAdd() {
    if (!form.name.trim()) return;
    const extraFields = formExtraFields.filter((f) => f.label.trim()).map((f) => ({ id: generateId(), label: f.label, value: f.value }));
    save([{ id: generateId(), ...form, image: "", archived: false, createdAt: new Date().toISOString().split("T")[0]!, customFields: extraFields, notes: [], reminders: [] }, ...contacts]);
    setForm({ name: "", phone: "", email: "", company: "", role: "" });
    setFormExtraFields([]);
    setShowForm(false);
  }

  function handleDelete(id: string) { save(contacts.filter((c) => c.id !== id)); if (expanded === id) setExpanded(null); }
  function toggleArchive(id: string) { save(contacts.map((c) => c.id === id ? { ...c, archived: !c.archived } : c)); }

  // Custom fields
  function getFieldForm(id: string) { return fieldForms[id] || { label: "", value: "" }; }
  function setFieldForm(id: string, data: { label: string; value: string }) { setFieldForms((p) => ({ ...p, [id]: data })); }
  function addField(contactId: string) {
    const ff = getFieldForm(contactId);
    if (!ff.label.trim()) return;
    save(contacts.map((c) => c.id === contactId ? { ...c, customFields: [...c.customFields, { id: generateId(), label: ff.label, value: ff.value }] } : c));
    setFieldForm(contactId, { label: "", value: "" });
  }
  function removeField(contactId: string, fieldId: string) {
    save(contacts.map((c) => c.id === contactId ? { ...c, customFields: c.customFields.filter((f) => f.id !== fieldId) } : c));
  }

  // Notes
  function getNoteForm(id: string) { return noteForms[id] || ""; }
  function setNoteForm(id: string, val: string) { setNoteForms((p) => ({ ...p, [id]: val })); }
  function addNote(contactId: string) {
    const text = getNoteForm(contactId);
    if (!text.trim()) return;
    save(contacts.map((c) => c.id === contactId ? { ...c, notes: [{ id: generateId(), content: text, createdAt: new Date().toISOString().split("T")[0]! }, ...c.notes] } : c));
    setNoteForm(contactId, "");
  }
  function removeNote(contactId: string, noteId: string) {
    save(contacts.map((c) => c.id === contactId ? { ...c, notes: c.notes.filter((n) => n.id !== noteId) } : c));
  }

  // Reminders
  function getReminderForm(id: string) { return reminderForms[id] || { text: "", date: "" }; }
  function setReminderForm(id: string, data: { text: string; date: string }) { setReminderForms((p) => ({ ...p, [id]: data })); }
  function addReminder(contactId: string) {
    const rf = getReminderForm(contactId);
    if (!rf.text.trim()) return;
    save(contacts.map((c) => c.id === contactId ? { ...c, reminders: [...c.reminders, { id: generateId(), text: rf.text, date: rf.date || "Sin fecha", done: false }] } : c));
    setReminderForm(contactId, { text: "", date: "" });
  }
  function toggleReminder(contactId: string, remId: string) {
    save(contacts.map((c) => c.id === contactId ? { ...c, reminders: c.reminders.map((r) => r.id === remId ? { ...r, done: !r.done } : r) } : c));
  }
  function removeReminder(contactId: string, remId: string) {
    save(contacts.map((c) => c.id === contactId ? { ...c, reminders: c.reminders.filter((r) => r.id !== remId) } : c));
  }

  const visible = contacts.filter((c) => showArchived ? c.archived : !c.archived);
  const filtered = visible.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.company.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  // Global pending reminders count
  const pendingReminders = contacts.reduce((sum, c) => sum + c.reminders.filter((r) => !r.done).length, 0);

  return (
    <div className="h-full overflow-y-auto">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b bg-white px-6 py-3">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold">Contactos</h2>
          <span className="text-xs text-muted-foreground">{contacts.filter((c) => !c.archived).length} activos</span>
          {pendingReminders > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
              <Bell className="h-3 w-3" />{pendingReminders} recordatorio{pendingReminders > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} className="accent-[var(--accent)]" />
            Archivados
          </label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-56 rounded-md border bg-white py-2 pl-8 pr-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
          </div>
          <button onClick={() => setShowDuplicates(true)} className="flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 hover:bg-amber-100">
            <AlertCircle className="h-3.5 w-3.5" />Duplicados
          </button>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover transition-colors">
            <Plus className="h-4 w-4" />Nuevo
          </button>
        </div>
      </header>

      <div className="p-6">
        {showForm && (
          <div className="mb-6 rounded-lg border bg-white p-5">
            <h3 className="mb-4 font-semibold">Agregar contacto</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nombre *" className="rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Teléfono" className="rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" type="email" className="rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Empresa" className="rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Cargo / Rol" className="rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
            </div>
            {/* Dynamic custom fields */}
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

        {filtered.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
            <Users className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm font-medium">{showArchived ? "Sin contactos archivados" : "Sin contactos"}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((contact) => {
              const isExpanded = expanded === contact.id;
              const pendingRem = contact.reminders.filter((r) => !r.done).length;
              return (
                <div key={contact.id} className="rounded-lg border bg-white overflow-hidden">
                  {/* Row */}
                  <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50/50" onClick={() => setExpanded(isExpanded ? null : contact.id)}>
                    {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                    {contact.image ? (
                      <img src={contact.image} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover border" />
                    ) : (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand-text">
                        {contact.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{contact.name}</span>
                        {contact.role && <span className="text-xs text-muted-foreground">· {contact.role}</span>}
                        {contact.archived && <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-muted-foreground">Archivado</span>}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {contact.company && <span>{contact.company}</span>}
                        {contact.phone && <span className="flex items-center gap-0.5"><Phone className="h-3 w-3" />{contact.phone}</span>}
                        {contact.email && <span className="flex items-center gap-0.5"><Mail className="h-3 w-3" />{contact.email}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {pendingRem > 0 && <span className="flex items-center gap-0.5 text-xs text-amber-600"><Bell className="h-3 w-3" />{pendingRem}</span>}
                      {contact.notes.length > 0 && <span className="flex items-center gap-0.5 text-xs text-muted-foreground"><StickyNote className="h-3 w-3" />{contact.notes.length}</span>}
                      <button onClick={(e) => { e.stopPropagation(); transferToProspection(contact); }} className="rounded p-1 hover:bg-blue-50 text-muted-foreground hover:text-brand" title="Transferir a Prospección">
                        <ArrowRightLeft className="h-4 w-4" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); toggleArchive(contact.id); }} className="rounded p-1 hover:bg-gray-100 text-muted-foreground" title={contact.archived ? "Desarchivar" : "Archivar"}>
                        {contact.archived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(contact.id); }} className="rounded p-1 hover:bg-red-50 text-muted-foreground hover:text-red-500" title="Eliminar">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="border-t px-4 pb-4 pt-3">
                      {/* Profile image upload */}
                      <div className="mb-3 flex items-center gap-3">
                        {contact.image ? <img src={contact.image} alt="" className="h-14 w-14 rounded-full object-cover border" /> : <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-lg font-bold text-gray-400">{contact.name.charAt(0)}</div>}
                        <button onClick={async () => { const img = await openImagePicker(); if (img) save(contacts.map(c => c.id === contact.id ? {...c, image: img} : c)); }} className="flex items-center gap-1.5 rounded border px-2.5 py-1.5 text-xs hover:bg-gray-50"><ImagePlus className="h-3.5 w-3.5" />Cambiar foto</button>
                        {contact.image && <button onClick={() => save(contacts.map(c => c.id === contact.id ? {...c, image: ""} : c))} className="text-[10px] text-red-500 hover:underline">Eliminar</button>}
                      </div>
                      {/* Editable main fields */}
                      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        <div><label className="text-[10px] font-medium text-muted-foreground">Nombre</label><input defaultValue={contact.name} onBlur={e => { if (e.target.value !== contact.name) save(contacts.map(c => c.id === contact.id ? {...c, name: e.target.value} : c)); }} className="w-full rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none" /></div>
                        <div><label className="text-[10px] font-medium text-muted-foreground">Telefono</label><input defaultValue={contact.phone} onBlur={e => { if (e.target.value !== contact.phone) save(contacts.map(c => c.id === contact.id ? {...c, phone: e.target.value} : c)); }} className="w-full rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none" /></div>
                        <div><label className="text-[10px] font-medium text-muted-foreground">Email</label><input defaultValue={contact.email} onBlur={e => { if (e.target.value !== contact.email) save(contacts.map(c => c.id === contact.id ? {...c, email: e.target.value} : c)); }} className="w-full rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none" /></div>
                        <div><label className="text-[10px] font-medium text-muted-foreground">Empresa</label><input defaultValue={contact.company} onBlur={e => { if (e.target.value !== contact.company) save(contacts.map(c => c.id === contact.id ? {...c, company: e.target.value} : c)); }} className="w-full rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none" /></div>
                        <div><label className="text-[10px] font-medium text-muted-foreground">Rol / Cargo</label><input defaultValue={contact.role} onBlur={e => { if (e.target.value !== contact.role) save(contacts.map(c => c.id === contact.id ? {...c, role: e.target.value} : c)); }} className="w-full rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none" /></div>
                      </div>
                      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                        {/* Custom Fields */}
                        <div>
                          <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Campos personalizados</h4>
                          {contact.customFields.length > 0 && (
                            <div className="mb-2 space-y-1">
                              {contact.customFields.map((f) => (
                                <div key={f.id} className="flex items-center gap-2 rounded bg-gray-50 px-2 py-1 text-xs">
                                  <span className="font-medium">{f.label}:</span>
                                  <span className="flex-1 truncate">{f.value}</span>
                                  <button onClick={() => removeField(contact.id, f.id)} className="text-muted-foreground hover:text-red-500"><X className="h-3 w-3" /></button>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="flex gap-1.5">
                            <input value={getFieldForm(contact.id).label} onChange={(e) => setFieldForm(contact.id, { ...getFieldForm(contact.id), label: e.target.value })} placeholder="Campo" className="w-20 rounded border px-2 py-1 text-xs focus:border-brand focus:outline-none" />
                            <input value={getFieldForm(contact.id).value} onChange={(e) => setFieldForm(contact.id, { ...getFieldForm(contact.id), value: e.target.value })} placeholder="Valor" className="flex-1 rounded border px-2 py-1 text-xs focus:border-brand focus:outline-none" />
                            <button onClick={() => addField(contact.id)} className="rounded bg-brand px-2 py-1 text-xs text-white hover:bg-brand-hover">+</button>
                          </div>
                        </div>

                        {/* Notes */}
                        <div>
                          <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1"><StickyNote className="h-3 w-3" />Notas</h4>
                          {contact.notes.length > 0 && (
                            <div className="mb-2 max-h-32 space-y-1 overflow-y-auto">
                              {contact.notes.map((n) => (
                                <div key={n.id} className="group flex gap-1 rounded bg-gray-50 p-1.5 text-xs">
                                  <div className="flex-1"><p>{n.content}</p><span className="text-muted-foreground">{n.createdAt}</span></div>
                                  <button onClick={() => removeNote(contact.id, n.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 shrink-0"><X className="h-3 w-3" /></button>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="flex gap-1.5">
                            <input value={getNoteForm(contact.id)} onChange={(e) => setNoteForm(contact.id, e.target.value)} placeholder="Agregar nota..." className="flex-1 rounded border px-2 py-1 text-xs focus:border-brand focus:outline-none" onKeyDown={(e) => { if (e.key === "Enter") addNote(contact.id); }} />
                            <button onClick={() => addNote(contact.id)} className="rounded bg-brand px-2 py-1 text-xs text-white hover:bg-brand-hover">+</button>
                          </div>
                        </div>

                        {/* Reminders */}
                        <div>
                          <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1"><Bell className="h-3 w-3" />Recordatorios</h4>
                          {contact.reminders.length > 0 && (
                            <div className="mb-2 space-y-1">
                              {contact.reminders.map((r) => (
                                <div key={r.id} className="group flex items-center gap-2 rounded bg-gray-50 px-2 py-1 text-xs">
                                  <input type="checkbox" checked={r.done} onChange={() => toggleReminder(contact.id, r.id)} className="accent-[var(--accent)]" />
                                  <span className={`flex-1 ${r.done ? "line-through text-muted-foreground" : ""}`}>{r.text}</span>
                                  {r.date !== "Sin fecha" && <span className="text-muted-foreground">{r.date}</span>}
                                  <button onClick={() => removeReminder(contact.id, r.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500"><X className="h-3 w-3" /></button>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="flex gap-1.5">
                            <input value={getReminderForm(contact.id).text} onChange={(e) => setReminderForm(contact.id, { ...getReminderForm(contact.id), text: e.target.value })} placeholder="Recordatorio..." className="flex-1 rounded border px-2 py-1 text-xs focus:border-brand focus:outline-none" />
                            <input value={getReminderForm(contact.id).date} onChange={(e) => setReminderForm(contact.id, { ...getReminderForm(contact.id), date: e.target.value })} type="date" className="w-28 rounded border px-1 py-1 text-xs focus:border-brand focus:outline-none" />
                            <button onClick={() => addReminder(contact.id)} className="rounded bg-brand px-2 py-1 text-xs text-white hover:bg-brand-hover">+</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Duplicates Modal */}
      {showDuplicates && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowDuplicates(false)}>
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold flex items-center gap-2"><AlertCircle className="h-4 w-4 text-amber-600" />Detección de duplicados</h3>
              <button onClick={() => setShowDuplicates(false)} className="rounded p-1 hover:bg-gray-100"><X className="h-4 w-4" /></button>
            </div>
            {(() => {
              const dupes = findDuplicates();
              if (dupes.length === 0) return <p className="text-sm text-muted-foreground text-center py-8">No se encontraron duplicados 🎉</p>;
              return (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">{dupes.length} posible(s) duplicado(s) encontrado(s)</p>
                  {dupes.map((d, i) => (
                    <div key={i} className="rounded-lg border p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-medium text-amber-700">{d.reason}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="rounded border p-2">
                          <p className="font-medium">{d.a.name}</p>
                          <p className="text-muted-foreground">{d.a.phone}</p>
                          <p className="text-muted-foreground">{d.a.email}</p>
                          <button onClick={() => { mergeContacts(d.a.id, d.b.id); setShowDuplicates(false); }} className="mt-2 rounded bg-brand px-2 py-1 text-[10px] text-white hover:bg-brand-hover">Mantener este</button>
                        </div>
                        <div className="rounded border p-2">
                          <p className="font-medium">{d.b.name}</p>
                          <p className="text-muted-foreground">{d.b.phone}</p>
                          <p className="text-muted-foreground">{d.b.email}</p>
                          <button onClick={() => { mergeContacts(d.b.id, d.a.id); setShowDuplicates(false); }} className="mt-2 rounded bg-brand px-2 py-1 text-[10px] text-white hover:bg-brand-hover">Mantener este</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-lg">{toast}</div>}
    </div>
  );
}
