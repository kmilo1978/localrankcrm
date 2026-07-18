"use client";

import { useState, useEffect } from "react";
import { Pin, Plus, Search, StickyNote, Trash2 } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";

type Note = {
  id: string;
  title: string;
  content: string;
  relatedTo: string;
  category: string;
  pinned: boolean;
  createdAt: string;
};

const SEED_NOTES: Note[] = [
  { id: "n1", title: "Reunión TechCorp - Requerimientos", content: "Necesitan integración con SAP. Presupuesto aprobado para Q3. Decisión final en agosto.", pinned: true, relatedTo: "TechCorp", category: "Reunión", createdAt: "2026-07-17" },
  { id: "n2", title: "Seguimiento LogiNext", content: "María García interesada en módulo logístico. Pedir caso de éxito similar.", pinned: false, relatedTo: "LogiNext", category: "Seguimiento", createdAt: "2026-07-16" },
  { id: "n3", title: "Ideas campaña MediaGroup", content: "Proponer paquete marketing digital + CRM. Cross-sell con automatización.", pinned: false, relatedTo: "MediaGroup", category: "Ideas", createdAt: "2026-07-15" },
];

const CAT_COLORS: Record<string, string> = {
  "Reunión": "bg-blue-100 text-blue-700",
  "Seguimiento": "bg-green-100 text-green-700",
  "Ideas": "bg-purple-100 text-purple-700",
  "Producto": "bg-amber-100 text-amber-700",
  "General": "bg-gray-100 text-gray-700",
};

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", relatedTo: "", category: "" });

  useEffect(() => { setNotes(loadFromStorage("notes", SEED_NOTES)); }, []);
  function save(u: Note[]) { setNotes(u); saveToStorage("notes", u); }

  function handleAdd() {
    if (!form.title.trim()) return;
    save([{ id: generateId(), title: form.title, content: form.content, relatedTo: form.relatedTo, category: form.category || "General", pinned: false, createdAt: new Date().toISOString().split("T")[0]! }, ...notes]);
    setForm({ title: "", content: "", relatedTo: "", category: "" });
    setShowForm(false);
  }

  function togglePin(id: string) { save(notes.map((n) => n.id === id ? { ...n, pinned: !n.pinned } : n)); }
  function handleDelete(id: string) { save(notes.filter((n) => n.id !== id)); }

  const filtered = notes.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase()) ||
    n.relatedTo.toLowerCase().includes(search.toLowerCase())
  );
  const pinned = filtered.filter((n) => n.pinned);
  const unpinned = filtered.filter((n) => !n.pinned);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Notas</h1>
            <p className="text-sm text-muted-foreground">{notes.length} notas</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover transition-colors">
            <Plus className="h-4 w-4" />Nueva nota
          </button>
        </div>

        {showForm && (
          <div className="mb-6 rounded-lg border bg-white p-5">
            <h3 className="mb-4 font-semibold">Agregar nueva nota</h3>
            <div className="space-y-3">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Título *" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Contenido..." rows={4} className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              <div className="grid grid-cols-2 gap-3">
                <input value={form.relatedTo} onChange={(e) => setForm({ ...form, relatedTo: e.target.value })} placeholder="Relacionado con" className="rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
                <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Categoría" className="rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={handleAdd} className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover">Guardar</button>
              <button onClick={() => setShowForm(false)} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50">Cancelar</button>
            </div>
          </div>
        )}

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Buscar en notas..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-md border bg-white py-2 pl-10 pr-4 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
        </div>

        {pinned.length > 0 && (
          <div className="mb-4">
            <h3 className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase text-muted-foreground"><Pin className="h-3 w-3" /> Fijadas</h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{pinned.map((n) => <NoteCard key={n.id} note={n} onPin={togglePin} onDelete={handleDelete} />)}</div>
          </div>
        )}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {unpinned.map((n) => <NoteCard key={n.id} note={n} onPin={togglePin} onDelete={handleDelete} />)}
        </div>
        {filtered.length === 0 && <div className="py-12 text-center text-muted-foreground">No hay notas. Crea una con el botón "Nueva nota".</div>}
      </div>
    </div>
  );
}

function NoteCard({ note, onPin, onDelete }: { note: Note; onPin: (id: string) => void; onDelete: (id: string) => void }) {
  const catColor = CAT_COLORS[note.category] ?? "bg-gray-100 text-gray-700";
  return (
    <div className="group rounded-lg border bg-white p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <StickyNote className="h-4 w-4 text-brand" />
          <h4 className="text-sm font-semibold">{note.title}</h4>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onPin(note.id)} className={`rounded p-1 ${note.pinned ? "text-brand" : "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-brand"}`} title={note.pinned ? "Desfijar" : "Fijar"}>
            <Pin className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => onDelete(note.id)} className="opacity-0 group-hover:opacity-100 rounded p-1 text-muted-foreground hover:text-red-500" title="Eliminar">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{note.content}</p>
      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        {note.category && <span className={`rounded px-1.5 py-0.5 font-medium ${catColor}`}>{note.category}</span>}
        {note.relatedTo && <><span>·</span><span>{note.relatedTo}</span></>}
        <span className="ml-auto">{note.createdAt}</span>
      </div>
    </div>
  );
}
