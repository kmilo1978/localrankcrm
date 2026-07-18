"use client";

import { useState, useEffect, useRef } from "react";
import { BarChart3, Calendar, CheckCircle2, Clock, Database, FileText, Image, Link, Mic, Play, Plus, Send, Tag, Trash2, Upload, Video, X } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";

type MediaAttachment = { id: string; type: "image" | "video" | "audio" | "url"; name: string; url: string };

type TemplateButton = { id: string; type: "url" | "phone" | "quick_reply"; label: string; value: string };

type Template = {
  id: string;
  name: string;
  category: string;
  body: string;
  status: "draft" | "pending_approval" | "approved" | "rejected" | "active";
  media: MediaAttachment[];
  buttons: TemplateButton[];
  labels: string[];
  sequence: { enabled: boolean; delay: string; followUp: string };
  schedule: { enabled: boolean; date: string; time: string; timezone: string };
  stats: { sent: number; delivered: number; read: number; replied: number; failed: number };
  createdAt: string;
  updatedAt: string;
};

const CATEGORIES = ["Marketing", "Ventas", "Soporte", "Onboarding", "Cobranza", "Seguimiento", "Recordatorio"];
const LABELS_AVAILABLE = ["Cliente VIP", "Prospecto caliente", "Nuevo lead", "En negociación", "Renovación", "Urgente"];

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  pending_approval: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  active: "bg-blue-100 text-blue-700",
};
const STATUS_LABELS: Record<string, string> = { draft: "Borrador", pending_approval: "Pre-aprobación", approved: "Aprobada", rejected: "Rechazada", active: "Activa" };

