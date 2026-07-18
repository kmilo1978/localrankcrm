"use client";
import { useState, useEffect } from "react";
import { Calendar, CheckCircle2, Clock, Plus, RefreshCw, Trash2, XCircle } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";

type ScheduledTask = { id: string; name: string; type: "follow_up" | "re_engagement" | "reminder" | "cleanup" | "report"; schedule: string; nextRun: string; lastRun: string; status: "active" | "paused" | "completed"; runs: number };

const TYPES = { follow_up: { label: "Follow-up vencidos", color: "bg-amber-100 text-amber-700" }, re_engagement: { label: "Re-engagement", color: "bg-purple-100 text-purple-700" }, reminder: { label: "Recordatorio", color: "bg-blue-100 text-blue-700" }, cleanup: { label: "Limpieza datos", color: "bg-gray-100 text-gray-700" }, report: { label: "Reporte automático", color: "bg-green-100 text-green-700" } };

const SEED: ScheduledTask[] = [
  { id: "sch1", name: "Follow-ups vencidos → recordatorio", type: "follow_up", schedule: "Cada día a las 9:00 AM", nextRun: "Mañana 9:00", lastRun: "Hoy 9:00", status: "active", runs: 45 },
  { id: "sch2", name: "Re-engage leads sin actividad 14d", type: "re_engagement", schedule: "Cada lunes a las 10:00 AM", nextRun: "Lun 10:00", lastRun: "Lun pasado", status: "active", runs: 12 },
  { id: "sch3", name: "Recordatorio cobros pendientes", type: "reminder", schedule: "Cada día a las 8:00 AM", nextRun: "Mañana 8:00", lastRun: "Hoy 8:00", status: "active", runs: 30 },
  { id: "sch4", name: "Limpiar leads inactivos +90d", type: "cleanup", schedule: "Primer día del mes", nextRun: "1 Ago 2026", lastRun: "1 Jul 2026", status: "active", runs: 3 },
  { id: "sch5", name: "Reporte semanal al equipo", type: "report", schedule: "Cada viernes a las 5:00 PM", nextRun: "Vie 17:00", lastRun: "Vie pasado", status: "paused", runs: 8 },
];

const SCHEDULES = ["Cada hora", "Cada día a las 8:00 AM", "Cada día a las 9:00 AM", "Cada día a las 5:00 PM", "Cada lunes a las 10:00 AM", "Cada viernes a las 5:00 PM", "Primer día del mes", "Cada 15 del mes", "Personalizado"];

export default function SchedulerPage() {
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ name: "", type: "follow_up" as ScheduledTask["type"], schedule: SCHEDULES[1]! });

  useEffect(() => { setTasks(loadFromStorage("scheduler_tasks", SEED)); }, []);
  function save(u: ScheduledTask[]) { setTasks(u); saveToStorage("scheduler_tasks", u); }
  function create() { if (!form.name.trim()) return; save([{ id: generateId(), ...form, nextRun: "Pendiente", lastRun: "Nunca", status: "active", runs: 0 }, ...tasks]); setForm({ name: "", type: "follow_up", schedule: SCHEDULES[1]! }); setShowNew(false); }
  function toggle(id: string) { save(tasks.map((t) => t.id === id ? { ...t, status: t.status === "active" ? "paused" as const : "active" as const } : t)); }
  function remove(id: string) { save(tasks.filter((t) => t.id !== id)); }

  const activeCount = tasks.filter((t) => t.status === "active").length;

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div><h1 className="text-2xl font-bold flex items-center gap-2"><Clock className="h-6 w-6 text-brand" />Scheduler</h1><p className="text-sm text-muted-foreground">Tareas programadas: follow-ups, re-engagement, recordatorios, reportes y limpieza. {activeCount} activas.</p></div>
          <button onClick={() => setShowNew(true)} className="flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"><Plus className="h-4 w-4" />Nueva tarea</button>
        </div>

        {showNew && (
          <div className="mb-4 rounded-lg border bg-white p-4 space-y-3">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nombre de la tarea *" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
            <div className="grid grid-cols-2 gap-3">
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ScheduledTask["type"] })} className="rounded-md border px-3 py-2 text-sm">{Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
              <select value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} className="rounded-md border px-3 py-2 text-sm">{SCHEDULES.map((s) => <option key={s} value={s}>{s}</option>)}</select>
            </div>
            <div className="flex gap-2"><button onClick={create} className="rounded bg-brand px-4 py-2 text-sm text-white hover:bg-brand-hover">Crear</button><button onClick={() => setShowNew(false)} className="rounded border px-4 py-2 text-sm">Cancelar</button></div>
          </div>
        )}

        <div className="space-y-3">
          {tasks.map((task) => {
            const typeInfo = TYPES[task.type];
            return (
              <div key={task.id} className={`rounded-lg border bg-white p-4 ${task.status === "paused" ? "opacity-60" : ""}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${task.status === "active" ? "bg-brand/10" : "bg-gray-100"}`}>
                      {task.status === "active" ? <RefreshCw className="h-4 w-4 text-brand" /> : <Clock className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{task.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className={`rounded px-1.5 py-0.5 text-[9px] font-medium ${typeInfo.color}`}>{typeInfo.label}</span>
                        <span>· {task.schedule}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggle(task.id)} className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${task.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{task.status === "active" ? "Activa" : "Pausada"}</button>
                    <button onClick={() => remove(task.id)} className="text-muted-foreground hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3 text-xs border-t pt-2">
                  <div className="flex items-center gap-1 text-muted-foreground"><Calendar className="h-3 w-3" />Próxima: <strong>{task.nextRun}</strong></div>
                  <div className="flex items-center gap-1 text-muted-foreground"><Clock className="h-3 w-3" />Última: {task.lastRun}</div>
                  <div className="flex items-center gap-1 text-muted-foreground"><CheckCircle2 className="h-3 w-3" />{task.runs} ejecuciones</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
