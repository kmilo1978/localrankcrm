"use client";
import { useState, useEffect, useRef } from "react";
import { Bell, BellRing, Clock, Copy, Edit3, Plus, Repeat, Trash2, Volume2, X } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";

type Reminder = {
  id: string; title: string; description: string; dateTime: string;
  repeat: "none" | "daily" | "weekly" | "monthly"; sound: boolean;
  active: boolean; dismissed: boolean; createdAt: string;
};

const SEED: Reminder[] = [
  { id: "rem1", title: "Llamar a TechCorp", description: "Confirmar propuesta enterprise", dateTime: "2026-07-19T10:00", repeat: "none", sound: true, active: true, dismissed: false, createdAt: "2026-07-18" },
  { id: "rem2", title: "Factura MediaGroup vence", description: "$45,000 pendiente de cobro", dateTime: "2026-07-20T09:00", repeat: "weekly", sound: true, active: true, dismissed: false, createdAt: "2026-07-17" },
  { id: "rem3", title: "Seguimiento LogiNext", description: "Enviar caso de exito", dateTime: "2026-07-21T14:00", repeat: "none", sound: false, active: true, dismissed: false, createdAt: "2026-07-16" },
];

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editRem, setEditRem] = useState<Reminder | null>(null);
  const [form, setForm] = useState({ title: "", description: "", dateTime: "", repeat: "none" as Reminder["repeat"], sound: true });
  const [activePopup, setActivePopup] = useState<Reminder | null>(null);
  const [toast, setToast] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const checkInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { setReminders(loadFromStorage("reminders_v2", SEED)); }, []);
  useEffect(() => {
    // Check every 30 seconds for due reminders
    checkInterval.current = setInterval(checkReminders, 30000);
    checkReminders(); // Check immediately
    return () => { if (checkInterval.current) clearInterval(checkInterval.current); };
  }, [reminders]);

  function save(u: Reminder[]) { setReminders(u); saveToStorage("reminders_v2", u); }
  function notify(m: string) { setToast(m); setTimeout(() => setToast(""), 2500); }

  function checkReminders() {
    const now = new Date();
    const due = reminders.find(r => r.active && !r.dismissed && new Date(r.dateTime) <= now);
    if (due && !activePopup) {
      setActivePopup(due);
      if (due.sound) playSound();
    }
  }

  function playSound() {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2AgHR0eICDg4F/fX19f4GBgYF/fn5+f4CAgIB/fn5+f3+AgIB/f35+fn9/gICAf39+fn5/f4CAgH9/fn5+f3+Af4B/f35+fn5/f4B/gH9/fn5+fn9/gH+Af39+fn5+f3+Af4B/f35+fn5/f4B/gH9/fn5+fn9/gIB/f39+fn5/f3+AgH9/f35+fn9/f4CAf39/fn5+f39/gIB/f39+fn5/f3+AgH9/f39+fn5/f3+AgH9/f39+fn5/f3+AgH9/f39/fn5/f3+AgH9/f39/fn5/f3+A");
      }
      audioRef.current.play().catch(() => {});
    } catch {}
  }

  function dismissPopup() {
    if (!activePopup) return;
    if (activePopup.repeat !== "none") {
      const next = new Date(activePopup.dateTime);
      if (activePopup.repeat === "daily") next.setDate(next.getDate() + 1);
      if (activePopup.repeat === "weekly") next.setDate(next.getDate() + 7);
      if (activePopup.repeat === "monthly") next.setMonth(next.getMonth() + 1);
      save(reminders.map(r => r.id === activePopup.id ? { ...r, dateTime: next.toISOString().slice(0, 16), dismissed: false } : r));
    } else {
      save(reminders.map(r => r.id === activePopup.id ? { ...r, dismissed: true, active: false } : r));
    }
    setActivePopup(null);
  }

  function snoozePopup(minutes: number) {
    if (!activePopup) return;
    const snoozed = new Date(Date.now() + minutes * 60000);
    save(reminders.map(r => r.id === activePopup.id ? { ...r, dateTime: snoozed.toISOString().slice(0, 16), dismissed: false } : r));
    setActivePopup(null);
    notify(`Pospuesto ${minutes} min`);
  }

  function reschedulePopup() {
    if (!activePopup) return;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    save(reminders.map(r => r.id === activePopup.id ? { ...r, dateTime: tomorrow.toISOString().slice(0, 16), dismissed: false } : r));
    setActivePopup(null);
    notify("Reprogramado para mañana 9:00 AM");
  }

  function addReminder() {
    if (!form.title.trim() || !form.dateTime) return;
    const r: Reminder = { id: generateId(), title: form.title, description: form.description, dateTime: form.dateTime, repeat: form.repeat, sound: form.sound, active: true, dismissed: false, createdAt: new Date().toISOString().split("T")[0]! };
    save([r, ...reminders]); resetForm(); setShowForm(false); notify("Recordatorio creado");
  }

  function openEdit(r: Reminder) {
    setEditRem(r);
    setForm({ title: r.title, description: r.description, dateTime: r.dateTime, repeat: r.repeat, sound: r.sound });
  }

  function handleUpdate() {
    if (!editRem) return;
    save(reminders.map(r => r.id === editRem.id ? { ...r, ...form } : r));
    setEditRem(null); resetForm(); notify("Actualizado");
  }

  function resetForm() { setForm({ title: "", description: "", dateTime: "", repeat: "none", sound: true }); }
  function deleteReminder(id: string) { save(reminders.filter(r => r.id !== id)); }
  function toggleActive(id: string) { save(reminders.map(r => r.id === id ? { ...r, active: !r.active } : r)); }
  function duplicateReminder(r: Reminder) { save([{ ...r, id: generateId(), dismissed: false }, ...reminders]); notify("Duplicado"); }

  const activeReminders = reminders.filter(r => r.active && !r.dismissed);
  const inactiveReminders = reminders.filter(r => !r.active || r.dismissed);

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2"><Bell className="h-5 w-5 text-brand" />Recordatorios</h1>
            <p className="text-xs text-muted-foreground">{activeReminders.length} activos · Se disparan automaticamente a la hora programada</p>
          </div>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-1.5 rounded-md bg-brand px-3 py-2 text-xs font-medium text-white hover:bg-brand-hover"><Plus className="h-3.5 w-3.5" />Nuevo recordatorio</button>
        </div>

        {/* Active reminders */}
        <div className="space-y-2 mb-6">
          {activeReminders.map(r => (
            <div key={r.id} className="rounded-lg border bg-white p-4 flex items-start gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 ${r.sound ? "bg-amber-100" : "bg-gray-100"}`}>
                {r.sound ? <Volume2 className="h-4 w-4 text-amber-600" /> : <Bell className="h-4 w-4 text-gray-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold">{r.title}</h4>
                  {r.repeat !== "none" && <span className="flex items-center gap-0.5 rounded-full bg-blue-100 px-2 py-0.5 text-[9px] text-blue-700"><Repeat className="h-2.5 w-2.5" />{r.repeat}</span>}
                </div>
                {r.description && <p className="text-xs text-muted-foreground mt-0.5">{r.description}</p>}
                <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(r.dateTime).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}</span>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => openEdit(r)} className="rounded p-1 text-muted-foreground hover:text-brand hover:bg-gray-100"><Edit3 className="h-3.5 w-3.5" /></button>
                <button onClick={() => duplicateReminder(r)} className="rounded p-1 text-muted-foreground hover:text-brand hover:bg-gray-100"><Copy className="h-3.5 w-3.5" /></button>
                <button onClick={() => toggleActive(r.id)} className="rounded p-1 text-muted-foreground hover:text-amber-600 hover:bg-amber-50"><Bell className="h-3.5 w-3.5" /></button>
                <button onClick={() => deleteReminder(r.id)} className="rounded p-1 text-muted-foreground hover:text-red-500 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          ))}
          {activeReminders.length === 0 && <p className="text-xs text-muted-foreground text-center py-8">No hay recordatorios activos.</p>}
        </div>

        {/* Inactive/completed */}
        {inactiveReminders.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Completados / Inactivos ({inactiveReminders.length})</h3>
            <div className="space-y-1">
              {inactiveReminders.map(r => (
                <div key={r.id} className="rounded border bg-gray-50 px-3 py-2 flex items-center gap-3 opacity-60">
                  <Bell className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs flex-1 line-through">{r.title}</span>
                  <button onClick={() => toggleActive(r.id)} className="text-[9px] text-brand hover:underline">Reactivar</button>
                  <button onClick={() => deleteReminder(r.id)} className="text-muted-foreground hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showForm || editRem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl mx-4">
            <div className="flex justify-between mb-4"><h3 className="text-sm font-bold">{editRem ? "Editar recordatorio" : "Nuevo recordatorio"}</h3><button onClick={() => { setShowForm(false); setEditRem(null); resetForm(); }} className="rounded p-1 hover:bg-gray-100"><X className="h-4 w-4" /></button></div>
            <div className="space-y-3">
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Titulo *" className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Descripcion (opcional)" className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              <div><label className="text-xs font-medium text-muted-foreground">Fecha y hora</label><input value={form.dateTime} onChange={e => setForm({...form, dateTime: e.target.value})} type="datetime-local" className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-muted-foreground">Repetir</label>
                  <select value={form.repeat} onChange={e => setForm({...form, repeat: e.target.value as Reminder["repeat"]})} className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none">
                    <option value="none">No repetir</option><option value="daily">Diario</option><option value="weekly">Semanal</option><option value="monthly">Mensual</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 rounded border px-3 py-2 cursor-pointer w-full">
                    <input type="checkbox" checked={form.sound} onChange={e => setForm({...form, sound: e.target.checked})} className="accent-[var(--accent)]" />
                    <Volume2 className="h-3.5 w-3.5" />
                    <span className="text-xs">Sonido</span>
                  </label>
                </div>
              </div>
              <button onClick={editRem ? handleUpdate : addReminder} disabled={!form.title.trim() || !form.dateTime} className="w-full rounded-md bg-brand py-2.5 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50">{editRem ? "Guardar" : "Crear recordatorio"}</button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP ALERT — does NOT auto-dismiss */}
      {activePopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl mx-4 animate-in zoom-in text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 animate-pulse">
              <BellRing className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="text-lg font-bold mb-1">{activePopup.title}</h2>
            {activePopup.description && <p className="text-sm text-muted-foreground mb-2">{activePopup.description}</p>}
            <p className="text-xs text-muted-foreground mb-4">{new Date(activePopup.dateTime).toLocaleString("es-CO")}</p>
            {activePopup.repeat !== "none" && <p className="text-xs text-blue-600 mb-4 flex items-center justify-center gap-1"><Repeat className="h-3 w-3" />Se repetira {activePopup.repeat === "daily" ? "manana" : activePopup.repeat === "weekly" ? "en 7 dias" : "el proximo mes"}</p>}
            
            {/* Main action */}
            <button onClick={dismissPopup} className="w-full rounded-lg bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-hover mb-2">✓ Entendido — Cerrar</button>
            
            {/* Snooze options */}
            <div className="flex gap-2 mb-2">
              <button onClick={() => snoozePopup(5)} className="flex-1 rounded-lg border py-2 text-xs font-medium hover:bg-gray-50">⏰ 5 min</button>
              <button onClick={() => snoozePopup(15)} className="flex-1 rounded-lg border py-2 text-xs font-medium hover:bg-gray-50">⏰ 15 min</button>
              <button onClick={() => snoozePopup(60)} className="flex-1 rounded-lg border py-2 text-xs font-medium hover:bg-gray-50">⏰ 1 hora</button>
            </div>
            
            {/* Reschedule */}
            <button onClick={() => reschedulePopup()} className="w-full rounded-lg border border-amber-200 bg-amber-50 py-2 text-xs font-medium text-amber-700 hover:bg-amber-100">📅 Reprogramar para mañana</button>
            
            <p className="mt-3 text-[9px] text-muted-foreground">Este popup no se cierra solo. Debes cerrarlo o posponerlo.</p>
          </div>
        </div>
      )}

      {toast && <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-lg">{toast}</div>}
    </div>
  );
}
