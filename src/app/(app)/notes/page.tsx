"use client";

import { useState, useEffect } from "react";
import { ClipboardCopy, Copy, Edit3, Filter, ImagePlus, Pin, Plus, Search, StickyNote, Tag, Trash2, X } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";
import { openImagePicker } from "@/lib/image-upload";

type Note = {
  id: string;
  title: string;
  content: string;
  image: string;
  relatedTo: string;
  category: string;
  pinned: boolean;
  createdAt: string;
};

type Category = { id: string; name: string; color: string };

const PRESET_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#e91e8c", "#8b5cf6", "#ef4444", "#06b6d4", "#6366f1", "#f97316", "#78716c"];

const SEED_CATEGORIES: Category[] = [
  { id: "cat1", name: "Reunión", color: "#3b82f6" },
  { id: "cat2", name: "Seguimiento", color: "#10b981" },
  { id: "cat3", name: "Ideas", color: "#8b5cf6" },
  { id: "cat4", name: "Producto", color: "#f59e0b" },
  { id: "cat5", name: "General", color: "#78716c" },
];

const SEED_NOTES: Note[] = [
  { id: "n1", title: "Reunión TechCorp - Requerimientos", content: "Necesitan integración con SAP. Presupuesto aprobado para Q3.", image: "", pinned: true, relatedTo: "TechCorp", category: "Reunión", createdAt: "2026-07-17" },
  { id: "n2", title: "Seguimiento LogiNext", content: "María García interesada en módulo logístico.", image: "", pinned: false, relatedTo: "LogiNext", category: "Seguimiento", createdAt: "2026-07-16" },
  { id: "n3", title: "Ideas campaña MediaGroup", content: "Proponer paquete marketing digital + CRM.", image: "", pinned: false, relatedTo: "MediaGroup", category: "Ideas", createdAt: "2026-07-15" },
];

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [showCatForm, setShowCatForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", image: "", relatedTo: "", category: "" });
  const [catForm, setCatForm] = useState({ name: "", color: PRESET_COLORS[0]! });
  const [viewNote, setViewNote] = useState<Note | null>(null);
  const [editNote, setEditNote] = useState<Note | null>(null);
  const [editForm, setEditForm] = useState({ title: "", content: "", image: "", relatedTo: "", category: "" });
  const [toast, setToast] = useState("");

  useEffect(() => {
    setNotes(loadFromStorage("notes", SEED_NOTES));
    setCategories(loadFromStorage("note_categories", SEED_CATEGORIES));
  }, []);
  function saveNotes(u: Note[]) { setNotes(u); saveToStorage("notes", u); }
  function saveCats(u: Category[]) { setCategories(u); saveToStorage("note_categories", u); }

  function handleAdd() {
    if (!form.title.trim()) return;
    saveNotes([{ id: generateId(), title: form.title, content: form.content, image: form.image, relatedTo: form.relatedTo, category: form.category || "General", pinned: false, createdAt: new Date().toISOString().split("T")[0]! }, ...notes]);
    setForm({ title: "", content: "", image: "", relatedTo: "", category: "" });
    setShowForm(false);
  }

  function addCategory() {
    if (!catForm.name.trim()) return;
    saveCats([...categories, { id: generateId(), name: catForm.name, color: catForm.color }]);
    setCatForm({ name: "", color: PRESET_COLORS[(categories.length + 1) % PRESET_COLORS.length]! });
    setShowCatForm(false);
  }

  function deleteCategory(id: string) { saveCats(categories.filter((c) => c.id !== id)); }
  function togglePin(id: string) { saveNotes(notes.map((n) => n.id === id ? { ...n, pinned: !n.pinned } : n)); }
  function deleteNote(id: string) { saveNotes(notes.filter((n) => n.id !== id)); if (viewNote?.id === id) setViewNote(null); }

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 2500); }

  function openEdit(note: Note) {
    setEditNote(note);
    setEditForm({ title: note.title, content: note.content, image: note.image || "", relatedTo: note.relatedTo, category: note.category });
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

  function getCatColor(name: string) { return categories.find((c) => c.name === name)?.color || "#78716c"; }

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
            <button onClick={clearAllNotes} className="flex items-center gap-1 rounded-md border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" />Borrar todas</button>
            <button onClick={() => setShowCatForm(!showCatForm)} className="flex items-center gap-1 rounded-md border px-3 py-2 text-xs font-medium hover:bg-gray-50"><Tag className="h-3.5 w-3.5" />Categorías</button>
            <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"><Plus className="h-4 w-4" />Nueva nota</button>
          </div>
        </div>

        {/* Category manager */}
        {showCatForm && (
          <div className="mb-4 rounded-lg border bg-white p-4">
            <h4 className="mb-2 text-sm font-semibold">Gestionar categorías</h4>
            <div className="flex flex-wrap gap-2 mb-3">
              {categories.map((c) => (
                <div key={c.id} className="group flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-white" style={{ backgroundColor: c.color }}>
                  {c.name}
                  <button onClick={() => deleteCategory(c.id)} className="opacity-0 group-hover:opacity-100 hover:bg-white/30 rounded-full p-0.5"><X className="h-2.5 w-2.5" /></button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} placeholder="Nueva categoría" className="rounded-md border px-3 py-1.5 text-sm focus:border-brand focus:outline-none" />
              <div className="flex gap-1">{PRESET_COLORS.map((c) => <button key={c} onClick={() => setCatForm({ ...catForm, color: c })} className={`h-6 w-6 rounded-full border-2 ${catForm.color === c ? "border-gray-800 scale-110" : "border-transparent"}`} style={{ backgroundColor: c }} />)}</div>
              <button onClick={addCategory} className="rounded bg-brand px-3 py-1.5 text-xs text-white hover:bg-brand-hover">Agregar</button>
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

        {/* Notes */}
        {pinned.length > 0 && (
          <div className="mb-4">
            <h3 className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase text-muted-foreground"><Pin className="h-3 w-3" />Fijadas</h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{pinned.map((n) => <NoteCard key={n.id} note={n} catColor={getCatColor(n.category)} categories={categories} onPin={togglePin} onDelete={deleteNote} onView={setViewNote} onEdit={openEdit} onClone={cloneNote} onCopy={copyNote} onMove={moveNote} />)}</div>
          </div>
        )}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {paginatedUnpinned.map((n) => <NoteCard key={n.id} note={n} catColor={getCatColor(n.category)} categories={categories} onPin={togglePin} onDelete={deleteNote} onView={setViewNote} onEdit={openEdit} onClone={cloneNote} onCopy={copyNote} onMove={moveNote} />)}
        </div>

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
            <div className="flex gap-2 mt-6 border-t pt-4">
              <button onClick={() => openEdit(viewNote)} className="flex items-center gap-1 rounded-md bg-brand px-3 py-2 text-xs font-medium text-white hover:bg-brand-hover"><Edit3 className="h-3.5 w-3.5" />Editar</button>
              <button onClick={() => { cloneNote(viewNote); setViewNote(null); }} className="flex items-center gap-1 rounded-md border px-3 py-2 text-xs font-medium hover:bg-gray-50"><Copy className="h-3.5 w-3.5" />Clonar</button>
              <button onClick={() => copyNote(viewNote)} className="flex items-center gap-1 rounded-md border px-3 py-2 text-xs font-medium hover:bg-gray-50"><ClipboardCopy className="h-3.5 w-3.5" />Copiar texto</button>
              <button onClick={() => copyNoteJSON(viewNote)} className="flex items-center gap-1 rounded-md border px-3 py-2 text-xs font-medium hover:bg-gray-50"><ClipboardCopy className="h-3.5 w-3.5" />JSON</button>
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
              <div className="flex gap-2 pt-2">
                <button onClick={handleUpdate} className="flex-1 rounded-md bg-brand py-2 text-sm font-medium text-white hover:bg-brand-hover">Guardar cambios</button>
                <button onClick={() => setEditNote(null)} className="rounded-md border px-4 py-2 text-sm">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-lg">{toast}</div>}
    </div>
  );
}

function NoteCard({ note, catColor, categories, onPin, onDelete, onView, onEdit, onClone, onCopy, onMove }: { note: Note; catColor: string; categories: Category[]; onPin: (id: string) => void; onDelete: (id: string) => void; onView: (n: Note) => void; onEdit: (n: Note) => void; onClone: (n: Note) => void; onCopy: (n: Note) => void; onMove: (id: string, cat: string) => void }) {
  return (
    <div className="group rounded-lg border bg-white p-4 hover:shadow-sm transition-shadow cursor-pointer overflow-hidden" onClick={() => onView(note)}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <StickyNote className="h-4 w-4 text-brand" />
          <h4 className="text-sm font-semibold truncate">{note.title}</h4>
        </div>
        <div className="flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
          {/* Move to category dropdown */}
          <select value={note.category} onChange={e => onMove(note.id, e.target.value)} className="opacity-0 group-hover:opacity-100 rounded border px-1 py-0.5 text-[9px] max-w-[80px] focus:outline-none cursor-pointer" title="Mover a categoria">
            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <button onClick={() => onPin(note.id)} className={`rounded p-1 ${note.pinned ? "text-brand" : "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-brand"}`} title="Fijar"><Pin className="h-3.5 w-3.5" /></button>
          <button onClick={() => onEdit(note)} className="opacity-0 group-hover:opacity-100 rounded p-1 text-muted-foreground hover:text-brand" title="Editar"><Edit3 className="h-3.5 w-3.5" /></button>
          <button onClick={() => onClone(note)} className="opacity-0 group-hover:opacity-100 rounded p-1 text-muted-foreground hover:text-gray-700" title="Clonar"><Copy className="h-3.5 w-3.5" /></button>
          <button onClick={() => onCopy(note)} className="opacity-0 group-hover:opacity-100 rounded p-1 text-muted-foreground hover:text-gray-700" title="Copiar"><ClipboardCopy className="h-3.5 w-3.5" /></button>
          <button onClick={() => onDelete(note.id)} className="opacity-0 group-hover:opacity-100 rounded p-1 text-muted-foreground hover:text-red-500" title="Eliminar"><Trash2 className="h-3.5 w-3.5" /></button>
        </div>
      </div>
      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground whitespace-pre-wrap break-words overflow-hidden">{note.content}</p>
      {note.image && <img src={note.image} alt="" className="mt-2 w-full max-h-32 rounded border object-cover" />}
      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="rounded-full px-2 py-0.5 text-xs font-medium text-white" style={{ backgroundColor: catColor }}>{note.category}</span>
        {note.relatedTo && <><span>·</span><span>{note.relatedTo}</span></>}
        <span className="ml-auto">{note.createdAt}</span>
      </div>
    </div>
  );
}
