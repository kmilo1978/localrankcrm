"use client";
import { useState, useEffect } from "react";
import { CheckSquare, ClipboardCopy, Copy, Edit3, Plus, Trash2, X } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";

type CheckItem = { id: string; text: string; done: boolean };
type Checklist = { id: string; title: string; description: string; items: CheckItem[]; category: string; createdAt: string };

const CATEGORIES = ["General", "Onboarding", "Ventas", "Proyecto", "Soporte", "Marketing"];

const SEED: Checklist[] = [
  { id: "cl1", title: "Onboarding nuevo cliente", description: "Pasos para configurar un nuevo cliente en el CRM", category: "Onboarding", createdAt: "2026-07-17", items: [
    { id: "ci1", text: "Crear contacto en el CRM", done: true }, { id: "ci2", text: "Asignar responsable", done: true }, { id: "ci3", text: "Enviar email de bienvenida", done: false },
    { id: "ci4", text: "Agendar llamada de kickoff", done: false }, { id: "ci5", text: "Configurar canales de comunicacion", done: false }, { id: "ci6", text: "Enviar accesos al cliente", done: false },
  ]},
  { id: "cl2", title: "Cierre de venta", description: "Checklist para cerrar un deal", category: "Ventas", createdAt: "2026-07-16", items: [
    { id: "ci7", text: "Propuesta enviada y aprobada", done: true }, { id: "ci8", text: "Contrato firmado", done: true }, { id: "ci9", text: "Pago inicial recibido", done: false }, { id: "ci10", text: "Kickoff agendado", done: false },
  ]},
  { id: "cl3", title: "Auditoria SEO pagina web", description: "Revision tecnica completa", category: "Marketing", createdAt: "2026-07-15", items: [
    { id: "ci11", text: "Revisar H1, H2, H3 por pagina", done: false }, { id: "ci12", text: "Verificar meta titles y descriptions", done: false }, { id: "ci13", text: "Analizar velocidad de carga", done: false },
    { id: "ci14", text: "Verificar sitemap.xml", done: false }, { id: "ci15", text: "Revisar robots.txt", done: false }, { id: "ci16", text: "Schema markup implementado", done: false },
  ]},
];

