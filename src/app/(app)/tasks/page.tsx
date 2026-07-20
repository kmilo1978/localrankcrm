"use client";

import { useState, useEffect } from "react";
import { Calendar, CheckCircle2, Circle, Clock, ClipboardCopy, Edit3, Plus, Tag, Trash2, X } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";
import { ViewToggle, ViewMode } from "@/components/view-toggle";

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
  { id: "t4", title: "Revisar contrato SaaS con legal", description: "Validar cláusulas de soporte y SLA", priority: "low", status: "completed", dueDate: "2026-07-15", assignee: "Ana López", relatedTo: "TechCorp", category: "Legal" },
];

const PRIORITY_STYLES = { high: "bg-red-100 text-red-700", medium: "bg-amber-100 text-amber-700", low: "bg-gray-100 text-gray-600" };
const PRIORITY_LABELS = { high: "Alta", medium: "Media", low: "Baja" };
const STATUS_ICONS = { pending: Circle, in_progress: Clock, completed: CheckCircle2 };
const STATUS_LABELS = { pending: "Pendiente", in_progress: "En progreso", completed: "Completada" };

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState<ViewMode>("list");
  const [filter, setFilter] = useState<"all" | "pending" | "in_progress" | "completed">("all");
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form, setForm] = useState({ title: "", description: "", priority: "medium" as Task["priority"], status: "pending" as Task["status"], dueDate: "", assignee: "", relatedTo: "", category: "" });
  const [toast, setToast] = useState("");

  useEffect(() => { setTasks(loadFromStorage("tasks", SEED_TASKS)); }, []);

  function save(updated: Task[]) { setTasks(updated); saveToStorage("tasks", updated); }

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 2500); }

  function handleAdd() {
    if (!form.title.trim()) return;
    const t: Task = { id: generateId(), ...form };
    save([t, ...tasks]);
    resetForm();
    setShowForm(false);
  }

  function openEdit(task: Task) {
    setEditingTask(task);
    setForm({ title: task.title, description: task.description, priority: task.priority, status: task.status, dueDate: task.dueDate, assignee: task.assignee, relatedTo: task.relatedTo, category: task.category });
  }

  function handleUpdate() {
    if (!editingTask || !form.title.trim()) return;
    save(tasks.map(t => t.id === editingTask.id ? { ...t, ...form } : t));
    setEditingTask(null);
    resetForm();
    showToast("Tarea actualizada");
  }

  function resetForm() {
    setForm({ title: "", description: "", priority: "medium", status: "pending", dueDate: "", assignee: "", relatedTo: "", category: "" });
  }

  function toggleStatus(id: string) {
    save(tasks.map((t) => {
      if (t.id !== id) return t;
      const next = t.status === "pending" ? "in_progress" : t.status === "in_progress" ? "completed" : "pending";
      return { ...t, status: next };
    }));
  }

  function duplicateTask(task: Task) {
    const copy: Task = { ...task, id: generateId(), title: task.title + " (copia)", status: "pending" };
    save([copy, ...tasks]);
    showToast("Tarea duplicada");
  }

  function copyTask(task: Task) {
    navigator.clipboard.writeText(JSON.stringify(task, null, 2));
    showToast("Tarea copiada al portapapeles");
  }

  function pasteTask() {
    navigator.clipboard.readText().then(text => {
      try {
        const data = JSON.parse(text);
        if (data.title) {
          const t: Task = { id: generateId(), title: data.title, description: data.description || "", priority: data.priority || "medium", status: "pending", dueDate: data.dueDate || "", assignee: data.assignee || "", relatedTo: data.relatedTo || "", category: data.category || "" };
          save([t, ...tasks]);
          showToast("Tarea pegada desde portapapeles");
        }
      } catch { showToast("No se reconoce el formato"); }
    });
  }

  function handleDelete(id: string) { save(tasks.filter((t) => t.id !== id)); }

  const filtered = filter === "all" ? tasks : tasks.filter((t) => t.status === filter);
  const pendingCount = tasks.filter((t) => t.status === "pending").length;
  const inProgressCount = tasks.filter((t) => t.status === "in_progress").length;

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">Tareas</h1>
            <p className="text-sm text-muted-foreground">{pendingCount} pendientes · {inProgressCount} en progreso</p>
          </div>
          <div className="flex items-center gap-2">
            <ViewToggle current={view} onChange={setView} views={["list", "board", "calendar", "grid"]} />
            <button onClick={pasteTask} className="flex items-center gap-1 rounded-md border px-3 py-2 text-xs font-medium hover:bg-gray-50" title="Pegar tarea"><ClipboardCopy className="h-3.5 w-3.5" />Pegar</button>
            <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"><Plus className="h-4 w-4" />Nueva tarea</button>
          </div>
        </div>

        {showForm && (
          <div className="mb-6 rounded-lg border bg-white p-5">
            <h3 className="mb-4 font-semibold">Agregar nueva tarea</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Titulo *" className="col-span-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descripcion" rows={2} className="col-span-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Task["priority"] })} className="rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none">
                <option value="high">Prioridad Alta</option><option value="medium">Prioridad Media</option><option value="low">Prioridad Baja</option>
              </select>
              <input value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} type="date" className="rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              <input value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })} placeholder="Asignado a" className="rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              <input value={form.relatedTo} onChange={(e) => setForm({ ...form, relatedTo: e.target.value })} placeholder="Relacionado con" className="rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={handleAdd} className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover">Guardar</button>
              <button onClick={() => setShowForm(false)} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50">Cancelar</button>
            </div>
          </div>
        )}

        <div className="mb-4 flex gap-2 flex-wrap">
          {([["all","Todas"],["pending","Pendientes"],["in_progress","En progreso"],["completed","Completadas"]] as const).map(([key, label]) => (
            <button key={key} onClick={() => setFilter(key)} className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${filter === key ? "bg-brand text-white" : "border hover:bg-gray-50"}`}>{label}</button>
          ))}
        </div>

        {/* LIST VIEW */}
        {view === "list" && (
        <div className="space-y-2">
          {filtered.map((task) => {
            const StatusIcon = STATUS_ICONS[task.status];
            return (
              <div key={task.id} className={`group rounded-lg border bg-white p-4 transition-colors hover:shadow-sm ${task.status === "completed" ? "opacity-60" : ""}`}>
                <div className="flex items-start gap-3">
                  <button onClick={() => toggleStatus(task.id)} title="Cambiar estado">
                    <StatusIcon className={`mt-0.5 h-5 w-5 shrink-0 ${task.status === "completed" ? "text-green-500" : task.status === "in_progress" ? "text-brand" : "text-muted-foreground"}`} />
                  </button>
                  <div className="flex-1 cursor-pointer" onClick={() => openEdit(task)}>
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
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(task)} className="rounded p-1 hover:bg-blue-50 text-muted-foreground hover:text-brand" title="Editar"><Edit3 className="h-3.5 w-3.5" /></button>
                    <button onClick={() => duplicateTask(task)} className="rounded p-1 hover:bg-gray-100 text-muted-foreground hover:text-gray-700" title="Duplicar"><ClipboardCopy className="h-3.5 w-3.5" /></button>
                    <button onClick={() => copyTask(task)} className="rounded p-1 hover:bg-gray-100 text-muted-foreground hover:text-gray-700" title="Copiar JSON"><Tag className="h-3.5 w-3.5" /></button>
                    <button onClick={() => handleDelete(task.id)} className="rounded p-1 hover:bg-red-50 text-muted-foreground hover:text-red-500" title="Eliminar"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <div className="py-12 text-center text-muted-foreground">No hay tareas en este filtro.</div>}
        </div>
        )}

        {/* BOARD VIEW (Kanban by status) */}
        {view === "board" && (
          <div className="flex gap-3 overflow-x-auto pb-4">
            {(["pending", "in_progress", "completed"] as const).map(status => {
              const statusTasks = filtered.filter(t => t.status === status);
              const StatusIcon = STATUS_ICONS[status];
              const colors = { pending: "border-t-gray-400", in_progress: "border-t-blue-400", completed: "border-t-green-400" };
              return (
                <div key={status} className={`w-72 shrink-0 rounded-lg border border-t-4 ${colors[status]} bg-white`}>
                  <div className="flex items-center justify-between px-3 py-2.5 border-b">
                    <div className="flex items-center gap-1.5"><StatusIcon className="h-4 w-4" /><span className="text-xs font-semibold">{STATUS_LABELS[status]}</span></div>
                    <span className="text-[10px] text-muted-foreground">{statusTasks.length}</span>
                  </div>
                  <div className="p-2 space-y-2 max-h-[60vh] overflow-y-auto">
                    {statusTasks.map(task => (
                      <div key={task.id} className="group rounded-lg border p-3 hover:shadow-sm cursor-pointer" onClick={() => openEdit(task)}>
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-medium">{task.title}</h4>
                          <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium ${PRIORITY_STYLES[task.priority]}`}>{PRIORITY_LABELS[task.priority]}</span>
                        </div>
                        {task.dueDate && <p className="mt-1 text-[10px] text-muted-foreground flex items-center gap-1"><Calendar className="h-2.5 w-2.5" />{task.dueDate}</p>}
                        {task.assignee && <p className="mt-0.5 text-[10px] text-muted-foreground">{task.assignee}</p>}
                        <div className="mt-1.5 flex gap-1 opacity-0 group-hover:opacity-100">
                          <button onClick={e => { e.stopPropagation(); toggleStatus(task.id); }} className="rounded px-1.5 py-0.5 text-[9px] border hover:bg-gray-50">Mover</button>
                          <button onClick={e => { e.stopPropagation(); handleDelete(task.id); }} className="rounded px-1.5 py-0.5 text-[9px] border border-red-200 text-red-600 hover:bg-red-50">×</button>
                        </div>
                      </div>
                    ))}
                    {statusTasks.length === 0 && <p className="text-center text-[10px] text-muted-foreground py-6">Sin tareas</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CALENDAR VIEW */}
        {view === "calendar" && (() => {
          const today = new Date();
          const year = today.getFullYear();
          const month = today.getMonth();
          const firstDay = new Date(year, month, 1).getDay();
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          const days = Array.from({ length: 42 }, (_, i) => {
            const day = i - firstDay + 1;
            return day > 0 && day <= daysInMonth ? day : null;
          });
          const monthName = today.toLocaleString("es", { month: "long", year: "numeric" });

          return (
            <div className="rounded-lg border bg-white p-4">
              <h3 className="text-sm font-bold mb-3 capitalize">{monthName}</h3>
              <div className="grid grid-cols-7 gap-px text-center text-[10px] font-medium text-muted-foreground mb-1">
                {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map(d => <div key={d}>{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-px">
                {days.map((day, i) => {
                  if (!day) return <div key={i} className="h-20" />;
                  const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const dayTasks = tasks.filter(t => t.dueDate === dateStr);
                  const isToday = day === today.getDate();
                  return (
                    <div key={i} className={`h-20 border rounded p-1 overflow-hidden ${isToday ? "bg-brand/5 border-brand" : "hover:bg-gray-50"}`}>
                      <span className={`text-[10px] font-medium ${isToday ? "text-brand" : "text-muted-foreground"}`}>{day}</span>
                      <div className="space-y-0.5 mt-0.5">
                        {dayTasks.slice(0, 2).map(t => (
                          <div key={t.id} className={`rounded px-1 py-0.5 text-[8px] truncate cursor-pointer ${t.status === "completed" ? "bg-green-100 text-green-700 line-through" : t.priority === "high" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`} onClick={() => openEdit(t)}>{t.title}</div>
                        ))}
                        {dayTasks.length > 2 && <span className="text-[8px] text-muted-foreground">+{dayTasks.length - 2} más</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* GRID VIEW (compact cards) */}
        {view === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(task => {
              const StatusIcon = STATUS_ICONS[task.status];
              return (
                <div key={task.id} className={`group rounded-lg border bg-white p-3 hover:shadow-sm cursor-pointer ${task.status === "completed" ? "opacity-60" : ""}`} onClick={() => openEdit(task)}>
                  <div className="flex items-center gap-2 mb-1">
                    <StatusIcon className={`h-4 w-4 shrink-0 ${task.status === "completed" ? "text-green-500" : task.status === "in_progress" ? "text-brand" : "text-muted-foreground"}`} />
                    <h4 className={`text-xs font-semibold truncate ${task.status === "completed" ? "line-through" : ""}`}>{task.title}</h4>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium ${PRIORITY_STYLES[task.priority]}`}>{PRIORITY_LABELS[task.priority]}</span>
                    {task.dueDate && <span className="text-[9px] text-muted-foreground">{task.dueDate}</span>}
                    {task.category && <span className="text-[9px] text-brand">{task.category}</span>}
                  </div>
                  {task.assignee && <p className="mt-1 text-[9px] text-muted-foreground">{task.assignee}</p>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold">Editar tarea</h3>
              <button onClick={() => { setEditingTask(null); resetForm(); }} className="rounded p-1 hover:bg-gray-100"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs font-medium text-muted-foreground">Titulo</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" /></div>
              <div><label className="text-xs font-medium text-muted-foreground">Descripcion</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground">Estado</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value as Task["status"]})} className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none">
                    <option value="pending">Pendiente</option><option value="in_progress">En progreso</option><option value="completed">Completada</option>
                  </select>
                </div>
                <div><label className="text-xs font-medium text-muted-foreground">Prioridad</label>
                  <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value as Task["priority"]})} className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none">
                    <option value="high">Alta</option><option value="medium">Media</option><option value="low">Baja</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground">Fecha limite</label><input value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} type="date" className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" /></div>
                <div><label className="text-xs font-medium text-muted-foreground">Asignado a</label><input value={form.assignee} onChange={e => setForm({...form, assignee: e.target.value})} className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground">Relacionado con</label><input value={form.relatedTo} onChange={e => setForm({...form, relatedTo: e.target.value})} className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" /></div>
                <div><label className="text-xs font-medium text-muted-foreground">Categoria</label><input value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" /></div>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={handleUpdate} className="flex-1 rounded-md bg-brand py-2 text-sm font-medium text-white hover:bg-brand-hover">Guardar cambios</button>
                <button onClick={() => { setEditingTask(null); resetForm(); }} className="rounded-md border px-4 py-2 text-sm">Cancelar</button>
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
