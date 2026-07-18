"use client";
import { useState, useEffect, useRef } from "react";
import { Bot, CalendarDays, Check, CheckCircle2, Circle, Clock, Copy, Edit3, FolderKanban, GitBranch, Kanban, LayoutList, MessageSquare, Network, Plus, Send, Share2, StickyNote, Target, Trash2, UserPlus, Users, X, XCircle } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";

type ProjectNote = { id: string; text: string; author: string; date: string };
type ProjectTask = { id: string; title: string; done: boolean; assignee: string };
type Milestone = { id: string; title: string; dueDate: string; completed: boolean };
type ChangeLog = { id: string; user: string; action: string; date: string; approved: boolean | null };
type SubAccount = { id: string; name: string; description: string; responsible: string };
type SharedUser = { id: string; name: string; role: "editor" | "viewer" };
type AiMessage = { id: string; role: "user" | "ai"; text: string };
type Project = {
  id: string; name: string; description: string; status: "planning" | "active" | "on_hold" | "completed";
  priority: "high" | "medium" | "low"; progress: number; startDate: string; endDate: string;
  team: string[]; milestones: Milestone[]; tasks: ProjectTask[]; notes: ProjectNote[];
  subAccounts: SubAccount[]; sharedWith: SharedUser[]; changeLog: ChangeLog[];
  color: string;
};

const STATUS_LABELS: Record<string, string> = { planning: "Planificacion", active: "Activo", on_hold: "En pausa", completed: "Completado" };
const STATUS_COLORS: Record<string, string> = { planning: "bg-blue-100 text-blue-700", active: "bg-green-100 text-green-700", on_hold: "bg-amber-100 text-amber-700", completed: "bg-gray-100 text-gray-600" };
const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#ec4899"];