const SEED: Template[] = [
  { id: "tp1", name: "Bienvenida nuevo lead", category: "Onboarding", body: "Hola {{nombre}}, gracias por tu interés en {{empresa}}. Soy {{agente}} y estaré encantado de ayudarte.\n\n¿Te gustaría agendar una llamada para conocer más sobre nuestros servicios?", status: "active", media: [], buttons: [{ id: "b1", type: "url", label: "Agendar llamada", value: "https://cal.com/localrank" }, { id: "b2", type: "quick_reply", label: "Sí, me interesa", value: "interested_yes" }], labels: ["Nuevo lead"], sequence: { enabled: true, delay: "24h", followUp: "Si no responde en 24h, enviar: '¿Pudiste ver mi mensaje anterior?'" }, schedule: { enabled: false, date: "", time: "", timezone: "" }, stats: { sent: 245, delivered: 238, read: 189, replied: 67, failed: 7 }, createdAt: "2026-06-01", updatedAt: "2026-07-15" },
  { id: "tp2", name: "Seguimiento propuesta", category: "Ventas", body: "Hola {{nombre}}, espero que estés bien.\n\nQuería hacer seguimiento a la propuesta que te envié el {{fecha_propuesta}}. ¿Tuviste oportunidad de revisarla?\n\nQuedo atento a cualquier pregunta.", status: "active", media: [], buttons: [{ id: "b3", type: "url", label: "Ver propuesta", value: "https://localrankcrm.com/p/{{propuesta_id}}" }, { id: "b4", type: "phone", label: "Llamar ahora", value: "+573001234567" }], labels: ["En negociación", "Cliente VIP"], sequence: { enabled: true, delay: "48h", followUp: "Recordatorio: propuesta pendiente de revisión" }, schedule: { enabled: false, date: "", time: "", timezone: "" }, stats: { sent: 89, delivered: 86, read: 72, replied: 34, failed: 3 }, createdAt: "2026-06-10", updatedAt: "2026-07-12" },
  { id: "tp3", name: "Recordatorio de pago", category: "Cobranza", body: "Hola {{nombre}}, te recordamos que tu factura #{{num_factura}} por {{monto}} vence el {{fecha_vencimiento}}.\n\nSi ya realizaste el pago, por favor ignora este mensaje.\n\nGracias.", status: "approved", media: [], buttons: [{ id: "b5", type: "url", label: "Pagar ahora", value: "https://pay.localrank.com/{{factura_id}}" }, { id: "b6", type: "quick_reply", label: "Ya pagué", value: "already_paid" }, { id: "b7", type: "quick_reply", label: "Necesito más tiempo", value: "need_time" }], labels: ["Urgente"], sequence: { enabled: false, delay: "", followUp: "" }, schedule: { enabled: true, date: "2026-07-25", time: "09:00", timezone: "America/Bogota" }, stats: { sent: 156, delivered: 152, read: 134, replied: 12, failed: 4 }, createdAt: "2026-05-20", updatedAt: "2026-07-10" },
  { id: "tp4", name: "Catálogo de servicios", category: "Marketing", body: "¡Hola {{nombre}}! 👋\n\nTe comparto nuestro catálogo actualizado de servicios para {{año}}.\n\n¿Hay algo que te interese? Con gusto agendo una demo personalizada.", status: "pending_approval", media: [{ id: "ma1", type: "image", name: "catalogo-2026.jpg", url: "" }], buttons: [{ id: "b8", type: "url", label: "Ver catálogo completo", value: "https://localrank.com/catalogo" }, { id: "b9", type: "quick_reply", label: "Quiero una demo", value: "want_demo" }], labels: ["Prospecto caliente"], sequence: { enabled: false, delay: "", followUp: "" }, schedule: { enabled: false, date: "", time: "", timezone: "" }, stats: { sent: 0, delivered: 0, read: 0, replied: 0, failed: 0 }, createdAt: "2026-07-16", updatedAt: "2026-07-16" },
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [editing, setEditing] = useState<Template | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [showUploadDB, setShowUploadDB] = useState(false);
  const [form, setForm] = useState({ name: "", category: CATEGORIES[0]!, body: "" });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setTemplates(loadFromStorage("crm_templates", SEED)); }, []);
  function save(u: Template[]) { setTemplates(u); saveToStorage("crm_templates", u); }

  function createTemplate() {
    if (!form.name.trim()) return;
    const t: Template = { id: generateId(), name: form.name, category: form.category, body: form.body, status: "draft", media: [], buttons: [], labels: [], sequence: { enabled: false, delay: "", followUp: "" }, schedule: { enabled: false, date: "", time: "", timezone: "" }, stats: { sent: 0, delivered: 0, read: 0, replied: 0, failed: 0 }, createdAt: new Date().toISOString().split("T")[0]!, updatedAt: new Date().toISOString().split("T")[0]! };
    save([t, ...templates]); setEditing(t); setForm({ name: "", category: CATEGORIES[0]!, body: "" }); setShowNew(false);
  }

  function updateTemplate(updated: Template) { save(templates.map((t) => t.id === updated.id ? { ...updated, updatedAt: new Date().toISOString().split("T")[0]! } : t)); setEditing(updated); }
  function deleteTemplate(id: string) { save(templates.filter((t) => t.id !== id)); if (editing?.id === id) setEditing(null); }
  function sendToApproval(id: string) { save(templates.map((t) => t.id === id ? { ...t, status: "pending_approval" as const } : t)); }
  function approveTemplate(id: string) { save(templates.map((t) => t.id === id ? { ...t, status: "approved" as const } : t)); }
  function activateTemplate(id: string) { save(templates.map((t) => t.id === id ? { ...t, status: "active" as const } : t)); }

  function addMedia(type: MediaAttachment["type"]) {
    if (!editing) return;
    const name = type === "url" ? prompt("Pega la URL:") : `${type}-${Date.now()}`;
    if (!name) return;
    updateTemplate({ ...editing, media: [...editing.media, { id: generateId(), type, name, url: name }] });
  }
  function removeMedia(mediaId: string) { if (!editing) return; updateTemplate({ ...editing, media: editing.media.filter((m) => m.id !== mediaId) }); }
  function toggleLabel(label: string) { if (!editing) return; const labels = editing.labels.includes(label) ? editing.labels.filter((l) => l !== label) : [...editing.labels, label]; updateTemplate({ ...editing, labels }); }

  function getSuccessRate(t: Template) { return t.stats.sent > 0 ? Math.round((t.stats.replied / t.stats.sent) * 100) : 0; }

  return (
    <div className="flex h-full">
      {/* List sidebar */}
      <div className="w-72 shrink-0 border-r flex flex-col overflow-hidden">
        <div className="border-b px-4 py-3 flex items-center justify-between">
          <h2 className="font-semibold text-sm">Plantillas</h2>
          <div className="flex gap-1">
            <button onClick={() => setShowUploadDB(!showUploadDB)} className="rounded p-1.5 hover:bg-gray-100 text-muted-foreground" title="Subir base de datos"><Database className="h-4 w-4" /></button>
            <button onClick={() => setShowNew(true)} className="flex items-center gap-1 rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-hover"><Plus className="h-3.5 w-3.5" />Nueva</button>
          </div>
        </div>

        {/* Upload DB */}
        {showUploadDB && (
          <div className="border-b p-3 bg-gray-50">
            <p className="text-xs font-medium mb-2">Subir base de datos</p>
            <p className="text-[10px] text-muted-foreground mb-2">CSV con columnas: nombre, telefono, email, etiqueta</p>
            <input type="file" ref={fileRef} accept=".csv,.xlsx,.txt" className="text-xs" onChange={() => { setShowUploadDB(false); }} />
          </div>
        )}

        {/* New template form */}
        {showNew && (
          <div className="border-b p-3 space-y-2">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nombre *" className="w-full rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none" />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded border px-2 py-1.5 text-xs"><option value="">Categoría...</option>{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select>
            <div className="flex gap-1"><button onClick={createTemplate} className="rounded bg-brand px-3 py-1 text-xs text-white">Crear</button><button onClick={() => setShowNew(false)} className="rounded border px-2 py-1 text-xs">✕</button></div>
          </div>
        )}

        {/* Template list */}
        <div className="flex-1 overflow-y-auto">
          {templates.map((t) => (
            <div key={t.id} onClick={() => setEditing(t)} className={`group cursor-pointer border-b px-4 py-3 hover:bg-gray-50 ${editing?.id === t.id ? "bg-brand-tint" : ""}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{t.name}</p>
                  <p className="text-[10px] text-muted-foreground">{t.category}</p>
                </div>
                <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-medium ${STATUS_STYLES[t.status]}`}>{STATUS_LABELS[t.status]}</span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                {t.stats.sent > 0 && <span className="flex items-center gap-0.5"><BarChart3 className="h-3 w-3" />{getSuccessRate(t)}% éxito</span>}
                {t.sequence.enabled && <span className="flex items-center gap-0.5"><Play className="h-3 w-3" />Secuencia</span>}
                {t.schedule.enabled && <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" />Programada</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}
      {editing ? (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-3xl space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <input value={editing.name} onChange={(e) => updateTemplate({ ...editing, name: e.target.value })} className="text-xl font-bold border-0 bg-transparent p-0 focus:outline-none focus:ring-0 w-full" />
                <p className="text-xs text-muted-foreground">{editing.category} · Actualizada: {editing.updatedAt}</p>
              </div>
              <div className="flex items-center gap-2">
                {editing.status === "draft" && <button onClick={() => sendToApproval(editing.id)} className="rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100">Enviar a pre-aprobación</button>}
                {editing.status === "pending_approval" && <button onClick={() => approveTemplate(editing.id)} className="rounded-md border border-green-300 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100">Aprobar</button>}
                {(editing.status === "approved" || editing.status === "draft") && <button onClick={() => activateTemplate(editing.id)} className="rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-hover">Activar</button>}
                <button onClick={() => deleteTemplate(editing.id)} className="rounded-md border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>

            {/* Stats */}
            {editing.stats.sent > 0 && (
              <div className="grid grid-cols-5 gap-3 rounded-lg border bg-white p-4">
                <div className="text-center"><p className="text-lg font-bold">{editing.stats.sent}</p><p className="text-[10px] text-muted-foreground">Enviados</p></div>
                <div className="text-center"><p className="text-lg font-bold">{editing.stats.delivered}</p><p className="text-[10px] text-muted-foreground">Entregados</p></div>
                <div className="text-center"><p className="text-lg font-bold">{editing.stats.read}</p><p className="text-[10px] text-muted-foreground">Leídos</p></div>
                <div className="text-center"><p className="text-lg font-bold text-brand">{editing.stats.replied}</p><p className="text-[10px] text-muted-foreground">Respondidos</p></div>
                <div className="text-center"><p className="text-lg font-bold text-green-600">{getSuccessRate(editing)}%</p><p className="text-[10px] text-muted-foreground">Tasa éxito</p></div>
              </div>
            )}

            {/* Body editor */}
            <div className="rounded-lg border bg-white p-4">
              <label className="mb-2 block text-xs font-semibold uppercase text-muted-foreground">Cuerpo del mensaje</label>
              <textarea value={editing.body} onChange={(e) => updateTemplate({ ...editing, body: e.target.value })} rows={6} className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" placeholder="Usa {{variable}} para personalización..." />
              <p className="mt-1 text-[10px] text-muted-foreground">Variables: {"{{nombre}}, {{empresa}}, {{agente}}, {{fecha}}, {{monto}}"}</p>
            </div>

            {/* Media */}
            <div className="rounded-lg border bg-white p-4">
              <label className="mb-2 block text-xs font-semibold uppercase text-muted-foreground">Archivos adjuntos</label>
              {editing.media.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {editing.media.map((m) => (
                    <div key={m.id} className="flex items-center gap-1.5 rounded border bg-gray-50 px-2 py-1 text-xs">
                      {m.type === "image" && <Image className="h-3 w-3 text-blue-500" />}
                      {m.type === "video" && <Video className="h-3 w-3 text-purple-500" />}
                      {m.type === "audio" && <Mic className="h-3 w-3 text-green-500" />}
                      {m.type === "url" && <Link className="h-3 w-3 text-brand" />}
                      <span className="truncate max-w-[120px]">{m.name}</span>
                      <button onClick={() => removeMedia(m.id)} className="text-muted-foreground hover:text-red-500"><X className="h-3 w-3" /></button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={() => addMedia("image")} className="flex items-center gap-1 rounded border px-2 py-1.5 text-xs hover:bg-gray-50"><Image className="h-3.5 w-3.5" />Imagen</button>
                <button onClick={() => addMedia("video")} className="flex items-center gap-1 rounded border px-2 py-1.5 text-xs hover:bg-gray-50"><Video className="h-3.5 w-3.5" />Video</button>
                <button onClick={() => addMedia("audio")} className="flex items-center gap-1 rounded border px-2 py-1.5 text-xs hover:bg-gray-50"><Mic className="h-3.5 w-3.5" />Audio</button>
                <button onClick={() => addMedia("url")} className="flex items-center gap-1 rounded border px-2 py-1.5 text-xs hover:bg-gray-50"><Link className="h-3.5 w-3.5" />URL</button>
              </div>
            </div>

            {/* Buttons */}
            <div className="rounded-lg border bg-white p-4">
              <label className="mb-2 block text-xs font-semibold uppercase text-muted-foreground">Botones (máx. 3)</label>
              {(editing.buttons || []).length > 0 && (
                <div className="space-y-2 mb-3">
                  {(editing.buttons || []).map((btn) => (
                    <div key={btn.id} className="flex items-center gap-2 rounded border bg-gray-50 px-3 py-2">
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${btn.type === "url" ? "bg-blue-100 text-blue-700" : btn.type === "phone" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"}`}>{btn.type === "url" ? "URL" : btn.type === "phone" ? "Llamar" : "Respuesta"}</span>
                      <span className="flex-1 text-xs font-medium">{btn.label}</span>
                      <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">{btn.value}</span>
                      <button onClick={() => updateTemplate({ ...editing, buttons: editing.buttons.filter((b) => b.id !== btn.id) })} className="text-muted-foreground hover:text-red-500"><X className="h-3 w-3" /></button>
                    </div>
                  ))}
                </div>
              )}
              {(editing.buttons || []).length < 3 && (
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => { const label = prompt("Texto del botón:"); const url = prompt("URL destino:"); if (label && url) updateTemplate({ ...editing, buttons: [...(editing.buttons || []), { id: generateId(), type: "url", label, value: url }] }); }} className="flex items-center gap-1 rounded border px-2 py-1.5 text-xs hover:bg-gray-50">🔗 Botón URL</button>
                  <button onClick={() => { const label = prompt("Texto del botón:"); const phone = prompt("Número de teléfono:"); if (label && phone) updateTemplate({ ...editing, buttons: [...(editing.buttons || []), { id: generateId(), type: "phone", label, value: phone }] }); }} className="flex items-center gap-1 rounded border px-2 py-1.5 text-xs hover:bg-gray-50">📞 Botón Llamar</button>
                  <button onClick={() => { const label = prompt("Texto de respuesta rápida:"); if (label) updateTemplate({ ...editing, buttons: [...(editing.buttons || []), { id: generateId(), type: "quick_reply", label, value: label.toLowerCase().replace(/\s/g, "_") }] }); }} className="flex items-center gap-1 rounded border px-2 py-1.5 text-xs hover:bg-gray-50">💬 Respuesta rápida</button>
                </div>
              )}
              <p className="mt-2 text-[10px] text-muted-foreground">URL: abre un link · Llamar: inicia llamada · Respuesta rápida: el usuario toca para responder</p>
            </div>

            {/* Labels (for auto-sequence) */}
            <div className="rounded-lg border bg-white p-4">
              <label className="mb-2 block text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1"><Tag className="h-3 w-3" />Etiquetas (envío automático)</label>
              <p className="text-[10px] text-muted-foreground mb-2">Los contactos con estas etiquetas recibirán esta plantilla automáticamente.</p>
              <div className="flex flex-wrap gap-2">
                {LABELS_AVAILABLE.map((l) => (
                  <button key={l} onClick={() => toggleLabel(l)} className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${editing.labels.includes(l) ? "bg-brand text-white" : "border hover:bg-gray-50"}`}>{l}</button>
                ))}
              </div>
            </div>

            {/* Sequence */}
            <div className="rounded-lg border bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1"><Play className="h-3 w-3" />Secuencia automática</label>
                <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={editing.sequence.enabled} onChange={(e) => updateTemplate({ ...editing, sequence: { ...editing.sequence, enabled: e.target.checked } })} className="accent-[var(--accent)]" />Activar</label>
              </div>
              {editing.sequence.enabled && (
                <div className="space-y-2 mt-2">
                  <div><label className="text-[10px] text-muted-foreground">Si no responde en:</label><select value={editing.sequence.delay} onChange={(e) => updateTemplate({ ...editing, sequence: { ...editing.sequence, delay: e.target.value } })} className="ml-2 rounded border px-2 py-1 text-xs"><option value="1h">1 hora</option><option value="4h">4 horas</option><option value="12h">12 horas</option><option value="24h">24 horas</option><option value="48h">48 horas</option><option value="72h">72 horas</option><option value="7d">7 días</option></select></div>
                  <div><label className="text-[10px] text-muted-foreground">Enviar follow-up:</label><input value={editing.sequence.followUp} onChange={(e) => updateTemplate({ ...editing, sequence: { ...editing.sequence, followUp: e.target.value } })} placeholder="Mensaje de seguimiento..." className="w-full mt-1 rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none" /></div>
                </div>
              )}
            </div>

            {/* Schedule */}
            <div className="rounded-lg border bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />Programar envío</label>
                <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={editing.schedule.enabled} onChange={(e) => updateTemplate({ ...editing, schedule: { ...editing.schedule, enabled: e.target.checked } })} className="accent-[var(--accent)]" />Activar</label>
              </div>
              {editing.schedule.enabled && (
                <div className="flex gap-3 mt-2">
                  <input type="date" value={editing.schedule.date} onChange={(e) => updateTemplate({ ...editing, schedule: { ...editing.schedule, date: e.target.value } })} className="rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none" />
                  <input type="time" value={editing.schedule.time} onChange={(e) => updateTemplate({ ...editing, schedule: { ...editing.schedule, time: e.target.value } })} className="rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none" />
                  <select value={editing.schedule.timezone} onChange={(e) => updateTemplate({ ...editing, schedule: { ...editing.schedule, timezone: e.target.value } })} className="rounded border px-2 py-1.5 text-xs"><option value="America/Bogota">Colombia (GMT-5)</option><option value="America/Mexico_City">México (GMT-6)</option><option value="America/New_York">US East (GMT-4)</option><option value="Europe/Madrid">España (GMT+2)</option></select>
                </div>
              )}
            </div>

            {/* Save button */}
            <button onClick={() => updateTemplate(editing)} className="rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-hover">Guardar plantilla</button>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center"><div className="text-center"><FileText className="mx-auto h-12 w-12 text-muted-foreground/30" /><p className="mt-3 text-sm text-muted-foreground">Selecciona o crea una plantilla</p></div></div>
      )}
    </div>
  );
}
