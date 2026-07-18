"use client";

import { useState, useEffect } from "react";
import { Calendar, CheckCircle2, Circle, Plus, Trash2 } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";

type TodoItem = { id: string; text: string; done: boolean; createdAt: string };
type TodoPeriod = "daily" | "weekly" | "monthly";

type TodoState = {
  daily: TodoItem[];
  weekly: TodoItem[];
  monthly: TodoItem[];
};

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
};

const PERIOD_CONFIG = {
  daily: { label: "Diario", sublabel: "Hoy", color: "border-t-blue-400", bg: "bg-blue-50" },
  weekly: { label: "Semanal", sublabel: "Esta semana", color: "border-t-purple-400", bg: "bg-purple-50" },
  monthly: { label: "Mensual", sublabel: "Este mes", color: "border-t-amber-400", bg: "bg-amber-50" },
};

export default function TodoPage() {
  const [todos, setTodos] = useState<TodoState>(SEED);
  const [newItems, setNewItems] = useState<Record<TodoPeriod, string>>({ daily: "", weekly: "", monthly: "" });

  useEffect(() => { setTodos(loadFromStorage("todos", SEED)); }, []);
  function save(u: TodoState) { setTodos(u); saveToStorage("todos", u); }

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

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {(["daily", "weekly", "monthly"] as TodoPeriod[]).map((period) => {
            const config = PERIOD_CONFIG[period];
            const items = todos[period];
            const doneCount = items.filter((t) => t.done).length;
            return (
              <div key={period} className={`rounded-lg border border-t-4 ${config.color} bg-white`}>
                <div className="px-4 py-3 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-sm">{config.label}</h3>
                      <p className="text-xs text-muted-foreground">{config.sublabel} · {doneCount}/{items.length}</p>
                    </div>
                    {doneCount > 0 && (
                      <button onClick={() => clearDone(period)} className="text-[10px] text-muted-foreground hover:text-red-500">Limpiar ✓</button>
                    )}
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
                    <div key={item.id} className={`group flex items-start gap-2 rounded px-2 py-1.5 hover:bg-gray-50 ${item.done ? "opacity-50" : ""}`}>
                      <button onClick={() => toggleItem(period, item.id)} className="mt-0.5 shrink-0">
                        {item.done ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                      </button>
                      <span className={`flex-1 text-xs ${item.done ? "line-through text-muted-foreground" : ""}`}>{item.text}</span>
                      <button onClick={() => deleteItem(period, item.id)} className="opacity-0 group-hover:opacity-100 shrink-0 text-muted-foreground hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                    </div>
                  ))}
                  {items.length === 0 && <p className="text-center text-xs text-muted-foreground py-4">Sin tareas</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
