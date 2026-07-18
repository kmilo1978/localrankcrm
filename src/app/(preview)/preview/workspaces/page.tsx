"use client";

import { useState, useEffect } from "react";
import { Building2, ChevronDown, ChevronRight, FileText, Folder, FolderPlus, Plus, Trash2, Users, X } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";

type WorkspaceFile = { id: string; name: string; type: string; addedAt: string };
type SubFolder = { id: string; name: string; color: string; files: WorkspaceFile[] };
type FolderItem = { id: string; name: string; color: string; files: WorkspaceFile[]; responsible: string; subfolders: SubFolder[] };
type Client = { id: string; name: string; color: string; industry: string };
type Workspace = { id: string; name: string; description: string; members: string[]; folders: FolderItem[]; createdAt: string; clientId: string };

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#e91e8c", "#8b5cf6", "#ef4444", "#06b6d4", "#6366f1"];

const SEED_CLIENTS: Client[] = [
  { id: "cl1", name: "LocalRank (Interno)", color: "#e91e8c", industry: "Tecnología" },
  { id: "cl2", name: "TechCorp Solutions", color: "#3b82f6", industry: "Software" },
  { id: "cl3", name: "MediaGroup Digital", color: "#10b981", industry: "Marketing" },
  { id: "cl4", name: "LogiNext International", color: "#f59e0b", industry: "Logística" },
];