const SEED: Project[] = [
  { id: "p1", name: "Migracion CRM Enterprise", description: "Migrar todos los datos del CRM anterior al nuevo sistema", status: "active", priority: "high", progress: 65, startDate: "2026-07-01", endDate: "2026-08-15", team: ["Juan Perez", "Ana Lopez"], color: "#3b82f6",
    milestones: [{ id: "m1", title: "Importar datos", dueDate: "2026-07-10", completed: true }, { id: "m2", title: "Validar integridad", dueDate: "2026-07-20", completed: false }],
    tasks: [{ id: "pt1", title: "Exportar CSV del sistema anterior", done: true, assignee: "Juan" }, { id: "pt2", title: "Mapear campos custom", done: true, assignee: "Ana" }, { id: "pt3", title: "Verificar duplicados", done: false, assignee: "Ana" }],
    notes: [{ id: "pn1", text: "El cliente aprobo el timeline de 6 semanas", author: "Admin", date: "2026-07-15" }, { id: "pn2", text: "Priorizar contactos activos sobre archivados", author: "Juan", date: "2026-07-12" }],
    subAccounts: [{ id: "sa1", name: "Fase 1 - Datos", description: "Migracion de contactos y empresas", responsible: "Juan" }, { id: "sa2", name: "Fase 2 - Pipeline", description: "Migracion de oportunidades", responsible: "Ana" }],
    sharedWith: [{ id: "sh1", name: "Juan Perez", role: "editor" }, { id: "sh2", name: "Ana Lopez", role: "editor" }],
    changeLog: [{ id: "cl1", user: "Admin", action: "Creo el proyecto", date: "2026-07-01", approved: true }, { id: "cl2", user: "Juan", action: "Agrego subcuenta Fase 2", date: "2026-07-05", approved: true }, { id: "cl3", user: "Ana", action: "Cambio fecha limite a Ago 15", date: "2026-07-10", approved: null }],
  },
  { id: "p2", name: "Campana Outbound Q3", description: "Secuencia multicanal para 500 prospectos B2B", status: "planning", priority: "medium", progress: 20, startDate: "2026-07-15", endDate: "2026-09-30", team: ["Maria Gomez"], color: "#10b981",
    milestones: [{ id: "m4", title: "Definir ICP", dueDate: "2026-07-20", completed: true }],
    tasks: [{ id: "pt6", title: "Segmentar base", done: true, assignee: "Maria" }, { id: "pt7", title: "Redactar emails", done: false, assignee: "Maria" }],
    notes: [{ id: "pn3", text: "Usar templates de cold email aprobados", author: "Admin", date: "2026-07-14" }],
    subAccounts: [], sharedWith: [{ id: "sh3", name: "Maria Gomez", role: "editor" }],
    changeLog: [{ id: "cl4", user: "Admin", action: "Creo proyecto", date: "2026-07-15", approved: true }],
  },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "board" | "table" | "mindmap">("list");
  const [tab, setTab] = useState<"tasks" | "notes" | "sub" | "shared" | "log" | "ai">("tasks");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", priority: "medium" as Project["priority"], endDate: "", color: COLORS[0]! });
  const [taskInput, setTaskInput] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [subForm, setSubForm] = useState({ name: "", description: "", responsible: "" });
  const [shareInput, setShareInput] = useState("");
  const [aiMessages, setAiMessages] = useState<AiMessage[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [toast, setToast] = useState("");
  const aiEnd = useRef<HTMLDivElement>(null);

  useEffect(() => { setProjects(loadFromStorage("projects_v2", SEED)); }, []);
  function save(u: Project[]) { setProjects(u); saveToStorage("projects_v2", u); }
  function notify(m: string) { setToast(m); setTimeout(() => setToast(""), 2500); }

  const project = projects.find(p => p.id === selected);

  function addProject() {
    if (!form.name.trim()) return;
    const p: Project = { id: generateId(), name: form.name, description: form.description, status: "planning", priority: form.priority, progress: 0, startDate: new Date().toISOString().split("T")[0]!, endDate: form.endDate, team: [], milestones: [], tasks: [], notes: [], subAccounts: [], sharedWith: [], changeLog: [{ id: generateId(), user: "Admin", action: "Creo el proyecto", date: new Date().toISOString().split("T")[0]!, approved: true }], color: form.color };
    save([p, ...projects]); setSelected(p.id); setShowForm(false);
    setForm({ name: "", description: "", priority: "medium", endDate: "", color: COLORS[0]! });
  }

  function deleteProject(id: string) { save(projects.filter(p => p.id !== id)); if (selected === id) setSelected(null); }

  function duplicateProject(p: Project) {
    const copy: Project = { ...p, id: generateId(), name: p.name + " (copia)", tasks: p.tasks.map(t => ({...t, id: generateId(), done: false})), notes: [], changeLog: [{ id: generateId(), user: "Admin", action: "Duplico desde " + p.name, date: new Date().toISOString().split("T")[0]!, approved: true }], createdAt: new Date().toISOString().split("T")[0]! } as Project;
    save([copy, ...projects]); notify("Proyecto duplicado");
  }

  function logChange(action: string) {
    if (!project) return;
    save(projects.map(p => p.id === selected ? { ...p, changeLog: [...p.changeLog, { id: generateId(), user: "Admin", action, date: new Date().toLocaleString("es-CO"), approved: null }] } : p));
  }

  // Tasks
  function addTask() {
    if (!taskInput.trim() || !project) return;
    save(projects.map(p => p.id === selected ? { ...p, tasks: [...p.tasks, { id: generateId(), title: taskInput, done: false, assignee: "" }] } : p));
    logChange("Agrego tarea: " + taskInput);
    setTaskInput("");
  }
  function toggleTask(taskId: string) {
    save(projects.map(p => {
      if (p.id !== selected) return p;
      const tasks = p.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t);
      const progress = tasks.length > 0 ? Math.round((tasks.filter(t => t.done).length / tasks.length) * 100) : 0;
      return { ...p, tasks, progress };
    }));
  }
  function deleteTask(taskId: string) { save(projects.map(p => p.id === selected ? { ...p, tasks: p.tasks.filter(t => t.id !== taskId) } : p)); }

  // Notes
  function addNote() {
    if (!noteInput.trim() || !project) return;
    save(projects.map(p => p.id === selected ? { ...p, notes: [{ id: generateId(), text: noteInput, author: "Admin", date: new Date().toISOString().split("T")[0]! }, ...p.notes] } : p));
    logChange("Agrego nota");
    setNoteInput("");
  }
  function deleteNote(noteId: string) { save(projects.map(p => p.id === selected ? { ...p, notes: p.notes.filter(n => n.id !== noteId) } : p)); }

  // Sub-accounts
  function addSubAccount() {
    if (!subForm.name.trim() || !project) return;
    save(projects.map(p => p.id === selected ? { ...p, subAccounts: [...p.subAccounts, { id: generateId(), ...subForm }] } : p));
    logChange("Creo subcuenta: " + subForm.name);
    setSubForm({ name: "", description: "", responsible: "" });
  }
  function deleteSubAccount(saId: string) { save(projects.map(p => p.id === selected ? { ...p, subAccounts: p.subAccounts.filter(sa => sa.id !== saId) } : p)); }

  // Sharing
  function shareProject() {
    if (!shareInput.trim() || !project) return;
    save(projects.map(p => p.id === selected ? { ...p, sharedWith: [...p.sharedWith, { id: generateId(), name: shareInput, role: "editor" }] } : p));
    logChange("Compartio con " + shareInput);
    setShareInput(""); notify("Compartido con " + shareInput);
  }
  function removeShare(shId: string) { save(projects.map(p => p.id === selected ? { ...p, sharedWith: p.sharedWith.filter(s => s.id !== shId) } : p)); }

  // Approvals
  function approveChange(clId: string, approved: boolean) {
    save(projects.map(p => p.id === selected ? { ...p, changeLog: p.changeLog.map(cl => cl.id === clId ? { ...cl, approved } : cl) } : p));
    notify(approved ? "Aprobado" : "Rechazado");
  }

  // AI Chat
  function sendAiMessage() {
    if (!aiInput.trim() || !project) return;
    const userMsg: AiMessage = { id: generateId(), role: "user", text: aiInput };
    setAiMessages(prev => [...prev, userMsg]);
    const q = aiInput; setAiInput("");

    setTimeout(() => {
      const tasksDone = project.tasks.filter(t => t.done).length;
      const totalTasks = project.tasks.length;
      const pendingApprovals = project.changeLog.filter(cl => cl.approved === null).length;
      let response = "";
      if (q.toLowerCase().includes("progreso") || q.toLowerCase().includes("estado")) {
        response = `El proyecto "${project.name}" esta al ${project.progress}% de progreso.\n\nTareas: ${tasksDone}/${totalTasks} completadas.\nEstado: ${STATUS_LABELS[project.status]}\nSubcuentas: ${project.subAccounts.length}\nNotas: ${project.notes.length}\n${pendingApprovals > 0 ? `\n⚠️ ${pendingApprovals} cambios pendientes de aprobacion.` : ""}`;
      } else if (q.toLowerCase().includes("tarea") || q.toLowerCase().includes("pendiente")) {
        const pending = project.tasks.filter(t => !t.done);
        response = pending.length > 0 ? `Tareas pendientes (${pending.length}):\n\n${pending.map((t, i) => `${i+1}. ${t.title}${t.assignee ? " → " + t.assignee : ""}`).join("\n")}` : "No hay tareas pendientes. El proyecto esta completo en tareas.";
      } else if (q.toLowerCase().includes("equipo") || q.toLowerCase().includes("quien")) {
        response = `Equipo del proyecto:\n\n${project.sharedWith.map(s => `• ${s.name} (${s.role})`).join("\n") || "Sin miembros compartidos aun."}`;
      } else if (q.toLowerCase().includes("nota")) {
        response = project.notes.length > 0 ? `Ultimas notas:\n\n${project.notes.slice(0, 5).map(n => `• ${n.text} — ${n.author}, ${n.date}`).join("\n")}` : "No hay notas en este proyecto.";
      } else {
        response = `Proyecto: ${project.name}\nEstado: ${STATUS_LABELS[project.status]} (${project.progress}%)\nTareas: ${tasksDone}/${totalTasks}\nSubcuentas: ${project.subAccounts.length}\nCompartido con: ${project.sharedWith.length} personas\n\nPuedes preguntarme sobre: progreso, tareas pendientes, equipo, notas, subcuentas.`;
      }
      setAiMessages(prev => [...prev, { id: generateId(), role: "ai", text: response }]);
      setTimeout(() => aiEnd.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }, 800);
  }

  return (
    <div className="flex h-full flex-col">
      {/* View mode toggle bar */}
      <div className="flex items-center justify-between border-b px-4 py-2 bg-white shrink-0">
        <div className="flex items-center gap-1">
          {([["list", LayoutList, "Lista"], ["board", Kanban, "Tablero"], ["table", LayoutList, "Mesa"], ["mindmap", Network, "Mapa mental"]] as const).map(([mode, Icon, label]) => (
            <button key={mode} onClick={() => setViewMode(mode)} className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${viewMode === mode ? "bg-brand text-white" : "hover:bg-gray-100 text-muted-foreground"}`}>
              <Icon className="h-3.5 w-3.5" /><span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-hover"><Plus className="h-3.5 w-3.5" />Nuevo</button>
      </div>

      {/* BOARD VIEW */}
      {viewMode === "board" && (
        <div className="flex-1 overflow-x-auto p-4">
          <div className="flex gap-3 min-h-full">
            {(["planning","active","on_hold","completed"] as const).map(status => {
              const statusProjects = projects.filter(p => p.status === status);
              return (
                <div key={status} className="w-64 shrink-0">
                  <div className="mb-2 flex items-center justify-between"><span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[status]}`}>{STATUS_LABELS[status]}</span><span className="text-[10px] text-muted-foreground">{statusProjects.length}</span></div>
                  <div className="space-y-2 min-h-[200px] rounded-lg border border-dashed p-2 bg-gray-50/30">
                    {statusProjects.map(p => (
                      <div key={p.id} onClick={() => { setSelected(p.id); setViewMode("list"); }} className="rounded-lg border bg-white p-3 cursor-pointer hover:shadow-sm">
                        <div className="flex items-center gap-2 mb-1"><span className="h-2 w-2 rounded-full" style={{backgroundColor: p.color}} /><span className="text-xs font-medium">{p.name}</span></div>
                        <div className="flex items-center gap-2"><div className="flex-1 h-1 rounded-full bg-gray-200"><div className="h-full rounded-full" style={{width: p.progress+"%", backgroundColor: p.color}} /></div><span className="text-[9px]">{p.progress}%</span></div>
                        <div className="mt-1.5 flex gap-1 text-[9px] text-muted-foreground"><span>{p.tasks.length} tareas</span><span>·</span><span>{p.sharedWith.length} miembros</span></div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === "table" && (
        <div className="flex-1 overflow-auto p-4">
          <div className="rounded-lg border bg-white overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-[10px] font-medium uppercase text-muted-foreground">Proyecto</th>
                  <th className="px-3 py-2 text-left text-[10px] font-medium uppercase text-muted-foreground">Estado</th>
                  <th className="px-3 py-2 text-center text-[10px] font-medium uppercase text-muted-foreground">Progreso</th>
                  <th className="px-3 py-2 text-center text-[10px] font-medium uppercase text-muted-foreground">Tareas</th>
                  <th className="px-3 py-2 text-center text-[10px] font-medium uppercase text-muted-foreground">Subcuentas</th>
                  <th className="px-3 py-2 text-center text-[10px] font-medium uppercase text-muted-foreground">Equipo</th>
                  <th className="px-3 py-2 text-left text-[10px] font-medium uppercase text-muted-foreground">Fecha fin</th>
                </tr>
              </thead>
              <tbody>
                {projects.map(p => (
                  <tr key={p.id} onClick={() => { setSelected(p.id); setViewMode("list"); }} className="border-b hover:bg-gray-50 cursor-pointer">
                    <td className="px-3 py-2.5"><div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{backgroundColor: p.color}} /><span className="text-sm font-medium">{p.name}</span></div></td>
                    <td className="px-3 py-2.5"><span className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${STATUS_COLORS[p.status]}`}>{STATUS_LABELS[p.status]}</span></td>
                    <td className="px-3 py-2.5 text-center"><div className="flex items-center gap-2 justify-center"><div className="w-16 h-1.5 rounded-full bg-gray-200"><div className="h-full rounded-full" style={{width: p.progress+"%", backgroundColor: p.color}} /></div><span className="text-xs">{p.progress}%</span></div></td>
                    <td className="px-3 py-2.5 text-center text-xs">{p.tasks.filter(t=>t.done).length}/{p.tasks.length}</td>
                    <td className="px-3 py-2.5 text-center text-xs">{p.subAccounts.length}</td>
                    <td className="px-3 py-2.5 text-center text-xs">{p.sharedWith.length}</td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">{p.endDate || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MIND MAP VIEW */}
      {viewMode === "mindmap" && (
        <div className="flex-1 overflow-auto p-6">
          <div className="flex flex-col items-center gap-6">
            {projects.map(p => (
              <div key={p.id} className="w-full max-w-3xl">
                {/* Project node */}
                <div onClick={() => { setSelected(p.id); setViewMode("list"); }} className="cursor-pointer mx-auto w-fit rounded-xl border-2 px-5 py-3 bg-white shadow-sm hover:shadow-md transition-shadow" style={{borderColor: p.color}}>
                  <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full" style={{backgroundColor: p.color}} /><span className="text-sm font-bold">{p.name}</span><span className={`rounded-full px-2 py-0.5 text-[8px] font-medium ${STATUS_COLORS[p.status]}`}>{STATUS_LABELS[p.status]}</span></div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{p.progress}% · {p.tasks.length} tareas · {p.subAccounts.length} subcuentas</p>
                </div>
                {/* Branches */}
                {(p.subAccounts.length > 0 || p.tasks.filter(t => !t.done).length > 0) && (
                  <div className="mt-2 flex justify-center"><div className="w-px h-4 bg-gray-300" /></div>
                )}
                <div className="flex flex-wrap justify-center gap-3 mt-1">
                  {p.subAccounts.map(sa => (
                    <div key={sa.id} className="rounded-lg border bg-blue-50 px-3 py-2 text-center min-w-[120px]">
                      <p className="text-[10px] font-semibold text-blue-700">{sa.name}</p>
                      <p className="text-[8px] text-blue-500">{sa.responsible}</p>
                    </div>
                  ))}
                  {p.tasks.filter(t => !t.done).slice(0, 4).map(t => (
                    <div key={t.id} className="rounded-lg border bg-amber-50 px-3 py-2 text-center min-w-[100px]">
                      <p className="text-[10px] font-medium text-amber-700 truncate max-w-[120px]">{t.title}</p>
                      <p className="text-[8px] text-amber-500">{t.assignee || "Sin asignar"}</p>
                    </div>
                  ))}
                  {p.tasks.filter(t => !t.done).length > 4 && <div className="rounded-lg border bg-gray-50 px-3 py-2 text-center"><p className="text-[10px] text-muted-foreground">+{p.tasks.filter(t => !t.done).length - 4} mas</p></div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LIST VIEW (original sidebar + detail) */}
      {viewMode === "list" && (
      <div className="flex flex-1 flex-col md:flex-row min-h-0">
      {/* Sidebar */}
      <div className="w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r bg-gray-50 flex flex-col max-h-48 md:max-h-none">
        <div className="p-3 border-b flex items-center justify-between">
          <h2 className="text-xs font-bold flex items-center gap-1.5"><FolderKanban className="h-3.5 w-3.5 text-brand" />Proyectos</h2>
          <button onClick={() => setShowForm(true)} className="rounded bg-brand text-white p-1.5 hover:bg-brand-hover"><Plus className="h-3.5 w-3.5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {projects.map(p => (
            <button key={p.id} onClick={() => { setSelected(p.id); setAiMessages([]); }} className={`w-full text-left rounded-lg px-3 py-2 transition-colors ${selected === p.id ? "bg-brand/10 border border-brand/20" : "hover:bg-gray-100"}`}>
              <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} /><span className="text-xs font-medium truncate">{p.name}</span></div>
              <div className="flex items-center gap-2 mt-1 ml-4"><div className="flex-1 h-1 rounded-full bg-gray-200"><div className="h-full rounded-full" style={{ width: p.progress+"%", backgroundColor: p.color }} /></div><span className="text-[9px] text-muted-foreground">{p.progress}%</span></div>
            </button>
          ))}
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 overflow-y-auto p-4 md:p-5">
        {project ? (
          <div className="max-w-4xl">
            {/* Header */}
            <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
              <div>
                <h1 className="text-lg font-bold flex items-center gap-2">{project.name} <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${STATUS_COLORS[project.status]}`}>{STATUS_LABELS[project.status]}</span></h1>
                <p className="text-xs text-muted-foreground">{project.description}</p>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{project.startDate} → {project.endDate || "Sin fecha"}</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{project.sharedWith.length} compartidos</span>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => duplicateProject(project)} className="rounded border px-2 py-1 text-xs hover:bg-gray-50"><Copy className="h-3 w-3" /></button>
                <button onClick={() => deleteProject(project.id)} className="rounded border px-2 py-1 text-xs text-red-500 hover:bg-red-50"><Trash2 className="h-3 w-3" /></button>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-4 flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full bg-gray-100"><div className="h-full rounded-full transition-all" style={{ width: project.progress+"%", backgroundColor: project.color }} /></div>
              <span className="text-xs font-bold">{project.progress}%</span>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-4 border-b pb-2 flex-wrap">
              {([["tasks","Tareas"],["notes","Notas"],["sub","Subcuentas"],["shared","Compartir"],["log","Cambios"],["ai","IA"]] as const).map(([k,l]) => (
                <button key={k} onClick={() => setTab(k)} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${tab === k ? "bg-brand text-white" : "hover:bg-gray-100"}`}>{l}{k === "log" && project.changeLog.filter(c => c.approved === null).length > 0 ? ` (${project.changeLog.filter(c => c.approved === null).length})` : ""}</button>
              ))}
            </div>

            {/* Tasks tab */}
            {tab === "tasks" && (
              <div className="space-y-1.5 mb-3">
                {project.tasks.map(t => (
                  <div key={t.id} className="group flex items-center gap-2 rounded px-2 py-1.5 hover:bg-gray-50">
                    <button onClick={() => toggleTask(t.id)}>{t.done ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4 text-muted-foreground" />}</button>
                    <span className={`flex-1 text-sm ${t.done ? "line-through text-muted-foreground" : ""}`}>{t.title}</span>
                    <button onClick={() => deleteTask(t.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                  </div>
                ))}
                <div className="flex gap-2 mt-3">
                  <input value={taskInput} onChange={e => setTaskInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") addTask(); }} placeholder="Nueva tarea..." className="flex-1 rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
                  <button onClick={addTask} disabled={!taskInput.trim()} className="rounded bg-brand px-3 py-2 text-xs text-white hover:bg-brand-hover disabled:opacity-50">Agregar</button>
                </div>
              </div>
            )}

            {/* Notes tab */}
            {tab === "notes" && (
              <div>
                <div className="flex gap-2 mb-3">
                  <input value={noteInput} onChange={e => setNoteInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") addNote(); }} placeholder="Agregar nota..." className="flex-1 rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
                  <button onClick={addNote} disabled={!noteInput.trim()} className="rounded bg-brand px-3 py-2 text-xs text-white hover:bg-brand-hover disabled:opacity-50">+</button>
                </div>
                <div className="space-y-2">
                  {project.notes.map(n => (
                    <div key={n.id} className="group flex gap-2 rounded border bg-gray-50 p-3 text-xs">
                      <StickyNote className="h-3.5 w-3.5 text-brand shrink-0 mt-0.5" />
                      <div className="flex-1"><p>{n.text}</p><span className="text-[9px] text-muted-foreground">{n.author} · {n.date}</span></div>
                      <button onClick={() => deleteNote(n.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 shrink-0"><Trash2 className="h-3 w-3" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-accounts tab */}
            {tab === "sub" && (
              <div>
                <div className="space-y-2 mb-3">
                  {project.subAccounts.map(sa => (
                    <div key={sa.id} className="group flex items-center gap-3 rounded border p-3">
                      <div className="flex-1"><p className="text-sm font-medium">{sa.name}</p><p className="text-[10px] text-muted-foreground">{sa.description} · {sa.responsible}</p></div>
                      <button onClick={() => deleteSubAccount(sa.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <input value={subForm.name} onChange={e => setSubForm({...subForm, name: e.target.value})} placeholder="Nombre subcuenta *" className="rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none flex-1" />
                  <input value={subForm.description} onChange={e => setSubForm({...subForm, description: e.target.value})} placeholder="Descripcion" className="rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none flex-1" />
                  <input value={subForm.responsible} onChange={e => setSubForm({...subForm, responsible: e.target.value})} placeholder="Responsable" className="rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none w-28" />
                  <button onClick={addSubAccount} disabled={!subForm.name.trim()} className="rounded bg-brand px-3 py-1.5 text-xs text-white hover:bg-brand-hover disabled:opacity-50">Crear</button>
                </div>
              </div>
            )}

            {/* Shared tab */}
            {tab === "shared" && (
              <div>
                <div className="flex gap-2 mb-3">
                  <input value={shareInput} onChange={e => setShareInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") shareProject(); }} placeholder="Nombre o email del usuario..." className="flex-1 rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
                  <button onClick={shareProject} disabled={!shareInput.trim()} className="flex items-center gap-1 rounded bg-brand px-3 py-2 text-xs text-white hover:bg-brand-hover disabled:opacity-50"><Share2 className="h-3 w-3" />Compartir</button>
                </div>
                <div className="space-y-2">
                  {project.sharedWith.map(s => (
                    <div key={s.id} className="flex items-center justify-between rounded border px-3 py-2">
                      <div className="flex items-center gap-2"><UserPlus className="h-3.5 w-3.5 text-brand" /><span className="text-sm font-medium">{s.name}</span><span className="text-[9px] rounded-full bg-gray-100 px-2 py-0.5">{s.role}</span></div>
                      <button onClick={() => removeShare(s.id)} className="text-muted-foreground hover:text-red-500"><X className="h-3.5 w-3.5" /></button>
                    </div>
                  ))}
                  {project.sharedWith.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No compartido con nadie aun.</p>}
                </div>
              </div>
            )}

            {/* Change log tab */}
            {tab === "log" && (
              <div className="space-y-2">
                {project.changeLog.map(cl => (
                  <div key={cl.id} className="flex items-center gap-3 rounded border px-3 py-2 text-xs">
                    <div className="flex-1">
                      <p><strong>{cl.user}</strong>: {cl.action}</p>
                      <span className="text-[9px] text-muted-foreground">{cl.date}</span>
                    </div>
                    {cl.approved === true && <span className="flex items-center gap-1 text-green-600"><Check className="h-3 w-3" />Aprobado</span>}
                    {cl.approved === false && <span className="flex items-center gap-1 text-red-500"><XCircle className="h-3 w-3" />Rechazado</span>}
                    {cl.approved === null && (
                      <div className="flex gap-1">
                        <button onClick={() => approveChange(cl.id, true)} className="rounded bg-green-50 border border-green-200 px-2 py-1 text-[10px] text-green-700 hover:bg-green-100">Aprobar</button>
                        <button onClick={() => approveChange(cl.id, false)} className="rounded bg-red-50 border border-red-200 px-2 py-1 text-[10px] text-red-600 hover:bg-red-100">Rechazar</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* AI tab */}
            {tab === "ai" && (
              <div className="flex flex-col h-80 rounded-lg border bg-gray-50">
                <div className="flex items-center gap-2 px-3 py-2 border-b bg-white rounded-t-lg">
                  <Bot className="h-4 w-4 text-brand" />
                  <span className="text-xs font-semibold">IA del Proyecto</span>
                  <span className="text-[9px] text-muted-foreground ml-auto">Pregunta sobre progreso, tareas, equipo...</span>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {aiMessages.length === 0 && <p className="text-xs text-muted-foreground text-center py-8">Preguntame sobre este proyecto: progreso, tareas pendientes, equipo, notas...</p>}
                  {aiMessages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-lg px-3 py-2 text-xs whitespace-pre-wrap ${msg.role === "user" ? "bg-brand text-white" : "bg-white border"}`}>{msg.text}</div>
                    </div>
                  ))}
                  <div ref={aiEnd} />
                </div>
                <div className="border-t p-2 flex gap-2">
                  <input value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") sendAiMessage(); }} placeholder="Pregunta algo..." className="flex-1 rounded border px-3 py-1.5 text-xs focus:border-brand focus:outline-none" />
                  <button onClick={sendAiMessage} disabled={!aiInput.trim()} className="rounded bg-brand p-1.5 text-white hover:bg-brand-hover disabled:opacity-50"><Send className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-muted-foreground gap-3">
            <FolderKanban className="h-12 w-12 text-gray-300" />
            <p className="text-sm">Selecciona un proyecto o crea uno nuevo</p>
            <button onClick={() => setShowForm(true)} className="rounded-md bg-brand px-4 py-2 text-sm text-white hover:bg-brand-hover">Nuevo proyecto</button>
          </div>
        )}
      </div>
      </div>
      )}

      {/* New Project Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl mx-4">
            <div className="flex justify-between mb-4"><h3 className="text-sm font-bold">Nuevo proyecto</h3><button onClick={() => setShowForm(false)} className="rounded p-1 hover:bg-gray-100"><X className="h-4 w-4" /></button></div>
            <div className="space-y-3">
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Nombre *" className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Descripcion" rows={2} className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value as Project["priority"]})} className="rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none"><option value="high">Alta</option><option value="medium">Media</option><option value="low">Baja</option></select>
                <input value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} type="date" className="rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              </div>
              <div className="flex gap-1">{COLORS.map(c => <button key={c} onClick={() => setForm({...form, color: c})} className={`h-6 w-6 rounded-full border-2 ${form.color === c ? "border-gray-800 scale-110" : "border-transparent"}`} style={{ backgroundColor: c }} />)}</div>
              <button onClick={addProject} disabled={!form.name.trim()} className="w-full rounded-md bg-brand py-2 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50">Crear proyecto</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-lg">{toast}</div>}
    </div>
  );
}
