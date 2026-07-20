"use client";

import { useState, useEffect } from "react";
import { Edit2, Plus, Tag, Trash2, X } from "lucide-react";
import { CrmTag, loadTags, saveTags, createTag, updateTag, deleteTag, TAG_PRESET_COLORS } from "@/lib/tags";

const PRESET_COLORS = TAG_PRESET_COLORS;

export default function LabelsPage() {
  const [labels, setLabels] = useState<CrmTag[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CrmTag | null>(null);
  const [form, setForm] = useState({ name: "", color: PRESET_COLORS[0]!, description: "" });
  const [customColor, setCustomColor] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");

  useEffect(() => { setLabels(loadTags()); }, []);
  function reload() { setLabels(loadTags()); }

  function handleAdd() {
    if (!form.name.trim()) return;
    const color = customColor.match(/^#[0-9a-fA-F]{6}$/) ? customColor : form.color;
    createTag(form.name, color, form.description, ["contactos", "notas", "tareas"]);
    setForm({ name: "", color: PRESET_COLORS[0]!, description: "" });
    setCustomColor("");
    setShowForm(false);
    reload();
  }

  function handleEdit() {
    if (!editing || !editing.name.trim()) return;
    updateTag(editing.id, { name: editing.name, color: editing.color, description: editing.description, modules: editing.modules });
    setEditing(null);
    reload();
  }

  function handleDelete(id: string) { deleteTag(id); reload(); }

  const filtered = moduleFilter === "all" ? labels : labels.filter(l => l.modules.includes(moduleFilter));
  const modules = Array.from(new Set(labels.flatMap(l => l.modules)));

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Etiquetas</h1>
            <p className="text-sm text-muted-foreground">{labels.length} etiquetas compartidas en todo el CRM · Asigna colores y módulos</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover transition-colors">
            <Plus className="h-4 w-4" />Nueva etiqueta
          </button>
        </div>

        {/* Module filter */}
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-muted-foreground">Filtrar por módulo:</span>
          <button onClick={() => setModuleFilter("all")} className={`rounded-full px-2.5 py-1 text-xs font-medium ${moduleFilter === "all" ? "bg-brand text-white" : "border hover:bg-gray-50"}`}>Todas</button>
          {modules.map(m => (
            <button key={m} onClick={() => setModuleFilter(m)} className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${moduleFilter === m ? "bg-brand text-white" : "border hover:bg-gray-50"}`}>{m}</button>
          ))}
        </div>

        {/* Create form */}
        {showForm && (
          <div className="mb-6 rounded-lg border bg-white p-5">
            <h3 className="mb-4 font-semibold">Crear etiqueta</h3>
            <div className="space-y-3">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nombre de la etiqueta *" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descripción (opcional)" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              <div>
                <label className="mb-2 block text-sm font-medium">Color</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button key={c} onClick={() => { setForm({ ...form, color: c }); setCustomColor(""); }} className={`h-7 w-7 rounded-full border-2 transition-transform ${form.color === c && !customColor ? "border-gray-800 scale-110" : "border-transparent hover:scale-105"}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">O personalizado:</span>
                  <input value={customColor} onChange={(e) => setCustomColor(e.target.value)} placeholder="#ff6600" className="w-24 rounded border px-2 py-1 text-xs focus:border-brand focus:outline-none" />
                  {customColor.match(/^#[0-9a-fA-F]{6}$/) && <span className="h-5 w-5 rounded-full border" style={{ backgroundColor: customColor }} />}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Vista previa:</span>
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-white" style={{ backgroundColor: customColor.match(/^#[0-9a-fA-F]{6}$/) ? customColor : form.color }}>
                  <Tag className="h-3 w-3" />{form.name || "Etiqueta"}
                </span>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={handleAdd} className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover">Crear</button>
              <button onClick={() => setShowForm(false)} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50">Cancelar</button>
            </div>
          </div>
        )}

        {/* Labels grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((label) => (
            <div key={label.id} className="group rounded-lg border bg-white p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="h-4 w-4 rounded-full shrink-0" style={{ backgroundColor: label.color }} />
                  <div>
                    <span className="text-sm font-medium">{label.name}</span>
                    {label.description && <p className="text-xs text-muted-foreground mt-0.5">{label.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditing(label)} className="rounded p-1 hover:bg-gray-100 text-muted-foreground"><Edit2 className="h-3.5 w-3.5" /></button>
                  <button onClick={() => handleDelete(label.id)} className="rounded p-1 hover:bg-red-50 text-muted-foreground hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium text-white" style={{ backgroundColor: label.color }}>
                  <Tag className="h-3 w-3" />{label.name}
                </span>
                <div className="flex gap-1">
                  {label.modules.map(m => (
                    <span key={m} className="rounded px-1.5 py-0.5 text-[9px] bg-gray-100 text-gray-600 capitalize">{m}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {labels.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <Tag className="mx-auto h-10 w-10 text-muted-foreground/30" />
            <p className="mt-2 text-sm">Sin etiquetas</p>
            <p className="text-xs">Crea etiquetas para organizar contactos, empresas y oportunidades.</p>
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setEditing(null)}>
          <div className="w-full max-w-md rounded-lg border bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 font-semibold">Editar etiqueta</h3>
            <div className="space-y-3">
              <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Nombre" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              <input value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="Descripción" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              <div>
                <label className="mb-1.5 block text-sm font-medium">Color</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button key={c} onClick={() => setEditing({ ...editing, color: c })} className={`h-6 w-6 rounded-full border-2 ${editing.color === c ? "border-gray-800 scale-110" : "border-transparent"}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Disponible en módulos</label>
                <div className="flex flex-wrap gap-2">
                  {["contactos", "notas", "tareas", "oportunidades"].map(mod => (
                    <label key={mod} className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={editing.modules.includes(mod)} onChange={e => { setEditing({...editing, modules: e.target.checked ? [...editing.modules, mod] : editing.modules.filter(m => m !== mod)}); }} className="accent-brand rounded" />
                      <span className="text-xs capitalize">{mod}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs">Preview:</span>
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium text-white" style={{ backgroundColor: editing.color }}>
                  <Tag className="h-3 w-3" />{editing.name}
                </span>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50">Cancelar</button>
              <button onClick={handleEdit} className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
