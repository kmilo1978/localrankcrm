"use client";
import { useState, useEffect } from "react";
import { Bot, CheckCircle2, ChevronRight, Circle, Copy, FileText, FolderKanban, FolderPlus, ImagePlus, Paperclip, Plus, Send, Trash2, UserPlus, Users, X } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";
import { openImagePicker } from "@/lib/image-upload";

type ProjectNote = { id: string; text: string; author: string; date: string };
type ProjectTask = { id: string; title: string; done: boolean; assignee: string };
type ProjectSection = { id: string; title: string; content: string; type: "text" | "list" | "link" };
type ProjectFile = { id: string; name: string; data: string; addedAt: string };
type TeamMember = { id: string; name: string; role: string };
type SubProject = { id: string; name: string; description: string; tasks: ProjectTask[]; notes: ProjectNote[]; sections: ProjectSection[]; files: ProjectFile[]; team: TeamMember[]; color: string };
type Project = {
  id: string; name: string; description: string; color: string;
  subProjects: SubProject[]; tasks: ProjectTask[]; notes: ProjectNote[];
  sections: ProjectSection[]; files: ProjectFile[]; team: TeamMember[];
  createdAt: string;
};

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#ec4899", "#f97316"];

const SEED: Project[] = [
  { id: "p1", name: "Migracion CRM Enterprise", description: "Migrar datos del sistema anterior al nuevo CRM. Incluye contactos, empresas, pipeline y configuraciones.", color: "#3b82f6", createdAt: "2026-07-01",
    tasks: [{ id: "t1", title: "Exportar CSV", done: true, assignee: "Juan" }, { id: "t2", title: "Mapear campos", done: true, assignee: "Ana" }, { id: "t3", title: "Importar contactos", done: false, assignee: "Juan" }],
    notes: [{ id: "n1", text: "Cliente aprobo timeline de 6 semanas", author: "Admin", date: "2026-07-15" }],
    sections: [{ id: "sec1", title: "Objetivos", content: "1. Migrar 100% de contactos activos\n2. Preservar historial de conversaciones\n3. Mantener pipeline sin interrupciones", type: "text" }, { id: "sec2", title: "Recursos", content: "https://docs.google.com/spreadsheet/migracion\nhttps://notion.so/plan-migracion", type: "link" }],
    files: [{ id: "f1", name: "Plan-Migracion.pdf", data: "", addedAt: "2026-07-05" }, { id: "f2", name: "Mapeo-Campos.xlsx", data: "", addedAt: "2026-07-08" }],
    team: [{ id: "tm1", name: "Juan Perez", role: "Lider tecnico" }, { id: "tm2", name: "Ana Lopez", role: "QA" }],
    subProjects: [
      { id: "sp1", name: "Fase 1 - Datos", description: "Contactos y empresas", color: "#06b6d4", tasks: [{ id: "st1", title: "Exportar contactos", done: true, assignee: "Juan" }, { id: "st2", title: "Validar duplicados", done: false, assignee: "Ana" }], notes: [{ id: "sn1", text: "Usar campo email como key", author: "Juan", date: "2026-07-10" }], sections: [], files: [], team: [] },
      { id: "sp2", name: "Fase 2 - Pipeline", description: "Oportunidades y deals", color: "#f59e0b", tasks: [{ id: "st3", title: "Mapear etapas", done: false, assignee: "" }], notes: [], sections: [], files: [], team: [] },
    ],
  },
  { id: "p2", name: "Campana Outbound Q3", description: "500 prospectos B2B multicanal — email, LinkedIn, WhatsApp", color: "#10b981", createdAt: "2026-07-15",
    tasks: [{ id: "t4", title: "Definir ICP", done: true, assignee: "Maria" }, { id: "t5", title: "Crear secuencias", done: false, assignee: "Maria" }],
    notes: [], sections: [{ id: "sec3", title: "Brief", content: "Objetivo: 50 reuniones agendadas en 8 semanas\nCanales: Email (primario), LinkedIn (secundario), WhatsApp (follow-up)", type: "text" }],
    files: [], team: [{ id: "tm3", name: "Maria Gomez", role: "SDR" }],
    subProjects: [
      { id: "sp4", name: "Email", description: "Secuencia de emails frios", color: "#3b82f6", tasks: [{ id: "st4", title: "Redactar 5 emails", done: false, assignee: "Maria" }], notes: [], sections: [], files: [], team: [] },
      { id: "sp5", name: "LinkedIn", description: "Conexiones + mensajes", color: "#8b5cf6", tasks: [], notes: [], sections: [], files: [], team: [] },
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
  const [sectionForm, setSectionForm] = useState({ title: "", content: "", type: "text" as ProjectSection["type"] });
  const [showAddSection, setShowAddSection] = useState(false);
  const [memberInput, setMemberInput] = useState({ name: "", role: "" });
  const [aiInput, setAiInput] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [activeTab, setActiveTab] = useState<"tasks" | "sections" | "files" | "team" | "notes" | "ai">("tasks");
  const [toast, setToast] = useState("");

  useEffect(() => { setProjects(loadFromStorage("projects_v3", SEED)); }, []);
  function save(u: Project[]) { setProjects(u); saveToStorage("projects_v3", u); }
  function notify(m: string) { setToast(m); setTimeout(() => setToast(""), 2500); }

  const project = projects.find(p => p.id === selectedProject);
  const subProject = project?.subProjects.find(sp => sp.id === selectedSub);

  // Current context: either sub-project or project level
  const currentTasks = selectedSub && subProject ? subProject.tasks : project?.tasks || [];
  const currentNotes = selectedSub && subProject ? subProject.notes : project?.notes || [];
  const currentSections = selectedSub && subProject ? subProject.sections : project?.sections || [];
  const currentFiles = selectedSub && subProject ? subProject.files : project?.files || [];
  const currentTeam = selectedSub && subProject ? subProject.team : project?.team || [];
  const currentName = selectedSub && subProject ? subProject.name : project?.name || "";

  function createProject() {
    if (!form.name.trim()) return;
    const p: Project = { id: generateId(), name: form.name, description: form.description, color: form.color, subProjects: [], tasks: [], notes: [], sections: [], files: [], team: [], createdAt: new Date().toISOString().split("T")[0]! };
    save([...projects, p]); setSelectedProject(p.id); setSelectedSub(null);
    setForm({ name: "", description: "", color: COLORS[0]! }); setShowNewProject(false); notify("Proyecto creado");
  }

  function createSubProject() {
    if (!form.name.trim() || !project) return;
    const sp: SubProject = { id: generateId(), name: form.name, description: form.description, color: form.color, tasks: [], notes: [], sections: [], files: [], team: [] };
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
    const task: ProjectTask = { id: generateId(), title: taskInput, done: false, assignee: "" };
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

  // Sections
  function addSection() {
    if (!sectionForm.title.trim()) return;
    const sec: ProjectSection = { id: generateId(), title: sectionForm.title, content: sectionForm.content, type: sectionForm.type };
    if (selectedSub) {
      save(projects.map(p => p.id === selectedProject ? { ...p, subProjects: p.subProjects.map(sp => sp.id === selectedSub ? { ...sp, sections: [...sp.sections, sec] } : sp) } : p));
    } else {
      save(projects.map(p => p.id === selectedProject ? { ...p, sections: [...p.sections, sec] } : p));
    }
    setSectionForm({ title: "", content: "", type: "text" }); setShowAddSection(false); notify("Seccion agregada");
  }

  function deleteSection(secId: string) {
    if (selectedSub) {
      save(projects.map(p => p.id === selectedProject ? { ...p, subProjects: p.subProjects.map(sp => sp.id === selectedSub ? { ...sp, sections: sp.sections.filter(s => s.id !== secId) } : sp) } : p));
    } else {
      save(projects.map(p => p.id === selectedProject ? { ...p, sections: p.sections.filter(s => s.id !== secId) } : p));
    }
  }

  // Files
  async function addFile() {
    const img = await openImagePicker();
    if (!img) return;
    const name = "Archivo-" + new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" }) + ".jpg";
    const file: ProjectFile = { id: generateId(), name, data: img, addedAt: new Date().toISOString().split("T")[0]! };
    if (selectedSub) {
      save(projects.map(p => p.id === selectedProject ? { ...p, subProjects: p.subProjects.map(sp => sp.id === selectedSub ? { ...sp, files: [...sp.files, file] } : sp) } : p));
    } else {
      save(projects.map(p => p.id === selectedProject ? { ...p, files: [...p.files, file] } : p));
    }
    notify("Archivo agregado");
  }

  function deleteFile(fileId: string) {
    if (selectedSub) {
      save(projects.map(p => p.id === selectedProject ? { ...p, subProjects: p.subProjects.map(sp => sp.id === selectedSub ? { ...sp, files: sp.files.filter(f => f.id !== fileId) } : sp) } : p));
    } else {
      save(projects.map(p => p.id === selectedProject ? { ...p, files: p.files.filter(f => f.id !== fileId) } : p));
    }
  }

  // Team
  function addMember() {
    if (!memberInput.name.trim()) return;
    const m: TeamMember = { id: generateId(), name: memberInput.name, role: memberInput.role || "Miembro" };
    if (selectedSub) {
      save(projects.map(p => p.id === selectedProject ? { ...p, subProjects: p.subProjects.map(sp => sp.id === selectedSub ? { ...sp, team: [...sp.team, m] } : sp) } : p));
    } else {
      save(projects.map(p => p.id === selectedProject ? { ...p, team: [...p.team, m] } : p));
    }
    setMemberInput({ name: "", role: "" }); notify("Miembro agregado");
  }

  function removeMember(mId: string) {
    if (selectedSub) {
      save(projects.map(p => p.id === selectedProject ? { ...p, subProjects: p.subProjects.map(sp => sp.id === selectedSub ? { ...sp, team: sp.team.filter(m => m.id !== mId) } : sp) } : p));
    } else {
      save(projects.map(p => p.id === selectedProject ? { ...p, team: p.team.filter(m => m.id !== mId) } : p));
    }
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

            {/* === UNIFIED VIEW: everything visible together === */}

            {/* Team bar */}
            {currentTeam.length > 0 && (
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                {currentTeam.map(m => <span key={m.id} className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-medium text-brand">{m.name} <span className="text-brand/60">({m.role})</span></span>)}
                <button onClick={() => { const n = prompt("Nombre:"); const r = prompt("Rol:"); if (n) { const m2: TeamMember = { id: generateId(), name: n, role: r || "Miembro" }; if (selectedSub) { save(projects.map(p => p.id === selectedProject ? { ...p, subProjects: p.subProjects.map(sp => sp.id === selectedSub ? { ...sp, team: [...sp.team, m2] } : sp) } : p)); } else { save(projects.map(p => p.id === selectedProject ? { ...p, team: [...p.team, m2] } : p)); } } }} className="rounded-full border border-dashed px-2 py-0.5 text-[10px] text-muted-foreground hover:border-brand hover:text-brand">+ Miembro</button>
              </div>
            )}
            {currentTeam.length === 0 && (
              <button onClick={() => { const n = prompt("Nombre del miembro:"); const r = prompt("Rol:"); if (n) { addMember(); setMemberInput({ name: n, role: r || "Miembro" }); } }} className="mb-4 flex items-center gap-1 rounded border border-dashed px-3 py-1.5 text-xs text-muted-foreground hover:border-brand hover:text-brand"><UserPlus className="h-3 w-3" />Agregar equipo</button>
            )}

            {/* Custom sections (personalizable) */}
            <div className="space-y-3 mb-4">
              {currentSections.map(sec => (
                <div key={sec.id} className="rounded-lg border bg-white p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-brand" />{sec.title}
                    </h4>
                    <button onClick={() => deleteSection(sec.id)} className="text-muted-foreground hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                  </div>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap break-words leading-relaxed">{sec.content}</div>
                </div>
              ))}
              {/* Add section */}
              {!showAddSection ? (
                <button onClick={() => setShowAddSection(true)} className="w-full rounded-lg border border-dashed p-3 text-xs text-muted-foreground hover:border-brand hover:text-brand flex items-center justify-center gap-1"><Plus className="h-3 w-3" />Agregar seccion personalizada</button>
              ) : (
                <div className="rounded-lg border bg-white p-4 space-y-2">
                  <input value={sectionForm.title} onChange={e => setSectionForm({...sectionForm, title: e.target.value})} placeholder="Titulo de la seccion (ej: Objetivos, Brief, Recursos, Notas tecnicas...)" className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
                  <textarea value={sectionForm.content} onChange={e => setSectionForm({...sectionForm, content: e.target.value})} placeholder="Contenido libre (texto, links, listas, lo que quieras...)" rows={5} className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
                  <div className="flex gap-2">
                    <button onClick={addSection} disabled={!sectionForm.title.trim()} className="rounded bg-brand px-3 py-1.5 text-xs text-white hover:bg-brand-hover disabled:opacity-50">Guardar seccion</button>
                    <button onClick={() => setShowAddSection(false)} className="rounded border px-3 py-1.5 text-xs">Cancelar</button>
                  </div>
                </div>
              )}
            </div>

            {/* Tasks */}
            <div className="rounded-lg border bg-white p-4 mb-4">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Tareas ({currentTasks.filter(t => t.done).length}/{currentTasks.length})</h3>
              <div className="space-y-1 mb-3 max-h-60 overflow-y-auto">
                {currentTasks.map(t => (
                  <div key={t.id} className="group flex items-center gap-2 rounded px-2 py-1.5 hover:bg-gray-50">
                    <button onClick={() => toggleTask(t.id)}>{t.done ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4 text-muted-foreground" />}</button>
                    <span className={`flex-1 text-sm ${t.done ? "line-through text-muted-foreground" : ""}`}>{t.title}</span>
                    {t.assignee && <span className="text-[9px] text-muted-foreground bg-gray-100 rounded px-1.5 py-0.5">{t.assignee}</span>}
                    <button onClick={() => deleteTask(t.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={taskInput} onChange={e => setTaskInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") addTask(); }} placeholder="Nueva tarea..." className="flex-1 rounded border px-3 py-1.5 text-sm focus:border-brand focus:outline-none" />
                <button onClick={addTask} disabled={!taskInput.trim()} className="rounded bg-brand px-3 py-1.5 text-xs text-white hover:bg-brand-hover disabled:opacity-50">+</button>
              </div>
            </div>

            {/* Files */}
            {(currentFiles.length > 0 || true) && (
            <div className="rounded-lg border bg-white p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1"><Paperclip className="h-3 w-3" />Archivos ({currentFiles.length})</h3>
                <button onClick={addFile} className="flex items-center gap-1 rounded border px-2 py-1 text-[10px] hover:bg-gray-50"><ImagePlus className="h-3 w-3" />Subir</button>
              </div>
              {currentFiles.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {currentFiles.map(f => (
                    <div key={f.id} className="group relative rounded border p-1.5 w-20">
                      {f.data ? <img src={f.data} alt={f.name} className="w-full h-14 object-cover rounded" /> : <Paperclip className="h-6 w-6 mx-auto text-muted-foreground" />}
                      <p className="text-[8px] truncate mt-0.5">{f.name}</p>
                      <button onClick={() => deleteFile(f.id)} className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 rounded-full bg-red-500 text-white p-0.5"><X className="h-2 w-2" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            )}

            {/* Notes */}
            <div className="rounded-lg border bg-white p-4 mb-4">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Notas ({currentNotes.length})</h3>
              <div className="flex gap-2 mb-2">
                <input value={noteInput} onChange={e => setNoteInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") addNote(); }} placeholder="Agregar nota rapida..." className="flex-1 rounded border px-3 py-1.5 text-sm focus:border-brand focus:outline-none" />
                <button onClick={addNote} disabled={!noteInput.trim()} className="rounded bg-brand px-3 py-1.5 text-xs text-white hover:bg-brand-hover disabled:opacity-50">+</button>
              </div>
              {currentNotes.length > 0 && (
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {currentNotes.map(n => (
                    <div key={n.id} className="rounded bg-gray-50 px-2.5 py-1.5 text-xs break-all"><span>{n.text}</span> <span className="text-[9px] text-muted-foreground">— {n.author}, {n.date}</span></div>
                  ))}
                </div>
              )}
            </div>

            {/* AI */}
            <div className="rounded-lg border bg-white p-4">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1"><Bot className="h-3.5 w-3.5 text-brand" />Preguntale a la IA</h3>
              <div className="flex gap-2">
                <input value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") askAI(); }} placeholder="Progreso? Tareas pendientes? Equipo?" className="flex-1 rounded border px-3 py-1.5 text-sm focus:border-brand focus:outline-none" />
                <button onClick={askAI} disabled={!aiInput.trim()} className="rounded bg-brand p-1.5 text-white hover:bg-brand-hover disabled:opacity-50"><Send className="h-3.5 w-3.5" /></button>
              </div>
              {aiResponse && <div className="mt-2 rounded bg-gray-50 p-3 text-xs whitespace-pre-wrap break-all">{aiResponse}</div>}
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
