"use client";
import { useState, useEffect } from "react";
import { ArrowRight, CheckCircle2, Clock, Play, Plus, Power, Trash2, XCircle, Zap } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";

type Condition = { field: string; operator: string; value: string };
type Action = { id: string; type: string; config: string };
type Automation = { id: string; name: string; trigger: string; conditions: Condition[]; actions: Action[]; active: boolean; runs: number; lastRun: string; failures: number };

const TRIGGERS = ["Nuevo contacto creado", "Lead score cambia", "Etapa del pipeline cambia", "Formulario recibido", "Mensaje recibido", "Sin respuesta X días", "Tarea vencida", "Deal ganado", "Deal perdido", "Fecha programada"];
const ACTION_TYPES = ["Enviar WhatsApp", "Enviar Email", "Enviar SMS", "Asignar etiqueta", "Mover a etapa", "Crear tarea", "Notificar equipo", "Asignar responsable", "Actualizar campo", "Webhook externo", "Esperar X tiempo", "Condición IF/ELSE"];
const FIELDS = ["lead_score", "etiqueta", "canal_origen", "ciudad", "industria", "ultimo_contacto_dias", "tiene_web", "tiene_email"];
const OPERATORS = ["es igual a", "contiene", "mayor que", "menor que", "no está vacío", "está vacío"];

const SEED: Automation[] = [
  { id: "au1", name: "Onboarding automático", trigger: "Nuevo contacto creado", conditions: [{ field: "canal_origen", operator: "es igual a", value: "formulario" }], actions: [{ id: "a1", type: "Enviar WhatsApp", config: "Plantilla: Bienvenida" }, { id: "a2", type: "Asignar etiqueta", config: "Nuevo lead" }, { id: "a3", type: "Crear tarea", config: "Llamar en 24h" }], active: true, runs: 245, lastRun: "Hace 2h", failures: 3 },
  { id: "au2", name: "Follow-up sin respuesta", trigger: "Sin respuesta X días", conditions: [{ field: "ultimo_contacto_dias", operator: "mayor que", value: "3" }], actions: [{ id: "a4", type: "Enviar Email", config: "Template: Seguimiento" }, { id: "a5", type: "Esperar X tiempo", config: "48 horas" }, { id: "a6", type: "Enviar WhatsApp", config: "Recordatorio amigable" }], active: true, runs: 89, lastRun: "Hace 5h", failures: 1 },
  { id: "au3", name: "Lead caliente → Pipeline", trigger: "Lead score cambia", conditions: [{ field: "lead_score", operator: "mayor que", value: "80" }], actions: [{ id: "a7", type: "Mover a etapa", config: "Calificación" }, { id: "a8", type: "Notificar equipo", config: "Slack: #ventas" }, { id: "a9", type: "Asignar responsable", config: "Round Robin" }], active: false, runs: 34, lastRun: "Ayer", failures: 0 },
];

