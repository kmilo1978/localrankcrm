"use client";
import { useState, useEffect } from "react";
import { CalendarDays, CheckCircle2, Circle, Clock, Edit3, FolderKanban, Plus, Target, Trash2, Users, X } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";

type ProjectTask = { id: string; title: string; done: boolean; assignee: string };
type Milestone = { id: string; title: string; dueDate: string; completed: boolean };
type Project = {
  id: string; name: string; description: string; status: "planning" | "active" | "on_hold" | "completed";
  priority: "high" | "medium" | "low"; progress: number; startDate: string; endDate: string;
  team: string[]; milestones: Milestone[]; tasks: ProjectTask[]; color: string;
};

const STATUS_LABELS: Record<string, string> = { planning: "Planificacion", active: "Activo", on_hold: "En pausa", completed: "Completado" };
const STATUS_COLORS: Record<string, string> = { planning: "bg-blue-100 text-blue-700", active: "bg-green-100 text-green-700", on_hold: "bg-amber-100 text-amber-700", completed: "bg-gray-100 text-gray-600" };
const PRIORITY_COLORS: Record<string, string> = { high: "bg-red-100 text-red-700", medium: "bg-amber-100 text-amber-700", low: "bg-gray-100 text-gray-600" };
const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#ec4899"];

const SEED: Project[] = [
  { id: "p1", name: "Migración CRM Enterprise", description: "Migrar todos los datos del CRM anterior al nuevo sistema", status: "active", priority: "high", progress: 65, startDate: "2026-07-01", endDate: "2026-08-15", team: ["Juan Pérez", "Ana López"], color: "#3b82f6",
    milestones: [{ id: "m1", title: "Importar datos", dueDate: "2026-07-10", completed: true }, { id: "m2", title: "Validar integridad", dueDate: "2026-07-20", completed: false }, { id: "m3", title: "Go-live", dueDate: "2026-08-15", completed: false }],
    tasks: [{ id: "pt1", title: "Exportar CSV del sistema anterior", done: true, assignee: "Juan" }, { id: "pt2", title: "Mapear campos custom", done: true, assignee: "Ana" }, { id: "pt3", title: "Importar contactos", done: true, assignee: "Juan" }, { id: "pt4", title: "Verificar duplicados", done: false, assignee: "Ana" }, { id: "pt5", title: "Capacitar equipo", done: false, assignee: "Juan" }] },
  { id: "p2", name: "Campaña Outbound Q3", description: "Secuencia multicanal para 500 prospectos B2B", status: "planning", priority: "medium", progress: 20, startDate: "2026-07-15", endDate: "2026-09-30", team: ["María Gómez"], color: "#10b981",
    milestones: [{ id: "m4", title: "Definir ICP", dueDate: "2026-07-20", completed: true }, { id: "m5", title: "Crear secuencias", dueDate: "2026-07-30", completed: false }],
    tasks: [{ id: "pt6", title: "Segmentar base de datos", done: true, assignee: "María" }, { id: "pt7", title: "Redactar emails", done: false, assignee: "María" }] },
  { id: "p3", name: "Integración WhatsApp API", description: "Conectar WhatsApp Business API con el CRM", status: "completed", priority: "high", progress: 100, startDate: "2026-06-01", endDate: "2026-06-30", team: ["Juan Pérez"], color: "#8b5cf6",
    milestones: [{ id: "m6", title: "Config Meta", dueDate: "2026-06-10", completed: true }, { id: "m7", title: "Webhook activo", dueDate: "2026-06-20", completed: true }],
    tasks: [{ id: "pt8", title: "Crear app en Meta", done: true, assignee: "Juan" }, { id: "pt9", title: "Configurar webhook", done: true, assignee: "Juan" }] },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", priority: "medium" as Project["priority"], startDate: "", endDate: "", color: COLORS[0]! });
  const [taskInput, setTaskInput] = useState("");
  const [milestoneInput, setMilestoneInput] = useState({ title: "", dueDate: "" });
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [editForm, setEditForm] = useState({ name: "", description: "", status: "active" as Project["status"], priority: "medium" as Project["priority"], endDate: "" });

  useEffect(() => { setProjects(loadFromStorage("projects", SEED)); }, []);
  function save(u: Project[]) { setProjects(u); saveToStorage("projects", u); }

  const project = projects.find(p => p.id === selected);

  function addProject() {
    if (!form.name.trim()) return;
    const p: Project = { id: generateId(), name: form.name, description: form.description, status: "planning", priority: form.priority, progress: 0, startDate: form.startDate || new Date().toISOString().split("T")[0]!, endDate: form.endDate, team: [], milestones: [], tasks: [], color: form.color };
    save([p, ...projects]); setSelected(p.id); setShowForm(false);
    setForm({ name: "", description: "", priority: "medium", startDate: "", endDate: "", color: COLORS[0]! });
  }

  function deleteProject(id: string) { save(projects.filter(p => p.id !== id)); if (selected === id) setSelected(null); }

  function addTask() {
    if (!taskInput.trim() || !project) return;
    const t: ProjectTask = { id: generateId(), title: taskInput, done: false, assignee: "" };
    save(projects.map(p => p.id === selected ? { ...p, tasks: [...p.tasks, t] } : p));
    setTaskInput("");
  }

  function toggleTask(taskId: string) {
    if (!project) return;
    const updated = projects.map(p => {
      if (p.id !== selected) return p;
      const tasks = p.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t);
      const progress = tasks.length > 0 ? Math.round((tasks.filter(t => t.done).length / tasks.length) * 100) : 0;
      return { ...p, tasks, progress };
    });
    save(updated);
  }

  function deleteTask(taskId: string) {
    save(projects.map(p => p.id === selected ? { ...p, tasks: p.tasks.filter(t => t.id !== taskId) } : p));
  }

  function addMilestone() {
    if (!milestoneInput.title.trim() || !project) return;
    const m: Milestone = { id: generateId(), title: milestoneInput.title, dueDate: milestoneInput.dueDate, completed: false };
    save(projects.map(p => p.id === selected ? { ...p, milestones: [...p.milestones, m] } : p));
    setMilestoneInput({ title: "", dueDate: "" });
  }

  function toggleMilestone(mId: string) {
    save(projects.map(p => p.id === selected ? { ...p, milestones: p.milestones.map(m => m.id === mId ? { ...m, completed: !m.completed } : m) } : p));
  }

  function openEditProject(p: Project) { setEditProject(p); setEditForm({ name: p.name, description: p.description, status: p.status, priority: p.priority, endDate: p.endDate }); }
  function handleUpdateProject() {
    if (!editProject) return;
    save(projects.map(p => p.id === editProject.id ? { ...p, ...editForm } : p));
    setEditProject(null);
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-72 shrink-0 border-r bg-gray-50 flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-sm font-bold flex items-center gap-2"><FolderKanban className="h-4 w-4 text-brand" />Proyectos</h2>
          <button onClick={() => setShowForm(true)} className="rounded p-1 hover:bg-gray-200"><Plus className="h-4 w-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {projects.map(p => (
            <button key={p.id} onClick={() => setSelected(p.id)} className={`w-full text-left rounded-lg px-3 py-2.5 transition-colors ${selected === p.id ? "bg-brand/10 border border-brand/20" : "hover:bg-gray-100"}`}>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                <span className="text-xs font-medium truncate flex-1">{p.name}</span>
              </div>
              <div className="flex items-center gap-2 mt-1 ml-4.5">
                <div className="flex-1 h-1.5 rounded-full bg-gray-200"><div className="h-full rounded-full" style={{ width: p.progress + "%", backgroundColor: p.color }} /></div>
                <span className="text-[10px] text-muted-foreground">{p.progress}%</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-6">
        {project ? (
          <div className="max-w-4xl">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold">{project.name}</h1>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[project.status]}`}>{STATUS_LABELS[project.status]}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${PRIORITY_COLORS[project.priority]}`}>{project.priority === "high" ? "Alta" : project.priority === "medium" ? "Media" : "Baja"}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{project.startDate} → {project.endDate || "Sin fecha"}</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{project.team.length > 0 ? project.team.join(", ") : "Sin asignar"}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEditProject(project)} className="flex items-center gap-1 rounded border px-2 py-1.5 text-xs hover:bg-gray-50"><Edit3 className="h-3 w-3" />Editar</button>
                <button onClick={() => deleteProject(project.id)} className="flex items-center gap-1 rounded border px-2 py-1.5 text-xs text-red-500 hover:bg-red-50"><Trash2 className="h-3 w-3" /></button>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-6 rounded-lg border bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold">Progreso general</span>
                <span className="text-sm font-bold" style={{ color: project.color }}>{project.progress}%</span>
              </div>
              <div className="h-3 rounded-full bg-gray-100"><div className="h-full rounded-full transition-all" style={{ width: project.progress + "%", backgroundColor: project.color }} /></div>
            </div>

            {/* Milestones */}
            <div className="mb-6 rounded-lg border bg-white p-4">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-3 flex items-center gap-1"><Target className="h-3.5 w-3.5" />Hitos</h3>
              <div className="space-y-2 mb-3">
                {project.milestones.map(m => (
                  <div key={m.id} className="flex items-center gap-3 text-sm">
                    <button onClick={() => toggleMilestone(m.id)}>{m.completed ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4 text-muted-foreground" />}</button>
                    <span className={m.completed ? "line-through text-muted-foreground" : ""}>{m.title}</span>
                    {m.dueDate && <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{m.dueDate}</span>}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={milestoneInput.title} onChange={e => setMilestoneInput({...milestoneInput, title: e.target.value})} placeholder="Nuevo hito..." className="flex-1 rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none" />
                <input value={milestoneInput.dueDate} onChange={e => setMilestoneInput({...milestoneInput, dueDate: e.target.value})} type="date" className="rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none" />
                <button onClick={addMilestone} className="rounded bg-brand px-3 py-1.5 text-xs text-white hover:bg-brand-hover">Agregar</button>
              </div>
            </div>

            {/* Tasks */}
            <div className="rounded-lg border bg-white p-4">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-3">Tareas ({project.tasks.filter(t => t.done).length}/{project.tasks.length})</h3>
              <div className="space-y-1.5 mb-3">
                {project.tasks.map(t => (
                  <div key={t.id} className="group flex items-center gap-2 rounded px-2 py-1.5 hover:bg-gray-50">
                    <button onClick={() => toggleTask(t.id)}>{t.done ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4 text-muted-foreground" />}</button>
                    <span className={`flex-1 text-sm ${t.done ? "line-through text-muted-foreground" : ""}`}>{t.title}</span>
                    {t.assignee && <span className="text-[10px] text-muted-foreground">{t.assignee}</span>}
                    <button onClick={() => deleteTask(t.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={taskInput} onChange={e => setTaskInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") addTask(); }} placeholder="Nueva tarea..." className="flex-1 rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none" />
                <button onClick={addTask} className="rounded bg-brand px-3 py-1.5 text-xs text-white hover:bg-brand-hover">Agregar</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground text-sm">Selecciona un proyecto o crea uno nuevo</div>
        )}
      </div>

      {/* New Project Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl mx-4">
            <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-bold">Nuevo proyecto</h3><button onClick={() => setShowForm(false)} className="rounded p-1 hover:bg-gray-100"><X className="h-4 w-4" /></button></div>
            <div className="space-y-3">
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Nombre del proyecto *" className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Descripcion" rows={2} className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value as Project["priority"]})} className="rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none"><option value="high">Alta</option><option value="medium">Media</option><option value="low">Baja</option></select>
                <input value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} type="date" placeholder="Fecha limite" className="rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              </div>
              <div className="flex gap-1">{COLORS.map(c => <button key={c} onClick={() => setForm({...form, color: c})} className={`h-6 w-6 rounded-full border-2 ${form.color === c ? "border-gray-800 scale-110" : "border-transparent"}`} style={{ backgroundColor: c }} />)}</div>
              <button onClick={addProject} className="w-full rounded-md bg-brand py-2 text-sm font-medium text-white hover:bg-brand-hover">Crear proyecto</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {editProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl mx-4">
            <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-bold">Editar proyecto</h3><button onClick={() => setEditProject(null)} className="rounded p-1 hover:bg-gray-100"><X className="h-4 w-4" /></button></div>
            <div className="space-y-3">
              <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              <textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} rows={2} className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value as Project["status"]})} className="rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none"><option value="planning">Planificacion</option><option value="active">Activo</option><option value="on_hold">En pausa</option><option value="completed">Completado</option></select>
                <select value={editForm.priority} onChange={e => setEditForm({...editForm, priority: e.target.value as Project["priority"]})} className="rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none"><option value="high">Alta</option><option value="medium">Media</option><option value="low">Baja</option></select>
              </div>
              <button onClick={handleUpdateProject} className="w-full rounded-md bg-brand py-2 text-sm font-medium text-white hover:bg-brand-hover">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
