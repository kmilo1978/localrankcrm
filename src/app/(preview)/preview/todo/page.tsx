"use client";

import { useState, useEffect } from "react";
import { Calendar, CheckCircle2, ChevronDown, ChevronUp, Circle, Plus, Trash2, Bell, Copy, ArrowRight } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";

type TodoItem = { id: string; text: string; done: boolean; createdAt: string };
type TodoPeriod = string;
type CustomPeriod = { id: string; label: string; sublabel: string; color: string; bg: string };

type TodoState = Record<string, TodoItem[]>;

const SEED: TodoState = {
  daily: [
    { id: "td1", text: "Revisar bandeja de entrada y responder pendientes", done: false, createdAt: "2026-07-17" },
    { id: "td2", text: "Llamar a Carlos Ruiz — confirmar propuesta", done: false, createdAt: "2026-07-17" },
    { id: "td3", text: "Actualizar pipeline de ventas", done: true, createdAt: "2026-07-17" },
  ],
  weekly: [
    { id: "tw1", text: "Reunión de equipo — revisar metas", done: false, createdAt: "2026-07-14" },
    { id: "tw2", text: "Enviar reporte semanal a clientes", done: false, createdAt: "2026-07-14" },
    { id: "tw3", text: "Revisar métricas de campañas activas", done: false, createdAt: "2026-07-14" },
    { id: "tw4", text: "Preparar contenido redes sociales", done: true, createdAt: "2026-07-14" },
  ],
  monthly: [
    { id: "tm1", text: "Cerrar al menos 3 propuestas", done: false, createdAt: "2026-07-01" },
    { id: "tm2", text: "Importar y enriquecer 50 leads nuevos", done: false, createdAt: "2026-07-01" },
    { id: "tm3", text: "Revisar y optimizar procesos del CRM", done: false, createdAt: "2026-07-01" },
    { id: "tm4", text: "Capacitación equipo — nuevas funcionalidades", done: true, createdAt: "2026-07-01" },
  ],
  semestral: [],
  yearly: [],
};

const DEFAULT_PERIODS: CustomPeriod[] = [
  { id: "daily", label: "Diario", sublabel: "Hoy", color: "border-t-blue-400", bg: "bg-blue-50" },
  { id: "weekly", label: "Semanal", sublabel: "Esta semana", color: "border-t-purple-400", bg: "bg-purple-50" },
  { id: "monthly", label: "Mensual", sublabel: "Este mes", color: "border-t-amber-400", bg: "bg-amber-50" },
  { id: "semestral", label: "6 Meses", sublabel: "Este semestre", color: "border-t-green-400", bg: "bg-green-50" },
  { id: "yearly", label: "Anual", sublabel: "Este año", color: "border-t-red-400", bg: "bg-red-50" },
];

const COLORS = ["border-t-blue-400", "border-t-purple-400", "border-t-amber-400", "border-t-green-400", "border-t-red-400", "border-t-cyan-400", "border-t-pink-400", "border-t-orange-400"];
const BGS = ["bg-blue-50", "bg-purple-50", "bg-amber-50", "bg-green-50", "bg-red-50", "bg-cyan-50", "bg-pink-50", "bg-orange-50"];

