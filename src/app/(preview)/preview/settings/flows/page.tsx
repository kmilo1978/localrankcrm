"use client";
import { useState, useEffect } from "react";
import { ArrowRight, GitBranch, Plus, Trash2, Zap } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";

type FlowStep = { id: string; channel: string; action: string; delay: string; condition: string };
type Flow = { id: string; name: string; trigger: string; label: string; steps: FlowStep[]; active: boolean; stats: { enrolled: number; completed: number; converted: number } };

const CHANNELS = ["WhatsApp", "Email", "SMS", "Instagram DM", "LinkedIn", "Telegram", "Llamada"];
const ACTIONS = ["Enviar plantilla", "Enviar mensaje personalizado", "Enviar media", "Esperar respuesta", "Asignar etiqueta", "Mover a pipeline", "Notificar equipo", "Validar número"];
const TRIGGERS = ["Nuevo lead importado", "Etiqueta asignada", "Sin respuesta X días", "Formulario completado", "Lead score > 80", "Fecha programada", "Manual"];
const DELAYS = ["Inmediato", "1 hora", "4 horas", "12 horas", "24 horas", "48 horas", "3 días", "7 días"];

const SEED: Flow[] = [
  { id: "fl1", name: "Secuencia Onboarding", trigger: "Nuevo lead importado", label: "Nuevo lead", active: true, stats: { enrolled: 124, completed: 89, converted: 34 }, steps: [
    { id: "fs1", channel: "WhatsApp", action: "Enviar plantilla", delay: "Inmediato", condition: "Siempre" },
    { id: "fs2", channel: "Email", action: "Enviar mensaje personalizado", delay: "4 horas", condition: "Si no respondió WhatsApp" },
    { id: "fs3", channel: "SMS", action: "Enviar plantilla", delay: "24 horas", condition: "Si no abrió email" },
    { id: "fs4", channel: "WhatsApp", action: "Enviar media", delay: "48 horas", condition: "Si no respondió" },
  ]},
  { id: "fl2", name: "Re-engagement Fríos", trigger: "Sin respuesta X días", label: "Prospecto caliente", active: false, stats: { enrolled: 45, completed: 22, converted: 8 }, steps: [
    { id: "fs5", channel: "LinkedIn", action: "Enviar mensaje personalizado", delay: "Inmediato", condition: "Siempre" },
    { id: "fs6", channel: "Email", action: "Enviar plantilla", delay: "3 días", condition: "Si no aceptó conexión" },
    { id: "fs7", channel: "WhatsApp", action: "Enviar plantilla", delay: "7 días", condition: "Si no respondió email" },
  ]},
];

