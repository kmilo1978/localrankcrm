"use client";
import { useState, useEffect, useRef } from "react";
import { Brain, CheckCircle2, Circle, Pause, Play, Plus, RotateCcw, Target, Timer, Trash2, X, Zap } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";

type FocusSession = { id: string; task: string; duration: number; completedAt: string; };
type FocusTask = { id: string; text: string; done: boolean; priority: "high" | "normal"; };

const SEED_TASKS: FocusTask[] = [
  { id: "ft1", text: "Preparar propuesta TechCorp", done: false, priority: "high" },
  { id: "ft2", text: "Revisar pipeline de ventas", done: false, priority: "normal" },
  { id: "ft3", text: "Enviar follow-up a LogiNext", done: true, priority: "high" },
];

export default function FocusPage() {
  const [tasks, setTasks] = useState<FocusTask[]>([]);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [newTask, setNewTask] = useState("");
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 min pomodoro
  const [focusDuration, setFocusDuration] = useState(25);
  const [currentTask, setCurrentTask] = useState("");
  const [toast, setToast] = useState("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setTasks(loadFromStorage("focus_tasks", SEED_TASKS));
    setSessions(loadFromStorage("focus_sessions", []));
  }, []);

  function saveTasks(u: FocusTask[]) { setTasks(u); saveToStorage("focus_tasks", u); }
  function saveSessions(u: FocusSession[]) { setSessions(u); saveToStorage("focus_sessions", u); }
  function notify(m: string) { setToast(m); setTimeout(() => setToast(""), 2500); }

  function startTimer() {
    if (timerRunning) return;
    setTimerRunning(true);
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          stopTimer();
          completeSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function stopTimer() {
    setTimerRunning(false);
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }

  function resetTimer() {
    stopTimer();
    setTimeLeft(focusDuration * 60);
  }

  function completeSession() {
    const session: FocusSession = { id: generateId(), task: currentTask || "Sesión de enfoque", duration: focusDuration, completedAt: new Date().toISOString() };
    saveSessions([session, ...sessions]);
    notify("¡Sesión completada! 🎉");
    setTimeLeft(focusDuration * 60);
  }

  function addTask() {
    if (!newTask.trim()) return;
    saveTasks([{ id: generateId(), text: newTask, done: false, priority: "normal" }, ...tasks]);
    setNewTask("");
  }

  function toggleTask(id: string) { saveTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t)); }
  function deleteTask(id: string) { saveTasks(tasks.filter(t => t.id !== id)); }
  function togglePriority(id: string) { saveTasks(tasks.map(t => t.id === id ? { ...t, priority: t.priority === "high" ? "normal" : "high" } : t)); }

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const progress = 1 - (timeLeft / (focusDuration * 60));
  const todaySessions = sessions.filter(s => s.completedAt.startsWith(new Date().toISOString().split("T")[0]!));
  const todayMinutes = todaySessions.reduce((s, sess) => s + sess.duration, 0);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2"><Brain className="h-6 w-6 text-brand" />Focus</h1>
          <p className="text-sm text-muted-foreground">Modo enfoque con Pomodoro · {todaySessions.length} sesiones hoy · {todayMinutes} min de concentración</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timer */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border bg-white p-6 text-center">
              {/* Circular progress */}
              <div className="relative mx-auto mb-4 h-48 w-48">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="var(--accent, #3b82f6)" strokeWidth="6" strokeDasharray={`${progress * 283} 283`} strokeLinecap="round" className="transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold font-mono">{String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}</span>
                  <span className="text-xs text-muted-foreground mt-1">{timerRunning ? "Enfocado..." : "Listo"}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <button onClick={timerRunning ? stopTimer : startTimer} className={`flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium text-white ${timerRunning ? "bg-amber-500 hover:bg-amber-600" : "bg-brand hover:bg-brand-hover"}`}>
                  {timerRunning ? <><Pause className="h-4 w-4" />Pausar</> : <><Play className="h-4 w-4" />Iniciar</>}
                </button>
                <button onClick={resetTimer} className="rounded-lg border p-2.5 hover:bg-gray-50" title="Reiniciar"><RotateCcw className="h-4 w-4 text-muted-foreground" /></button>
              </div>

              {/* Duration selector */}
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs text-muted-foreground">Duración:</span>
                {[15, 25, 45, 60].map(d => (
                  <button key={d} onClick={() => { setFocusDuration(d); if (!timerRunning) setTimeLeft(d * 60); }} className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${focusDuration === d ? "bg-brand text-white" : "border hover:bg-gray-50"}`}>{d}m</button>
                ))}
              </div>

              {/* Current task input */}
              <input value={currentTask} onChange={e => setCurrentTask(e.target.value)} placeholder="¿En qué te enfocas?" className="mt-4 w-full rounded-lg border px-3 py-2 text-xs text-center focus:border-brand focus:outline-none" />
            </div>

            {/* Stats */}
            <div className="mt-4 rounded-lg border bg-white p-4">
              <h3 className="text-xs font-semibold mb-2 flex items-center gap-1"><Zap className="h-3.5 w-3.5 text-amber-500" />Hoy</h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div><p className="text-lg font-bold text-brand">{todaySessions.length}</p><p className="text-[9px] text-muted-foreground">Sesiones</p></div>
                <div><p className="text-lg font-bold text-green-600">{todayMinutes}</p><p className="text-[9px] text-muted-foreground">Minutos</p></div>
                <div><p className="text-lg font-bold text-purple-600">{tasks.filter(t => t.done).length}</p><p className="text-[9px] text-muted-foreground">Completadas</p></div>
              </div>
            </div>
          </div>

          {/* Tasks */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold flex items-center gap-1.5"><Target className="h-4 w-4 text-brand" />Tareas de enfoque</h3>
                <span className="text-[10px] text-muted-foreground">{tasks.filter(t => !t.done).length} pendientes</span>
              </div>

              {/* Add task */}
              <div className="flex gap-2 mb-4">
                <input value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => { if (e.key === "Enter") addTask(); }} placeholder="Agregar tarea de enfoque..." className="flex-1 rounded-lg border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
                <button onClick={addTask} disabled={!newTask.trim()} className="rounded-lg bg-brand px-3 py-2 text-white hover:bg-brand-hover disabled:opacity-50"><Plus className="h-4 w-4" /></button>
              </div>

              {/* Task list */}
              <div className="space-y-1">
                {tasks.filter(t => !t.done).map(task => (
                  <div key={task.id} className="group flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-50">
                    <button onClick={() => toggleTask(task.id)}><Circle className="h-4 w-4 text-muted-foreground" /></button>
                    <span className="flex-1 text-sm">{task.text}</span>
                    <button onClick={() => togglePriority(task.id)} className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium ${task.priority === "high" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500"}`}>{task.priority === "high" ? "Alta" : "Normal"}</button>
                    <button onClick={() => { setCurrentTask(task.text); if (!timerRunning) startTimer(); }} className="opacity-0 group-hover:opacity-100 rounded px-1.5 py-0.5 text-[9px] bg-brand/10 text-brand font-medium">Enfocar</button>
                    <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                  </div>
                ))}
                {tasks.filter(t => t.done).length > 0 && (
                  <>
                    <div className="border-t my-2" />
                    <p className="text-[10px] font-medium text-muted-foreground px-3">Completadas</p>
                    {tasks.filter(t => t.done).map(task => (
                      <div key={task.id} className="group flex items-center gap-2 rounded-lg px-3 py-1.5 opacity-50">
                        <button onClick={() => toggleTask(task.id)}><CheckCircle2 className="h-4 w-4 text-green-500" /></button>
                        <span className="flex-1 text-sm line-through">{task.text}</span>
                        <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Recent sessions */}
            {sessions.length > 0 && (
              <div className="mt-4 rounded-lg border bg-white p-4">
                <h3 className="text-xs font-semibold mb-2 flex items-center gap-1"><Timer className="h-3.5 w-3.5 text-muted-foreground" />Sesiones recientes</h3>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {sessions.slice(0, 10).map(s => (
                    <div key={s.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[9px] text-green-700">{s.duration}m</span>
                      <span className="flex-1 truncate">{s.task}</span>
                      <span>{new Date(s.completedAt).toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" })}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-lg">{toast}</div>}
    </div>
  );
}