export default function ChecklistsPage() {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "General" });
  const [itemInput, setItemInput] = useState("");
  const [editCl, setEditCl] = useState<Checklist | null>(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", category: "General" });
  const [toast, setToast] = useState("");

  useEffect(() => { setChecklists(loadFromStorage("checklists", SEED)); }, []);
  function save(u: Checklist[]) { setChecklists(u); saveToStorage("checklists", u); }
  function showToast(m: string) { setToast(m); setTimeout(() => setToast(""), 2500); }

  const checklist = checklists.find(c => c.id === selected);

  function addChecklist() {
    if (!form.title.trim()) return;
    const cl: Checklist = { id: generateId(), title: form.title, description: form.description, items: [], category: form.category, createdAt: new Date().toISOString().split("T")[0]! };
    save([cl, ...checklists]); setSelected(cl.id); setShowForm(false);
    setForm({ title: "", description: "", category: "General" });
  }

  function deleteChecklist(id: string) { save(checklists.filter(c => c.id !== id)); if (selected === id) setSelected(null); }

  function cloneChecklist(cl: Checklist) {
    const copy: Checklist = { ...cl, id: generateId(), title: cl.title + " (copia)", items: cl.items.map(i => ({ ...i, id: generateId(), done: false })), createdAt: new Date().toISOString().split("T")[0]! };
    save([copy, ...checklists]); showToast("Checklist clonada");
  }

  function copyChecklist(cl: Checklist) {
    const text = cl.title + "\n\n" + cl.items.map(i => (i.done ? "[x] " : "[ ] ") + i.text).join("\n");
    navigator.clipboard.writeText(text); showToast("Copiada al portapapeles");
  }

  function addItem() {
    if (!itemInput.trim() || !checklist) return;
    save(checklists.map(c => c.id === selected ? { ...c, items: [...c.items, { id: generateId(), text: itemInput, done: false }] } : c));
    setItemInput("");
  }

  function toggleItem(itemId: string) {
    save(checklists.map(c => c.id === selected ? { ...c, items: c.items.map(i => i.id === itemId ? { ...i, done: !i.done } : i) } : c));
  }

  function deleteItem(itemId: string) {
    save(checklists.map(c => c.id === selected ? { ...c, items: c.items.filter(i => i.id !== itemId) } : c));
  }

  function openEdit(cl: Checklist) { setEditCl(cl); setEditForm({ title: cl.title, description: cl.description, category: cl.category }); }
  function handleUpdate() {
    if (!editCl) return;
    save(checklists.map(c => c.id === editCl.id ? { ...c, ...editForm } : c));
    setEditCl(null); showToast("Checklist actualizada");
  }

  function resetAll() {
    if (!checklist) return;
    save(checklists.map(c => c.id === selected ? { ...c, items: c.items.map(i => ({ ...i, done: false })) } : c));
    showToast("Items reiniciados");
  }

  return (
    <div className="flex h-full flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-72 shrink-0 border-b md:border-b-0 md:border-r bg-gray-50 flex flex-col max-h-52 md:max-h-none">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-sm font-bold flex items-center gap-2"><CheckSquare className="h-4 w-4 text-brand" />Checklists</h2>
          <button onClick={() => setShowForm(true)} className="rounded bg-brand text-white p-1.5 hover:bg-brand-hover" title="Nuevo checklist"><Plus className="h-4 w-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {checklists.map(cl => {
            const done = cl.items.filter(i => i.done).length;
            const total = cl.items.length;
            return (
              <button key={cl.id} onClick={() => setSelected(cl.id)} className={`w-full text-left rounded-lg px-3 py-2.5 transition-colors ${selected === cl.id ? "bg-brand/10 border border-brand/20" : "hover:bg-gray-100"}`}>
                <span className="text-xs font-medium block truncate">{cl.title}</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 rounded-full bg-gray-200"><div className="h-full rounded-full bg-green-500 transition-all" style={{ width: total > 0 ? (done / total * 100) + "%" : "0%" }} /></div>
                  <span className="text-[10px] text-muted-foreground">{done}/{total}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 overflow-y-auto p-6">
        {checklist ? (
          <div className="max-w-3xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold">{checklist.title}</h1>
                <p className="text-sm text-muted-foreground">{checklist.description}</p>
                <span className="inline-block mt-1 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-medium text-brand">{checklist.category}</span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(checklist)} className="rounded border px-2 py-1 text-xs hover:bg-gray-50" title="Editar"><Edit3 className="h-3 w-3" /></button>
                <button onClick={() => cloneChecklist(checklist)} className="rounded border px-2 py-1 text-xs hover:bg-gray-50" title="Clonar"><Copy className="h-3 w-3" /></button>
                <button onClick={() => copyChecklist(checklist)} className="rounded border px-2 py-1 text-xs hover:bg-gray-50" title="Copiar"><ClipboardCopy className="h-3 w-3" /></button>
                <button onClick={resetAll} className="rounded border px-2 py-1 text-xs hover:bg-gray-50" title="Reiniciar">Reset</button>
                <button onClick={() => deleteChecklist(checklist.id)} className="rounded border px-2 py-1 text-xs text-red-500 hover:bg-red-50"><Trash2 className="h-3 w-3" /></button>
              </div>
            </div>

            <div className="rounded-lg border bg-white p-4">
              <div className="space-y-1.5 mb-4">
                {checklist.items.map(item => (
                  <div key={item.id} className="group flex items-center gap-3 rounded px-2 py-2 hover:bg-gray-50">
                    <input type="checkbox" checked={item.done} onChange={() => toggleItem(item.id)} className="h-4 w-4 accent-[var(--accent)] rounded" />
                    <span className={`flex-1 text-sm ${item.done ? "line-through text-muted-foreground" : ""}`}>{item.text}</span>
                    <button onClick={() => deleteItem(item.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 border-t pt-3">
                <input value={itemInput} onChange={e => setItemInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") addItem(); }} placeholder="Escribir nuevo item y presionar Enter..." className="flex-1 rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
                <button onClick={addItem} disabled={!itemInput.trim()} className="rounded bg-brand px-4 py-2 text-sm text-white hover:bg-brand-hover disabled:opacity-50">Agregar</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-muted-foreground text-sm gap-4">
            <CheckSquare className="h-12 w-12 text-gray-300" />
            <p>Selecciona un checklist o crea uno nuevo</p>
            <button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"><Plus className="h-4 w-4" />Nuevo checklist</button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl mx-4">
            <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-bold">Nuevo checklist</h3><button onClick={() => setShowForm(false)} className="rounded p-1 hover:bg-gray-100"><X className="h-4 w-4" /></button></div>
            <div className="space-y-3">
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Titulo *" className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Descripcion" rows={2} className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none">{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select>
              <button onClick={addChecklist} className="w-full rounded-md bg-brand py-2 text-sm font-medium text-white hover:bg-brand-hover">Crear checklist</button>
            </div>
          </div>
        </div>
      )}
      {editCl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl mx-4">
            <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-bold">Editar checklist</h3><button onClick={() => setEditCl(null)} className="rounded p-1 hover:bg-gray-100"><X className="h-4 w-4" /></button></div>
            <div className="space-y-3">
              <input value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              <textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} rows={2} className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              <select value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none">{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select>
              <button onClick={handleUpdate} className="w-full rounded-md bg-brand py-2 text-sm font-medium text-white hover:bg-brand-hover">Guardar</button>
            </div>
          </div>
        </div>
      )}
      {toast && <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-lg">{toast}</div>}
    </div>
  );
}
