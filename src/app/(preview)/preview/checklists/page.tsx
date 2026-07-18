"use client";
import { useState, useEffect } from "react";
import { CheckSquare, ClipboardCopy, ClipboardPaste, Copy, Edit3, Plus, Trash2, UserPlus, Users, X } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";

type CheckItem = { id: string; text: string; done: boolean };
type Checklist = { id: string; title: string; description: string; items: CheckItem[]; category: string; client: string; createdAt: string };

const CATEGORIES = ["General", "Onboarding", "Ventas", "Proyecto", "Soporte", "Marketing", "SEO", "Desarrollo"];

const SEED: Checklist[] = [
  { id: "cl1", title: "Onboarding nuevo cliente", description: "Pasos para configurar un nuevo cliente en el CRM", category: "Onboarding", client: "TechCorp", createdAt: "2026-07-17", items: [
    { id: "ci1", text: "Crear contacto en el CRM", done: true }, { id: "ci2", text: "Asignar responsable", done: true }, { id: "ci3", text: "Enviar email de bienvenida", done: false },
    { id: "ci4", text: "Agendar llamada de kickoff", done: false }, { id: "ci5", text: "Configurar canales de comunicacion", done: false }, { id: "ci6", text: "Enviar accesos al cliente", done: false },
  ]},
  { id: "cl2", title: "Cierre de venta", description: "Checklist para cerrar un deal", category: "Ventas", client: "MediaGroup", createdAt: "2026-07-16", items: [
    { id: "ci7", text: "Propuesta enviada y aprobada", done: true }, { id: "ci8", text: "Contrato firmado", done: true }, { id: "ci9", text: "Pago inicial recibido", done: false }, { id: "ci10", text: "Kickoff agendado", done: false },
  ]},
  { id: "cl3", title: "Auditoria SEO pagina web", description: "Revision tecnica completa", category: "SEO", client: "", createdAt: "2026-07-15", items: [
    { id: "ci11", text: "Revisar H1, H2, H3 por pagina", done: false }, { id: "ci12", text: "Verificar meta titles y descriptions", done: false }, { id: "ci13", text: "Analizar velocidad de carga", done: false },
    { id: "ci14", text: "Verificar sitemap.xml", done: false }, { id: "ci15", text: "Revisar robots.txt", done: false }, { id: "ci16", text: "Schema markup implementado", done: false },
  ]},
];

