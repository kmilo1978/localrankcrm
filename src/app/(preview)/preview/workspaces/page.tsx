"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, File, FileText, Folder, FolderPlus, MoreHorizontal, Plus, Settings, Trash2, Users, X } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";

type WorkspaceFile = { id: string; name: string; type: "proposal" | "import" | "document" | "image"; addedAt: string };
type FolderItem = { id: string; name: string; color: string; files: WorkspaceFile[]; responsible: string };
type Workspace = { id: string; name: string; description: string; members: string[]; folders: FolderItem[]; createdAt: string };

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#e91e8c", "#8b5cf6", "#ef4444", "#06b6d4", "#6366f1"];

const SEED: Workspace[] = [
  { id: "ws1", name: "Ventas Q3 2026", description: "Pipeline y propuestas del tercer trimestre", members: ["Kevin Rivera", "Ana López", "Juan Pérez"], createdAt: "2026-07-01", folders: [
    { id: "f1", name: "Propuestas enviadas", color: "#3b82f6", responsible: "Juan Pérez", files: [
      { id: "fl1", name: "Propuesta TechCorp Enterprise.pdf", type: "proposal", addedAt: "2026-07-15" },
      { id: "fl2", name: "Cotización MediaGroup.pdf", type: "proposal", addedAt: "2026-07-17" },
    ]},
    { id: "f2", name: "Leads importados", color: "#10b981", responsible: "Ana López", files: [
      { id: "fl3", name: "leads-clasificados.xlsx", type: "import", addedAt: "2026-07-17" },
      { id: "fl4", name: "leads-sabaneta-odontologia.csv", type: "import", addedAt: "2026-07-16" },
    ]},
    { id: "f3", name: "Documentos legales", color: "#f59e0b", responsible: "Kevin Rivera", files: [
      { id: "fl5", name: "Contrato modelo SaaS.docx", type: "document", addedAt: "2026-07-10" },
    ]},
  ]},
  { id: "ws2", name: "Marketing & Contenido", description: "Materiales de marketing y redes sociales", members: ["María Gómez", "Ana López"], createdAt: "2026-06-15", folders: [
    { id: "f4", name: "Branding", color: "#e91e8c", responsible: "María Gómez", files: [
      { id: "fl6", name: "Logo LocalRank.png", type: "image", addedAt: "2026-06-20" },
    ]},
    { id: "f5", name: "Campañas", color: "#8b5cf6", responsible: "Ana López", files: [] },
  ]},
];

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWs, setActiveWs] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [showNewWs, setShowNewWs] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState<string | null>(null);
  const [wsForm, setWsForm] = useState({ name: "", description: "" });
  const [folderForm, setFolderForm] = useState({ name: "", color: COLORS[0]!, responsible: "" });
  const [showAddFile, setShowAddFile] = useState<string | null>(null);
  const [fileForm, setFileForm] = useState({ name: "", type: "document" as WorkspaceFile["type"] });

  useEffect(() => {
    const data = loadFromStorage("workspaces", SEED);
    setWorkspaces(data);
    if (data.length > 0) setActiveWs(data[0]!.id);
  }, []);
  function save(u: Workspace[]) { setWorkspaces(u); saveToStorage("workspaces", u); }

  const active = workspaces.find((w) => w.id === activeWs);

  function addWorkspace() {
    if (!wsForm.name.trim()) return;
    const ws: Workspace = { id: generateId(), name: wsForm.name, description: wsForm.description, members: ["Kevin Rivera"], folders: [], createdAt: new Date().toISOString().split("T")[0]! };
    save([...workspaces, ws]);
    setActiveWs(ws.id);
    setWsForm({ name: "", description: "" });
    setShowNewWs(false);
  }

  function deleteWorkspace(id: string) {
    save(workspaces.filter((w) => w.id !== id));
    if (activeWs === id) setActiveWs(workspaces.find((w) => w.id !== id)?.id || null);
  }

  function addFolder(wsId: string) {
    if (!folderForm.name.trim()) return;
    const folder: FolderItem = { id: generateId(), name: folderForm.name, color: folderForm.color, files: [], responsible: folderForm.responsible };
    save(workspaces.map((w) => w.id === wsId ? { ...w, folders: [...w.folders, folder] } : w));
    setFolderForm({ name: "", color: COLORS[0]!, responsible: "" });
    setShowNewFolder(null);
  }

  function deleteFolder(wsId: string, folderId: string) {
    save(workspaces.map((w) => w.id === wsId ? { ...w, folders: w.folders.filter((f) => f.id !== folderId) } : w));
  }

  function addFile(wsId: string, folderId: string) {
    if (!fileForm.name.trim()) return;
    const file: WorkspaceFile = { id: generateId(), name: fileForm.name, type: fileForm.type, addedAt: new Date().toISOString().split("T")[0]! };
    save(workspaces.map((w) => w.id === wsId ? { ...w, folders: w.folders.map((f) => f.id === folderId ? { ...f, files: [...f.files, file] } : f) } : w));
    setFileForm({ name: "", type: "document" });
    setShowAddFile(null);
  }

  function deleteFile(wsId: string, folderId: string, fileId: string) {
    save(workspaces.map((w) => w.id === wsId ? { ...w, folders: w.folders.map((f) => f.id === folderId ? { ...f, files: f.files.filter((fl) => fl.id !== fileId) } : f) } : w));
  }

  function toggleFolder(id: string) {
    setExpandedFolders((p) => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }

  return (
    <div className="flex h-full">
      {/* Workspace sidebar */}
      <div className="w-56 shrink-0 border-r flex flex-col overflow-hidden">
        <div className="border-b px-3 py-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase text-muted-foreground">Espacios</h3>
          <button onClick={() => setShowNewWs(true)} className="rounded p-1 hover:bg-gray-100 text-muted-foreground"><Plus className="h-3.5 w-3.5" /></button>
        </div>
        {showNewWs && (
          <div className="border-b p-3 space-y-2">
            <input value={wsForm.name} onChange={(e) => setWsForm({ ...wsForm, name: e.target.value })} placeholder="Nombre *" className="w-full rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none" />
            <input value={wsForm.description} onChange={(e) => setWsForm({ ...wsForm, description: e.target.value })} placeholder="Descripción" className="w-full rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none" />
            <div className="flex gap-1">
              <button onClick={addWorkspace} className="rounded bg-brand px-2 py-1 text-xs text-white hover:bg-brand-hover">Crear</button>
              <button onClick={() => setShowNewWs(false)} className="rounded border px-2 py-1 text-xs hover:bg-gray-50">✕</button>
            </div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto py-1">
          {workspaces.map((ws) => (
            <div key={ws.id} onClick={() => setActiveWs(ws.id)} className={`group flex items-center gap-2 px-3 py-2 cursor-pointer ${activeWs === ws.id ? "bg-brand-tint" : "hover:bg-gray-50"}`}>
              <Folder className="h-4 w-4 text-brand shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{ws.name}</p>
                <p className="text-[10px] text-muted-foreground">{ws.folders.length} carpetas · {ws.members.length} miembros</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); deleteWorkspace(ws.id); }} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      {active ? (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{active.name}</h2>
                <p className="text-sm text-muted-foreground">{active.description}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />{active.members.join(", ")}
                </div>
              </div>
              <button onClick={() => setShowNewFolder(active.id)} className="flex items-center gap-2 rounded-md bg-brand px-3 py-2 text-xs font-medium text-white hover:bg-brand-hover">
                <FolderPlus className="h-3.5 w-3.5" />Nueva carpeta
              </button>
            </div>

            {/* New folder form */}
            {showNewFolder === active.id && (
              <div className="mb-4 rounded-lg border bg-white p-4">
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="mb-1 block text-xs font-medium">Nombre</label>
                    <input value={folderForm.name} onChange={(e) => setFolderForm({ ...folderForm, name: e.target.value })} placeholder="Nombre de la carpeta" className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium">Color</label>
                    <div className="flex gap-1">
                      {COLORS.map((c) => <button key={c} onClick={() => setFolderForm({ ...folderForm, color: c })} className={`h-7 w-7 rounded-full border-2 ${folderForm.color === c ? "border-gray-800 scale-110" : "border-transparent"}`} style={{ backgroundColor: c }} />)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="mb-1 block text-xs font-medium">Responsable</label>
                    <input value={folderForm.responsible} onChange={(e) => setFolderForm({ ...folderForm, responsible: e.target.value })} placeholder="Nombre" className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
                  </div>
                  <button onClick={() => addFolder(active.id)} className="rounded bg-brand px-4 py-2 text-sm text-white hover:bg-brand-hover">Crear</button>
                  <button onClick={() => setShowNewFolder(null)} className="rounded border px-3 py-2 text-sm hover:bg-gray-50"><X className="h-4 w-4" /></button>
                </div>
              </div>
            )}

            {/* Folders */}
            <div className="space-y-2">
              {active.folders.map((folder) => {
                const isExpanded = expandedFolders.has(folder.id);
                return (
                  <div key={folder.id} className="rounded-lg border bg-white overflow-hidden">
                    <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50/50" onClick={() => toggleFolder(folder.id)}>
                      {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                      <Folder className="h-4 w-4" style={{ color: folder.color }} />
                      <span className="text-sm font-medium flex-1">{folder.name}</span>
                      {folder.responsible && <span className="text-xs text-muted-foreground bg-gray-100 rounded px-2 py-0.5">{folder.responsible}</span>}
                      <span className="text-xs text-muted-foreground">{folder.files.length} archivos</span>
                      <button onClick={(e) => { e.stopPropagation(); deleteFolder(active.id, folder.id); }} className="rounded p-1 text-muted-foreground hover:text-red-500 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                    {isExpanded && (
                      <div className="border-t px-4 pb-3 pt-2">
                        {folder.files.length > 0 && (
                          <div className="space-y-1 mb-2">
                            {folder.files.map((f) => (
                              <div key={f.id} className="group flex items-center gap-2 rounded px-2 py-1.5 hover:bg-gray-50">
                                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="flex-1 text-xs">{f.name}</span>
                                <span className="text-[10px] text-muted-foreground">{f.addedAt}</span>
                                <button onClick={() => deleteFile(active.id, folder.id, f.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                              </div>
                            ))}
                          </div>
                        )}
                        {showAddFile === folder.id ? (
                          <div className="flex gap-2 items-center">
                            <input value={fileForm.name} onChange={(e) => setFileForm({ ...fileForm, name: e.target.value })} placeholder="Nombre del archivo" className="flex-1 rounded border px-2 py-1 text-xs focus:border-brand focus:outline-none" />
                            <select value={fileForm.type} onChange={(e) => setFileForm({ ...fileForm, type: e.target.value as WorkspaceFile["type"] })} className="rounded border px-2 py-1 text-xs">
                              <option value="document">Documento</option>
                              <option value="proposal">Propuesta</option>
                              <option value="import">Importación</option>
                              <option value="image">Imagen</option>
                            </select>
                            <button onClick={() => addFile(active.id, folder.id)} className="rounded bg-brand px-2 py-1 text-xs text-white">+</button>
                            <button onClick={() => setShowAddFile(null)} className="text-xs text-muted-foreground">✕</button>
                          </div>
                        ) : (
                          <button onClick={() => setShowAddFile(folder.id)} className="flex items-center gap-1 text-xs text-brand hover:underline"><Plus className="h-3 w-3" />Agregar archivo</button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {active.folders.length === 0 && <p className="text-center py-8 text-sm text-muted-foreground">Sin carpetas. Crea una para organizar tu trabajo.</p>}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center"><p className="text-sm text-muted-foreground">Selecciona o crea un espacio de trabajo</p></div>
      )}
    </div>
  );
}
