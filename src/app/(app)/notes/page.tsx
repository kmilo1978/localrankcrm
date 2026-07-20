"use client";

import { useState, useEffect } from "react";
import { Bell, ClipboardCopy, Copy, Edit3, Filter, ImagePlus, Lock, Pin, Plus, Search, StickyNote, Tag, Trash2, X } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";
import { openImagePicker } from "@/lib/image-upload";
import { CrmTag, loadTags, saveTags, getTagsByModule, createTag, deleteTag as removeTag, updateTag, TAG_PRESET_COLORS, getTagColor } from "@/lib/tags";
import { ViewToggle, ViewMode } from "@/components/view-toggle";
import { SortableList } from "@/components/sortable-list";

type Note = {
  id: string;
  title: string;
  content: string;
  image: string;
  relatedTo: string;
  category: string;
  tags: string[];
  pinned: boolean;
  locked: boolean;
  createdAt: string;
};

const PRESET_COLORS = TAG_PRESET_COLORS;

const SEED_NOTES: Note[] = [
  { id: "n1", title: "Reunión TechCorp - Requerimientos", content: "Necesitan integración con SAP. Presupuesto aprobado para Q3.", image: "", pinned: true, locked: false, relatedTo: "TechCorp", category: "Reunión", tags: ["Reunión", "Cliente VIP"], createdAt: "2026-07-17" },
  { id: "n2", title: "Seguimiento LogiNext", content: "María García interesada en módulo logístico.", image: "", pinned: false, locked: false, relatedTo: "LogiNext", category: "Seguimiento", tags: ["Seguimiento"], createdAt: "2026-07-16" },
  { id: "n3", title: "Ideas campaña MediaGroup", content: "Proponer paquete marketing digital + CRM.", image: "", pinned: false, locked: false, relatedTo: "MediaGroup", category: "Ideas", tags: ["Ideas", "Producto"], createdAt: "2026-07-15" },
];

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [tags, setTags] = useState<CrmTag[]>([]);
  const [view, setView] = useState<ViewMode>("grid");
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [showCatForm, setShowCatForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", image: "", relatedTo: "", category: "", tags: [] as string[] });
  const [catForm, setCatForm] = useState({ name: "", color: PRESET_COLORS[0]!, description: "" });
  const [customColor, setCustomColor] = useState("");
  const [viewNote, setViewNote] = useState<Note | null>(null);
  const [editNote, setEditNote] = useState<Note | null>(null);
  const [editForm, setEditForm] = useState({ title: "", content: "", image: "", relatedTo: "", category: "", tags: [] as string[] });
  const [toast, setToast] = useState("");
  const [editingTag, setEditingTag] = useState<CrmTag | null>(null);

  useEffect(() => {
    setNotes(loadFromStorage("notes", SEED_NOTES));
    reloadTags();
  }, []);

  function reloadTags() { setTags(loadTags()); }
  function saveNotes(u: Note[]) { setNotes(u); saveToStorage("notes", u); }

  // Categories derived from tags that include "notas" module
  const categories = tags.filter(t => t.modules.includes("notas"));

  function handleAdd() {
    if (!form.title.trim()) return;
    saveNotes([{ id: generateId(), title: form.title, content: form.content, image: form.image, relatedTo: form.relatedTo, category: form.category || "General", tags: form.tags, pinned: false, locked: false, createdAt: new Date().toISOString().split("T")[0]! }, ...notes]);
    setForm({ title: "", content: "", image: "", relatedTo: "", category: "", tags: [] });
    setShowForm(false);
  }

  function addCategory() {
    if (!catForm.name.trim()) return;
    const color = customColor.match(/^#[0-9a-fA-F]{6}$/) ? customColor : catForm.color;
    createTag(catForm.name, color, catForm.description, ["notas"]);
    setCatForm({ name: "", color: PRESET_COLORS[(categories.length + 1) % PRESET_COLORS.length]!, description: "" });
    setCustomColor("");
    setShowCatForm(false);
    reloadTags();
  }

  function deleteCategory(id: string) { removeTag(id); reloadTags(); }

  function handleEditTag() {
    if (!editingTag || !editingTag.name.trim()) return;
    updateTag(editingTag.id, { name: editingTag.name, color: editingTag.color, description: editingTag.description, modules: editingTag.modules });
    setEditingTag(null);
    reloadTags();
    showToast("Etiqueta actualizada");
  }
  function togglePin(id: string) { saveNotes(notes.map((n) => n.id === id ? { ...n, pinned: !n.pinned } : n)); }
  function toggleLock(id: string) { saveNotes(notes.map((n) => n.id === id ? { ...n, locked: !n.locked } : n)); }
  function deleteNote(id: string) { saveNotes(notes.filter((n) => n.id !== id)); if (viewNote?.id === id) setViewNote(null); }

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 2500); }

  function openEdit(note: Note) {
    setEditNote(note);
    setEditForm({ title: note.title, content: note.content, image: note.image || "", relatedTo: note.relatedTo, category: note.category, tags: note.tags || [] });
    setViewNote(null);
  }

  function handleUpdate() {
    if (!editNote || !editForm.title.trim()) return;
    saveNotes(notes.map(n => n.id === editNote.id ? { ...n, ...editForm } : n));
    setEditNote(null);
    showToast("Nota actualizada");
  }

  function cloneNote(note: Note) {
    const copy: Note = { ...note, id: generateId(), title: note.title + " (copia)", pinned: false, createdAt: new Date().toISOString().split("T")[0]! };
    saveNotes([copy, ...notes]);
    showToast("Nota clonada");
  }

  function copyNote(note: Note) {
    navigator.clipboard.writeText(note.title + "\n\n" + note.content);
    showToast("Nota copiada al portapapeles");
  }

  function copyNoteJSON(note: Note) {
    navigator.clipboard.writeText(JSON.stringify(note, null, 2));
    showToast("JSON copiado");
  }

  function sendToReminder(note: Note) {
    const reminders = loadFromStorage<Array<{id:string;title:string;description:string;dateTime:string;repeat:string;sound:boolean;active:boolean;dismissed:boolean;createdAt:string}>>("reminders_v2", []);
    const dateTime = new Date(Date.now() + 3600000).toISOString().slice(0, 16); // 1 hour from now
    const newReminder = { id: generateId(), title: note.title, description: note.content.slice(0, 200), dateTime, repeat: "none", sound: true, active: true, dismissed: false, createdAt: new Date().toISOString().split("T")[0]! };
    saveToStorage("reminders_v2", [newReminder, ...reminders]);
    showToast("Enviada a recordatorios (en 1 hora)");
  }

  function getCatColor(name: string) { return getTagColor(name); }

  const filtered = notes
    .filter((n) => filterCat === "all" || n.category === filterCat)
    .filter((n) => !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase()));
  const pinned = filtered.filter((n) => n.pinned);
  const unpinned = filtered.filter((n) => !n.pinned);

  // Pagination
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;
  const totalPages = Math.ceil(unpinned.length / PER_PAGE);
  const paginatedUnpinned = unpinned.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function clearAllNotes() {
    if (confirm("Borrar TODAS las notas? Esta accion no se puede deshacer.")) {
      saveNotes([]);
      showToast("Todas las notas eliminadas");
    }
  }

  function moveNote(noteId: string, newCategory: string) {
    saveNotes(notes.map(n => n.id === noteId ? { ...n, category: newCategory } : n));
    showToast("Movida a " + newCategory);
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Notas</h1>
            <p className="text-sm text-muted-foreground">{notes.length} notas · {categories.length} categorías</p>
          </div>
          <div className="flex items-center gap-2">
            <ViewToggle current={view} onChange={setView} views={["grid", "list", "board"]} />
            <button onClick={clearAllNotes} className="flex items-center gap-1 rounded-md border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" />Borrar todas</button>
            <button onClick={() => setShowCatForm(!showCatForm)} className="flex items-center gap-1 rounded-md border px-3 py-2 text-xs font-medium hover:bg-gray-50"><Tag className="h-3.5 w-3.5" />Etiquetas</button>
            <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"><Plus className="h-4 w-4" />Nueva nota</button>
          </div>
        </div>

        {/* Tag/Category manager */}
        {showCatForm && (
          <div className="mb-4 rounded-lg border bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-semibold">Gestionar etiquetas</h4>
                <p className="text-[10px] text-muted-foreground">Las etiquetas son compartidas con todo el CRM (contactos, tareas, etc.)</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {categories.map((c) => (
                <div key={c.id} className="group flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-white" style={{ backgroundColor: c.color }}>
                  {c.name}
                  <button onClick={() => setEditingTag(c)} className="opacity-0 group-hover:opacity-100 hover:bg-white/30 rounded-full p-0.5" title="Editar"><Edit3 className="h-2.5 w-2.5" /></button>
                  <button onClick={() => deleteCategory(c.id)} className="opacity-0 group-hover:opacity-100 hover:bg-white/30 rounded-full p-0.5" title="Eliminar"><X className="h-2.5 w-2.5" /></button>
                </div>
              ))}
            </div>
            {/* Import from CRM tags */}
            {tags.filter(t => !t.modules.includes("notas")).length > 0 && (
              <div className="mb-3 rounded border border-dashed border-brand/30 bg-brand/5 p-3">
                <p className="text-[10px] font-medium text-brand mb-1.5">Importar del CRM:</p>
                <div className="flex flex-wrap gap-1.5">
                  {tags.filter(t => !t.modules.includes("notas")).map(t => (
                    <button key={t.id} onClick={() => { updateTag(t.id, { modules: [...t.modules, "notas"] }); reloadTags(); showToast(`"${t.name}" importada a Notas`); }} className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] hover:bg-white" style={{ borderColor: t.color, color: t.color }}>
                      <Plus className="h-2.5 w-2.5" />{t.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} placeholder="Nombre de la etiqueta *" className="flex-1 rounded-md border px-3 py-1.5 text-sm focus:border-brand focus:outline-none" />
                <input value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} placeholder="Descripción" className="flex-1 rounded-md border px-3 py-1.5 text-sm focus:border-brand focus:outline-none" />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1 flex-wrap flex-1">{PRESET_COLORS.map((c) => <button key={c} onClick={() => { setCatForm({ ...catForm, color: c }); setCustomColor(""); }} className={`h-5 w-5 rounded-full border-2 ${catForm.color === c && !customColor ? "border-gray-800 scale-110" : "border-transparent"}`} style={{ backgroundColor: c }} />)}</div>
                <input value={customColor} onChange={(e) => setCustomColor(e.target.value)} placeholder="#hex" className="w-20 rounded border px-2 py-1 text-xs focus:border-brand focus:outline-none" />
                {customColor.match(/^#[0-9a-fA-F]{6}$/) && <span className="h-5 w-5 rounded-full border" style={{ backgroundColor: customColor }} />}
                <button onClick={addCategory} className="rounded bg-brand px-3 py-1.5 text-xs text-white hover:bg-brand-hover shrink-0">Crear etiqueta</button>
              </div>
            </div>
          </div>
        )}

        {/* New note form */}
        {showForm && (
          <div className="mb-4 rounded-lg border bg-white p-5">
            <div className="space-y-3">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Título *" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Contenido..." rows={4} className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              {/* Image attachment */}
              <div className="flex items-center gap-2">
                <button onClick={async () => { const img = await openImagePicker(); if (img) setForm({...form, image: img}); }} className="flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs hover:bg-gray-50"><ImagePlus className="h-3.5 w-3.5" />Adjuntar imagen</button>
                {form.image && <div className="relative"><img src={form.image} alt="" className="h-12 w-12 rounded border object-cover" /><button onClick={() => setForm({...form, image: ""})} className="absolute -top-1 -right-1 rounded-full bg-red-500 p-0.5 text-white"><X className="h-2.5 w-2.5" /></button></div>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input value={form.relatedTo} onChange={(e) => setForm({ ...form, relatedTo: e.target.value })} placeholder="Relacionado con" className="rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none">
                  <option value="">Categoría...</option>
                  {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              {/* Tag selector */}
              <div>
                <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Etiquetas</label>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map(t => (
                    <button key={t.id} type="button" onClick={() => { const has = form.tags.includes(t.name); setForm({...form, tags: has ? form.tags.filter(x => x !== t.name) : [...form.tags, t.name]}); }} className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-all ${form.tags.includes(t.name) ? "text-white scale-105" : "border opacity-70 hover:opacity-100"}`} style={form.tags.includes(t.name) ? { backgroundColor: t.color } : { borderColor: t.color, color: t.color }}>
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={handleAdd} className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover">Guardar</button>
              <button onClick={() => setShowForm(false)} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50">Cancelar</button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-4 flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-52 rounded-md border bg-white py-2 pl-8 pr-3 text-sm focus:border-brand focus:outline-none" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => setFilterCat("all")} className={`rounded-full px-2.5 py-1 text-xs font-medium ${filterCat === "all" ? "bg-brand text-white" : "border hover:bg-gray-50"}`}>Todas</button>
            {categories.map((c) => (
              <button key={c.id} onClick={() => setFilterCat(c.name)} className={`rounded-full px-2.5 py-1 text-xs font-medium ${filterCat === c.name ? "text-white" : "border hover:bg-gray-50"}`} style={filterCat === c.name ? { backgroundColor: c.color } : {}}>
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Notes — GRID VIEW (default, cards) */}
        {view === "grid" && (<>
        {pinned.length > 0 && (
          <div className="mb-4">
            <h3 className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase text-muted-foreground"><Pin className="h-3 w-3" />Fijadas</h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{pinned.map((n) => <NoteCard key={n.id} note={n} catColor={getCatColor(n.category)} categories={categories} onPin={togglePin} onLock={toggleLock} onDelete={deleteNote} onView={setViewNote} onEdit={openEdit} onClone={cloneNote} onCopy={copyNote} onMove={moveNote} />)}</div>
          </div>
        )}
        <SortableList
          items={paginatedUnpinned}
          onReorder={(reordered) => { const otherNotes = notes.filter(n => !reordered.some(r => r.id === n.id)); saveNotes([...otherNotes, ...reordered]); }}
          renderItem={(n) => <NoteCard note={n} catColor={getCatColor(n.category)} categories={categories} onPin={togglePin} onLock={toggleLock} onDelete={deleteNote} onView={setViewNote} onEdit={openEdit} onClone={cloneNote} onCopy={copyNote} onMove={moveNote} />}
        />
        </>)}

        {/* Notes — LIST VIEW (compact rows) */}
        {view === "list" && (
          <div className="rounded-lg border bg-white overflow-hidden">
            {[...pinned, ...paginatedUnpinned].map(n => (
              <div key={n.id} className="flex items-center gap-3 px-4 py-2.5 border-b last:border-0 hover:bg-gray-50 cursor-pointer" onClick={() => setViewNote(n)}>
                {n.pinned && <Pin className="h-3 w-3 text-brand shrink-0" />}
                <span className="rounded-full w-2 h-2 shrink-0" style={{ backgroundColor: getCatColor(n.category) }} />
                <span className="text-sm font-medium flex-1 truncate">{n.title}</span>
                <span className="text-[10px] text-muted-foreground shrink-0">{n.category}</span>
                <span className="text-[10px] text-muted-foreground shrink-0">{n.createdAt}</span>
              </div>
            ))}
          </div>
        )}

        {/* Notes — BOARD VIEW (by category columns) */}
        {view === "board" && (
          <div className="flex gap-3 overflow-x-auto pb-4">
            {categories.map(cat => {
              const catNotes = filtered.filter(n => n.category === cat.name);
              return (
                <div key={cat.id} className="w-64 shrink-0 rounded-lg border bg-white">
                  <div className="flex items-center gap-2 px-3 py-2.5 border-b">
                    <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-xs font-semibold">{cat.name}</span>
                    <span className="text-[10px] text-muted-foreground ml-auto">{catNotes.length}</span>
                  </div>
                  <div className="p-2 space-y-2 max-h-[60vh] overflow-y-auto">
                    {catNotes.map(n => (
                      <div key={n.id} className="rounded border p-2 hover:shadow-sm cursor-pointer" onClick={() => setViewNote(n)}>
                        <p className="text-xs font-medium truncate">{n.title}</p>
                        <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">{n.content}</p>
                        <span className="text-[9px] text-muted-foreground mt-1 block">{n.createdAt}</span>
                      </div>
                    ))}
                    {catNotes.length === 0 && <p className="text-center text-[10px] text-muted-foreground py-6">Sin notas</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="rounded border px-3 py-1.5 text-xs font-medium disabled:opacity-40 hover:bg-gray-50">Anterior</button>
            <span className="text-xs text-muted-foreground">Pagina {page} de {totalPages} ({unpinned.length} notas)</span>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="rounded border px-3 py-1.5 text-xs font-medium disabled:opacity-40 hover:bg-gray-50">Siguiente</button>
          </div>
        )}

        {filtered.length === 0 && <div className="py-12 text-center text-muted-foreground text-sm">Sin notas. Crea una con el boton "Nueva nota".</div>}
      </div>

      {/* View Note Modal */}
      {viewNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setViewNote(null)}>
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold">{viewNote.title}</h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span className="rounded-full px-2 py-0.5 text-white text-[10px] font-medium" style={{ backgroundColor: getCatColor(viewNote.category) }}>{viewNote.category}</span>
                  {viewNote.relatedTo && <span>{viewNote.relatedTo}</span>}
                  <span>{viewNote.createdAt}</span>
                </div>
              </div>
              <button onClick={() => setViewNote(null)} className="rounded p-1 hover:bg-gray-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed border-t pt-4 break-words overflow-hidden">{viewNote.content}</div>
            {viewNote.image && <img src={viewNote.image} alt="" className="mt-4 w-full max-h-64 rounded-lg border object-contain" />}
            <div className="flex gap-2 mt-6 border-t pt-4 flex-wrap">
              <button onClick={() => openEdit(viewNote)} className="flex items-center gap-1 rounded-md bg-brand px-3 py-2 text-xs font-medium text-white hover:bg-brand-hover"><Edit3 className="h-3.5 w-3.5" />Editar</button>
              <button onClick={() => { sendToReminder(viewNote); }} className="flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 hover:bg-amber-100"><Bell className="h-3.5 w-3.5" />Recordatorio</button>
              <button onClick={() => { cloneNote(viewNote); setViewNote(null); }} className="flex items-center gap-1 rounded-md border px-3 py-2 text-xs font-medium hover:bg-gray-50"><Copy className="h-3.5 w-3.5" />Clonar</button>
              <button onClick={() => copyNote(viewNote)} className="flex items-center gap-1 rounded-md border px-3 py-2 text-xs font-medium hover:bg-gray-50"><ClipboardCopy className="h-3.5 w-3.5" />Copiar texto</button>
              <button onClick={() => copyNoteJSON(viewNote)} className="flex items-center gap-1 rounded-md border px-3 py-2 text-xs font-medium hover:bg-gray-50"><ClipboardCopy className="h-3.5 w-3.5" />JSON</button>
              <button onClick={() => { deleteNote(viewNote.id); setViewNote(null); }} className="flex items-center gap-1 rounded-md border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 ml-auto"><Trash2 className="h-3.5 w-3.5" />Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Note Modal */}
      {editNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold">Editar nota</h3>
              <button onClick={() => setEditNote(null)} className="rounded p-1 hover:bg-gray-100"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs font-medium text-muted-foreground">Titulo</label><input value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" /></div>
              <div><label className="text-xs font-medium text-muted-foreground">Contenido</label><textarea value={editForm.content} onChange={e => setEditForm({...editForm, content: e.target.value})} rows={8} className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" /></div>
              <div className="flex items-center gap-2">
                <button onClick={async () => { const img = await openImagePicker(); if (img) setEditForm({...editForm, image: img}); }} className="flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs hover:bg-gray-50"><ImagePlus className="h-3.5 w-3.5" />Imagen</button>
                {editForm.image && <div className="relative"><img src={editForm.image} alt="" className="h-12 w-12 rounded border object-cover" /><button onClick={() => setEditForm({...editForm, image: ""})} className="absolute -top-1 -right-1 rounded-full bg-red-500 p-0.5 text-white"><X className="h-2.5 w-2.5" /></button></div>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground">Relacionado con</label><input value={editForm.relatedTo} onChange={e => setEditForm({...editForm, relatedTo: e.target.value})} className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" /></div>
                <div><label className="text-xs font-medium text-muted-foreground">Categoria</label>
                  <select value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none">
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              {/* Edit tags */}
              <div>
                <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Etiquetas</label>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map(t => (
                    <button key={t.id} type="button" onClick={() => { const has = editForm.tags.includes(t.name); setEditForm({...editForm, tags: has ? editForm.tags.filter(x => x !== t.name) : [...editForm.tags, t.name]}); }} className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-all ${editForm.tags.includes(t.name) ? "text-white scale-105" : "border opacity-70 hover:opacity-100"}`} style={editForm.tags.includes(t.name) ? { backgroundColor: t.color } : { borderColor: t.color, color: t.color }}>
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={handleUpdate} className="flex-1 rounded-md bg-brand py-2 text-sm font-medium text-white hover:bg-brand-hover">Guardar cambios</button>
                <button onClick={() => setEditNote(null)} className="rounded-md border px-4 py-2 text-sm">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Tag Modal */}
      {editingTag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setEditingTag(null)}>
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold">Editar etiqueta</h3>
              <button onClick={() => setEditingTag(null)} className="rounded p-1 hover:bg-gray-100"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <input value={editingTag.name} onChange={e => setEditingTag({...editingTag, name: e.target.value})} placeholder="Nombre" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              <input value={editingTag.description} onChange={e => setEditingTag({...editingTag, description: e.target.value})} placeholder="Descripción" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              <div>
                <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Color</label>
                <div className="flex flex-wrap gap-1.5">{PRESET_COLORS.map(c => <button key={c} onClick={() => setEditingTag({...editingTag, color: c})} className={`h-5 w-5 rounded-full border-2 ${editingTag.color === c ? "border-gray-800 scale-110" : "border-transparent"}`} style={{ backgroundColor: c }} />)}</div>
              </div>
              <div>
                <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Disponible en módulos:</label>
                <div className="flex flex-wrap gap-2">
                  {["notas", "contactos", "tareas", "oportunidades"].map(mod => (
                    <label key={mod} className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={editingTag.modules.includes(mod)} onChange={e => { setEditingTag({...editingTag, modules: e.target.checked ? [...editingTag.modules, mod] : editingTag.modules.filter(m => m !== mod)}); }} className="accent-brand rounded" />
                      <span className="text-xs capitalize">{mod}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-muted-foreground">Vista previa:</span>
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium text-white" style={{ backgroundColor: editingTag.color }}><Tag className="h-3 w-3" />{editingTag.name}</span>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={handleEditTag} className="flex-1 rounded-md bg-brand py-2 text-sm font-medium text-white hover:bg-brand-hover">Guardar</button>
              <button onClick={() => setEditingTag(null)} className="rounded-md border px-4 py-2 text-sm">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-lg">{toast}</div>}
    </div>
  );
}

function NoteCard({ note, catColor, categories, onPin, onLock, onDelete, onView, onEdit, onClone, onCopy, onMove }: { note: Note; catColor: string; categories: CrmTag[]; onPin: (id: string) => void; onLock: (id: string) => void; onDelete: (id: string) => void; onView: (n: Note) => void; onEdit: (n: Note) => void; onClone: (n: Note) => void; onCopy: (n: Note) => void; onMove: (id: string, cat: string) => void }) {
  return (
    <div className={`rounded-lg border bg-white p-3 hover:shadow-sm transition-shadow overflow-hidden ${note.locked ? "border-amber-200 bg-amber-50/30" : ""}`}>
      {/* Title row — clickable to view */}
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => onView(note)}>
        <StickyNote className="h-3.5 w-3.5 text-brand shrink-0" />
        <h4 className="text-sm font-semibold truncate flex-1">{note.title}</h4>
        {note.pinned && <Pin className="h-3 w-3 text-brand shrink-0" />}
        {note.locked && <Lock className="h-3 w-3 text-amber-600 shrink-0" />}
      </div>
      {/* Content preview */}
      <p className="mt-1.5 text-xs text-muted-foreground break-all overflow-hidden line-clamp-2 cursor-pointer" onClick={() => onView(note)}>{note.content}</p>
      {note.image && <img src={note.image} alt="" className="mt-1.5 w-full max-h-20 rounded border object-cover cursor-pointer" onClick={() => onView(note)} />}
      {/* Tags + category */}
      <div className="mt-2 flex items-center gap-1.5 flex-wrap text-[10px] text-muted-foreground">
        <span className="rounded-full px-1.5 py-0.5 text-[9px] font-medium text-white" style={{ backgroundColor: catColor }}>{note.category}</span>
        {(note.tags || []).filter(t => t !== note.category).map(t => (
          <span key={t} className="rounded-full px-1.5 py-0.5 text-[9px] font-medium border" style={{ borderColor: getTagColor(t), color: getTagColor(t) }}>{t}</span>
        ))}
        <span className="ml-auto">{note.createdAt}</span>
      </div>
      {/* Action buttons — ALWAYS visible */}
      <div className="mt-2 flex items-center gap-1 border-t pt-2" onClick={e => e.stopPropagation()}>
        <select value={note.category} onChange={e => onMove(note.id, e.target.value)} className="rounded border px-1 py-0.5 text-[9px] w-20 focus:outline-none">
          {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
        <div className="flex-1" />
        <button onClick={() => onPin(note.id)} className={`rounded p-1 ${note.pinned ? "text-brand" : "text-muted-foreground hover:text-brand"}`} title="Fijar"><Pin className="h-3 w-3" /></button>
        <button onClick={() => onLock(note.id)} className={`rounded p-1 ${note.locked ? "text-amber-600" : "text-muted-foreground hover:text-amber-600"}`} title={note.locked ? "Desbloquear" : "Bloquear"}><Lock className="h-3 w-3" /></button>
        <button onClick={() => onEdit(note)} className="rounded p-1 text-muted-foreground hover:text-brand" title="Editar"><Edit3 className="h-3 w-3" /></button>
        <button onClick={() => onClone(note)} className="rounded p-1 text-muted-foreground hover:text-gray-700" title="Clonar"><Copy className="h-3 w-3" /></button>
        <button onClick={() => onDelete(note.id)} className="rounded p-1 text-red-400 hover:text-red-600 hover:bg-red-50" title="Eliminar"><Trash2 className="h-3 w-3" /></button>
      </div>
    </div>
  );
}
