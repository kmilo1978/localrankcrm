"use client";
import { useState, useEffect } from "react";
import { CheckSquare, ChevronDown, ChevronUp, ClipboardPaste, Copy, Edit3, Lock, Plus, RotateCcw, Search, Trash2, Unlock, UserPlus, X } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";
import { CrmTag, loadTags, getTagColor, TAG_PRESET_COLORS } from "@/lib/tags";
import { SortableList } from "@/components/sortable-list";

type CheckItem = { id: string; text: string; done: boolean };
type Checklist = { id: string; title: string; client: string; category: string; tags: string[]; project: string; locked: boolean; items: CheckItem[]; createdAt: string };

const SEED: Checklist[] = [
  { id: "cl1", title: "Onboarding cliente", client: "TechCorp", category: "Ventas", tags: ["Cliente VIP"], project: "Implementación", locked: false, createdAt: "2026-07-17", items: [
    { id: "i1", text: "Crear contacto en CRM", done: true },
    { id: "i2", text: "Asignar responsable", done: true },
    { id: "i3", text: "Enviar email de bienvenida", done: false },
    { id: "i4", text: "Agendar llamada kickoff", done: false },
    { id: "i5", text: "Configurar canales", done: false },
  ]},
  { id: "cl2", title: "Cierre de venta", client: "MediaGroup", category: "Ventas", tags: ["Urgente"], project: "Comercial", locked: false, createdAt: "2026-07-16", items: [
    { id: "i6", text: "Propuesta aprobada", done: true },
    { id: "i7", text: "Contrato firmado", done: true },
    { id: "i8", text: "Pago recibido", done: false },
    { id: "i9", text: "Kickoff agendado", done: false },
  ]},
];

function splitText(text: string): string[] {
  let parts: string[];
  if (text.includes("\n")) {
    parts = text.split("\n");
  } else if (text.includes(" - ")) {
    parts = text.split(" - ");
  } else if (text.includes("- ")) {
    parts = text.split("- ");
  } else {
    parts = [text];
  }
  return parts.map(p => p.replace(/^[\s\-\*\•\–\d\.]+/, "").trim()).filter(p => p.length > 2);
}

