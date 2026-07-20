"use client";
import { useState, useEffect } from "react";
import { Bell, BellRing, Bot, Calendar, CheckCircle2, Clock, Mail, MessageSquare, Phone, Plus, RefreshCw, Send, Settings, Sparkles, Trash2, X } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";
import { crmAI, isAiConfigured } from "@/lib/ai-client";

type ReminderChannel = "email" | "sms" | "whatsapp";
type MeetingReminder = {
  id: string;
  meetingTitle: string;
  meetingDate: string;
  meetingTime: string;
  attendees: { name: string; email: string; phone: string }[];
  channels: ReminderChannel[];
  remindBefore: number[]; // minutes before: [1440, 60, 15] = 1 day, 1h, 15min
  autoEnabled: boolean;
  customMessage: string;
  status: "scheduled" | "sent" | "partial" | "failed";
  sentAt: string;
  createdAt: string;
};

type ReminderConfig = {
  defaultChannels: ReminderChannel[];
  defaultRemindBefore: number[];
  twilioConfigured: boolean;
  googleCalendarLinked: boolean;
};

const REMIND_OPTIONS = [
  { value: 10080, label: "1 semana antes" },
  { value: 1440, label: "1 día antes" },
  { value: 120, label: "2 horas antes" },
  { value: 60, label: "1 hora antes" },
  { value: 30, label: "30 min antes" },
  { value: 15, label: "15 min antes" },
  { value: 5, label: "5 min antes" },
];

const SEED_REMINDERS: MeetingReminder[] = [
  { id: "mr1", meetingTitle: "Demo TechCorp — Propuesta Enterprise", meetingDate: "2026-07-22", meetingTime: "10:00", attendees: [{ name: "Carlos Ruiz", email: "carlos@techcorp.com", phone: "+52 55 1234 5678" }], channels: ["email", "whatsapp"], remindBefore: [1440, 60], autoEnabled: true, customMessage: "", status: "scheduled", sentAt: "", createdAt: "2026-07-20" },
  { id: "mr2", meetingTitle: "Kickoff MediaGroup", meetingDate: "2026-07-23", meetingTime: "15:00", attendees: [{ name: "Roberto Méndez", email: "roberto@mediagroup.mx", phone: "+52 33 9876 5432" }, { name: "Ana López", email: "ana@localrank.co", phone: "" }], channels: ["email", "sms"], remindBefore: [1440, 30], autoEnabled: true, customMessage: "", status: "scheduled", sentAt: "", createdAt: "2026-07-20" },
  { id: "mr3", meetingTitle: "Seguimiento LogiNext", meetingDate: "2026-07-21", meetingTime: "11:00", attendees: [{ name: "María García", email: "maria@loginext.io", phone: "+1 305 555 0123" }], channels: ["whatsapp"], remindBefore: [60, 15], autoEnabled: false, customMessage: "", status: "sent", sentAt: "2026-07-21 10:00", createdAt: "2026-07-19" },
];

const DEFAULT_CONFIG: ReminderConfig = {
  defaultChannels: ["email", "whatsapp"],
  defaultRemindBefore: [1440, 60],
  twilioConfigured: false,
  googleCalendarLinked: false,
};

