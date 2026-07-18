"use client";
import { useState, useEffect } from "react";
import { ArrowRight, Clock, GitBranch, Mail, MessageSquare, Pause, Phone, Play, Plus, Trash2, Users } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";

type SequenceStep = { id: string; channel: string; action: string; delay: string; subject: string; stopOnReply: boolean };
type Sequence = { id: string; name: string; steps: SequenceStep[]; active: boolean; enrolled: number; completed: number; replied: number; bounced: number; createdAt: string };

const CHANNELS = ["Email", "WhatsApp", "LinkedIn", "SMS", "Llamada", "Telegram"];
const DELAYS = ["Inmediato", "30 min", "1 hora", "4 horas", "12 horas", "1 día", "2 días", "3 días", "5 días", "7 días", "14 días"];

const SEED: Sequence[] = [
  { id: "sq1", name: "Outbound B2B — Tech", active: true, enrolled: 120, completed: 45, replied: 28, bounced: 5, createdAt: "2026-07-01", steps: [
    { id: "st1", channel: "LinkedIn", action: "Enviar conexión + nota", delay: "Inmediato", subject: "Conexión con nota personalizada", stopOnReply: true },
    { id: "st2", channel: "Email", action: "Email frío personalizado", delay: "2 días", subject: "{{nombre}}, una idea para {{empresa}}", stopOnReply: true },
    { id: "st3", channel: "LinkedIn", action: "Follow-up mensaje", delay: "3 días", subject: "Seguimiento si aceptó conexión", stopOnReply: true },
    { id: "st4", channel: "Email", action: "Valor + caso de éxito", delay: "3 días", subject: "Cómo ayudamos a {{empresa_similar}}", stopOnReply: true },
    { id: "st5", channel: "WhatsApp", action: "Mensaje corto", delay: "5 días", subject: "Hola {{nombre}}, ¿viste mi email?", stopOnReply: true },
    { id: "st6", channel: "Llamada", action: "Llamar directo", delay: "2 días", subject: "Llamada de 2 min — last touch", stopOnReply: false },
  ]},
  { id: "sq2", name: "Nurture — Inbound leads", active: true, enrolled: 85, completed: 62, replied: 34, bounced: 2, createdAt: "2026-06-15", steps: [
    { id: "st7", channel: "Email", action: "Bienvenida + recurso gratis", delay: "Inmediato", subject: "Gracias por descargar — tu recurso", stopOnReply: false },
    { id: "st8", channel: "WhatsApp", action: "Saludo personal", delay: "1 hora", subject: "Hola, soy {{agente}} de LocalRank", stopOnReply: true },
    { id: "st9", channel: "Email", action: "Caso de éxito", delay: "3 días", subject: "Cómo {{cliente}} logró +40% ventas", stopOnReply: true },
    { id: "st10", channel: "Email", action: "Invitación demo", delay: "5 días", subject: "¿15 min para mostrarte cómo funciona?", stopOnReply: true },
  ]},
];

