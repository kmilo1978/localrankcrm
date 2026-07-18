"use client";
import { useState, useEffect } from "react";
import { GitBranch, Plus, Trash2, Users } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";

type RoutingRule = { id: string; name: string; condition: string; field: string; value: string; assignTo: string; method: "specific" | "round_robin" | "least_loaded"; active: boolean; assigned: number };

const FIELDS = ["fuente", "ciudad", "industria", "lead_score", "etiqueta", "canal", "idioma", "país"];
const METHODS = [{ id: "specific", label: "Agente específico" }, { id: "round_robin", label: "Round Robin" }, { id: "least_loaded", label: "Menos cargado" }];
const AGENTS = ["Camilo Rivera", "Ana López", "Juan Pérez", "María Gómez"];

const SEED: RoutingRule[] = [
  { id: "rr1", name: "Leads de formulario → Ana", condition: "es igual a", field: "fuente", value: "formulario", assignTo: "Ana López", method: "specific", active: true, assigned: 45 },
  { id: "rr2", name: "Score alto → Round Robin ventas", condition: "mayor que", field: "lead_score", value: "80", assignTo: "Camilo Rivera, Juan Pérez", method: "round_robin", active: true, assigned: 28 },
  { id: "rr3", name: "Industria Tech → Juan", condition: "es igual a", field: "industria", value: "tecnología", assignTo: "Juan Pérez", method: "specific", active: true, assigned: 32 },
  { id: "rr4", name: "WhatsApp entrante → Menos cargado", condition: "es igual a", field: "canal", value: "whatsapp", assignTo: "Equipo completo", method: "least_loaded", active: false, assigned: 12 },
];

export default function LeadRoutingPage() {
  const [rules, setRules] = useState<RoutingRule[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ name: "", field: FIELDS[0]!, condition: "es igual a", value: "", assignTo: AGENTS[0]!, method: "specific" as RoutingRule["method"] });

  useEffect(() => { setRules(loadFromStorage("lead_routing", SEED)); }, []);
  function save(u: RoutingRule[]) { setRules(u); saveToStorage("lead_routing", u); }
  function create() { if (!form.name.trim()) return; save([{ id: generateId(), ...form, active: true, assigned: 0 }, ...rules]); setForm({ name: "", field: FIELDS[0]!, condition: "es igual a", value: "", assignTo: AGENTS[0]!, method: "specific" }); setShowNew(false); }
  function toggle(id: string) { save(rules.map((r) => r.id === id ? { ...r, active: !r.active } : r)); }
  function remove(id: string) { save(rules.filter((r) => r.id !== id)); }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div><h1 className="text-2xl font-bold flex items-center gap-2"><GitBranch className="h-6 w-6 text-brand" />Lead Routing</h1><p className="text-sm text-muted-foreground">Asignación automática por fuente, zona, nicho, score o disponibilidad.</p></div>
          <button onClick={() => setShowNew(true)} className="flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"><Plus className="h-4 w-4" />Nueva regla</button>
        </div>

        {showNew && (
          <div className="mb-4 rounded-lg border bg-white p-5 space-y-3">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nombre de la regla *" className="w-full rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
            <div className="grid grid-cols-3 gap-3">
              <select value={form.field} onChange={(e) => setForm({ ...form, field: e.target.value })} className="rounded-md border px-3 py-2 text-sm">{FIELDS.map((f) => <option key={f} value={f}>{f}</option>)}</select>
              <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className="rounded-md border px-3 py-2 text-sm"><option>es igual a</option><option>contiene</option><option>mayor que</option><option>menor que</option></select>
              <input value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="Valor" className="rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium">Método</label><select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value as RoutingRule["method"] })} className="w-full rounded-md border px-3 py-2 text-sm">{METHODS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}</select></div>
              <div><label className="text-xs font-medium">Asignar a</label><select value={form.assignTo} onChange={(e) => setForm({ ...form, assignTo: e.target.value })} className="w-full rounded-md border px-3 py-2 text-sm">{AGENTS.map((a) => <option key={a} value={a}>{a}</option>)}<option value="Equipo completo">Equipo completo</option></select></div>
            </div>
            <div className="flex gap-2"><button onClick={create} className="rounded bg-brand px-4 py-2 text-sm text-white hover:bg-brand-hover">Crear</button><button onClick={() => setShowNew(false)} className="rounded border px-4 py-2 text-sm">Cancelar</button></div>
          </div>
        )}

        <div className="space-y-3">
          {rules.map((rule) => (
            <div key={rule.id} className={`rounded-lg border bg-white p-4 ${rule.active ? "" : "opacity-60"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3"><GitBranch className="h-4 w-4 text-brand" /><span className="text-sm font-semibold">{rule.name}</span></div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">{rule.assigned} asignados</span>
                  <button onClick={() => toggle(rule.id)} className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${rule.active ? "bg-green-100 text-green-700" : "bg-gray-100"}`}>{rule.active ? "ON" : "OFF"}</button>
                  <button onClick={() => remove(rule.id)} className="text-muted-foreground hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded bg-gray-100 px-2 py-0.5">Si <strong>{rule.field}</strong> {rule.condition} <strong>{rule.value}</strong></span>
                <span>→</span>
                <span className="rounded bg-brand/10 px-2 py-0.5 text-brand font-medium">{rule.method === "round_robin" ? "Round Robin" : rule.method === "least_loaded" ? "Menos cargado" : rule.assignTo}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