const LOGS = [
  { id: "l1", automation: "Onboarding automático", status: "success", contact: "María García", time: "Hace 2h", detail: "WhatsApp enviado + etiqueta asignada" },
  { id: "l2", automation: "Follow-up sin respuesta", status: "success", contact: "Roberto Méndez", time: "Hace 5h", detail: "Email enviado, esperando 48h" },
  { id: "l3", automation: "Onboarding automático", status: "error", contact: "Lead #4521", time: "Hace 8h", detail: "Error: número inválido" },
  { id: "l4", automation: "Lead caliente → Pipeline", status: "success", contact: "Carlos Ruiz", time: "Ayer", detail: "Movido a Calificación, notificación enviada" },
];

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [editing, setEditing] = useState<Automation | null>(null);
  const [tab, setTab] = useState<"automations" | "logs">("automations");
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ name: "", trigger: TRIGGERS[0]! });

  useEffect(() => { setAutomations(loadFromStorage("crm_automations", SEED)); }, []);
  function save(u: Automation[]) { setAutomations(u); saveToStorage("crm_automations", u); }
  function toggle(id: string) { save(automations.map((a) => a.id === id ? { ...a, active: !a.active } : a)); }
  function remove(id: string) { save(automations.filter((a) => a.id !== id)); if (editing?.id === id) setEditing(null); }
  function create() { if (!newForm.name.trim()) return; const a: Automation = { id: generateId(), name: newForm.name, trigger: newForm.trigger, conditions: [], actions: [], active: false, runs: 0, lastRun: "Nunca", failures: 0 }; save([a, ...automations]); setEditing(a); setShowNew(false); }
  function update(u: Automation) { save(automations.map((a) => a.id === u.id ? u : a)); setEditing(u); }
  function addCondition() { if (!editing) return; update({ ...editing, conditions: [...editing.conditions, { field: FIELDS[0]!, operator: OPERATORS[0]!, value: "" }] }); }
  function addAction() { if (!editing) return; update({ ...editing, actions: [...editing.actions, { id: generateId(), type: ACTION_TYPES[0]!, config: "" }] }); }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Zap className="h-6 w-6 text-brand" />Automatizaciones</h1>
            <p className="text-sm text-muted-foreground">Constructor visual de reglas: triggers → condiciones → acciones</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-md border"><button onClick={() => setTab("automations")} className={`px-3 py-1.5 text-xs font-medium ${tab === "automations" ? "bg-brand text-white" : "hover:bg-gray-50"}`}>Automatizaciones</button><button onClick={() => setTab("logs")} className={`px-3 py-1.5 text-xs font-medium ${tab === "logs" ? "bg-brand text-white" : "hover:bg-gray-50"}`}>Logs</button></div>
            <button onClick={() => setShowNew(true)} className="flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"><Plus className="h-4 w-4" />Nueva</button>
          </div>
        </div>

        {showNew && (
          <div className="mb-4 rounded-lg border bg-white p-4 flex gap-3 items-end">
            <div className="flex-1"><label className="text-xs font-medium">Nombre</label><input value={newForm.name} onChange={(e) => setNewForm({ ...newForm, name: e.target.value })} placeholder="Mi automatización" className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" /></div>
            <div className="flex-1"><label className="text-xs font-medium">Trigger</label><select value={newForm.trigger} onChange={(e) => setNewForm({ ...newForm, trigger: e.target.value })} className="w-full rounded border px-3 py-2 text-sm">{TRIGGERS.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
            <button onClick={create} className="rounded bg-brand px-4 py-2 text-sm text-white">Crear</button>
            <button onClick={() => setShowNew(false)} className="rounded border px-3 py-2 text-sm">✕</button>
          </div>
        )}

        {tab === "automations" && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* List */}
            <div className="space-y-2">
              {automations.map((a) => (
                <div key={a.id} onClick={() => setEditing(a)} className={`rounded-lg border bg-white p-4 cursor-pointer hover:shadow-sm ${editing?.id === a.id ? "border-brand" : ""}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><Zap className={`h-4 w-4 ${a.active ? "text-brand" : "text-muted-foreground"}`} /><span className="text-sm font-semibold">{a.name}</span></div>
                    <div className="flex items-center gap-2">
                      <button onClick={(e) => { e.stopPropagation(); toggle(a.id); }} className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${a.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{a.active ? "ON" : "OFF"}</button>
                      <button onClick={(e) => { e.stopPropagation(); remove(a.id); }} className="text-muted-foreground hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Trigger: {a.trigger} · {a.actions.length} acciones</p>
                  <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-0.5"><Play className="h-3 w-3" />{a.runs} ejecuciones</span>
                    <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" />{a.lastRun}</span>
                    {a.failures > 0 && <span className="flex items-center gap-0.5 text-red-500"><XCircle className="h-3 w-3" />{a.failures} errores</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Editor */}
            {editing ? (
              <div className="rounded-lg border bg-white p-5 space-y-4">
                <input value={editing.name} onChange={(e) => update({ ...editing, name: e.target.value })} className="text-lg font-semibold border-0 bg-transparent p-0 w-full focus:outline-none" />

                {/* Trigger */}
                <div className="rounded border p-3 bg-green-50">
                  <label className="text-[10px] font-semibold uppercase text-green-700">⚡ Trigger</label>
                  <select value={editing.trigger} onChange={(e) => update({ ...editing, trigger: e.target.value })} className="w-full mt-1 rounded border px-2 py-1.5 text-xs">{TRIGGERS.map((t) => <option key={t} value={t}>{t}</option>)}</select>
                </div>

                {/* Conditions */}
                <div className="rounded border p-3">
                  <div className="flex items-center justify-between mb-2"><label className="text-[10px] font-semibold uppercase text-muted-foreground">🔀 Condiciones</label><button onClick={addCondition} className="text-[10px] text-brand hover:underline">+ Agregar</button></div>
                  {editing.conditions.map((c, i) => (
                    <div key={i} className="flex gap-1.5 mb-1.5">
                      <select value={c.field} onChange={(e) => { const conds = [...editing.conditions]; conds[i] = { ...c, field: e.target.value }; update({ ...editing, conditions: conds }); }} className="rounded border px-2 py-1 text-[10px] flex-1">{FIELDS.map((f) => <option key={f} value={f}>{f}</option>)}</select>
                      <select value={c.operator} onChange={(e) => { const conds = [...editing.conditions]; conds[i] = { ...c, operator: e.target.value }; update({ ...editing, conditions: conds }); }} className="rounded border px-2 py-1 text-[10px] flex-1">{OPERATORS.map((o) => <option key={o} value={o}>{o}</option>)}</select>
                      <input value={c.value} onChange={(e) => { const conds = [...editing.conditions]; conds[i] = { ...c, value: e.target.value }; update({ ...editing, conditions: conds }); }} placeholder="valor" className="rounded border px-2 py-1 text-[10px] w-20" />
                      <button onClick={() => update({ ...editing, conditions: editing.conditions.filter((_, idx) => idx !== i) })} className="text-muted-foreground hover:text-red-500 text-xs">✕</button>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="rounded border p-3">
                  <div className="flex items-center justify-between mb-2"><label className="text-[10px] font-semibold uppercase text-muted-foreground">▶ Acciones</label><button onClick={addAction} className="text-[10px] text-brand hover:underline">+ Agregar</button></div>
                  {editing.actions.map((a, i) => (
                    <div key={a.id} className="flex items-center gap-2 mb-1.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/10 text-[9px] font-bold text-brand">{i + 1}</span>
                      <select value={a.type} onChange={(e) => update({ ...editing, actions: editing.actions.map((x) => x.id === a.id ? { ...x, type: e.target.value } : x) })} className="rounded border px-2 py-1 text-[10px] flex-1">{ACTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select>
                      <input value={a.config} onChange={(e) => update({ ...editing, actions: editing.actions.map((x) => x.id === a.id ? { ...x, config: e.target.value } : x) })} placeholder="Config..." className="rounded border px-2 py-1 text-[10px] flex-1" />
                      <button onClick={() => update({ ...editing, actions: editing.actions.filter((x) => x.id !== a.id) })} className="text-muted-foreground hover:text-red-500 text-xs">✕</button>
                    </div>
                  ))}
                </div>

                {/* Visual flow */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[9px]">
                  <span className="rounded bg-green-100 px-2 py-1 text-green-700 font-medium whitespace-nowrap">⚡{editing.trigger}</span>
                  {editing.conditions.length > 0 && <><ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" /><span className="rounded bg-amber-100 px-2 py-1 text-amber-700 whitespace-nowrap">🔀 {editing.conditions.length} condición(es)</span></>}
                  {editing.actions.map((a) => <span key={a.id} className="flex items-center gap-0.5"><ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" /><span className="rounded bg-blue-100 px-2 py-1 text-blue-700 whitespace-nowrap">{a.type}</span></span>)}
                </div>
              </div>
            ) : <div className="flex items-center justify-center rounded-lg border bg-white p-12"><p className="text-sm text-muted-foreground">Selecciona una automatización</p></div>}
          </div>
        )}

        {/* Logs tab */}
        {tab === "logs" && (
          <div className="rounded-lg border bg-white overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50"><h4 className="text-sm font-semibold">Historial de ejecuciones</h4></div>
            <div className="divide-y">
              {LOGS.map((log) => (
                <div key={log.id} className="flex items-center gap-3 px-4 py-3">
                  {log.status === "success" ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" /> : <XCircle className="h-4 w-4 text-red-500 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{log.automation}</p>
                    <p className="text-xs text-muted-foreground">{log.contact} — {log.detail}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