export default function MeetingRemindersPage() {
  const [reminders, setReminders] = useState<MeetingReminder[]>([]);
  const [config, setConfig] = useState<ReminderConfig>(DEFAULT_CONFIG);
  const [showNew, setShowNew] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({
    meetingTitle: "", meetingDate: "", meetingTime: "",
    attendeeName: "", attendeeEmail: "", attendeePhone: "",
    attendees: [] as { name: string; email: string; phone: string }[],
    channels: ["email", "whatsapp"] as ReminderChannel[],
    remindBefore: [1440, 60] as number[],
    autoEnabled: true,
    customMessage: "",
  });

  useEffect(() => {
    setReminders(loadFromStorage("meeting_reminders", SEED_REMINDERS));
    setConfig(loadFromStorage("meeting_reminder_config", DEFAULT_CONFIG));
  }, []);

  function save(u: MeetingReminder[]) { setReminders(u); saveToStorage("meeting_reminders", u); }
  function saveConfig(c: ReminderConfig) { setConfig(c); saveToStorage("meeting_reminder_config", c); }
  function notify(m: string) { setToast(m); setTimeout(() => setToast(""), 2500); }

  function addAttendee() {
    if (!form.attendeeName.trim()) return;
    setForm({ ...form, attendees: [...form.attendees, { name: form.attendeeName, email: form.attendeeEmail, phone: form.attendeePhone }], attendeeName: "", attendeeEmail: "", attendeePhone: "" });
  }

  function createReminder() {
    if (!form.meetingTitle.trim() || !form.meetingDate || form.attendees.length === 0) return;
    const reminder: MeetingReminder = {
      id: generateId(), meetingTitle: form.meetingTitle, meetingDate: form.meetingDate, meetingTime: form.meetingTime,
      attendees: form.attendees, channels: form.channels, remindBefore: form.remindBefore,
      autoEnabled: form.autoEnabled, customMessage: form.customMessage, status: "scheduled", sentAt: "", createdAt: new Date().toISOString().split("T")[0]!,
    };
    save([reminder, ...reminders]);
    setForm({ meetingTitle: "", meetingDate: "", meetingTime: "", attendeeName: "", attendeeEmail: "", attendeePhone: "", attendees: [], channels: config.defaultChannels, remindBefore: config.defaultRemindBefore, autoEnabled: true, customMessage: "" });
    setShowNew(false); notify("Recordatorio programado");
  }

  // AI features
  const [generatingMsg, setGeneratingMsg] = useState(false);

  async function generateAiMessage() {
    setGeneratingMsg(true);
    if (isAiConfigured()) {
      const result = await crmAI(`Genera un mensaje de recordatorio corto y profesional para la reunión "${form.meetingTitle}" programada para ${form.meetingDate} a las ${form.meetingTime}. Asistentes: ${form.attendees.map(a => a.name).join(", ")}. El mensaje debe ser amigable, breve (máximo 3 líneas) y motivar la asistencia. En español.`);
      setForm(f => ({ ...f, customMessage: result }));
    } else {
      const attendeeNames = form.attendees.map(a => a.name).join(" y ");
      const msg = `Hola ${attendeeNames || "equipo"},\n\nTe recordamos que tenemos programada la reunión "${form.meetingTitle}" para el ${form.meetingDate} a las ${form.meetingTime}.\n\n¡Te esperamos! Confirma tu asistencia respondiendo este mensaje.`;
      setForm(f => ({ ...f, customMessage: msg }));
    }
    setGeneratingMsg(false);
  }

  async function suggestTiming() {
    if (!form.meetingDate || !form.meetingTime) { notify("Ingresa fecha y hora primero"); return; }
    const suggestion = form.meetingTime < "12:00"
      ? "Para reuniones de mañana, recomiendo recordar: 1 día antes + 1 hora antes."
      : form.meetingTime >= "15:00"
        ? "Para reuniones de tarde, recomiendo recordar: 1 día antes + 30 min antes (la gente se distrae después de almuerzo)."
        : "Para reuniones de mediodía, recomiendo recordar: 1 día antes + 2 horas antes.";
    notify(suggestion);
  }

  function sendNow(id: string) {
    save(reminders.map(r => r.id === id ? { ...r, status: "sent" as const, sentAt: new Date().toLocaleString("es-CO") } : r));
    notify("Recordatorio enviado manualmente");
  }

  function toggleAuto(id: string) {
    save(reminders.map(r => r.id === id ? { ...r, autoEnabled: !r.autoEnabled } : r));
  }

  function deleteReminder(id: string) { save(reminders.filter(r => r.id !== id)); }

  function resetConfig() {
    saveConfig(DEFAULT_CONFIG);
    notify("Configuración restablecida");
  }

  const scheduled = reminders.filter(r => r.status === "scheduled");
  const sent = reminders.filter(r => r.status === "sent" || r.status === "partial");

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><BellRing className="h-6 w-6 text-brand" />Meeting Reminders</h1>
            <p className="text-sm text-muted-foreground">{scheduled.length} programados · Recordatorios automáticos por email, SMS y WhatsApp</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowConfig(!showConfig)} className="flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-medium hover:bg-gray-50"><Settings className="h-3.5 w-3.5" />Config</button>
            <button onClick={() => setShowNew(true)} className="flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"><Plus className="h-4 w-4" />Nuevo recordatorio</button>
          </div>
        </div>

        {/* Config panel */}
        {showConfig && (
          <div className="mb-6 rounded-lg border bg-white p-5">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Settings className="h-4 w-4" />Configuración</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Canales por defecto</label>
                <div className="flex gap-2">
                  {(["email", "sms", "whatsapp"] as ReminderChannel[]).map(ch => (
                    <button key={ch} onClick={() => { const next = config.defaultChannels.includes(ch) ? config.defaultChannels.filter(c => c !== ch) : [...config.defaultChannels, ch]; saveConfig({ ...config, defaultChannels: next }); }} className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium ${config.defaultChannels.includes(ch) ? "bg-brand text-white" : "border hover:bg-gray-50"}`}>
                      {ch === "email" ? <Mail className="h-3 w-3" /> : ch === "sms" ? <Phone className="h-3 w-3" /> : <MessageSquare className="h-3 w-3" />}{ch}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Integraciones</label>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`h-2 w-2 rounded-full ${config.googleCalendarLinked ? "bg-green-500" : "bg-gray-300"}`} />
                    <span>Google Calendar</span>
                    <button onClick={() => saveConfig({ ...config, googleCalendarLinked: !config.googleCalendarLinked })} className="text-[10px] text-brand hover:underline ml-auto">{config.googleCalendarLinked ? "Desconectar" : "Conectar"}</button>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`h-2 w-2 rounded-full ${config.twilioConfigured ? "bg-green-500" : "bg-gray-300"}`} />
                    <span>Twilio (SMS/WhatsApp)</span>
                    <button onClick={() => saveConfig({ ...config, twilioConfigured: !config.twilioConfigured })} className="text-[10px] text-brand hover:underline ml-auto">{config.twilioConfigured ? "Desconectar" : "Configurar"}</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={resetConfig} className="flex items-center gap-1 rounded border px-3 py-1.5 text-xs hover:bg-gray-50"><RefreshCw className="h-3 w-3" />Restablecer</button>
              {!config.twilioConfigured && <p className="text-[10px] text-amber-600 flex items-center gap-1">⚠ SMS y WhatsApp requieren Twilio configurado</p>}
            </div>
          </div>
        )}

        {/* Scheduled reminders */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1"><Clock className="h-3 w-3" />Programados ({scheduled.length})</h3>
          <div className="space-y-2">
            {scheduled.map(r => (
              <div key={r.id} className="group rounded-lg border bg-white p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold">{r.meetingTitle}</h4>
                      {r.autoEnabled ? <span className="rounded-full bg-green-100 px-2 py-0.5 text-[9px] font-medium text-green-700">Auto ✓</span> : <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[9px] text-gray-600">Manual</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{r.meetingDate} · {r.meetingTime}</span>
                      <span>{r.attendees.length} asistente(s)</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      {r.channels.map(ch => (
                        <span key={ch} className="flex items-center gap-0.5 rounded bg-gray-100 px-1.5 py-0.5 text-[9px]">
                          {ch === "email" ? <Mail className="h-2.5 w-2.5" /> : ch === "sms" ? <Phone className="h-2.5 w-2.5" /> : <MessageSquare className="h-2.5 w-2.5" />}{ch}
                        </span>
                      ))}
                      <span className="text-[9px] text-muted-foreground">· Recordar: {r.remindBefore.map(m => m >= 1440 ? `${m/1440}d` : m >= 60 ? `${m/60}h` : `${m}min`).join(", ")}</span>
                    </div>
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {r.attendees.map((a, i) => (
                        <span key={i} className="rounded-full bg-brand/10 px-2 py-0.5 text-[9px] text-brand">{a.name}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => sendNow(r.id)} className="rounded p-1.5 hover:bg-blue-50 text-muted-foreground hover:text-blue-600" title="Enviar ahora"><Send className="h-3.5 w-3.5" /></button>
                    <button onClick={() => toggleAuto(r.id)} className="rounded p-1.5 hover:bg-gray-100 text-muted-foreground" title="Toggle auto"><Bell className="h-3.5 w-3.5" /></button>
                    <button onClick={() => deleteReminder(r.id)} className="rounded p-1.5 hover:bg-red-50 text-muted-foreground hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              </div>
            ))}
            {scheduled.length === 0 && <p className="text-xs text-muted-foreground text-center py-6">No hay recordatorios programados</p>}
          </div>
        </div>

        {/* Sent */}
        {sent.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-500" />Enviados ({sent.length})</h3>
            <div className="space-y-1">
              {sent.map(r => (
                <div key={r.id} className="flex items-center gap-3 rounded border bg-gray-50 px-4 py-2.5 opacity-70">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{r.meetingTitle}</p>
                    <p className="text-[10px] text-muted-foreground">{r.meetingDate} · Enviado: {r.sentAt}</p>
                  </div>
                  <button onClick={() => deleteReminder(r.id)} className="text-muted-foreground hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* New reminder modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowNew(false)}>
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl mx-4 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold">Nuevo recordatorio de reunión</h3>
              <button onClick={() => setShowNew(false)} className="rounded p-1 hover:bg-gray-100"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="text-xs font-medium text-muted-foreground">Título de la reunión *</label><input value={form.meetingTitle} onChange={e => setForm({...form, meetingTitle: e.target.value})} placeholder="Demo TechCorp" className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground">Fecha *</label><input value={form.meetingDate} onChange={e => setForm({...form, meetingDate: e.target.value})} type="date" className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" /></div>
                <div><label className="text-xs font-medium text-muted-foreground">Hora</label><input value={form.meetingTime} onChange={e => setForm({...form, meetingTime: e.target.value})} type="time" className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" /></div>
              </div>

              {/* Attendees */}
              <div>
                <label className="text-xs font-medium text-muted-foreground">Asistentes *</label>
                {form.attendees.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1 mb-2">{form.attendees.map((a, i) => (
                    <span key={i} className="flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] text-brand">{a.name}<button onClick={() => setForm({...form, attendees: form.attendees.filter((_, idx) => idx !== i)})} className="hover:text-red-500">×</button></span>
                  ))}</div>
                )}
                <div className="grid grid-cols-3 gap-2 mt-1">
                  <input value={form.attendeeName} onChange={e => setForm({...form, attendeeName: e.target.value})} placeholder="Nombre *" className="rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none" />
                  <input value={form.attendeeEmail} onChange={e => setForm({...form, attendeeEmail: e.target.value})} placeholder="Email" className="rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none" />
                  <div className="flex gap-1"><input value={form.attendeePhone} onChange={e => setForm({...form, attendeePhone: e.target.value})} placeholder="Teléfono" className="flex-1 rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none" /><button onClick={addAttendee} disabled={!form.attendeeName.trim()} className="rounded bg-brand px-2 text-white text-xs disabled:opacity-50">+</button></div>
                </div>
              </div>

              {/* Channels */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Canales de notificación</label>
                <div className="flex gap-2">
                  {(["email", "sms", "whatsapp"] as ReminderChannel[]).map(ch => (
                    <button key={ch} onClick={() => { const next = form.channels.includes(ch) ? form.channels.filter(c => c !== ch) : [...form.channels, ch]; setForm({...form, channels: next}); }} className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium ${form.channels.includes(ch) ? "bg-brand/10 border-brand/30 text-brand" : "hover:bg-gray-50"}`}>
                      {ch === "email" ? <Mail className="h-3.5 w-3.5" /> : ch === "sms" ? <Phone className="h-3.5 w-3.5" /> : <MessageSquare className="h-3.5 w-3.5" />}{ch}
                    </button>
                  ))}
                </div>
              </div>

              {/* Remind before */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Recordar antes de</label>
                <div className="flex flex-wrap gap-1.5">
                  {REMIND_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => { const next = form.remindBefore.includes(opt.value) ? form.remindBefore.filter(v => v !== opt.value) : [...form.remindBefore, opt.value]; setForm({...form, remindBefore: next}); }} className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${form.remindBefore.includes(opt.value) ? "bg-brand text-white" : "border hover:bg-gray-50"}`}>{opt.label}</button>
                  ))}
                </div>
              </div>

              {/* Auto toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.autoEnabled} onChange={e => setForm({...form, autoEnabled: e.target.checked})} className="accent-brand" />
                <span className="text-xs font-medium">Enviar automáticamente (sin intervención manual)</span>
              </label>

              {/* AI Message */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Mensaje personalizado</label>
                  <div className="flex gap-1">
                    <button onClick={generateAiMessage} disabled={generatingMsg} className="flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 disabled:opacity-50">
                      {generatingMsg ? <Sparkles className="h-2.5 w-2.5 animate-spin" /> : <Bot className="h-2.5 w-2.5" />}Generar con IA
                    </button>
                    <button onClick={suggestTiming} className="flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium bg-blue-100 text-blue-700 hover:bg-blue-200">
                      <Clock className="h-2.5 w-2.5" />Sugerir timing
                    </button>
                  </div>
                </div>
                <textarea value={form.customMessage} onChange={e => setForm({...form, customMessage: e.target.value})} placeholder="Mensaje opcional. Usa IA para generarlo automáticamente." rows={3} className="w-full rounded border px-3 py-2 text-xs focus:border-brand focus:outline-none" />
                {!isAiConfigured() && <p className="text-[9px] text-amber-600 mt-0.5">⚠ Sin OpenRouter — genera mensaje con plantilla local</p>}
              </div>

              <button onClick={createReminder} disabled={!form.meetingTitle.trim() || !form.meetingDate || form.attendees.length === 0} className="w-full rounded-md bg-brand py-2.5 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50">Programar recordatorio</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-lg">{toast}</div>}
    </div>
  );
}