export default function ChecklistsPage() {
  const [lists, setLists] = useState<Checklist[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [showPaste, setShowPaste] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newClient, setNewClient] = useState("");
  const [newCategory, setNewCategory] = useState("General");
  const [newProject, setNewProject] = useState("");
  const [newTags, setNewTags] = useState<string[]>([]);
  const [pasteTitle, setPasteTitle] = useState("");
  const [pasteClient, setPasteClient] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editClient, setEditClient] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [itemInputs, setItemInputs] = useState<Record<string, string>>({});
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [page, setPage] = useState(1);
  const [tags, setTags] = useState<CrmTag[]>([]);
  const PER_PAGE = 8;

  useEffect(() => { setLists(loadFromStorage("checklists_v2", SEED)); setTags(loadTags()); }, []);
  function save(u: Checklist[]) { setLists(u); saveToStorage("checklists_v2", u); }
  function notify(m: string) { setToast(m); setTimeout(() => setToast(""), 2500); }

  const checklistCategories = Array.from(new Set(lists.map(l => l.category || "General").filter(Boolean)));

  const filtered = lists
    .filter(l => filterCat === "all" || (l.category || "General") === filterCat)
    .filter(l => !search || l.title.toLowerCase().includes(search.toLowerCase()) || l.client.toLowerCase().includes(search.toLowerCase()));

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function createEmpty() {
    if (!newTitle.trim()) return;
    const cl: Checklist = { id: generateId(), title: newTitle, client: newClient, category: newCategory || "General", tags: newTags, project: newProject, locked: false, items: [], createdAt: new Date().toISOString().split("T")[0]! };
    save([cl, ...lists]); setNewTitle(""); setNewClient(""); setNewCategory("General"); setNewProject(""); setNewTags([]); setShowNew(false);
  }

  function createFromPaste() {
    if (!pasteTitle.trim() || !pasteText.trim()) return;
    const items = splitText(pasteText).map(text => ({ id: generateId(), text, done: false }));
    if (items.length === 0) { notify("No se detectaron items"); return; }
    const cl: Checklist = { id: generateId(), title: pasteTitle, client: pasteClient, category: "General", tags: [], project: "", locked: false, items, createdAt: new Date().toISOString().split("T")[0]! };
    save([cl, ...lists]); setPasteTitle(""); setPasteClient(""); setPasteText(""); setShowPaste(false);
    notify(items.length + " items creados");
  }

  function addItem(listId: string) {
    const list = lists.find(l => l.id === listId);
    if (list?.locked) { notify("Checklist bloqueado"); return; }
    const text = itemInputs[listId]?.trim();
    if (!text) return;
    const parts = splitText(text);
    const newItems = parts.map(t => ({ id: generateId(), text: t, done: false }));
    save(lists.map(l => l.id === listId ? { ...l, items: [...l.items, ...newItems] } : l));
    setItemInputs({ ...itemInputs, [listId]: "" });
    if (newItems.length > 1) notify(newItems.length + " items agregados");
  }

  function toggleItem(listId: string, itemId: string) {
    const list = lists.find(l => l.id === listId);
    if (list?.locked) { notify("Checklist bloqueado"); return; }
    save(lists.map(l => l.id === listId ? { ...l, items: l.items.map(i => i.id === itemId ? { ...i, done: !i.done } : i) } : l));
  }

  function deleteItem(listId: string, itemId: string) {
    const list = lists.find(l => l.id === listId);
    if (list?.locked) { notify("Checklist bloqueado"); return; }
    save(lists.map(l => l.id === listId ? { ...l, items: l.items.filter(i => i.id !== itemId) } : l));
  }

  function toggleLock(id: string) {
    save(lists.map(l => l.id === id ? { ...l, locked: !l.locked } : l));
    const list = lists.find(l => l.id === id);
    notify(list?.locked ? "Desbloqueado" : "Bloqueado");
  }

  function deleteList(id: string) { save(lists.filter(l => l.id !== id)); }

  function moveListUp(id: string) {
    const idx = lists.findIndex(l => l.id === id);
    if (idx <= 0) return;
    const arr = [...lists]; [arr[idx - 1], arr[idx]] = [arr[idx]!, arr[idx - 1]!];
    save(arr);
  }

  function moveListDown(id: string) {
    const idx = lists.findIndex(l => l.id === id);
    if (idx >= lists.length - 1) return;
    const arr = [...lists]; [arr[idx], arr[idx + 1]] = [arr[idx + 1]!, arr[idx]!];
    save(arr);
  }

  function cloneList(cl: Checklist) {
    const copy: Checklist = { ...cl, id: generateId(), title: cl.title + " (copia)", locked: false, items: cl.items.map(i => ({ ...i, id: generateId(), done: false })), createdAt: new Date().toISOString().split("T")[0]! };
    save([copy, ...lists]); notify("Checklist clonada");
  }

  function cloneForClient(cl: Checklist, client: string) {
    const copy: Checklist = { ...cl, id: generateId(), title: cl.title, client, locked: false, items: cl.items.map(i => ({ ...i, id: generateId(), done: false })), createdAt: new Date().toISOString().split("T")[0]! };
    save([copy, ...lists]); notify("Duplicada para " + client);
  }

  function resetList(id: string) {
    save(lists.map(l => l.id === id ? { ...l, items: l.items.map(i => ({ ...i, done: false })) } : l));
    notify("Reiniciado");
  }

  function copyList(cl: Checklist) {
    const text = cl.title + (cl.client ? " — " + cl.client : "") + "\n\n" + cl.items.map(i => (i.done ? "[x] " : "[ ] ") + i.text).join("\n");
    navigator.clipboard.writeText(text); notify("Copiado");
  }

  function saveEdit() {
    if (!editId) return;
    save(lists.map(l => l.id === editId ? { ...l, title: editTitle, client: editClient, category: editCategory } : l));
    setEditId(null); notify("Actualizado");
  }

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2"><CheckSquare className="h-5 w-5 text-brand" />Checklists</h1>
            <p className="text-xs text-muted-foreground">{lists.length} listas · Pega texto para crear items automaticamente</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowPaste(true)} className="flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 hover:bg-amber-100"><ClipboardPaste className="h-3.5 w-3.5" />Pegar lista</button>
            <button onClick={() => setShowNew(true)} className="flex items-center gap-1.5 rounded-md bg-brand px-3 py-2 text-xs font-medium text-white hover:bg-brand-hover"><Plus className="h-3.5 w-3.5" />Nuevo</button>
          </div>
        </div>

        {/* Search + Category filters + Pagination info */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar..." className="w-44 rounded border bg-white py-1.5 pl-8 pr-3 text-xs focus:border-brand focus:outline-none" />
          </div>
          <div className="flex gap-1 flex-wrap">
            <button onClick={() => { setFilterCat("all"); setPage(1); }} className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${filterCat === "all" ? "bg-brand text-white" : "border hover:bg-gray-50"}`}>Todas</button>
            {checklistCategories.map(c => (
              <button key={c} onClick={() => { setFilterCat(c); setPage(1); }} className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${filterCat === c ? "bg-brand text-white" : "border hover:bg-gray-50"}`}>{c}</button>
            ))}
          </div>
          {totalPages > 1 && <span className="text-[10px] text-muted-foreground ml-auto">Pag {page}/{totalPages}</span>}
        </div>

        {/* All checklists as cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginated.map(cl => {
            const done = cl.items.filter(i => i.done).length;
            const total = cl.items.length;
            const pct = total > 0 ? Math.round(done / total * 100) : 0;
            return (
              <div key={cl.id} className={`rounded-lg border bg-white p-4 ${cl.locked ? "border-amber-200 bg-amber-50/30" : ""}`}>
                {/* Card header */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold">{cl.title}</h3>
                      {cl.locked && <Lock className="h-3 w-3 text-amber-600" />}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      {cl.client && <span className="text-[10px] text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">{cl.client}</span>}
                      {cl.category && <span className="text-[10px] text-brand bg-brand/10 rounded-full px-2 py-0.5">{cl.category}</span>}
                      {cl.project && <span className="text-[10px] text-purple-700 bg-purple-50 border border-purple-200 rounded-full px-2 py-0.5">{cl.project}</span>}
                      {(cl.tags || []).map(t => <span key={t} className="rounded-full px-1.5 py-0.5 text-[9px] font-medium text-white" style={{ backgroundColor: getTagColor(t) }}>{t}</span>)}
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    <button onClick={() => moveListUp(cl.id)} className="rounded p-1 text-muted-foreground hover:text-brand hover:bg-gray-50" title="Subir"><ChevronUp className="h-3 w-3" /></button>
                    <button onClick={() => moveListDown(cl.id)} className="rounded p-1 text-muted-foreground hover:text-brand hover:bg-gray-50" title="Bajar"><ChevronDown className="h-3 w-3" /></button>
                    <button onClick={() => toggleLock(cl.id)} className={`rounded p-1 hover:bg-gray-50 ${cl.locked ? "text-amber-600" : "text-muted-foreground hover:text-amber-600"}`} title={cl.locked ? "Desbloquear" : "Bloquear"}>{cl.locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}</button>
                    <button onClick={() => { setEditId(cl.id); setEditTitle(cl.title); setEditClient(cl.client); setEditCategory(cl.category || "General"); }} className="rounded p-1 text-muted-foreground hover:text-brand hover:bg-gray-50" title="Editar"><Edit3 className="h-3 w-3" /></button>
                    <button onClick={() => cloneList(cl)} className="rounded p-1 text-muted-foreground hover:text-brand hover:bg-gray-50" title="Clonar"><Copy className="h-3 w-3" /></button>
                    <button onClick={() => { const c = prompt("Nombre del cliente:"); if (c) cloneForClient(cl, c); }} className="rounded p-1 text-muted-foreground hover:text-brand hover:bg-gray-50" title="Duplicar para cliente"><UserPlus className="h-3 w-3" /></button>
                    <button onClick={() => copyList(cl)} className="rounded p-1 text-muted-foreground hover:text-brand hover:bg-gray-50" title="Copiar texto"><ClipboardPaste className="h-3 w-3" /></button>
                    <button onClick={() => resetList(cl.id)} className="rounded p-1 text-muted-foreground hover:text-amber-600 hover:bg-amber-50" title="Reiniciar"><RotateCcw className="h-3 w-3" /></button>
                    <button onClick={() => deleteList(cl.id)} className="rounded p-1 text-muted-foreground hover:text-red-500 hover:bg-red-50" title="Eliminar"><Trash2 className="h-3 w-3" /></button>
                  </div>
                </div>

                {/* Progress */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 h-1.5 rounded-full bg-gray-100"><div className="h-full rounded-full bg-green-500 transition-all" style={{ width: pct + "%" }} /></div>
                  <span className="text-[10px] font-medium text-muted-foreground">{done}/{total}</span>
                </div>

                {/* Items */}
                <div className="space-y-0.5 max-h-64 overflow-y-auto mb-3">
                  {cl.items.map(item => (
                    <div key={item.id} className="group flex items-center gap-2 rounded px-1.5 py-1 hover:bg-gray-50">
                      <input type="checkbox" checked={item.done} onChange={() => toggleItem(cl.id, item.id)} className="h-3.5 w-3.5 accent-[var(--accent)] shrink-0" />
                      <span className={`flex-1 text-xs ${item.done ? "line-through text-muted-foreground" : ""}`}>{item.text}</span>
                      <button onClick={() => deleteItem(cl.id, item.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 shrink-0"><Trash2 className="h-2.5 w-2.5" /></button>
                    </div>
                  ))}
                </div>

                {/* Add item input */}
                <div className="flex gap-1.5 border-t pt-2">
                  <input value={itemInputs[cl.id] || ""} onChange={e => setItemInputs({...itemInputs, [cl.id]: e.target.value})} onKeyDown={e => { if (e.key === "Enter") addItem(cl.id); }} placeholder="Agregar item (o pega una lista)..." className="flex-1 rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none" />
                  <button onClick={() => addItem(cl.id)} disabled={!itemInputs[cl.id]?.trim()} className="rounded bg-brand px-2.5 py-1.5 text-xs text-white hover:bg-brand-hover disabled:opacity-50">+</button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="rounded border px-3 py-1.5 text-xs font-medium disabled:opacity-40 hover:bg-gray-50">Anterior</button>
            <span className="text-xs text-muted-foreground">Pagina {page} de {totalPages} ({filtered.length} checklists)</span>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="rounded border px-3 py-1.5 text-xs font-medium disabled:opacity-40 hover:bg-gray-50">Siguiente</button>
          </div>
        )}

        {lists.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <CheckSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm mb-4">Sin checklists. Crea uno o pega una lista.</p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => setShowNew(true)} className="rounded-md bg-brand px-4 py-2 text-sm text-white hover:bg-brand-hover">Nuevo</button>
              <button onClick={() => setShowPaste(true)} className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50">Pegar lista</button>
            </div>
          </div>
        )}
      </div>

      {/* New Checklist Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl mx-4">
            <div className="flex justify-between mb-3"><h3 className="text-sm font-bold">Nuevo checklist</h3><button onClick={() => setShowNew(false)} className="rounded p-1 hover:bg-gray-100"><X className="h-4 w-4" /></button></div>
            <div className="space-y-2">
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Titulo *" className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              <div className="grid grid-cols-2 gap-2">
                <input value={newClient} onChange={e => setNewClient(e.target.value)} placeholder="Cliente (opcional)" className="rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
                <input value={newProject} onChange={e => setNewProject(e.target.value)} placeholder="Proyecto (opcional)" className="rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              </div>
              <input value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="Categoría" className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              {/* Tags selector */}
              <div>
                <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Etiquetas</label>
                <div className="flex flex-wrap gap-1">
                  {tags.map(t => (
                    <button key={t.id} type="button" onClick={() => setNewTags(newTags.includes(t.name) ? newTags.filter(x => x !== t.name) : [...newTags, t.name])} className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${newTags.includes(t.name) ? "text-white" : "border"}`} style={newTags.includes(t.name) ? { backgroundColor: t.color } : { borderColor: t.color, color: t.color }}>
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={createEmpty} disabled={!newTitle.trim()} className="w-full rounded bg-brand py-2 text-sm text-white hover:bg-brand-hover disabled:opacity-50">Crear</button>
            </div>
          </div>
        </div>
      )}

      {/* Paste List Modal */}
      {showPaste && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-2xl mx-4">
            <div className="flex justify-between mb-3"><h3 className="text-sm font-bold flex items-center gap-2"><ClipboardPaste className="h-4 w-4 text-amber-600" />Pegar lista como checklist</h3><button onClick={() => setShowPaste(false)} className="rounded p-1 hover:bg-gray-100"><X className="h-4 w-4" /></button></div>
            <p className="text-xs text-muted-foreground mb-3">Pega tu lista. Separa items con saltos de linea o con " - ". Se limpian bullets y numeros automaticamente.</p>
            <div className="space-y-2">
              <input value={pasteTitle} onChange={e => setPasteTitle(e.target.value)} placeholder="Titulo del checklist *" className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              <input value={pasteClient} onChange={e => setPasteClient(e.target.value)} placeholder="Cliente (opcional)" className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              <textarea value={pasteText} onChange={e => setPasteText(e.target.value)} rows={10} placeholder={"Pega tu lista aqui...\n\nEjemplo:\n- Revisar H1 y H2\n- Verificar meta descriptions\n- Analizar velocidad de carga"} className="w-full rounded border px-3 py-2 text-xs font-mono focus:border-brand focus:outline-none" />
              {pasteText.trim() && <p className="text-xs text-green-600 font-medium">{splitText(pasteText).length} items detectados</p>}
              <button onClick={createFromPaste} disabled={!pasteTitle.trim() || !pasteText.trim()} className="w-full rounded bg-brand py-2.5 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50">Crear checklist ({splitText(pasteText).length} items)</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl mx-4">
            <div className="flex justify-between mb-3"><h3 className="text-sm font-bold">Editar</h3><button onClick={() => setEditId(null)} className="rounded p-1 hover:bg-gray-100"><X className="h-4 w-4" /></button></div>
            <div className="space-y-2">
              <input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              <input value={editClient} onChange={e => setEditClient(e.target.value)} placeholder="Cliente" className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              <input value={editCategory} onChange={e => setEditCategory(e.target.value)} placeholder="Categoría" className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              <button onClick={saveEdit} className="w-full rounded bg-brand py-2 text-sm text-white hover:bg-brand-hover">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-lg">{toast}</div>}
    </div>
  );
}