const SEED: Workspace[] = [
  { id: "ws1", name: "Ventas Q3 2026", description: "Pipeline y propuestas del trimestre", members: ["Kevin", "Ana", "Juan"], createdAt: "2026-07-01", clientId: "cl1", folders: [
    { id: "f1", name: "Propuestas", color: "#3b82f6", responsible: "Juan Pérez", files: [
      { id: "fl1", name: "Propuesta Enterprise.pdf", type: "proposal", addedAt: "2026-07-15" },
    ], subfolders: [
      { id: "sf1", name: "Borradores", color: "#94a3b8", files: [{ id: "fl6", name: "borrador-v1.docx", type: "document", addedAt: "2026-07-14" }] },
      { id: "sf2", name: "Aprobadas", color: "#10b981", files: [] },
    ]},
    { id: "f2", name: "Leads", color: "#10b981", responsible: "Ana López", files: [
      { id: "fl3", name: "leads-clasificados.xlsx", type: "import", addedAt: "2026-07-17" },
    ], subfolders: [] },
    { id: "f3", name: "Legal", color: "#f59e0b", responsible: "Kevin", files: [
      { id: "fl5", name: "Contrato SaaS.docx", type: "document", addedAt: "2026-07-10" },
    ], subfolders: [
      { id: "sf3", name: "Contratos firmados", color: "#10b981", files: [] },
      { id: "sf4", name: "Pendientes revisión", color: "#f59e0b", files: [] },
    ]},
  ]},
  { id: "ws2", name: "Campaña TechCorp", description: "Material para campaña Q3", members: ["María", "Ana"], createdAt: "2026-06-15", clientId: "cl2", folders: [
    { id: "f4", name: "Diseño", color: "#e91e8c", responsible: "María", files: [
      { id: "fl7", name: "Logo-TechCorp.png", type: "image", addedAt: "2026-06-20" },
    ], subfolders: [
      { id: "sf5", name: "Banners", color: "#8b5cf6", files: [] },
      { id: "sf6", name: "Social Media", color: "#06b6d4", files: [] },
    ]},
  ]},
];

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [activeWs, setActiveWs] = useState<string | null>(null);
  const [filterClient, setFilterClient] = useState("all");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [expandedSubs, setExpandedSubs] = useState<Set<string>>(new Set());
  const [showNewWs, setShowNewWs] = useState(false);
  const [showNewClient, setShowNewClient] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState<string | null>(null);
  const [showNewSub, setShowNewSub] = useState<string | null>(null);
  const [wsForm, setWsForm] = useState({ name: "", description: "", clientId: "" });
  const [clientForm, setClientForm] = useState({ name: "", color: COLORS[0]!, industry: "" });
  const [folderForm, setFolderForm] = useState({ name: "", color: COLORS[0]!, responsible: "" });
  const [subForm, setSubForm] = useState({ name: "", color: COLORS[2]! });
  const [showRecommendation, setShowRecommendation] = useState(true);
  const [showAddFile, setShowAddFile] = useState<string | null>(null);
  const [fileForm, setFileForm] = useState({ name: "", type: "document" });

  useEffect(() => {
    const data = loadFromStorage("workspaces_v2", SEED);
    setWorkspaces(data);
    setClients(loadFromStorage("workspace_clients", SEED_CLIENTS));
    if (data.length > 0) setActiveWs(data[0]!.id);
  }, []);
  function save(u: Workspace[]) { setWorkspaces(u); saveToStorage("workspaces_v2", u); }
  function saveClients(u: Client[]) { setClients(u); saveToStorage("workspace_clients", u); }

  const filteredWs = filterClient === "all" ? workspaces : workspaces.filter((w) => w.clientId === filterClient);
  const active = workspaces.find((w) => w.id === activeWs);
  const activeClient = active ? clients.find((c) => c.id === active.clientId) : null;

  function addClient() {
    if (!clientForm.name.trim()) return;
    saveClients([...clients, { id: generateId(), name: clientForm.name, color: clientForm.color, industry: clientForm.industry }]);
    setClientForm({ name: "", color: COLORS[(clients.length + 1) % COLORS.length]!, industry: "" });
    setShowNewClient(false);
  }
  function deleteClient(id: string) { saveClients(clients.filter((c) => c.id !== id)); }

  function addWorkspace() {
    if (!wsForm.name.trim()) return;
    const ws: Workspace = { id: generateId(), name: wsForm.name, description: wsForm.description, members: ["Kevin"], folders: [], createdAt: new Date().toISOString().split("T")[0]!, clientId: wsForm.clientId || clients[0]?.id || "" };
    save([...workspaces, ws]); setActiveWs(ws.id);
    setWsForm({ name: "", description: "", clientId: "" }); setShowNewWs(false);
  }
  function deleteWorkspace(id: string) { save(workspaces.filter((w) => w.id !== id)); if (activeWs === id) setActiveWs(workspaces[0]?.id || null); }

  function addFolder(wsId: string) {
    if (!folderForm.name.trim()) return;
    save(workspaces.map((w) => w.id === wsId ? { ...w, folders: [...w.folders, { id: generateId(), name: folderForm.name, color: folderForm.color, files: [], responsible: folderForm.responsible, subfolders: [] }] } : w));
    setFolderForm({ name: "", color: COLORS[0]!, responsible: "" }); setShowNewFolder(null);
  }
  function deleteFolder(wsId: string, fId: string) { save(workspaces.map((w) => w.id === wsId ? { ...w, folders: w.folders.filter((f) => f.id !== fId) } : w)); }

  function addSubfolder(wsId: string, folderId: string) {
    if (!subForm.name.trim()) return;
    save(workspaces.map((w) => w.id === wsId ? { ...w, folders: w.folders.map((f) => f.id === folderId ? { ...f, subfolders: [...f.subfolders, { id: generateId(), name: subForm.name, color: subForm.color, files: [] }] } : f) } : w));
    setSubForm({ name: "", color: COLORS[2]! }); setShowNewSub(null);
  }
  function deleteSubfolder(wsId: string, folderId: string, subId: string) {
    save(workspaces.map((w) => w.id === wsId ? { ...w, folders: w.folders.map((f) => f.id === folderId ? { ...f, subfolders: f.subfolders.filter((s) => s.id !== subId) } : f) } : w));
  }

  function addFile(wsId: string, folderId: string, subId?: string) {
    if (!fileForm.name.trim()) return;
    const file: WorkspaceFile = { id: generateId(), name: fileForm.name, type: fileForm.type, addedAt: new Date().toISOString().split("T")[0]! };
    if (subId) {
      save(workspaces.map((w) => w.id === wsId ? { ...w, folders: w.folders.map((f) => f.id === folderId ? { ...f, subfolders: f.subfolders.map((s) => s.id === subId ? { ...s, files: [...s.files, file] } : s) } : f) } : w));
    } else {
      save(workspaces.map((w) => w.id === wsId ? { ...w, folders: w.folders.map((f) => f.id === folderId ? { ...f, files: [...f.files, file] } : f) } : w));
    }
    setFileForm({ name: "", type: "document" }); setShowAddFile(null);
  }
  function deleteFile(wsId: string, folderId: string, fileId: string, subId?: string) {
    if (subId) {
      save(workspaces.map((w) => w.id === wsId ? { ...w, folders: w.folders.map((f) => f.id === folderId ? { ...f, subfolders: f.subfolders.map((s) => s.id === subId ? { ...s, files: s.files.filter((fl) => fl.id !== fileId) } : s) } : f) } : w));
    } else {
      save(workspaces.map((w) => w.id === wsId ? { ...w, folders: w.folders.map((f) => f.id === folderId ? { ...f, files: f.files.filter((fl) => fl.id !== fileId) } : f) } : w));
    }
  }

  function toggleFolder(id: string) { setExpandedFolders((p) => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; }); }
  function toggleSub(id: string) { setExpandedSubs((p) => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; }); }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-60 shrink-0 border-r flex flex-col overflow-hidden">
        <div className="border-b px-3 py-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase text-muted-foreground">Espacios</h3>
          <button onClick={() => setShowNewWs(true)} className="rounded p-1 hover:bg-gray-100 text-muted-foreground"><Plus className="h-3.5 w-3.5" /></button>
        </div>

        {/* Clients section */}
        <div className="border-b px-3 py-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold uppercase text-muted-foreground flex items-center gap-1"><Building2 className="h-3 w-3" />Clientes</span>
            <button onClick={() => setShowNewClient(!showNewClient)} className="text-[10px] text-brand hover:underline">+ Nuevo</button>
          </div>
          {showNewClient && (
            <div className="mb-2 space-y-1.5 rounded border p-2">
              <input value={clientForm.name} onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })} placeholder="Nombre del cliente *" className="w-full rounded border px-2 py-1 text-[10px] focus:border-brand focus:outline-none" />
              <input value={clientForm.industry} onChange={(e) => setClientForm({ ...clientForm, industry: e.target.value })} placeholder="Industria" className="w-full rounded border px-2 py-1 text-[10px] focus:border-brand focus:outline-none" />
              <div className="flex gap-1">{COLORS.map((c) => <button key={c} onClick={() => setClientForm({ ...clientForm, color: c })} className={`h-4 w-4 rounded-full border ${clientForm.color === c ? "border-gray-800 scale-110" : "border-transparent"}`} style={{ backgroundColor: c }} />)}</div>
              <div className="flex gap-1">
                <button onClick={addClient} className="rounded bg-brand px-2 py-0.5 text-[10px] text-white">Crear</button>
                <button onClick={() => setShowNewClient(false)} className="text-[10px] text-muted-foreground">✕</button>
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-1">
            <button onClick={() => setFilterClient("all")} className={`rounded-full px-2 py-0.5 text-[10px] ${filterClient === "all" ? "bg-brand text-white" : "border hover:bg-gray-50"}`}>Todos</button>
            {clients.map((c) => (
              <button key={c.id} onClick={() => setFilterClient(c.id)} className={`rounded-full px-2 py-0.5 text-[10px] flex items-center gap-1 ${filterClient === c.id ? "text-white" : "border hover:bg-gray-50"}`} style={filterClient === c.id ? { backgroundColor: c.color } : {}}>
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />{c.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* New workspace form */}
        {showNewWs && (
          <div className="border-b p-3 space-y-2">
            <input value={wsForm.name} onChange={(e) => setWsForm({ ...wsForm, name: e.target.value })} placeholder="Nombre *" className="w-full rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none" />
            <input value={wsForm.description} onChange={(e) => setWsForm({ ...wsForm, description: e.target.value })} placeholder="Descripción" className="w-full rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none" />
            <select value={wsForm.clientId} onChange={(e) => setWsForm({ ...wsForm, clientId: e.target.value })} className="w-full rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none">
              <option value="">Cliente...</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div className="flex gap-1">
              <button onClick={addWorkspace} className="rounded bg-brand px-2 py-1 text-xs text-white hover:bg-brand-hover">Crear</button>
              <button onClick={() => setShowNewWs(false)} className="rounded border px-2 py-1 text-xs">✕</button>
            </div>
          </div>
        )}

        {/* Workspace list */}
        <div className="flex-1 overflow-y-auto py-1">
          {filteredWs.map((ws) => {
            const client = clients.find((c) => c.id === ws.clientId);
            return (
              <div key={ws.id} onClick={() => setActiveWs(ws.id)} className={`group flex items-center gap-2 px-3 py-2 cursor-pointer ${activeWs === ws.id ? "bg-brand-tint" : "hover:bg-gray-50"}`}>
                <Folder className="h-4 w-4 text-brand shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{ws.name}</p>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    {client && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: client.color }} />}
                    <span>{client?.name.split(" ")[0] || "Sin cliente"}</span>
                    <span>· {ws.folders.length} carpetas</span>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); deleteWorkspace(ws.id); }} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      {active ? (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{active.name}</h2>
                  {activeClient && <span className="rounded-full px-2 py-0.5 text-[10px] font-medium text-white" style={{ backgroundColor: activeClient.color }}>{activeClient.name}</span>}
                </div>
                <p className="text-sm text-muted-foreground">{active.description}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground"><Users className="h-3 w-3" />{active.members.join(", ")}</div>
              </div>
              <button onClick={() => setShowNewFolder(active.id)} className="flex items-center gap-2 rounded-md bg-brand px-3 py-2 text-xs font-medium text-white hover:bg-brand-hover"><FolderPlus className="h-3.5 w-3.5" />Nueva carpeta</button>
            </div>

            {/* Recommendation banner */}
            {showRecommendation && (
              <div className="mb-5 rounded-lg border border-violet-200 bg-gradient-to-r from-violet-50 to-emerald-50 p-4 relative">
                <button onClick={() => setShowRecommendation(false)} className="absolute top-2 right-2 rounded p-1 text-muted-foreground hover:text-foreground hover:bg-white/50"><X className="h-3.5 w-3.5" /></button>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <p className="text-sm font-semibold text-violet-800">Recomendación: Conecta tus herramientas</p>
                    <p className="mt-1 text-xs text-muted-foreground">Para automatizar este workspace y conectar Gmail, Slack, Sheets y 250+ herramientas sin configurar cada una, te recomendamos crear una cuenta gratuita en:</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a href="https://composio.dev" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-md bg-violet-600 px-3 py-2 text-xs font-medium text-white hover:opacity-90 transition-opacity">
                        ⚡ Composio.dev <span className="rounded bg-white/20 px-1 py-0.5 text-[9px]">Recomendado</span>
                      </a>
                      <a href="https://withone.ai" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:opacity-90 transition-opacity">
                        🤖 WithOne.ai
                      </a>
                      <a href="/settings/integrations" className="flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium hover:bg-white/50">
                        Configurar →
                      </a>
                    </div>
                    <p className="mt-2 text-[10px] text-muted-foreground">Una sola API key conecta todas tus herramientas. No necesitas ser técnico.</p>
                  </div>
                </div>
              </div>
            )}

            {/* New folder form */}
            {showNewFolder === active.id && (
              <div className="mb-4 rounded-lg border bg-white p-4">
                <div className="flex gap-3 items-end flex-wrap">
                  <div className="flex-1 min-w-[150px]"><label className="mb-1 block text-xs font-medium">Nombre</label><input value={folderForm.name} onChange={(e) => setFolderForm({ ...folderForm, name: e.target.value })} placeholder="Nombre carpeta" className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" /></div>
                  <div><label className="mb-1 block text-xs font-medium">Color</label><div className="flex gap-1">{COLORS.map((c) => <button key={c} onClick={() => setFolderForm({ ...folderForm, color: c })} className={`h-6 w-6 rounded-full border-2 ${folderForm.color === c ? "border-gray-800 scale-110" : "border-transparent"}`} style={{ backgroundColor: c }} />)}</div></div>
                  <div className="flex-1 min-w-[150px]"><label className="mb-1 block text-xs font-medium">Responsable</label><input value={folderForm.responsible} onChange={(e) => setFolderForm({ ...folderForm, responsible: e.target.value })} placeholder="Nombre" className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" /></div>
                  <button onClick={() => addFolder(active.id)} className="rounded bg-brand px-4 py-2 text-sm text-white hover:bg-brand-hover">Crear</button>
                  <button onClick={() => setShowNewFolder(null)} className="rounded border px-3 py-2 text-sm"><X className="h-4 w-4" /></button>
                </div>
              </div>
            )}

            {/* Folders */}
            <div className="space-y-2">
              {active.folders.map((folder) => {
                const isExp = expandedFolders.has(folder.id);
                return (
                  <div key={folder.id} className="rounded-lg border bg-white overflow-hidden">
                    {/* Folder header */}
                    <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50/50" onClick={() => toggleFolder(folder.id)}>
                      {isExp ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                      <Folder className="h-4 w-4" style={{ color: folder.color }} />
                      <span className="text-sm font-medium flex-1">{folder.name}</span>
                      {folder.responsible && <span className="text-xs text-muted-foreground bg-gray-100 rounded px-2 py-0.5">{folder.responsible}</span>}
                      <span className="text-xs text-muted-foreground">{folder.files.length} archivos · {folder.subfolders.length} subcarpetas</span>
                      <button onClick={(e) => { e.stopPropagation(); deleteFolder(active.id, folder.id); }} className="rounded p-1 text-muted-foreground hover:text-red-500 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>

                    {/* Folder content */}
                    {isExp && (
                      <div className="border-t px-4 pb-3 pt-2">
                        {/* Files in this folder */}
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

                        {/* Subfolders */}
                        {folder.subfolders.length > 0 && (
                          <div className="ml-4 space-y-1 mb-2">
                            {folder.subfolders.map((sub) => {
                              const subExp = expandedSubs.has(sub.id);
                              return (
                                <div key={sub.id} className="rounded border overflow-hidden">
                                  <div className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50" onClick={() => toggleSub(sub.id)}>
                                    {subExp ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                                    <Folder className="h-3.5 w-3.5" style={{ color: sub.color }} />
                                    <span className="text-xs font-medium flex-1">{sub.name}</span>
                                    <span className="text-[10px] text-muted-foreground">{sub.files.length}</span>
                                    <button onClick={(e) => { e.stopPropagation(); deleteSubfolder(active.id, folder.id, sub.id); }} className="text-muted-foreground hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                                  </div>
                                  {subExp && (
                                    <div className="border-t px-3 py-2 bg-gray-50/50">
                                      {sub.files.map((f) => (
                                        <div key={f.id} className="group flex items-center gap-2 py-1 text-xs">
                                          <FileText className="h-3 w-3 text-muted-foreground" />
                                          <span className="flex-1">{f.name}</span>
                                          <button onClick={() => deleteFile(active.id, folder.id, f.id, sub.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                                        </div>
                                      ))}
                                      {showAddFile === sub.id ? (
                                        <div className="flex gap-1 mt-1">
                                          <input value={fileForm.name} onChange={(e) => setFileForm({ ...fileForm, name: e.target.value })} placeholder="Archivo..." className="flex-1 rounded border px-2 py-1 text-[10px]" />
                                          <button onClick={() => addFile(active.id, folder.id, sub.id)} className="rounded bg-brand px-2 py-1 text-[10px] text-white">+</button>
                                          <button onClick={() => setShowAddFile(null)} className="text-[10px]">✕</button>
                                        </div>
                                      ) : (
                                        <button onClick={() => setShowAddFile(sub.id)} className="text-[10px] text-brand hover:underline mt-1">+ Archivo</button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Add file / Add subfolder */}
                        <div className="flex items-center gap-3 mt-2">
                          {showAddFile === folder.id ? (
                            <div className="flex gap-1 flex-1">
                              <input value={fileForm.name} onChange={(e) => setFileForm({ ...fileForm, name: e.target.value })} placeholder="Nombre archivo" className="flex-1 rounded border px-2 py-1 text-xs" />
                              <select value={fileForm.type} onChange={(e) => setFileForm({ ...fileForm, type: e.target.value })} className="rounded border px-2 py-1 text-xs"><option value="document">Doc</option><option value="proposal">Propuesta</option><option value="import">Import</option><option value="image">Imagen</option></select>
                              <button onClick={() => addFile(active.id, folder.id)} className="rounded bg-brand px-2 py-1 text-xs text-white">+</button>
                              <button onClick={() => setShowAddFile(null)} className="text-xs">✕</button>
                            </div>
                          ) : (
                            <button onClick={() => setShowAddFile(folder.id)} className="text-xs text-brand hover:underline flex items-center gap-1"><Plus className="h-3 w-3" />Archivo</button>
                          )}
                          {showNewSub === folder.id ? (
                            <div className="flex gap-1">
                              <input value={subForm.name} onChange={(e) => setSubForm({ ...subForm, name: e.target.value })} placeholder="Subcarpeta" className="w-28 rounded border px-2 py-1 text-xs" />
                              <button onClick={() => addSubfolder(active.id, folder.id)} className="rounded bg-brand px-2 py-1 text-xs text-white">+</button>
                              <button onClick={() => setShowNewSub(null)} className="text-xs">✕</button>
                            </div>
                          ) : (
                            <button onClick={() => setShowNewSub(folder.id)} className="text-xs text-brand hover:underline flex items-center gap-1"><FolderPlus className="h-3 w-3" />Subcarpeta</button>
                          )}
                        </div>
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
