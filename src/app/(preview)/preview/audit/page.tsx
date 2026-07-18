"use client";
import { AlertCircle, CheckCircle2, Clock, Filter, History, Search, User, XCircle, Zap } from "lucide-react";
import { useState } from "react";

type LogEntry = { id: string; type: "change" | "workflow" | "login" | "error"; user: string; action: string; detail: string; target: string; time: string; status: "success" | "error" | "info" };

const LOGS: LogEntry[] = [
  { id: "lg1", type: "workflow", user: "Sistema", action: "Automatización ejecutada", detail: "Onboarding automático → María García", target: "Automatización", time: "Hace 2h", status: "success" },
  { id: "lg2", type: "change", user: "Kevin Rivera", action: "Movió lead de etapa", detail: "Carlos Ruiz: Propuesta → Negociación", target: "Pipeline", time: "Hace 3h", status: "info" },
  { id: "lg3", type: "change", user: "Ana López", action: "Editó contacto", detail: "Roberto Méndez: agregó campo 'Presupuesto'", target: "Contactos", time: "Hace 4h", status: "info" },
  { id: "lg4", type: "workflow", user: "Sistema", action: "Follow-up ejecutado", detail: "Email enviado a Roberto Méndez", target: "Automatización", time: "Hace 5h", status: "success" },
  { id: "lg5", type: "error", user: "Sistema", action: "Automatización falló", detail: "Error: número inválido para Lead #4521", target: "Automatización", time: "Hace 8h", status: "error" },
  { id: "lg6", type: "login", user: "Juan Pérez", action: "Inició sesión", detail: "Desde Chrome / Windows", target: "Auth", time: "Hace 10h", status: "info" },
  { id: "lg7", type: "change", user: "María Gómez", action: "Creó propuesta", detail: "Propuesta Enterprise — TechCorp", target: "Propuestas", time: "Ayer", status: "info" },
  { id: "lg8", type: "workflow", user: "Sistema", action: "Lead routing ejecutado", detail: "Nuevo lead asignado a Ana López (Round Robin)", target: "Lead Routing", time: "Ayer", status: "success" },
  { id: "lg9", type: "change", user: "Kevin Rivera", action: "Cambió etiqueta", detail: "Dentart: agregó 'Cliente caliente'", target: "Etiquetas", time: "Ayer", status: "info" },
  { id: "lg10", type: "workflow", user: "Sistema", action: "Scoring actualizado", detail: "Carlos Ruiz: score 78 → 95 (+17)", target: "Scoring", time: "Hace 2d", status: "success" },
  { id: "lg11", type: "error", user: "Sistema", action: "Webhook falló", detail: "n8n endpoint timeout (5s)", target: "Webhooks", time: "Hace 2d", status: "error" },
  { id: "lg12", type: "change", user: "Ana López", action: "Eliminó contacto", detail: "Lead inactivo #3892 eliminado", target: "Contactos", time: "Hace 3d", status: "info" },
];

const TYPE_ICONS = { change: History, workflow: Zap, login: User, error: AlertCircle };

export default function AuditPage() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const filtered = LOGS.filter((l) => filter === "all" || l.type === filter).filter((l) => !search || l.action.toLowerCase().includes(search.toLowerCase()) || l.detail.toLowerCase().includes(search.toLowerCase()) || l.user.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2"><History className="h-6 w-6 text-brand" />Auditoría & Logs</h1>
          <p className="text-sm text-muted-foreground">Historial completo: quién hizo qué, workflows ejecutados, errores.</p>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." className="w-52 rounded-md border bg-white py-2 pl-8 pr-3 text-sm focus:border-brand focus:outline-none" /></div>
          <div className="flex gap-1">
            {[{ key: "all", label: "Todos" }, { key: "change", label: "Cambios" }, { key: "workflow", label: "Workflows" }, { key: "error", label: "Errores" }, { key: "login", label: "Logins" }].map(({ key, label }) => (
              <button key={key} onClick={() => setFilter(key)} className={`rounded-md px-3 py-1.5 text-xs font-medium ${filter === key ? "bg-brand text-white" : "border hover:bg-gray-50"}`}>{label}</button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-white overflow-hidden">
          <div className="divide-y">
            {filtered.map((log) => {
              const Icon = TYPE_ICONS[log.type] || History;
              return (
                <div key={log.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/50">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${log.status === "success" ? "bg-green-100" : log.status === "error" ? "bg-red-100" : "bg-gray-100"}`}>
                    {log.status === "success" ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : log.status === "error" ? <XCircle className="h-4 w-4 text-red-600" /> : <Icon className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2"><p className="text-sm font-medium">{log.action}</p><span className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px]">{log.target}</span></div>
                    <p className="text-xs text-muted-foreground truncate">{log.detail}</p>
                  </div>
                  <div className="text-right shrink-0"><p className="text-[10px] text-muted-foreground">{log.time}</p><p className="text-[10px] text-muted-foreground">{log.user}</p></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
