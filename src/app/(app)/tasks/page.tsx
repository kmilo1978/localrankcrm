"use client";

import { useState, useEffect } from "react";
import { Calendar, CheckCircle2, Circle, Clock, Plus, Tag, Trash2 } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";

type Task = {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "in_progress" | "completed";
  dueDate: string;
  assignee: string;
  relatedTo: string;
  category: string;
};

const SEED_TASKS: Task[] = [
  { id: "t1", title: "Enviar propuesta Enterprise a TechCorp", description: "Preparar y enviar la propuesta final", priority: "high", status: "in_progress", dueDate: "2026-07-18", assignee: "Juan Pérez", relatedTo: "TechCorp", category: "Venta" },
  { id: "t2", title: "Llamada de seguimiento con María García", description: "Confirmar interés en implementación", priority: "high", status: "pending", dueDate: "2026-07-17", assignee: "Ana López", relatedTo: "LogiNext", category: "Seguimiento" },
  { id: "t3", title: "Demo producto para MediaGroup", description: "Preparar demo personalizada", priority: "medium", status: "pending", dueDate: "2026-07-20", assignee: "Juan Pérez", relatedTo: "MediaGroup", category: "Demo" },
];

const PRIORITY_STYLES = { high: "bg-red-100 text-red-700", medium: "bg-amber-100 text-amber-700", low: "bg-gray-100 text-gray-600" };
const PRIORITY_LABELS = { high: "Alta", medium: "Media", low: "Baja" };
const STATUS_ICONS = { pending: Circle, in_progress: Clock, completed: CheckCircle2 };

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "in_progress" | "completed">("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", priority: "medium" as Task["priority"], dueDate: "", assignee: "", relatedTo: "", category: "" });

  useEffect(() => { setTasks(loadFromStorage("tasks", SEED_TASKS)); }, []);

  function save(updated: Task[]) { setTasks(updated); saveToStorage("tasks", updated); }

  function handleAdd() {
    if (!form.title.trim()) return;
    const t: Task = { id: generateId(), ...form, status: "pending" };
    save([t, ...tasks]);
    setForm({ title: "", description: "", priority: "medium", dueDate: "", assignee: "", relatedTo: "", category: "" });
    setShowForm(false);
  }

  function toggleStatus(id: string) {
    save(tasks.map((t) => {
      if (t.id !== id) return t;
      const next = t.status === "pending" ? "in_progress" : t.status === "in_progress" ? "completed" : "pending";
      return { ...t, status: next };
    }));
  }

  function handleDelete(id: string) { save(tasks.filter((t) => t.id !== id)); }

  const filtered = filter === "all" ? tasks : tasks.filter((t) => t.status === filter);
  const pendingCount = tasks.filter((t) => t.status === "pending").length;
  const inProgressCount = tasks.filter((t) => t.status === "in_progress").length;

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Tareas</h1>
            <p className="text-sm text-muted-foreground">{pendingCount} pendientes · {inProgressCount} en progreso</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover transition-colors">
            <Plus className="h-4 w-4" />Nueva tarea
          </button>
        </div>

        {showForm && (
          <div className="mb-6 rounded-lg border bg-white p-5">
            <h3 className="mb-4 font-semibold">Agregar nueva tarea</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Título *" className="col-span-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descripción" rows={2} className="col-span-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Task["priority"] })} className="rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand">
                <option value="high">Prioridad Alta</option>
                <option value="medium">Prioridad Media</option>
                <option value="low">Prioridad Baja</option>
              </select>
              <input value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} type="date" className="rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              <input value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })} placeholder="Asignado a" className="rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              <input value={form.relatedTo} onChange={(e) => setForm({ ...form, relatedTo: e.target.value })} placeholder="Relacionado con" className="rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={handleAdd} className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover">Guardar</button>
              <button onClick={() => setShowForm(false)} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50">Cancelar</button>
            </div>
          </div>
        )}

        <div className="mb-4 flex gap-2">
          {([["all","Todas"],["pending","Pendientes"],["in_progress","En progreso"],["completed","Completadas"]] as const).map(([key, label]) => (
            <button key={key} onClick={() => setFilter(key)} className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${filter === key ? "bg-brand text-white" : "border hover:bg-gray-50"}`}>{label}</button>
          ))}
        </div>

        <div className="space-y-2">
          {filtered.map((task) => {
            const StatusIcon = STATUS_ICONS[task.status];
            return (
              <div key={task.id} className={`group rounded-lg border bg-white p-4 transition-colors hover:shadow-sm ${task.status === "completed" ? "opacity-60" : ""}`}>
                <div className="flex items-start gap-3">
                  <button onClick={() => toggleStatus(task.id)} title="Cambiar estado">
                    <StatusIcon className={`mt-0.5 h-5 w-5 shrink-0 ${task.status === "completed" ? "text-green-500" : task.status === "in_progress" ? "text-brand" : "text-muted-foreground"}`} />
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm font-medium ${task.status === "completed" ? "line-through" : ""}`}>{task.title}</h4>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_STYLES[task.priority]}`}>{PRIORITY_LABELS[task.priority]}</span>
                    </div>
                    {task.description && <p className="mt-0.5 text-xs text-muted-foreground">{task.description}</p>}
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      {task.dueDate && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{task.dueDate}</span>}
                      {task.category && <span className="flex items-center gap-1"><Tag className="h-3 w-3" />{task.category}</span>}
                      {task.assignee && <span>{task.assignee}</span>}
                      {task.relatedTo && <span className="text-brand">{task.relatedTo}</span>}
                    </div>
                  </div>
                  <button onClick={() => handleDelete(task.id)} className="opacity-0 group-hover:opacity-100 rounded p-1 hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-all" title="Eliminar">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <div className="py-12 text-center text-muted-foreground">No hay tareas en este filtro.</div>}
        </div>
      </div>
    </div>
  );
}