export default function TodoPage() {
  const [todos, setTodos] = useState<TodoState>(SEED);
  const [periods, setPeriods] = useState<CustomPeriod[]>(DEFAULT_PERIODS);
  const [newItems, setNewItems] = useState<Record<string, string>>({});
  const [showAddPeriod, setShowAddPeriod] = useState(false);
  const [periodForm, setPeriodForm] = useState({ label: "", sublabel: "" });

  useEffect(() => {
    const raw = loadFromStorage<TodoState>("todos", SEED);
    const savedPeriods = loadFromStorage<CustomPeriod[]>("todo_periods", DEFAULT_PERIODS);
    // Ensure all periods have arrays
    const filled: TodoState = {};
    for (const p of savedPeriods) { filled[p.id] = raw[p.id] || []; }
    setTodos(filled);
    setPeriods(savedPeriods);
  }, []);
  function save(u: TodoState) { setTodos(u); saveToStorage("todos", u); }
  function savePeriods(p: CustomPeriod[]) { setPeriods(p); saveToStorage("todo_periods", p); }

  function addCustomPeriod() {
    if (!periodForm.label.trim()) return;
    const id = generateId();
    const idx = periods.length % COLORS.length;
    const newPeriod: CustomPeriod = { id, label: periodForm.label, sublabel: periodForm.sublabel || periodForm.label, color: COLORS[idx]!, bg: BGS[idx]! };
    savePeriods([...periods, newPeriod]);
    save({ ...todos, [id]: [] });
    setPeriodForm({ label: "", sublabel: "" });
    setShowAddPeriod(false);
  }

  function deleteCustomPeriod(id: string) {
    savePeriods(periods.filter(p => p.id !== id));
    const newTodos = { ...todos };
    delete newTodos[id];
    save(newTodos);
  }

  function addItem(period: TodoPeriod) {
    const text = newItems[period].trim();
    if (!text) return;
    const item: TodoItem = { id: generateId(), text, done: false, createdAt: new Date().toISOString().split("T")[0]! };
    save({ ...todos, [period]: [item, ...todos[period]] });
    setNewItems({ ...newItems, [period]: "" });
  }

  function toggleItem(period: TodoPeriod, id: string) {
    save({ ...todos, [period]: todos[period].map((t) => t.id === id ? { ...t, done: !t.done } : t) });
  }

  function deleteItem(period: TodoPeriod, id: string) {
    save({ ...todos, [period]: todos[period].filter((t) => t.id !== id) });
  }

  function moveItemUp(period: TodoPeriod, id: string) {
    const items = [...todos[period]];
    const idx = items.findIndex(t => t.id === id);
    if (idx <= 0) return;
    [items[idx - 1], items[idx]] = [items[idx]!, items[idx - 1]!];
    save({ ...todos, [period]: items });
  }

  function moveItemDown(period: TodoPeriod, id: string) {
    const items = [...todos[period]];
    const idx = items.findIndex(t => t.id === id);
    if (idx >= items.length - 1) return;
    [items[idx], items[idx + 1]] = [items[idx + 1]!, items[idx]!];
    save({ ...todos, [period]: items });
  }

  function editItemText(period: TodoPeriod, id: string, newText: string) {
    save({ ...todos, [period]: todos[period].map(t => t.id === id ? { ...t, text: newText } : t) });
  }

  function cloneItem(period: TodoPeriod, item: TodoItem) {
    const copy: TodoItem = { ...item, id: generateId(), done: false };
    save({ ...todos, [period]: [copy, ...todos[period]] });
  }

  function moveItem(fromPeriod: TodoPeriod, toPeriod: TodoPeriod, item: TodoItem) {
    save({ ...todos, [fromPeriod]: todos[fromPeriod].filter(t => t.id !== item.id), [toPeriod]: [{ ...item, id: generateId(), done: false }, ...todos[toPeriod]] });
  }

  function sendToReminder(item: TodoItem) {
    const reminders = loadFromStorage<Array<{id:string;title:string;description:string;dateTime:string;repeat:string;sound:boolean;active:boolean;dismissed:boolean;createdAt:string}>>("reminders_v2", []);
    const dateTime = new Date(Date.now() + 3600000).toISOString().slice(0, 16);
    const newReminder = { id: generateId(), title: item.text, description: "", dateTime, repeat: "none", sound: true, active: true, dismissed: false, createdAt: new Date().toISOString().split("T")[0]! };
    saveToStorage("reminders_v2", [newReminder, ...reminders]);
  }

  function clearDone(period: TodoPeriod) {
    save({ ...todos, [period]: todos[period].filter((t) => !t.done) });
  }

  const totalDone = todos.daily.filter((t) => t.done).length + todos.weekly.filter((t) => t.done).length + todos.monthly.filter((t) => t.done).length;
  const totalAll = todos.daily.length + todos.weekly.length + todos.monthly.length;

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">To-Do</h1>
          <p className="text-sm text-muted-foreground">{totalDone}/{totalAll} completadas · Organiza por día, semana y mes</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {periods.map((config) => {
            const period = config.id;
            const items = todos[period] || [];
            const doneCount = items.filter((t) => t.done).length;
            const isCustom = !["daily", "weekly", "monthly", "semestral", "yearly"].includes(period);
            return (
              <div key={period} className={`rounded-lg border border-t-4 ${config.color} bg-white`}>
                <div className="px-4 py-3 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-sm">{config.label}</h3>
                      <p className="text-xs text-muted-foreground">{config.sublabel} · {doneCount}/{items.length}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {doneCount > 0 && (
                        <button onClick={() => clearDone(period)} className="text-[10px] text-muted-foreground hover:text-red-500">Limpiar ✓</button>
                      )}
                      {isCustom && (
                        <button onClick={() => deleteCustomPeriod(period)} className="text-muted-foreground hover:text-red-500 rounded p-0.5 hover:bg-red-50" title="Eliminar periodo"><Trash2 className="h-3 w-3" /></button>
                      )}
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100">
                    <div className="h-1.5 rounded-full bg-brand transition-all" style={{ width: `${items.length > 0 ? (doneCount / items.length) * 100 : 0}%` }} />
                  </div>
                </div>

                {/* Add item */}
                <div className="px-3 py-2 border-b">
                  <div className="flex gap-1.5">
                    <input value={newItems[period]} onChange={(e) => setNewItems({ ...newItems, [period]: e.target.value })} onKeyDown={(e) => { if (e.key === "Enter") addItem(period); }} placeholder="Agregar tarea..." className="flex-1 rounded border px-2 py-1.5 text-xs focus:border-brand focus:outline-none" />
                    <button onClick={() => addItem(period)} className="rounded bg-brand px-2 py-1.5 text-xs text-white hover:bg-brand-hover"><Plus className="h-3.5 w-3.5" /></button>
                  </div>
                </div>

                {/* Items */}
                <div className="max-h-80 overflow-y-auto px-2 py-2 space-y-1">
                  {items.map((item) => (
                    <div key={item.id} className={`group flex items-start gap-1.5 rounded px-2 py-1.5 hover:bg-gray-50 ${item.done ? "opacity-50" : ""}`}>
                      <div className="flex flex-col opacity-0 group-hover:opacity-100 mt-0.5">
                        <button onClick={() => moveItemUp(period, item.id)} className="text-muted-foreground hover:text-brand"><ChevronUp className="h-2.5 w-2.5" /></button>
                        <button onClick={() => moveItemDown(period, item.id)} className="text-muted-foreground hover:text-brand"><ChevronDown className="h-2.5 w-2.5" /></button>
                      </div>
                      <button onClick={() => toggleItem(period, item.id)} className="mt-0.5 shrink-0">
                        {item.done ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                      </button>
                      <span className={`flex-1 text-xs ${item.done ? "line-through text-muted-foreground" : ""}`}>
                        <input value={item.text} onChange={(e) => editItemText(period, item.id, e.target.value)} className={`w-full bg-transparent border-0 p-0 text-xs focus:outline-none focus:ring-0 ${item.done ? "line-through text-muted-foreground" : ""}`} />
                      </span>
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 shrink-0">
                        <button onClick={() => cloneItem(period, item)} className="text-muted-foreground hover:text-brand" title="Clonar"><Copy className="h-3 w-3" /></button>
                        <button onClick={() => { const targets = (["daily","weekly","monthly"] as TodoPeriod[]).filter(p => p !== period); moveItem(period, targets[0]!, item); }} className="text-muted-foreground hover:text-purple-600" title={`Mover a ${period === "daily" ? "semanal" : period === "weekly" ? "mensual" : "diario"}`}><ArrowRight className="h-3 w-3" /></button>
                        <button onClick={() => sendToReminder(item)} className="text-muted-foreground hover:text-amber-600" title="Recordatorio"><Bell className="h-3 w-3" /></button>
                        <button onClick={() => deleteItem(period, item.id)} className="text-muted-foreground hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && <p className="text-center text-xs text-muted-foreground py-4">Sin tareas</p>}
                </div>
              </div>
            );
          })}

          {/* Add custom period card */}
          <div className="rounded-lg border border-dashed bg-gray-50/50 p-4 flex flex-col items-center justify-center min-h-[200px]">
            {showAddPeriod ? (
              <div className="space-y-2 w-full">
                <input value={periodForm.label} onChange={e => setPeriodForm({...periodForm, label: e.target.value})} placeholder="Nombre (ej: Trimestral, Q3, Proyecto X)" className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
                <input value={periodForm.sublabel} onChange={e => setPeriodForm({...periodForm, sublabel: e.target.value})} placeholder="Subtítulo (ej: Jul-Sep 2026)" className="w-full rounded border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
                <div className="flex gap-2">
                  <button onClick={addCustomPeriod} className="rounded bg-brand px-3 py-1.5 text-xs text-white hover:bg-brand-hover">Crear</button>
                  <button onClick={() => setShowAddPeriod(false)} className="rounded border px-3 py-1.5 text-xs hover:bg-gray-50">Cancelar</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowAddPeriod(true)} className="flex flex-col items-center gap-2 text-muted-foreground hover:text-brand">
                <Plus className="h-8 w-8" />
                <span className="text-xs font-medium">Agregar periodo personalizado</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
