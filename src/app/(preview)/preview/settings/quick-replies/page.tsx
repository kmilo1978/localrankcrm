"use client";
import { useState, useEffect } from "react";
import { Clock, Image, Mic, Plus, RefreshCw, Send, Trash2, Users, Video, X, Zap } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";

type QuickMedia = { id: string; type: "image" | "video" | "audio"; name: string };
type QuickReply = {
  id: string;
  shortcut: string;
  title: string;
  body: string;
  media: QuickMedia[];
  channel: "whatsapp" | "email" | "both";
  schedule: { enabled: boolean; delay: string };
  sequence: { enabled: boolean; steps: string[] };
  roundRobin: { enabled: boolean; agents: string[] };
  category: string;
  usageCount: number;
};

const CHANNELS = [{ id: "whatsapp", label: "WhatsApp" }, { id: "email", label: "Email" }, { id: "both", label: "Ambos" }];
const DELAYS = ["Inmediato", "5 min", "15 min", "30 min", "1 hora", "2 horas", "4 horas", "Personalizado"];
const CATEGORIES = ["Ventas", "Soporte", "Seguimiento", "Onboarding", "Cobranza", "General"];
const AGENTS = ["Kevin Rivera", "Ana López", "Juan Pérez", "María Gómez"];

const SEED: QuickReply[] = [
  { id: "qr1", shortcut: "/hola", title: "Saludo inicial", body: "¡Hola {{nombre}}! 👋 Gracias por contactarnos. Soy {{agente}} de {{empresa}}. ¿En qué puedo ayudarte hoy?", media: [], channel: "both", schedule: { enabled: false, delay: "Inmediato" }, sequence: { enabled: false, steps: [] }, roundRobin: { enabled: true, agents: ["Kevin Rivera", "Ana López", "Juan Pérez"] }, category: "General", usageCount: 342 },
  { id: "qr2", shortcut: "/precio", title: "Info de precios", body: "Nuestros planes empiezan desde ${{precio_base}}/mes. Te comparto el detalle:\n\n📋 Plan Starter: $99/mes\n🚀 Plan Pro: $249/mes\n💎 Plan Enterprise: Personalizado\n\n¿Cuál te interesa para contarte más?", media: [{ id: "qm1", type: "image", name: "precios-2026.jpg" }], channel: "whatsapp", schedule: { enabled: false, delay: "Inmediato" }, sequence: { enabled: true, steps: ["Enviar precios", "Esperar 24h", "Si no responde: '¿Tuviste oportunidad de revisar?'", "Esperar 48h", "Enviar caso de éxito"] }, roundRobin: { enabled: false, agents: [] }, category: "Ventas", usageCount: 187 },
  { id: "qr3", shortcut: "/demo", title: "Agendar demo", body: "¡Perfecto! Me encantaría mostrarte cómo funciona.\n\n📅 Agenda tu demo en el horario que prefieras:\nhttps://cal.com/localrank/demo\n\nLa sesión dura ~20 min y es totalmente gratuita.", media: [{ id: "qm2", type: "video", name: "demo-preview.mp4" }], channel: "both", schedule: { enabled: true, delay: "5 min" }, sequence: { enabled: false, steps: [] }, roundRobin: { enabled: true, agents: ["Ana López", "María Gómez"] }, category: "Ventas", usageCount: 95 },
  { id: "qr4", shortcut: "/pago", title: "Recordatorio de pago", body: "Hola {{nombre}}, te recordamos que tu factura #{{factura}} por {{monto}} está pendiente.\n\nPuedes pagar aquí: {{link_pago}}\n\n¿Necesitas ayuda con el proceso?", media: [], channel: "whatsapp", schedule: { enabled: true, delay: "1 hora" }, sequence: { enabled: true, steps: ["Enviar recordatorio", "Esperar 3 días", "Segundo recordatorio", "Esperar 7 días", "Escalar a cobranza"] }, roundRobin: { enabled: false, agents: [] }, category: "Cobranza", usageCount: 64 },
  { id: "qr5", shortcut: "/gracias", title: "Agradecimiento post-compra", body: "¡Gracias por tu compra, {{nombre}}! 🎉\n\nTu orden #{{orden}} está confirmada. Te enviaremos actualizaciones por este medio.\n\n¿Hay algo más en lo que pueda ayudarte?", media: [{ id: "qm3", type: "audio", name: "bienvenida-personalizada.ogg" }], channel: "both", schedule: { enabled: false, delay: "Inmediato" }, sequence: { enabled: false, steps: [] }, roundRobin: { enabled: false, agents: [] }, category: "Onboarding", usageCount: 156 },
];

