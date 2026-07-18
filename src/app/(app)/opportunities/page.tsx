"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";

type Opportunity = {
  id: string;
  name: string;
  company: string;
  value: number;
  stage: "discovery" | "qualification" | "proposal" | "negotiation" | "closed_won" | "closed_lost";
  probability: number;
  owner: string;
  closeDate: string;
};

const STAGES = {
  discovery: { label: "Descubrimiento", color: "bg-gray-100 text-gray-700" },
  qualification: { label: "Calificación", color: "bg-blue-100 text-blue-700" },
  proposal: { label: "Propuesta", color: "bg-purple-100 text-purple-700" },
  negotiation: { label: "Negociación", color: "bg-amber-100 text-amber-700" },
  closed_won: { label: "Cerrada ganada", color: "bg-green-100 text-green-700" },
  closed_lost: { label: "Cerrada perdida", color: "bg-red-100 text-red-700" },
};

const SEED: Opportunity[] = [
  { id: "o1", name: "Contrato Enterprise", company: "TechCorp", value: 85000, stage: "negotiation", probability: 75, owner: "Juan Pérez", closeDate: "2026-08-15" },
  { id: "o2", name: "Licencia Anual", company: "MediaGroup", value: 45000, stage: "proposal", probability: 60, owner: "Ana López", closeDate: "2026-08-30" },
  { id: "o3", name: "Implementación Logística", company: "LogiNext", value: 32000, stage: "qualification", probability: 40, owner: "Juan Pérez", closeDate: "2026-09-15" },
];

function fmt(v: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v); }

export default function OpportunitiesPage() {
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [view, setView] = useState<"list" | "board">("board");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", company: "", value: "", stage: "discovery" as Opportunity["stage"], probability: "50", owner: "", closeDate: "" });

  useEffect(() => { setOpps(loadFromStorage("opportunities", SEED)); }, []);
  function save(u: Opportunity[]) { setOpps(u); saveToStorage("opportunities", u); }

  function handleAdd() {
    if (!form.name.trim()) return;
    save([{ id: generateId(), name: form.name, company: form.company, value: Number(form.value) || 0, stage: form.stage, probability: Number(form.probability) || 50, owner: form.owner, closeDate: form.closeDate }, ...opps]);
    setForm({ name: "", company: "", value: "", stage: "discovery", probability: "50", owner: "", closeDate: "" });
    setShowForm(false);
  }

  function handleDelete(id: string) { save(opps.filter((o) => o.id !== id)); }

  function moveStage(id: string, stage: Opportunity["stage"]) {
    save(opps.map((o) => o.id === id ? { ...o, stage } : o));
  }

  const totalPipeline = opps.filter((o) => !o.stage.startsWith("closed")).reduce((s, o) => s + o.value, 0);
  const weighted = opps.filter((o) => !o.stage.startsWith("closed")).reduce((s, o) => s + o.value * (o.probability / 100), 0);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Oportunidades</h1>
            <p className="text-sm text-muted-foreground">Pipeline: {fmt(totalPipeline)} · Ponderado: {fmt(weighted)}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-md border">
              <button onClick={() => setView("board")} className={`px-3 py-1.5 text-xs font-medium ${view === "board" ? "bg-brand text-white" : "hover:bg-gray-50"}`}>Board</button>
              <button onClick={() => setView("list")} className={`px-3 py-1.5 text-xs font-medium ${view === "list" ? "bg-brand text-white" : "hover:bg-gray-50"}`}>Lista</button>
            </div>
            <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover transition-colors">
              <Plus className="h-4 w-4" />Nueva
            </button>
          </div>
        </div>

        {showForm && (
          <div className="mb-6 rounded-lg border bg-white p-5">
            <h3 className="mb-4 font-semibold">Nueva oportunidad</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nombre *" className="rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Empresa" className="rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              <input value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="Valor ($)" type="number" className="rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              <select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value as Opportunity["stage"] })} className="rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand">
                {Object.entries(STAGES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <input value={form.probability} onChange={(e) => setForm({ ...form, probability: e.target.value })} placeholder="Probabilidad %" type="number" className="rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
              <input value={form.closeDate} onChange={(e) => setForm({ ...form, closeDate: e.target.value })} type="date" className="rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={handleAdd} className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover">Guardar</button>
              <button onClick={() => setShowForm(false)} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50">Cancelar</button>
            </div>
          </div>
        )}

        {view === "board" && (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {Object.entries(STAGES).map(([key, stage]) => {
              const stageOpps = opps.filter((o) => o.stage === key);
              return (
                <div key={key} className="w-72 shrink-0">
                  <div className="mb-2 flex items-center justify-between">
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${stage.color}`}>{stage.label}</span>
                    <span className="text-xs text-muted-foreground">{stageOpps.length}</span>
                  </div>
                  <div className="space-y-2 min-h-[80px] rounded-lg border border-dashed p-2">
                    {stageOpps.map((opp) => (
                      <div key={opp.id} className="group rounded-lg border bg-white p-3 shadow-sm">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium">{opp.name}</p>
                          <button onClick={() => handleDelete(opp.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                        <p className="text-xs text-muted-foreground">{opp.company}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-sm font-bold text-brand">{fmt(opp.value)}</span>
                          <span className="text-xs text-muted-foreground">{opp.probability}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {view === "list" && (
          <div className="overflow-hidden rounded-lg border bg-white">
            <table className="w-full">
              <thead className="border-b bg-gray-50/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Oportunidad</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Etapa</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-muted-foreground">Valor</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase text-muted-foreground">Prob.</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {opps.map((opp) => (
                  <tr key={opp.id} className="group border-b last:border-0 hover:bg-gray-50/50">
                    <td className="px-4 py-3"><p className="text-sm font-medium">{opp.name}</p><p className="text-xs text-muted-foreground">{opp.company}</p></td>
                    <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STAGES[opp.stage].color}`}>{STAGES[opp.stage].label}</span></td>
                    <td className="px-4 py-3 text-right text-sm font-semibold">{fmt(opp.value)}</td>
                    <td className="px-4 py-3 text-center text-sm">{opp.probability}%</td>
                    <td className="px-4 py-3 text-right"><button onClick={() => handleDelete(opp.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500"><Trash2 className="h-4 w-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