export default function ChecklistsPage() {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showPaste, setShowPaste] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [pasteTitle, setPasteTitle] = useState("");
  const [pasteClient, setPasteClient] = useState("");
  const [form, setForm] = useState({ title: "", description: "", category: "General", client: "" });
  const [itemInput, setItemInput] = useState("");
  const [editCl, setEditCl] = useState<Checklist | null>(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", category: "General", client: "" });
  const [duplicateFor, setDuplicateFor] = useState<Checklist | null>(null);
  const [dupClient, setDupClient] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => { setChecklists(loadFromStorage("checklists", SEED)); }, []);
  function save(u: Checklist[]) { setChecklists(u); saveToStorage("checklists", u); }
  function showToast(m: string) { setToast(m); setTimeout(() => setToast(""), 2500); }

  const checklist = checklists.find(c => c.id === selected);

  function addChecklist() {
    if (!form.title.trim()) return;
    const cl: Checklist = { id: generateId(), title: form.title, description: form.description, items: [], category: form.category, client: form.client, createdAt: new Date().toISOString().split("T")[0]! };
    save([cl, ...checklists]); setSelected(cl.id); setShowForm(false);
    setForm({ title: "", description: "", category: "General", client: "" });
  }

  // PASTE LIST — converts text lines to checklist items
  function handlePasteList() {
    if (!pasteTitle.trim() || !pasteText.trim()) return;
    const items = parseTextToItems(pasteText);
    if (items.length === 0) return;
    const cl: Checklist = { id: generateId(), title: pasteTitle, description: "Creado desde lista pegada (" + items.length + " items)", items, category: "General", client: pasteClient, createdAt: new Date().toISOString().split("T")[0]! };
    save([cl, ...checklists]); setSelected(cl.id);
    setPasteText(""); setPasteTitle(""); setPasteClient(""); setShowPaste(false);
    showToast(items.length + " items importados");
  }

  // Smart parser: handles newlines, " - ", " · ", numbered lists, bullets
  function parseTextToItems(text: string): CheckItem[] {
    let lines: string[];
    // If text has newlines, split by newlines
    if (text.includes("\n")) {
      lines = text.split("\n");
    }
    // If text uses " - " as separator (common in pasted documents)
    else if (text.includes(" - ")) {
      lines = text.split(" - ");
    }
    // If text uses " · " as separator
    else if (text.includes(" · ")) {
      lines = text.split(" · ");
    }
    // If text uses ". " followed by uppercase (numbered items like "1. Item 2. Item")
    else if (/\d+\.\s/.test(text)) {
      lines = text.split(/(?=\d+\.\s)/);
    }
    // Fallback: treat as single item
    else {
      lines = [text];
    }
    return lines
      .map(l => l.replace(/^[\s\-\*\•\–\—\d\.]+/, "").trim())
      .filter(l => l.length > 2)
      .map(text => ({ id: generateId(), text, done: false }));
  }

  // Paste from clipboard directly
  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) { setPasteText(text); setShowPaste(true); }
    } catch { showToast("No se pudo acceder al portapapeles"); }
  }

  function deleteChecklist(id: string) { save(checklists.filter(c => c.id !== id)); if (selected === id) setSelected(null); }

  function cloneChecklist(cl: Checklist) {
    const copy: Checklist = { ...cl, id: generateId(), title: cl.title + " (copia)", items: cl.items.map(i => ({ ...i, id: generateId(), done: false })), createdAt: new Date().toISOString().split("T")[0]! };
    save([copy, ...checklists]); showToast("Checklist clonada");
  }

  // Duplicate for a specific client
  function handleDuplicateForClient() {
    if (!duplicateFor || !dupClient.trim()) return;
    const copy: Checklist = { ...duplicateFor, id: generateId(), title: duplicateFor.title + " — " + dupClient, client: dupClient, items: duplicateFor.items.map(i => ({ ...i, id: generateId(), done: false })), createdAt: new Date().toISOString().split("T")[0]! };
    save([copy, ...checklists]); setSelected(copy.id);
    setDuplicateFor(null); setDupClient("");
    showToast("Checklist duplicada para " + dupClient);
  }

  function copyChecklist(cl: Checklist) {
    const text = cl.title + (cl.client ? " — " + cl.client : "") + "\n\n" + cl.items.map(i => (i.done ? "[x] " : "[ ] ") + i.text).join("\n");
    navigator.clipboard.writeText(text); showToast("Copiada al portapapeles");
  }

  function addItem() {
    if (!itemInput.trim() || !checklist) return;
    save(checklists.map(c => c.id === selected ? { ...c, items: [...c.items, { id: generateId(), text: itemInput, done: false }] } : c));
    setItemInput("");
  }

  // Add multiple items at once (paste into the input)
  function addBulkItems(text: string) {
    if (!text.trim() || !checklist) return;
    const newItems = parseTextToItems(text);
    if (newItems.length === 0) return;
    save(checklists.map(c => c.id === selected ? { ...c, items: [...c.items, ...newItems] } : c));
    showToast(newItems.length + " items agregados");
  }

  function toggleItem(itemId: string) {
    save(checklists.map(c => c.id === selected ? { ...c, items: c.items.map(i => i.id === itemId ? { ...i, done: !i.done } : i) } : c));
  }

  function deleteItem(itemId: string) {
    save(checklists.map(c => c.id === selected ? { ...c, items: c.items.filter(i => i.id !== itemId) } : c));
  }

  // Split a long item into multiple items using the smart parser
  function splitItem(itemId: string) {
    if (!checklist) return;
    const item = checklist.items.find(i => i.id === itemId);
    if (!item) return;
    const newItems = parseTextToItems(item.text);
    if (newItems.length <= 1) { showToast("No se pudo dividir (no se detectan separadores)"); return; }
    save(checklists.map(c => {
      if (c.id !== selected) return c;
      const idx = c.items.findIndex(i => i.id === itemId);
      const before = c.items.slice(0, idx);
      const after = c.items.slice(idx + 1);
      return { ...c, items: [...before, ...newItems, ...after] };
    }));
    showToast("Dividido en " + newItems.length + " items");
  }

  function openEdit(cl: Checklist) { setEditCl(cl); setEditForm({ title: cl.title, description: cl.description, category: cl.category, client: cl.client }); }
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
        <div className="p-3 border-b flex items-center justify-between gap-2">
          <h2 className="text-xs font-bold flex items-center gap-1.5"><CheckSquare className="h-3.5 w-3.5 text-brand" />Checklists</h2>
          <div className="flex gap-1">
            <button onClick={pasteFromClipboard} className="rounded bg-amber-50 border border-amber-200 text-amber-700 p-1.5 hover:bg-amber-100" title="Pegar lista desde portapapeles"><ClipboardPaste className="h-3.5 w-3.5" /></button>
            <button onClick={() => setShowForm(true)} className="rounded bg-brand text-white p-1.5 hover:bg-brand-hover" title="Nuevo checklist"><Plus className="h-3.5 w-3.5" /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {checklists.map(cl => {
            const done = cl.items.filter(i => i.done).length;
            const total = cl.items.length;
            return (
              <button key={cl.id} onClick={() => setSelected(cl.id)} className={`w-full text-left rounded-lg px-3 py-2.5 transition-colors ${selected === cl.id ? "bg-brand/10 border border-brand/20" : "hover:bg-gray-100"}`}>
                <span className="text-xs font-medium block truncate">{cl.title}</span>
                {cl.client && <span className="text-[9px] text-brand block truncate">{cl.client}</span>}
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
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {checklist ? (
          <div className="max-w-3xl">
            <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
              <div>
                <h1 className="text-lg font-bold">{checklist.title}</h1>
                <p className="text-xs text-muted-foreground">{checklist.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-block rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-medium text-brand">{checklist.category}</span>
                  {checklist.client && <span className="inline-flex items-center gap-1 rounded-full bg-green-50 border border-green-200 px-2 py-0.5 text-[10px] font-medium text-green-700"><Users className="h-2.5 w-2.5" />{checklist.client}</span>}
                </div>
              </div>
              <div className="flex gap-1 flex-wrap">
                <button onClick={() => openEdit(checklist)} className="rounded border px-2 py-1 text-xs hover:bg-gray-50" title="Editar"><Edit3 className="h-3 w-3" /></button>
                <button onClick={() => cloneChecklist(checklist)} className="rounded border px-2 py-1 text-xs hover:bg-gray-50" title="Clonar"><Copy className="h-3 w-3" /></button>
                <button onClick={() => { setDuplicateFor(checklist); setDupClient(""); }} className="rounded border px-2 py-1 text-xs hover:bg-gray-50" title="Duplicar para cliente"><UserPlus className="h-3 w-3" /></button>
                <button onClick={() => copyChecklist(checklist)} className="rounded border px-2 py-1 text-xs hover:bg-gray-50" title="Copiar texto"><ClipboardCopy className="h-3 w-3" /></button>
                <button onClick={resetAll} className="rounded border px-2 py-1 text-xs hover:bg-gray-50" title="Reiniciar">Reset</button>
                <button onClick={() => deleteChecklist(checklist.id)} className="rounded border px-2 py-1 text-xs text-red-500 hover:bg-red-50"><Trash2 className="h-3 w-3" /></button>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-4 flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full bg-gray-200"><div className="h-full rounded-full bg-green-500 transition-all" style={{ width: checklist.items.length > 0 ? (checklist.items.filter(i => i.done).length / checklist.items.length * 100) + "%" : "0%" }} /></div>
              <span className="text-xs font-medium">{checklist.items.filter(i => i.done).length}/{checklist.items.length}</span>
            </div>

            <div className="rounded-lg border bg-white p-4">
              <div className="space-y-1 mb-4">
                {checklist.items.map(item => (
                  <div key={item.id} className="group flex items-center gap-3 rounded px-2 py-2 hover:bg-gray-50">
                    <input type="checkbox" checked={item.done} onChange={() => toggleItem(item.id)} className="h-4 w-4 accent-[var(--accent)] rounded shrink-0" />
                    <span className={`flex-1 text-sm ${item.done ? "line-through text-muted-foreground" : ""}`}>{item.text}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 shrink-0">
                      {item.text.length > 100 && <button onClick={() => splitItem(item.id)} className="rounded px-1.5 py-0.5 text-[9px] border text-amber-600 border-amber-200 hover:bg-amber-50" title="Dividir en items">Dividir</button>}
                      <button onClick={() => deleteItem(item.id)} className="text-muted-foreground hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                    </div>
                  </div>
                ))}
                {checklist.items.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Sin items. Agrega uno abajo o pega una lista.</p>}
              </div>
              {/* Add single item */}
              <div className="flex gap-2 border-t pt-3">
                <input value={itemInput} onChange={e => setItemInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") addItem(); }} placeholder="Escribir item y Enter..." className="flex-1 rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
                <button onClick={addItem} disabled={!itemInput.trim()} className="rounded bg-brand px-3 py-2 text-xs text-white hover:bg-brand-hover disabled:opacity-50">Agregar</button>
              </div>
              {/* Paste multiple items */}
              <div className="mt-3 border-t pt-3">
                <button onClick={() => setShowPaste(true)} className="flex items-center gap-2 rounded border border-dashed px-3 py-2 text-xs text-muted-foreground hover:border-brand hover:text-brand w-full justify-center">
                  <ClipboardPaste className="h-3.5 w-3.5" />Pegar lista (cada linea = un item)
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-muted-foreground text-sm gap-4">
            <CheckSquare className="h-12 w-12 text-gray-300" />
            <p>Selecciona un checklist o crea uno nuevo</p>
            <div className="flex gap-2">
              <button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"><Plus className="h-4 w-4" />Nuevo checklist</button>
              <button onClick={pasteFromClipboard} className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"><ClipboardPaste className="h-4 w-4" />Pegar lista</button>
            </div>
          </div>
        )}
      </div>

      {/* New Checklist Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl mx-4">
            <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-bold">Nuevo checklist</h3><button onClick={() => setShowForm(false)} className="rounded p-1 hover:bg-gray-100"><X className="h-4 w-4" /></button></div>
            <div className="space-y-3">
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Titulo *" className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Descripcion" rows={2} className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none">{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select>
                <input value={form.client} onChange={e => setForm({...form, client: e.target.value})} placeholder="Cliente (opcional)" className="rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              </div>
              <button onClick={addChecklist} disabled={!form.title.trim()} className="w-full rounded-md bg-brand py-2 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50">Crear checklist</button>
            </div>
          </div>
        </div>
      )}

      {/* Paste List Modal */}
      {showPaste && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl mx-4">
            <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-bold flex items-center gap-2"><ClipboardPaste className="h-4 w-4 text-brand" />Pegar lista como checklist</h3><button onClick={() => setShowPaste(false)} className="rounded p-1 hover:bg-gray-100"><X className="h-4 w-4" /></button></div>
            <p className="text-xs text-muted-foreground mb-3">Pega una lista de texto. Cada linea se convierte en un item del checklist. Se ignoran lineas vacias, numeros, guiones y bullets automaticamente.</p>
            <div className="space-y-3">
              <input value={pasteTitle} onChange={e => setPasteTitle(e.target.value)} placeholder="Titulo del checklist *" className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              <input value={pasteClient} onChange={e => setPasteClient(e.target.value)} placeholder="Cliente (opcional)" className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              <textarea value={pasteText} onChange={e => setPasteText(e.target.value)} placeholder={"Pega tu lista aqui...\n\nEjemplo:\n- Revisar H1 y H2\n- Verificar meta descriptions\n- Analizar velocidad\n- Revisar mobile"} rows={10} className="w-full rounded border px-3 py-2 text-sm font-mono focus:border-brand focus:outline-none" />
              {pasteText.trim() && (
                <p className="text-xs text-muted-foreground">{parseTextToItems(pasteText).length} items detectados</p>
              )}
              <button onClick={handlePasteList} disabled={!pasteTitle.trim() || !pasteText.trim()} className="w-full rounded-md bg-brand py-2.5 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50">Crear checklist desde lista</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editCl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl mx-4">
            <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-bold">Editar checklist</h3><button onClick={() => setEditCl(null)} className="rounded p-1 hover:bg-gray-100"><X className="h-4 w-4" /></button></div>
            <div className="space-y-3">
              <input value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              <textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} rows={2} className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <select value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} className="rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none">{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select>
                <input value={editForm.client} onChange={e => setEditForm({...editForm, client: e.target.value})} placeholder="Cliente" className="rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              </div>
              <button onClick={handleUpdate} className="w-full rounded-md bg-brand py-2 text-sm font-medium text-white hover:bg-brand-hover">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate for Client Modal */}
      {duplicateFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl mx-4">
            <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-bold">Duplicar para cliente</h3><button onClick={() => setDuplicateFor(null)} className="rounded p-1 hover:bg-gray-100"><X className="h-4 w-4" /></button></div>
            <p className="text-xs text-muted-foreground mb-3">Se creara una copia de "<strong>{duplicateFor.title}</strong>" con todos los items sin marcar, asignada al cliente que indiques.</p>
            <input value={dupClient} onChange={e => setDupClient(e.target.value)} placeholder="Nombre del cliente *" className="w-full rounded border px-3 py-2 text-sm mb-3 focus:border-brand focus:outline-none" />
            <button onClick={handleDuplicateForClient} disabled={!dupClient.trim()} className="w-full rounded-md bg-brand py-2 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50">Duplicar y asignar</button>
          </div>
        </div>
      )}

      {toast && <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-lg">{toast}</div>}
    </div>
  );
}