export default function QuickRepliesPage() {
  const [replies, setReplies] = useState<QuickReply[]>([]);
  const [editing, setEditing] = useState<QuickReply | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ shortcut: "/", title: "", body: "", channel: "both" as QuickReply["channel"], category: "General" });

  useEffect(() => { setReplies(loadFromStorage("quick_replies", SEED)); }, []);
  function save(u: QuickReply[]) { setReplies(u); saveToStorage("quick_replies", u); }

  function create() {
    if (!form.title.trim()) return;
    const qr: QuickReply = { id: generateId(), shortcut: form.shortcut, title: form.title, body: form.body, media: [], channel: form.channel, schedule: { enabled: false, delay: "Inmediato" }, sequence: { enabled: false, steps: [] }, roundRobin: { enabled: false, agents: [] }, category: form.category, usageCount: 0 };
    save([qr, ...replies]); setEditing(qr); setShowNew(false); setForm({ shortcut: "/", title: "", body: "", channel: "both", category: "General" });
  }
  function update(u: QuickReply) { save(replies.map((r) => r.id === u.id ? u : r)); setEditing(u); }
  function remove(id: string) { save(replies.filter((r) => r.id !== id)); if (editing?.id === id) setEditing(null); }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2"><Zap className="h-5 w-5 text-brand" />Respuestas rápidas</h3>
          <p className="mt-1 text-sm text-muted-foreground">Mensajes predefinidos con media, secuencias, programación y round robin.</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"><Plus className="h-4 w-4" />Nueva</button>
      </div>

      {showNew && (
        <div className="rounded-lg border bg-white p-5 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <input value={form.shortcut} onChange={(e) => setForm({ ...form, shortcut: e.target.value })} placeholder="/atajo" className="rounded-md border px-3 py-2 text-sm font-mono focus:border-brand focus:outline-none" />
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Título *" className="rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-md border px-3 py-2 text-sm">{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select>
          </div>
          <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Cuerpo del mensaje..." rows={3} className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
          <div className="flex gap-2">
            <select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value as QuickReply["channel"] })} className="rounded-md border px-3 py-2 text-sm">{CHANNELS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</select>
            <button onClick={create} className="rounded bg-brand px-4 py-2 text-sm text-white hover:bg-brand-hover">Crear</button>
            <button onClick={() => setShowNew(false)} className="rounded border px-3 py-2 text-sm">Cancelar</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* List */}
        <div className="lg:col-span-1 space-y-2 max-h-[600px] overflow-y-auto">
          {replies.map((r) => (
            <div key={r.id} onClick={() => setEditing(r)} className={`rounded-lg border bg-white p-3 cursor-pointer hover:shadow-sm transition-shadow ${editing?.id === r.id ? "border-brand" : ""}`}>
              <div className="flex items-center justify-between">
                <code className="text-xs font-mono text-brand">{r.shortcut}</code>
                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px]">{r.channel}</span>
              </div>
              <p className="text-sm font-medium mt-1">{r.title}</p>
              <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                <span>{r.category}</span>
                {r.media.length > 0 && <span>📎{r.media.length}</span>}
                {r.sequence.enabled && <span>🔄 Secuencia</span>}
                {r.roundRobin.enabled && <span>👥 Round Robin</span>}
                <span className="ml-auto">{r.usageCount}x usado</span>
              </div>
            </div>
          ))}
        </div>

        {/* Editor */}
        {editing ? (
          <div className="lg:col-span-2 rounded-lg border bg-white p-5 space-y-4 max-h-[600px] overflow-y-auto">
            <div className="flex items-center justify-between">
              <input value={editing.title} onChange={(e) => update({ ...editing, title: e.target.value })} className="text-lg font-semibold border-0 bg-transparent p-0 focus:outline-none flex-1" />
              <button onClick={() => remove(editing.id)} className="text-muted-foreground hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div><label className="text-[10px] font-medium text-muted-foreground">Atajo</label><input value={editing.shortcut} onChange={(e) => update({ ...editing, shortcut: e.target.value })} className="w-full rounded border px-2 py-1.5 text-sm font-mono focus:border-brand focus:outline-none" /></div>
              <div><label className="text-[10px] font-medium text-muted-foreground">Canal</label><select value={editing.channel} onChange={(e) => update({ ...editing, channel: e.target.value as QuickReply["channel"] })} className="w-full rounded border px-2 py-1.5 text-sm">{CHANNELS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</select></div>
              <div><label className="text-[10px] font-medium text-muted-foreground">Categoría</label><select value={editing.category} onChange={(e) => update({ ...editing, category: e.target.value })} className="w-full rounded border px-2 py-1.5 text-sm">{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
            </div>

            {/* Body */}
            <div><label className="text-[10px] font-medium text-muted-foreground">Mensaje</label><textarea value={editing.body} onChange={(e) => update({ ...editing, body: e.target.value })} rows={4} className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" /></div>

            {/* Media */}
            <div className="rounded border p-3">
              <label className="text-[10px] font-medium text-muted-foreground flex items-center gap-1 mb-2">Media adjunta</label>
              {editing.media.length > 0 && <div className="flex flex-wrap gap-2 mb-2">{editing.media.map((m) => (<span key={m.id} className="flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-xs">{m.type === "image" ? <Image className="h-3 w-3" /> : m.type === "video" ? <Video className="h-3 w-3" /> : <Mic className="h-3 w-3" />}{m.name}<button onClick={() => update({ ...editing, media: editing.media.filter((x) => x.id !== m.id) })} className="text-muted-foreground hover:text-red-500"><X className="h-3 w-3" /></button></span>))}</div>}
              <div className="flex gap-2">
                <button onClick={() => update({ ...editing, media: [...editing.media, { id: generateId(), type: "image", name: `img-${Date.now()}.jpg` }] })} className="flex items-center gap-1 rounded border px-2 py-1 text-xs hover:bg-gray-50"><Image className="h-3 w-3" />Imagen</button>
                <button onClick={() => update({ ...editing, media: [...editing.media, { id: generateId(), type: "video", name: `video-${Date.now()}.mp4` }] })} className="flex items-center gap-1 rounded border px-2 py-1 text-xs hover:bg-gray-50"><Video className="h-3 w-3" />Video</button>
                <button onClick={() => update({ ...editing, media: [...editing.media, { id: generateId(), type: "audio", name: `audio-${Date.now()}.ogg` }] })} className="flex items-center gap-1 rounded border px-2 py-1 text-xs hover:bg-gray-50"><Mic className="h-3 w-3" />Audio</button>
              </div>
            </div>

            {/* Schedule */}
            <div className="rounded border p-3">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-medium text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />Programar envío</label>
                <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={editing.schedule.enabled} onChange={(e) => update({ ...editing, schedule: { ...editing.schedule, enabled: e.target.checked } })} className="accent-[var(--accent)]" />{editing.schedule.enabled ? "ON" : "OFF"}</label>
              </div>
              {editing.schedule.enabled && <select value={editing.schedule.delay} onChange={(e) => update({ ...editing, schedule: { ...editing.schedule, delay: e.target.value } })} className="rounded border px-2 py-1.5 text-xs">{DELAYS.map((d) => <option key={d} value={d}>{d}</option>)}</select>}
            </div>

            {/* Sequence */}
            <div className="rounded border p-3">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-medium text-muted-foreground flex items-center gap-1"><RefreshCw className="h-3 w-3" />Secuencia</label>
                <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={editing.sequence.enabled} onChange={(e) => update({ ...editing, sequence: { ...editing.sequence, enabled: e.target.checked } })} className="accent-[var(--accent)]" />{editing.sequence.enabled ? "ON" : "OFF"}</label>
              </div>
              {editing.sequence.enabled && (
                <div className="space-y-1">
                  {editing.sequence.steps.map((s, i) => (<div key={i} className="flex items-center gap-2 text-xs"><span className="rounded-full bg-brand/10 text-brand h-5 w-5 flex items-center justify-center text-[10px] font-bold">{i + 1}</span><span className="flex-1">{s}</span><button onClick={() => update({ ...editing, sequence: { ...editing.sequence, steps: editing.sequence.steps.filter((_, idx) => idx !== i) } })} className="text-muted-foreground hover:text-red-500"><X className="h-3 w-3" /></button></div>))}
                  <div className="flex gap-1 mt-1"><input id="new-step" placeholder="Nuevo paso..." className="flex-1 rounded border px-2 py-1 text-xs focus:border-brand focus:outline-none" onKeyDown={(e) => { if (e.key === "Enter") { const inp = e.target as HTMLInputElement; if (inp.value) { update({ ...editing, sequence: { ...editing.sequence, steps: [...editing.sequence.steps, inp.value] } }); inp.value = ""; } } }} /><button onClick={() => { const inp = document.getElementById("new-step") as HTMLInputElement; if (inp?.value) { update({ ...editing, sequence: { ...editing.sequence, steps: [...editing.sequence.steps, inp.value] } }); inp.value = ""; } }} className="rounded bg-brand px-2 py-1 text-xs text-white">+</button></div>
                </div>
              )}
            </div>

            {/* Round Robin */}
            <div className="rounded border p-3">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-medium text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" />Round Robin (asignación rotativa)</label>
                <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={editing.roundRobin.enabled} onChange={(e) => update({ ...editing, roundRobin: { ...editing.roundRobin, enabled: e.target.checked } })} className="accent-[var(--accent)]" />{editing.roundRobin.enabled ? "ON" : "OFF"}</label>
              </div>
              {editing.roundRobin.enabled && (
                <div className="flex flex-wrap gap-1.5">{AGENTS.map((a) => (<button key={a} onClick={() => { const agents = editing.roundRobin.agents.includes(a) ? editing.roundRobin.agents.filter((x) => x !== a) : [...editing.roundRobin.agents, a]; update({ ...editing, roundRobin: { ...editing.roundRobin, agents } }); }} className={`rounded-full px-2 py-0.5 text-xs ${editing.roundRobin.agents.includes(a) ? "bg-brand text-white" : "border hover:bg-gray-50"}`}>{a}</button>))}</div>
              )}
            </div>

            <button onClick={() => update(editing)} className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"><Send className="inline h-3.5 w-3.5 mr-1" />Guardar</button>
          </div>
        ) : (
          <div className="lg:col-span-2 flex items-center justify-center rounded-lg border bg-white p-8"><p className="text-sm text-muted-foreground">Selecciona una respuesta rápida para editar</p></div>
        )}
      </div>
    </div>
  );
}