export default function FlowsPage() {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [editing, setEditing] = useState<Flow | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ name: "", trigger: TRIGGERS[0]!, label: "" });

  useEffect(() => { setFlows(loadFromStorage("crm_flows", SEED)); }, []);
  function save(u: Flow[]) { setFlows(u); saveToStorage("crm_flows", u); }

  function createFlow() {
    if (!newForm.name.trim()) return;
    const f: Flow = { id: generateId(), name: newForm.name, trigger: newForm.trigger, label: newForm.label, steps: [], active: false, stats: { enrolled: 0, completed: 0, converted: 0 } };
    save([f, ...flows]); setEditing(f); setShowNew(false); setNewForm({ name: "", trigger: TRIGGERS[0]!, label: "" });
  }
  function deleteFlow(id: string) { save(flows.filter((f) => f.id !== id)); if (editing?.id === id) setEditing(null); }
  function toggleFlow(id: string) { save(flows.map((f) => f.id === id ? { ...f, active: !f.active } : f)); }
  function updateFlow(updated: Flow) { save(flows.map((f) => f.id === updated.id ? updated : f)); setEditing(updated); }

  function addStep() {
    if (!editing) return;
    updateFlow({ ...editing, steps: [...editing.steps, { id: generateId(), channel: CHANNELS[0]!, action: ACTIONS[0]!, delay: DELAYS[0]!, condition: "Siempre" }] });
  }
  function removeStep(stepId: string) { if (!editing) return; updateFlow({ ...editing, steps: editing.steps.filter((s) => s.id !== stepId) }); }
  function updateStep(stepId: string, field: keyof FlowStep, value: string) { if (!editing) return; updateFlow({ ...editing, steps: editing.steps.map((s) => s.id === stepId ? { ...s, [field]: value } : s) }); }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2"><GitBranch className="h-5 w-5 text-brand" />Flows — Estrategia Multicanal</h3>
        <p className="mt-1 text-sm text-muted-foreground">Crea secuencias automáticas que combinan WhatsApp, Email, SMS, LinkedIn y más.</p>
      </div>

      {/* Flow list */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {flows.map((f) => (
          <div key={f.id} onClick={() => setEditing(f)} className={`rounded-lg border bg-white p-4 cursor-pointer hover:shadow-sm transition-shadow ${editing?.id === f.id ? "border-brand" : ""}`}>
            <div className="flex items-start justify-between">
              <div><p className="text-sm font-semibold">{f.name}</p><p className="text-xs text-muted-foreground">{f.trigger} · {f.steps.length} pasos</p></div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={f.active} onChange={(e) => { e.stopPropagation(); toggleFlow(f.id); }} className="accent-[var(--accent)]" />{f.active ? "ON" : "OFF"}</label>
                <button onClick={(e) => { e.stopPropagation(); deleteFlow(f.id); }} className="text-muted-foreground hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
            {f.stats.enrolled > 0 && (
              <div className="mt-2 flex gap-3 text-[10px] text-muted-foreground">
                <span>{f.stats.enrolled} inscritos</span><span>{f.stats.completed} completaron</span><span className="text-brand">{f.stats.converted} convertidos</span>
              </div>
            )}
            <div className="mt-2 flex items-center gap-1">
              {f.steps.slice(0, 4).map((s, i) => (
                <span key={s.id} className="flex items-center gap-0.5">
                  <span className="rounded bg-brand/10 px-1.5 py-0.5 text-[9px] font-medium text-brand">{s.channel}</span>
                  {i < Math.min(f.steps.length - 1, 3) && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                </span>
              ))}
              {f.steps.length > 4 && <span className="text-[9px] text-muted-foreground">+{f.steps.length - 4}</span>}
            </div>
          </div>
        ))}
        <button onClick={() => setShowNew(true)} className="rounded-lg border border-dashed p-4 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:border-brand hover:text-brand transition-colors">
          <Plus className="h-4 w-4" />Nuevo flow
        </button>
      </div>

      {/* New flow form */}
      {showNew && (
        <div className="rounded-lg border bg-white p-4 space-y-3">
          <input value={newForm.name} onChange={(e) => setNewForm({ ...newForm, name: e.target.value })} placeholder="Nombre del flow *" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
          <div className="grid grid-cols-2 gap-3">
            <select value={newForm.trigger} onChange={(e) => setNewForm({ ...newForm, trigger: e.target.value })} className="rounded-md border px-3 py-2 text-sm"><option value="">Trigger...</option>{TRIGGERS.map((t) => <option key={t} value={t}>{t}</option>)}</select>
            <input value={newForm.label} onChange={(e) => setNewForm({ ...newForm, label: e.target.value })} placeholder="Etiqueta activadora" className="rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
          </div>
          <div className="flex gap-2"><button onClick={createFlow} className="rounded bg-brand px-4 py-2 text-sm text-white hover:bg-brand-hover">Crear</button><button onClick={() => setShowNew(false)} className="rounded border px-4 py-2 text-sm">Cancelar</button></div>
        </div>
      )}

      {/* Flow editor */}
      {editing && (
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <div><h4 className="font-semibold">{editing.name}</h4><p className="text-xs text-muted-foreground">Trigger: {editing.trigger}{editing.label ? ` · Etiqueta: ${editing.label}` : ""}</p></div>
            <button onClick={addStep} className="flex items-center gap-1 rounded bg-brand px-3 py-1.5 text-xs text-white hover:bg-brand-hover"><Plus className="h-3.5 w-3.5" />Paso</button>
          </div>

          <div className="space-y-3">
            {editing.steps.map((step, idx) => (
              <div key={step.id} className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">{idx + 1}</span>
                <div className="flex-1 grid grid-cols-4 gap-2">
                  <select value={step.channel} onChange={(e) => updateStep(step.id, "channel", e.target.value)} className="rounded border px-2 py-1.5 text-xs">{CHANNELS.map((c) => <option key={c} value={c}>{c}</option>)}</select>
                  <select value={step.action} onChange={(e) => updateStep(step.id, "action", e.target.value)} className="rounded border px-2 py-1.5 text-xs">{ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}</select>
                  <select value={step.delay} onChange={(e) => updateStep(step.id, "delay", e.target.value)} className="rounded border px-2 py-1.5 text-xs">{DELAYS.map((d) => <option key={d} value={d}>{d}</option>)}</select>
                  <input value={step.condition} onChange={(e) => updateStep(step.id, "condition", e.target.value)} placeholder="Condición" className="rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none" />
                </div>
                <button onClick={() => removeStep(step.id)} className="text-muted-foreground hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            ))}
            {editing.steps.length === 0 && <p className="text-center py-4 text-xs text-muted-foreground">Sin pasos. Agrega pasos con el botón + Paso.</p>}
          </div>

          {/* Visual flow */}
          {editing.steps.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs font-medium text-muted-foreground mb-2">Vista de flujo:</p>
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700 whitespace-nowrap">🎯 {editing.trigger}</span>
                {editing.steps.map((s) => (
                  <span key={s.id} className="flex items-center gap-1">
                    <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="rounded border px-2 py-1 text-[10px] whitespace-nowrap">{s.channel}: {s.action}<br/><span className="text-muted-foreground">⏱ {s.delay}</span></span>
                  </span>
                ))}
                <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                <span className="rounded bg-brand/10 px-2 py-1 text-xs font-medium text-brand whitespace-nowrap">✅ Completado</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
