"use client";

import { useState, useEffect } from "react";
import { Bell, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, DollarSign, Plus, Trash2, X } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";

type CalendarGroup = { id: string; name: string; color: string };

type Appointment = {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  calendarId: string;
  contact: string;
  type: "appointment" | "payment_reminder" | "reminder";
  amount?: string;
  notes: string;
  done: boolean;
};

const COLORS = ["#e91e8c", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#6366f1", "#ec4899", "#14b8a6"];

const SEED_CALENDARS: CalendarGroup[] = [
  { id: "cal1", name: "Citas", color: "#3b82f6" },
  { id: "cal2", name: "Cobros", color: "#10b981" },
  { id: "cal3", name: "Recordatorios", color: "#f59e0b" },
];

const SEED_APPOINTMENTS: Appointment[] = [
  { id: "a1", title: "Reunión TechCorp - Propuesta Enterprise", date: "2026-07-18", time: "10:00", duration: "1h", calendarId: "cal1", contact: "Carlos Ruiz", type: "appointment", notes: "Llevar presentación actualizada", done: false },
  { id: "a2", title: "Demo MediaGroup", date: "2026-07-20", time: "15:00", duration: "45min", calendarId: "cal1", contact: "Roberto Méndez", type: "appointment", notes: "", done: false },
  { id: "a3", title: "Cobro factura #1045 — TechCorp", date: "2026-07-19", time: "09:00", duration: "", calendarId: "cal2", contact: "TechCorp", type: "payment_reminder", amount: "$12,500", notes: "Factura enviada el 5 de julio", done: false },
  { id: "a4", title: "Cobro mensualidad RetailMax", date: "2026-07-25", time: "09:00", duration: "", calendarId: "cal2", contact: "RetailMax", type: "payment_reminder", amount: "$8,000", notes: "", done: false },
  { id: "a5", title: "Seguimiento LogiNext - ¿Decisión?", date: "2026-07-21", time: "11:00", duration: "", calendarId: "cal3", contact: "María García", type: "reminder", notes: "Si no responde, enviar email", done: false },
  { id: "a6", title: "Renovación contrato FinServ", date: "2026-07-30", time: "09:00", duration: "", calendarId: "cal3", contact: "FinServ Partners", type: "reminder", notes: "Vence el 31 de julio", done: false },
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default function CalendarPage() {
  const [calendars, setCalendars] = useState<CalendarGroup[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(6); // July (0-indexed)
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showNewAppt, setShowNewAppt] = useState(false);
  const [showNewCalendar, setShowNewCalendar] = useState(false);
  const [visibleCalendars, setVisibleCalendars] = useState<Set<string>>(new Set());
  const [apptForm, setApptForm] = useState({ title: "", date: "", time: "", duration: "", calendarId: "", contact: "", type: "appointment" as Appointment["type"], amount: "", notes: "" });
  const [calForm, setCalForm] = useState({ name: "", color: COLORS[0]! });

  useEffect(() => {
    const cals = loadFromStorage("calendars", SEED_CALENDARS);
    setCalendars(cals);
    setAppointments(loadFromStorage("calendar_appointments", SEED_APPOINTMENTS));
    setVisibleCalendars(new Set(cals.map((c) => c.id)));
  }, []);

  function saveCals(u: CalendarGroup[]) { setCalendars(u); saveToStorage("calendars", u); }
  function saveAppts(u: Appointment[]) { setAppointments(u); saveToStorage("calendar_appointments", u); }

  function addCalendar() {
    if (!calForm.name.trim()) return;
    const cal: CalendarGroup = { id: generateId(), name: calForm.name, color: calForm.color };
    saveCals([...calendars, cal]);
    setVisibleCalendars((p) => new Set([...p, cal.id]));
    setCalForm({ name: "", color: COLORS[(calendars.length + 1) % COLORS.length]! });
    setShowNewCalendar(false);
  }

  function deleteCalendar(id: string) {
    saveCals(calendars.filter((c) => c.id !== id));
    saveAppts(appointments.filter((a) => a.calendarId !== id));
    setVisibleCalendars((p) => { const n = new Set(p); n.delete(id); return n; });
  }

  function toggleCalendarVisibility(id: string) {
    setVisibleCalendars((p) => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }

  function addAppointment() {
    if (!apptForm.title.trim() || !apptForm.date) return;
    const a: Appointment = { id: generateId(), ...apptForm, done: false };
    saveAppts([...appointments, a]);
    setApptForm({ title: "", date: "", time: "", duration: "", calendarId: calendars[0]?.id || "", contact: "", type: "appointment", amount: "", notes: "" });
    setShowNewAppt(false);
  }

  function toggleDone(id: string) { saveAppts(appointments.map((a) => a.id === id ? { ...a, done: !a.done } : a)); }
  function deleteAppt(id: string) { saveAppts(appointments.filter((a) => a.id !== id)); }

  function prevMonth() { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); } else setCurrentMonth(currentMonth - 1); }
  function nextMonth() { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); } else setCurrentMonth(currentMonth + 1); }

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const today = new Date().toISOString().split("T")[0];

  const visibleAppts = appointments.filter((a) => visibleCalendars.has(a.calendarId));
  const selectedAppts = selectedDate ? visibleAppts.filter((a) => a.date === selectedDate) : [];

  // Upcoming (next 7 days)
  const nowDate = new Date();
  const in7Days = new Date(nowDate.getTime() + 7 * 86400000).toISOString().split("T")[0]!;
  const upcoming = visibleAppts.filter((a) => !a.done && a.date >= today! && a.date <= in7Days).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

  function getCalColor(calId: string) { return calendars.find((c) => c.id === calId)?.color || "#999"; }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 shrink-0 border-r overflow-y-auto p-4 space-y-4">
        <button onClick={() => { setShowNewAppt(true); setApptForm({ ...apptForm, date: selectedDate || today || "", calendarId: calendars[0]?.id || "" }); }} className="flex w-full items-center justify-center gap-2 rounded-md bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-hover transition-colors">
          <Plus className="h-4 w-4" />Nueva cita
        </button>

        {/* Calendars */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground">Calendarios</h4>
            <button onClick={() => setShowNewCalendar(!showNewCalendar)} className="rounded p-0.5 hover:bg-gray-100 text-muted-foreground"><Plus className="h-3.5 w-3.5" /></button>
          </div>
          {showNewCalendar && (
            <div className="mb-2 space-y-2 rounded border p-2">
              <input value={calForm.name} onChange={(e) => setCalForm({ ...calForm, name: e.target.value })} placeholder="Nombre del calendario" className="w-full rounded border px-2 py-1 text-xs focus:border-brand focus:outline-none" />
              <div className="flex flex-wrap gap-1">
                {COLORS.map((c) => (
                  <button key={c} onClick={() => setCalForm({ ...calForm, color: c })} className={`h-5 w-5 rounded-full border-2 ${calForm.color === c ? "border-gray-800 scale-110" : "border-transparent"}`} style={{ backgroundColor: c }} />
                ))}
              </div>
              <div className="flex gap-1">
                <button onClick={addCalendar} className="rounded bg-brand px-2 py-1 text-xs text-white hover:bg-brand-hover">Crear</button>
                <button onClick={() => setShowNewCalendar(false)} className="rounded border px-2 py-1 text-xs hover:bg-gray-50">✕</button>
              </div>
            </div>
          )}
          <div className="space-y-1">
            {calendars.map((cal) => (
              <div key={cal.id} className="group flex items-center gap-2 rounded px-2 py-1 hover:bg-gray-50">
                <input type="checkbox" checked={visibleCalendars.has(cal.id)} onChange={() => toggleCalendarVisibility(cal.id)} className="accent-[var(--accent)]" />
                <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: cal.color }} />
                <span className="flex-1 text-sm truncate">{cal.name}</span>
                <span className="text-xs text-muted-foreground">{appointments.filter((a) => a.calendarId === cal.id && !a.done).length}</span>
                <button onClick={() => deleteCalendar(cal.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming */}
        <div>
          <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Próximos 7 días</h4>
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {upcoming.length === 0 && <p className="text-xs text-muted-foreground">Nada programado</p>}
            {upcoming.slice(0, 8).map((a) => (
              <div key={a.id} className="flex items-start gap-2 rounded border p-2 text-xs">
                <span className="mt-0.5 h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: getCalColor(a.calendarId) }} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{a.title}</p>
                  <p className="text-muted-foreground">{a.date} {a.time && `· ${a.time}`}</p>
                  {a.type === "payment_reminder" && a.amount && <p className="text-green-600 font-medium">{a.amount}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Month nav */}
        <div className="flex items-center justify-between border-b px-6 py-3">
          <div className="flex items-center gap-3">
            <button onClick={prevMonth} className="rounded p-1 hover:bg-gray-100"><ChevronLeft className="h-5 w-5" /></button>
            <h2 className="text-lg font-semibold w-44 text-center">{MONTHS[currentMonth]} {currentYear}</h2>
            <button onClick={nextMonth} className="rounded p-1 hover:bg-gray-100"><ChevronRight className="h-5 w-5" /></button>
          </div>
          <button onClick={() => { setCurrentYear(2026); setCurrentMonth(6); setSelectedDate(today ?? null); }} className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-gray-50">Hoy</button>
        </div>

        {/* Calendar grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden border">
            {/* Day headers */}
            {DAYS.map((d) => (
              <div key={d} className="bg-gray-50 py-2 text-center text-xs font-medium text-muted-foreground">{d}</div>
            ))}
            {/* Empty cells before first day */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`e${i}`} className="bg-white min-h-[80px] p-1" />
            ))}
            {/* Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const dayAppts = visibleAppts.filter((a) => a.date === dateStr);
              const isToday = dateStr === today;
              const isSelected = dateStr === selectedDate;
              return (
                <div key={day} onClick={() => setSelectedDate(dateStr)} className={`bg-white min-h-[80px] p-1 cursor-pointer transition-colors hover:bg-gray-50 ${isSelected ? "ring-2 ring-brand ring-inset" : ""}`}>
                  <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${isToday ? "bg-brand text-white" : ""}`}>{day}</span>
                  <div className="mt-0.5 space-y-0.5">
                    {dayAppts.slice(0, 3).map((a) => (
                      <div key={a.id} className={`truncate rounded px-1 py-0.5 text-[10px] leading-tight ${a.done ? "line-through opacity-50" : ""}`} style={{ backgroundColor: `${getCalColor(a.calendarId)}20`, color: getCalColor(a.calendarId) }}>
                        {a.time && <span className="font-medium">{a.time} </span>}{a.title}
                      </div>
                    ))}
                    {dayAppts.length > 3 && <span className="text-[10px] text-muted-foreground px-1">+{dayAppts.length - 3} más</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected date detail */}
        {selectedDate && (
          <div className="border-t max-h-52 overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold">{selectedDate}</h4>
              <button onClick={() => { setShowNewAppt(true); setApptForm({ ...apptForm, date: selectedDate, calendarId: calendars[0]?.id || "" }); }} className="text-xs text-brand hover:underline">+ Agregar</button>
            </div>
            {selectedAppts.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sin eventos este día</p>
            ) : (
              <div className="space-y-2">
                {selectedAppts.map((a) => (
                  <div key={a.id} className="group flex items-center gap-3 rounded border p-2">
                    <input type="checkbox" checked={a.done} onChange={() => toggleDone(a.id)} className="accent-[var(--accent)]" />
                    <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: getCalColor(a.calendarId) }} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${a.done ? "line-through text-muted-foreground" : ""}`}>{a.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {a.time && <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" />{a.time} {a.duration && `(${a.duration})`}</span>}
                        {a.contact && <span>{a.contact}</span>}
                        {a.type === "payment_reminder" && a.amount && <span className="flex items-center gap-0.5 text-green-600 font-medium"><DollarSign className="h-3 w-3" />{a.amount}</span>}
                      </div>
                    </div>
                    <button onClick={() => deleteAppt(a.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* New appointment modal */}
      {showNewAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowNewAppt(false)}>
          <div className="w-full max-w-lg rounded-lg border bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Nueva cita / recordatorio</h3>
              <button onClick={() => setShowNewAppt(false)} className="rounded p-1 hover:bg-gray-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <input value={apptForm.title} onChange={(e) => setApptForm({ ...apptForm, title: e.target.value })} placeholder="Título *" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium">Tipo</label>
                  <select value={apptForm.type} onChange={(e) => setApptForm({ ...apptForm, type: e.target.value as Appointment["type"] })} className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand">
                    <option value="appointment">Cita</option>
                    <option value="payment_reminder">Recordatorio de cobro</option>
                    <option value="reminder">Recordatorio general</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">Calendario</label>
                  <select value={apptForm.calendarId} onChange={(e) => setApptForm({ ...apptForm, calendarId: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand">
                    {calendars.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">Fecha *</label>
                  <input value={apptForm.date} onChange={(e) => setApptForm({ ...apptForm, date: e.target.value })} type="date" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">Hora</label>
                  <input value={apptForm.time} onChange={(e) => setApptForm({ ...apptForm, time: e.target.value })} type="time" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">Duración</label>
                  <input value={apptForm.duration} onChange={(e) => setApptForm({ ...apptForm, duration: e.target.value })} placeholder="30min, 1h..." className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">Contacto / Empresa</label>
                  <input value={apptForm.contact} onChange={(e) => setApptForm({ ...apptForm, contact: e.target.value })} placeholder="Nombre" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
                </div>
              </div>
              {apptForm.type === "payment_reminder" && (
                <div>
                  <label className="mb-1 block text-xs font-medium">Monto a cobrar</label>
                  <input value={apptForm.amount} onChange={(e) => setApptForm({ ...apptForm, amount: e.target.value })} placeholder="$5,000" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
                </div>
              )}
              <div>
                <label className="mb-1 block text-xs font-medium">Notas</label>
                <textarea value={apptForm.notes} onChange={(e) => setApptForm({ ...apptForm, notes: e.target.value })} placeholder="Notas adicionales..." rows={2} className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowNewAppt(false)} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50">Cancelar</button>
              <button onClick={addAppointment} className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
