"use client";
import { useState, useEffect } from "react";
import { Bot, CheckCircle2, ChevronRight, Circle, Copy, Edit3, FolderKanban, FolderPlus, Plus, Send, Trash2, X } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";

type ProjectNote = { id: string; text: string; author: string; date: string };
type ProjectTask = { id: string; title: string; done: boolean };
type SubProject = { id: string; name: string; description: string; tasks: ProjectTask[]; notes: ProjectNote[]; color: string };
type Project = {
  id: string; name: string; description: string; color: string;
  subProjects: SubProject[]; tasks: ProjectTask[]; notes: ProjectNote[];
  createdAt: string;
};

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#ec4899", "#f97316"];

const SEED: Project[] = [
  { id: "p1", name: "Migracion CRM Enterprise", description: "Migrar datos del sistema anterior", color: "#3b82f6", createdAt: "2026-07-01",
    tasks: [{ id: "t1", title: "Exportar CSV", done: true }, { id: "t2", title: "Mapear campos", done: true }, { id: "t3", title: "Importar contactos", done: false }],
    notes: [{ id: "n1", text: "Cliente aprobo timeline de 6 semanas", author: "Admin", date: "2026-07-15" }],
    subProjects: [
      { id: "sp1", name: "Fase 1 - Datos", description: "Contactos y empresas", color: "#06b6d4", tasks: [{ id: "st1", title: "Exportar contactos", done: true }, { id: "st2", title: "Validar duplicados", done: false }], notes: [{ id: "sn1", text: "Usar campo email como key", author: "Juan", date: "2026-07-10" }] },
      { id: "sp2", name: "Fase 2 - Pipeline", description: "Oportunidades y deals", color: "#f59e0b", tasks: [{ id: "st3", title: "Mapear etapas", done: false }], notes: [] },
      { id: "sp3", name: "Fase 3 - Go Live", description: "Lanzamiento", color: "#10b981", tasks: [], notes: [] },
    ],
  },
  { id: "p2", name: "Campana Outbound Q3", description: "500 prospectos B2B multicanal", color: "#10b981", createdAt: "2026-07-15",
    tasks: [{ id: "t4", title: "Definir ICP", done: true }, { id: "t5", title: "Crear secuencias", done: false }],
    notes: [], subProjects: [
      { id: "sp4", name: "Email", description: "Secuencia de emails frios", color: "#3b82f6", tasks: [{ id: "st4", title: "Redactar 5 emails", done: false }], notes: [] },
      { id: "sp5", name: "LinkedIn", description: "Conexiones + mensajes", color: "#8b5cf6", tasks: [], notes: [] },
    ],
  },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [showNewSub, setShowNewSub] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", color: COLORS[0]! });
  const [taskInput, setTaskInput] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [aiInput, setAiInput] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => { setProjects(loadFromStorage("projects_v3", SEED)); }, []);
  function save(u: Project[]) { setProjects(u); saveToStorage("projects_v3", u); }
  function notify(m: string) { setToast(m); setTimeout(() => setToast(""), 2500); }

  const project = projects.find(p => p.id === selectedProject);
  const subProject = project?.subProjects.find(sp => sp.id === selectedSub);

  // Current context: either sub-project or project level
  const currentTasks = selectedSub && subProject ? subProject.tasks : project?.tasks || [];
  const currentNotes = selectedSub && subProject ? subProject.notes : project?.notes || [];
  const currentName = selectedSub && subProject ? subProject.name : project?.name || "";

  function createProject() {
    if (!form.name.trim()) return;
    const p: Project = { id: generateId(), name: form.name, description: form.description, color: form.color, subProjects: [], tasks: [], notes: [], createdAt: new Date().toISOString().split("T")[0]! };
    save([...projects, p]); setSelectedProject(p.id); setSelectedSub(null);
    setForm({ name: "", description: "", color: COLORS[0]! }); setShowNewProject(false); notify("Proyecto creado");
  }

  function createSubProject() {
    if (!form.name.trim() || !project) return;
    const sp: SubProject = { id: generateId(), name: form.name, description: form.description, color: form.color, tasks: [], notes: [] };
    save(projects.map(p => p.id === selectedProject ? { ...p, subProjects: [...p.subProjects, sp] } : p));
    setSelectedSub(sp.id); setForm({ name: "", description: "", color: COLORS[0]! }); setShowNewSub(false); notify("Sub-proyecto creado");
  }

  function deleteProject(id: string) {
    save(projects.filter(p => p.id !== id));
    if (selectedProject === id) { setSelectedProject(null); setSelectedSub(null); }
  }

  function deleteSubProject(spId: string) {
    save(projects.map(p => p.id === selectedProject ? { ...p, subProjects: p.subProjects.filter(sp => sp.id !== spId) } : p));
    if (selectedSub === spId) setSelectedSub(null);
  }

  function duplicateProject(p: Project) {
    const copy: Project = { ...p, id: generateId(), name: p.name + " (copia)", subProjects: p.subProjects.map(sp => ({ ...sp, id: generateId(), tasks: sp.tasks.map(t => ({ ...t, id: generateId(), done: false })) })), tasks: p.tasks.map(t => ({ ...t, id: generateId(), done: false })), createdAt: new Date().toISOString().split("T")[0]! };
    save([...projects, copy]); notify("Proyecto duplicado");
  }

  // Tasks
  function addTask() {
    if (!taskInput.trim()) return;
    const task: ProjectTask = { id: generateId(), title: taskInput, done: false };
    if (selectedSub && subProject) {
      save(projects.map(p => p.id === selectedProject ? { ...p, subProjects: p.subProjects.map(sp => sp.id === selectedSub ? { ...sp, tasks: [...sp.tasks, task] } : sp) } : p));
    } else if (project) {
      save(projects.map(p => p.id === selectedProject ? { ...p, tasks: [...p.tasks, task] } : p));
    }
    setTaskInput("");
  }

  function toggleTask(taskId: string) {
    if (selectedSub) {
      save(projects.map(p => p.id === selectedProject ? { ...p, subProjects: p.subProjects.map(sp => sp.id === selectedSub ? { ...sp, tasks: sp.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t) } : sp) } : p));
    } else {
      save(projects.map(p => p.id === selectedProject ? { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t) } : p));
    }
  }

  function deleteTask(taskId: string) {
    if (selectedSub) {
      save(projects.map(p => p.id === selectedProject ? { ...p, subProjects: p.subProjects.map(sp => sp.id === selectedSub ? { ...sp, tasks: sp.tasks.filter(t => t.id !== taskId) } : sp) } : p));
    } else {
      save(projects.map(p => p.id === selectedProject ? { ...p, tasks: p.tasks.filter(t => t.id !== taskId) } : p));
    }
  }

  // Notes
  function addNote() {
    if (!noteInput.trim()) return;
    const note: ProjectNote = { id: generateId(), text: noteInput, author: "Admin", date: new Date().toISOString().split("T")[0]! };
    if (selectedSub) {
      save(projects.map(p => p.id === selectedProject ? { ...p, subProjects: p.subProjects.map(sp => sp.id === selectedSub ? { ...sp, notes: [note, ...sp.notes] } : sp) } : p));
    } else {
      save(projects.map(p => p.id === selectedProject ? { ...p, notes: [note, ...p.notes] } : p));
    }
    setNoteInput("");
  }

  // AI
  function askAI() {
    if (!aiInput.trim() || !project) return;
    const totalTasks = project.tasks.length + project.subProjects.reduce((s, sp) => s + sp.tasks.length, 0);
    const doneTasks = project.tasks.filter(t => t.done).length + project.subProjects.reduce((s, sp) => s + sp.tasks.filter(t => t.done).length, 0);
    const progress = totalTasks > 0 ? Math.round(doneTasks / totalTasks * 100) : 0;
    setAiResponse(`Proyecto: ${project.name}\nProgreso: ${progress}% (${doneTasks}/${totalTasks} tareas)\nSub-proyectos: ${project.subProjects.length}\n\n${project.subProjects.map(sp => `• ${sp.name}: ${sp.tasks.filter(t=>t.done).length}/${sp.tasks.length} tareas`).join("\n")}`);
    setAiInput("");
  }

  function getProgress(p: Project) {
    const total = p.tasks.length + p.subProjects.reduce((s, sp) => s + sp.tasks.length, 0);
    const done = p.tasks.filter(t => t.done).length + p.subProjects.reduce((s, sp) => s + sp.tasks.filter(t => t.done).length, 0);
    return total > 0 ? Math.round(done / total * 100) : 0;
  }

  return (
    <div className="flex h-full flex-col md:flex-row">
      {/* LEFT: Project list */}
      <div className="w-full md:w-60 shrink-0 border-b md:border-b-0 md:border-r bg-gray-50 flex flex-col max-h-44 md:max-h-none overflow-y-auto">
        <div className="p-3 border-b flex items-center justify-between">
          <h2 className="text-xs font-bold">Proyectos</h2>
          <button onClick={() => setShowNewProject(true)} className="rounded bg-brand text-white p-1.5 hover:bg-brand-hover"><Plus className="h-3.5 w-3.5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {projects.map(p => (
            <div key={p.id} className={`rounded-lg px-2.5 py-2 cursor-pointer transition-colors ${selectedProject === p.id ? "bg-brand/10 border border-brand/20" : "hover:bg-gray-100"}`} onClick={() => { setSelectedProject(p.id); setSelectedSub(null); }}>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                <span className="text-xs font-medium truncate flex-1">{p.name}</span>
                <span className="text-[9px] text-muted-foreground">{getProgress(p)}%</span>
              </div>
              {selectedProject === p.id && p.subProjects.length > 0 && (
                <div className="ml-4 mt-1 space-y-0.5">
                  {p.subProjects.map(sp => (
                    <button key={sp.id} onClick={e => { e.stopPropagation(); setSelectedSub(sp.id); }} className={`w-full text-left rounded px-2 py-1 text-[10px] ${selectedSub === sp.id ? "bg-brand/20 text-brand font-medium" : "text-muted-foreground hover:text-foreground"}`}>
                      <span className="inline-block h-1.5 w-1.5 rounded-full mr-1.5" style={{ backgroundColor: sp.color }} />{sp.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-5">
        {project ? (
          <div className="max-w-4xl">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
              <button onClick={() => { setSelectedProject(null); setSelectedSub(null); }} className="hover:text-brand">Proyectos</button>
              <ChevronRight className="h-3 w-3" />
              <button onClick={() => setSelectedSub(null)} className={`hover:text-brand ${!selectedSub ? "text-foreground font-medium" : ""}`}>{project.name}</button>
              {selectedSub && subProject && <><ChevronRight className="h-3 w-3" /><span className="text-foreground font-medium">{subProject.name}</span></>}
            </div>

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-lg font-bold flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: selectedSub && subProject ? subProject.color : project.color }} />
                  {currentName}
                </h1>
                <p className="text-xs text-muted-foreground">{selectedSub && subProject ? subProject.description : project.description}</p>
              </div>
              <div className="flex gap-1">
                {!selectedSub && <button onClick={() => setShowNewSub(true)} className="flex items-center gap-1 rounded border px-2 py-1 text-xs hover:bg-gray-50"><FolderPlus className="h-3 w-3" />Sub-proyecto</button>}
                {!selectedSub && <button onClick={() => duplicateProject(project)} className="rounded border px-2 py-1 text-xs hover:bg-gray-50"><Copy className="h-3 w-3" /></button>}
                {selectedSub ? (
                  <button onClick={() => deleteSubProject(selectedSub)} className="rounded border px-2 py-1 text-xs text-red-500 hover:bg-red-50"><Trash2 className="h-3 w-3" /></button>
                ) : (
                  <button onClick={() => deleteProject(project.id)} className="rounded border px-2 py-1 text-xs text-red-500 hover:bg-red-50"><Trash2 className="h-3 w-3" /></button>
                )}
              </div>
            </div>

            {/* Sub-projects nav (only at project level) */}
            {!selectedSub && project.subProjects.length > 0 && (
              <div className="mb-4 flex gap-2 flex-wrap">
                {project.subProjects.map(sp => {
                  const spDone = sp.tasks.filter(t => t.done).length;
                  return (
                    <button key={sp.id} onClick={() => setSelectedSub(sp.id)} className="rounded-lg border px-3 py-2 text-left hover:shadow-sm transition-shadow min-w-[140px]">
                      <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: sp.color }} /><span className="text-xs font-medium">{sp.name}</span></div>
                      <div className="flex items-center gap-2 mt-1"><div className="flex-1 h-1 rounded-full bg-gray-200"><div className="h-full rounded-full" style={{ width: sp.tasks.length > 0 ? (spDone / sp.tasks.length * 100) + "%" : "0%", backgroundColor: sp.color }} /></div><span className="text-[9px] text-muted-foreground">{spDone}/{sp.tasks.length}</span></div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Tasks */}
            <div className="rounded-lg border bg-white p-4 mb-4">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Tareas ({currentTasks.filter(t => t.done).length}/{currentTasks.length})</h3>
              <div className="space-y-1 mb-3 max-h-48 overflow-y-auto">
                {currentTasks.map(t => (
                  <div key={t.id} className="group flex items-center gap-2 rounded px-2 py-1.5 hover:bg-gray-50">
                    <button onClick={() => toggleTask(t.id)}>{t.done ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4 text-muted-foreground" />}</button>
                    <span className={`flex-1 text-sm ${t.done ? "line-through text-muted-foreground" : ""}`}>{t.title}</span>
                    <button onClick={() => deleteTask(t.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={taskInput} onChange={e => setTaskInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") addTask(); }} placeholder="Nueva tarea..." className="flex-1 rounded border px-3 py-1.5 text-sm focus:border-brand focus:outline-none" />
                <button onClick={addTask} disabled={!taskInput.trim()} className="rounded bg-brand px-3 py-1.5 text-xs text-white hover:bg-brand-hover disabled:opacity-50">+</button>
              </div>
            </div>

            {/* Notes */}
            <div className="rounded-lg border bg-white p-4 mb-4">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Notas ({currentNotes.length})</h3>
              <div className="flex gap-2 mb-3">
                <input value={noteInput} onChange={e => setNoteInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") addNote(); }} placeholder="Agregar nota..." className="flex-1 rounded border px-3 py-1.5 text-sm focus:border-brand focus:outline-none" />
                <button onClick={addNote} disabled={!noteInput.trim()} className="rounded bg-brand px-3 py-1.5 text-xs text-white hover:bg-brand-hover disabled:opacity-50">+</button>
              </div>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {currentNotes.map(n => (
                  <div key={n.id} className="rounded bg-gray-50 px-3 py-2 text-xs"><p className="break-all">{n.text}</p><span className="text-[9px] text-muted-foreground">{n.author} · {n.date}</span></div>
                ))}
              </div>
            </div>

            {/* AI */}
            <div className="rounded-lg border bg-white p-4">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1"><Bot className="h-3.5 w-3.5 text-brand" />IA del proyecto</h3>
              <div className="flex gap-2 mb-2">
                <input value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") askAI(); }} placeholder="Pregunta sobre el proyecto..." className="flex-1 rounded border px-3 py-1.5 text-sm focus:border-brand focus:outline-none" />
                <button onClick={askAI} disabled={!aiInput.trim()} className="rounded bg-brand p-1.5 text-white hover:bg-brand-hover disabled:opacity-50"><Send className="h-3.5 w-3.5" /></button>
              </div>
              {aiResponse && <div className="rounded bg-gray-50 p-3 text-xs whitespace-pre-wrap break-all">{aiResponse}</div>}
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-muted-foreground gap-3">
            <FolderKanban className="h-12 w-12 text-gray-300" />
            <p className="text-sm">Selecciona o crea un proyecto</p>
            <button onClick={() => setShowNewProject(true)} className="rounded-md bg-brand px-4 py-2 text-sm text-white hover:bg-brand-hover">Nuevo proyecto</button>
          </div>
        )}
      </div>

      {/* New Project Modal */}
      {showNewProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl mx-4">
            <div className="flex justify-between mb-3"><h3 className="text-sm font-bold">Nuevo proyecto</h3><button onClick={() => setShowNewProject(false)} className="rounded p-1 hover:bg-gray-100"><X className="h-4 w-4" /></button></div>
            <div className="space-y-3">
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Nombre *" className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Descripcion" className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              <div className="flex gap-1">{COLORS.map(c => <button key={c} onClick={() => setForm({...form, color: c})} className={`h-6 w-6 rounded-full border-2 ${form.color === c ? "border-gray-800 scale-110" : "border-transparent"}`} style={{ backgroundColor: c }} />)}</div>
              <button onClick={createProject} disabled={!form.name.trim()} className="w-full rounded bg-brand py-2 text-sm text-white hover:bg-brand-hover disabled:opacity-50">Crear</button>
            </div>
          </div>
        </div>
      )}

      {/* New Sub-Project Modal */}
      {showNewSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl mx-4">
            <div className="flex justify-between mb-3"><h3 className="text-sm font-bold">Nuevo sub-proyecto en {project?.name}</h3><button onClick={() => setShowNewSub(false)} className="rounded p-1 hover:bg-gray-100"><X className="h-4 w-4" /></button></div>
            <div className="space-y-3">
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Nombre *" className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Descripcion" className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              <div className="flex gap-1">{COLORS.map(c => <button key={c} onClick={() => setForm({...form, color: c})} className={`h-6 w-6 rounded-full border-2 ${form.color === c ? "border-gray-800 scale-110" : "border-transparent"}`} style={{ backgroundColor: c }} />)}</div>
              <button onClick={createSubProject} disabled={!form.name.trim()} className="w-full rounded bg-brand py-2 text-sm text-white hover:bg-brand-hover disabled:opacity-50">Crear sub-proyecto</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-lg">{toast}</div>}
    </div>
  );
}
