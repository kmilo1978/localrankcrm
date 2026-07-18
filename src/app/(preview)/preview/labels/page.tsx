"use client";

import { useState, useEffect } from "react";
import { Edit2, Plus, Tag, Trash2, X } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";

type Label = {
  id: string;
  name: string;
  color: string;
  description: string;
  count: number;
};

const PRESET_COLORS = [
  "#e91e8c", "#ef4444", "#f97316", "#f59e0b", "#eab308",
  "#84cc16", "#22c55e", "#10b981", "#14b8a6", "#06b6d4",
  "#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7",
  "#d946ef", "#ec4899", "#f43f5e", "#78716c", "#475569",
];

const SEED_LABELS: Label[] = [
  { id: "lb1", name: "Cliente VIP", color: "#f59e0b", description: "Clientes de alto valor", count: 4 },
  { id: "lb2", name: "Urgente", color: "#ef4444", description: "Requiere atención inmediata", count: 2 },
  { id: "lb3", name: "Prospecto caliente", color: "#e91e8c", description: "Alta probabilidad de cierre", count: 5 },
  { id: "lb4", name: "En negociación", color: "#8b5cf6", description: "En proceso de negociación activa", count: 3 },
  { id: "lb5", name: "Renovación", color: "#06b6d4", description: "Contrato próximo a renovar", count: 2 },
  { id: "lb6", name: "Nuevo lead", color: "#22c55e", description: "Lead recién ingresado", count: 8 },
  { id: "lb7", name: "Soporte", color: "#3b82f6", description: "Requiere soporte post-venta", count: 1 },
  { id: "lb8", name: "Inactivo", color: "#78716c", description: "Sin actividad reciente", count: 6 },
];

export default function LabelsPage() {
  const [labels, setLabels] = useState<Label[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Label | null>(null);
  const [form, setForm] = useState({ name: "", color: PRESET_COLORS[0]!, description: "" });
  const [customColor, setCustomColor] = useState("");

  useEffect(() => { setLabels(loadFromStorage("crm_labels", SEED_LABELS)); }, []);
  function save(u: Label[]) { setLabels(u); saveToStorage("crm_labels", u); }

  function handleAdd() {
    if (!form.name.trim()) return;
    const color = customColor.match(/^#[0-9a-fA-F]{6}$/) ? customColor : form.color;
    save([...labels, { id: generateId(), name: form.name, color, description: form.description, count: 0 }]);
    setForm({ name: "", color: PRESET_COLORS[0]!, description: "" });
    setCustomColor("");
    setShowForm(false);
  }

  function handleEdit() {
    if (!editing || !editing.name.trim()) return;
    save(labels.map((l) => l.id === editing.id ? editing : l));
    setEditing(null);
  }

  function handleDelete(id: string) { save(labels.filter((l) => l.id !== id)); }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Etiquetas</h1>
            <p className="text-sm text-muted-foreground">{labels.length} etiquetas · Crea las que necesites con colores personalizados</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover transition-colors">
            <Plus className="h-4 w-4" />Nueva etiqueta
          </button>
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
          {labels.map((label) => (
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
                <span className="text-xs text-muted-foreground">{label.count} asignadas</span>
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