export default function SequencesPage() {
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [editing, setEditing] = useState<Sequence | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => { setSequences(loadFromStorage("crm_sequences", SEED)); }, []);
  function save(u: Sequence[]) { setSequences(u); saveToStorage("crm_sequences", u); }
  function create() { if (!newName.trim()) return; const s: Sequence = { id: generateId(), name: newName, steps: [], active: false, enrolled: 0, completed: 0, replied: 0, bounced: 0, createdAt: new Date().toISOString().split("T")[0]! }; save([s, ...sequences]); setEditing(s); setNewName(""); setShowNew(false); }
  function update(u: Sequence) { save(sequences.map((s) => s.id === u.id ? u : s)); setEditing(u); }
  function remove(id: string) { save(sequences.filter((s) => s.id !== id)); if (editing?.id === id) setEditing(null); }
  function addStep() { if (!editing) return; update({ ...editing, steps: [...editing.steps, { id: generateId(), channel: "Email", action: "", delay: "1 día", subject: "", stopOnReply: true }] }); }
  function updateStep(stepId: string, field: Partial<SequenceStep>) { if (!editing) return; update({ ...editing, steps: editing.steps.map((s) => s.id === stepId ? { ...s, ...field } : s) }); }
  function removeStep(stepId: string) { if (!editing) return; update({ ...editing, steps: editing.steps.filter((s) => s.id !== stepId) }); }

  const CHANNEL_ICONS: Record<string, typeof Mail> = { Email: Mail, WhatsApp: MessageSquare, LinkedIn: Users, SMS: MessageSquare, Llamada: Phone, Telegram: MessageSquare };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div><h1 className="text-2xl font-bold flex items-center gap-2"><GitBranch className="h-6 w-6 text-brand" />Secuencias Multicanal</h1><p className="text-sm text-muted-foreground">Cadenas automatizadas: email → WhatsApp → LinkedIn → llamada con delays y stop-on-reply.</p></div>
          <button onClick={() => setShowNew(true)} className="flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"><Plus className="h-4 w-4" />Nueva</button>
        </div>

        {showNew && (
          <div className="mb-4 flex gap-2"><input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nombre de la secuencia *" className="flex-1 rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none" /><button onClick={create} className="rounded bg-brand px-4 py-2 text-sm text-white">Crear</button><button onClick={() => setShowNew(false)} className="rounded border px-3 py-2 text-sm">✕</button></div>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* List */}
          <div className="space-y-2">
            {sequences.map((seq) => (
              <div key={seq.id} onClick={() => setEditing(seq)} className={`rounded-lg border bg-white p-4 cursor-pointer hover:shadow-sm ${editing?.id === seq.id ? "border-brand" : ""}`}>
                <div className="flex items-center justify-between"><span className="text-sm font-semibold">{seq.name}</span><span className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${seq.active ? "bg-green-100 text-green-700" : "bg-gray-100"}`}>{seq.active ? "Activa" : "Pausada"}</span></div>
                <p className="text-xs text-muted-foreground mt-1">{seq.steps.length} pasos · {seq.steps.map((s) => s.channel).filter((v, i, a) => a.indexOf(v) === i).join(" → ")}</p>
                <div className="mt-2 grid grid-cols-4 gap-1 text-center text-[9px]">
                  <div><p className="font-bold">{seq.enrolled}</p><p className="text-muted-foreground">Inscritos</p></div>
                  <div><p className="font-bold">{seq.completed}</p><p className="text-muted-foreground">Completos</p></div>
                  <div><p className="font-bold text-brand">{seq.replied}</p><p className="text-muted-foreground">Respondieron</p></div>
                  <div><p className="font-bold text-red-500">{seq.bounced}</p><p className="text-muted-foreground">Bounced</p></div>
                </div>
              </div>
            ))}
          </div>

          {/* Editor */}
          {editing ? (
            <div className="lg:col-span-2 rounded-lg border bg-white p-5 space-y-4">
              <div className="flex items-center justify-between">
                <input value={editing.name} onChange={(e) => update({ ...editing, name: e.target.value })} className="text-lg font-semibold border-0 bg-transparent p-0 flex-1 focus:outline-none" />
                <div className="flex gap-2">
                  <button onClick={() => update({ ...editing, active: !editing.active })} className={`flex items-center gap-1 rounded px-3 py-1.5 text-xs font-medium ${editing.active ? "bg-green-100 text-green-700" : "bg-gray-100"}`}>{editing.active ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}{editing.active ? "Pausar" : "Activar"}</button>
                  <button onClick={() => remove(editing.id)} className="rounded border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-2">
                {editing.steps.map((step, idx) => {
                  const Icon = CHANNEL_ICONS[step.channel] || Mail;
                  return (
                    <div key={step.id} className="flex items-start gap-3 rounded border p-3">
                      <div className="flex flex-col items-center gap-1 pt-1">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand/10 text-[10px] font-bold text-brand">{idx + 1}</span>
                        {idx < editing.steps.length - 1 && <div className="h-8 w-px bg-gray-200" />}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                          <select value={step.channel} onChange={(e) => updateStep(step.id, { channel: e.target.value })} className="rounded border px-2 py-1.5 text-xs">{CHANNELS.map((c) => <option key={c} value={c}>{c}</option>)}</select>
                          <select value={step.delay} onChange={(e) => updateStep(step.id, { delay: e.target.value })} className="rounded border px-2 py-1.5 text-xs">{DELAYS.map((d) => <option key={d} value={d}>{d}</option>)}</select>
                          <label className="flex items-center gap-1 text-[10px]"><input type="checkbox" checked={step.stopOnReply} onChange={(e) => updateStep(step.id, { stopOnReply: e.target.checked })} className="accent-[var(--accent)]" />Stop si responde</label>
                        </div>
                        <input value={step.subject} onChange={(e) => updateStep(step.id, { subject: e.target.value })} placeholder="Asunto / mensaje" className="w-full rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none" />
                      </div>
                      <button onClick={() => removeStep(step.id)} className="mt-1 text-muted-foreground hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  );
                })}
              </div>
              <button onClick={addStep} className="w-full rounded-md border border-dashed py-2 text-xs text-muted-foreground hover:border-brand hover:text-brand">+ Agregar paso</button>

              {/* Visual flow */}
              {editing.steps.length > 0 && (
                <div className="flex items-center gap-1 overflow-x-auto pb-2 border-t pt-3">
                  {editing.steps.map((s, i) => {
                    const Icon = CHANNEL_ICONS[s.channel] || Mail;
                    return (<span key={s.id} className="flex items-center gap-1"><span className="flex items-center gap-1 rounded border px-2 py-1 text-[9px] whitespace-nowrap"><Icon className="h-3 w-3" />{s.channel}<span className="text-muted-foreground">({s.delay})</span></span>{i < editing.steps.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />}</span>);
                  })}
                </div>
              )}
            </div>
          ) : <div className="lg:col-span-2 flex items-center justify-center rounded-lg border bg-white p-12"><p className="text-sm text-muted-foreground">Selecciona una secuencia</p></div>}
        </div>
      </div>
    </div>
  );
}
