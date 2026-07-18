"use client";

import { useState, useEffect } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ChevronLeft, ChevronRight, ClipboardCopy, Copy, Edit3, GripVertical, Plus, Trash2, X } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";

type Opportunity = {
  id: string; name: string; company: string; value: number;
  stage: "discovery" | "qualification" | "proposal" | "negotiation" | "closed_won" | "closed_lost";
  probability: number; owner: string; closeDate: string;
};

const STAGE_ORDER: Opportunity["stage"][] = ["discovery", "qualification", "proposal", "negotiation", "closed_won", "closed_lost"];
const STAGES: Record<string, { label: string; color: string }> = {
  discovery: { label: "Descubrimiento", color: "bg-gray-100 text-gray-700" },
  qualification: { label: "Calificacion", color: "bg-blue-100 text-blue-700" },
  proposal: { label: "Propuesta", color: "bg-purple-100 text-purple-700" },
  negotiation: { label: "Negociacion", color: "bg-amber-100 text-amber-700" },
  closed_won: { label: "Cerrada ganada", color: "bg-green-100 text-green-700" },
  closed_lost: { label: "Cerrada perdida", color: "bg-red-100 text-red-700" },
};

const SEED: Opportunity[] = [
  { id: "o1", name: "Contrato Enterprise", company: "TechCorp", value: 85000, stage: "negotiation", probability: 75, owner: "Juan Pérez", closeDate: "2026-08-15" },
  { id: "o2", name: "Licencia Anual", company: "MediaGroup", value: 45000, stage: "proposal", probability: 60, owner: "Ana López", closeDate: "2026-08-30" },
  { id: "o3", name: "Implementacion Logistica", company: "LogiNext", value: 32000, stage: "qualification", probability: 40, owner: "Juan Pérez", closeDate: "2026-09-15" },
  { id: "o4", name: "Consultoria Digital", company: "InnovateLab", value: 28000, stage: "discovery", probability: 25, owner: "María Gómez", closeDate: "2026-09-30" },
  { id: "o5", name: "Paquete Premium", company: "RetailMax", value: 12000, stage: "closed_won", probability: 100, owner: "Juan Pérez", closeDate: "2026-07-01" },
];

function fmt(v: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v); }

export default function OpportunitiesPage() {
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [view, setView] = useState<"list" | "board">("board");
  const [showForm, setShowForm] = useState(false);
  const [editOpp, setEditOpp] = useState<Opportunity | null>(null);
  const [form, setForm] = useState({ name: "", company: "", value: "", stage: "discovery" as Opportunity["stage"], probability: "50", owner: "", closeDate: "" });
  const [dragging, setDragging] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => { setOpps(loadFromStorage("opportunities", SEED)); }, []);
  function save(u: Opportunity[]) { setOpps(u); saveToStorage("opportunities", u); }
  function showToast(m: string) { setToast(m); setTimeout(() => setToast(""), 2500); }

  function handleAdd() {
    if (!form.name.trim()) return;
    save([{ id: generateId(), name: form.name, company: form.company, value: Number(form.value) || 0, stage: form.stage, probability: Number(form.probability) || 50, owner: form.owner, closeDate: form.closeDate }, ...opps]);
    setForm({ name: "", company: "", value: "", stage: "discovery", probability: "50", owner: "", closeDate: "" });
    setShowForm(false);
  }

  function openEdit(opp: Opportunity) {
    setEditOpp(opp);
    setForm({ name: opp.name, company: opp.company, value: String(opp.value), stage: opp.stage, probability: String(opp.probability), owner: opp.owner, closeDate: opp.closeDate });
  }

  function handleUpdate() {
    if (!editOpp) return;
    save(opps.map(o => o.id === editOpp.id ? { ...o, name: form.name, company: form.company, value: Number(form.value) || 0, stage: form.stage, probability: Number(form.probability) || 50, owner: form.owner, closeDate: form.closeDate } : o));
    setEditOpp(null); showToast("Oportunidad actualizada");
  }

  function handleDelete(id: string) { save(opps.filter(o => o.id !== id)); }

  function moveStage(id: string, direction: "next" | "prev") {
    save(opps.map(o => {
      if (o.id !== id) return o;
      const idx = STAGE_ORDER.indexOf(o.stage);
      const newIdx = direction === "next" ? Math.min(idx + 1, STAGE_ORDER.length - 1) : Math.max(idx - 1, 0);
      return { ...o, stage: STAGE_ORDER[newIdx]! };
    }));
    showToast("Movida a " + STAGES[opps.find(o => o.id === id)?.stage || "discovery"]?.label);
  }

  function moveToStage(id: string, stage: Opportunity["stage"]) {
    save(opps.map(o => o.id === id ? { ...o, stage } : o));
  }

  function duplicateOpp(opp: Opportunity) {
    save([{ ...opp, id: generateId(), name: opp.name + " (copia)" }, ...opps]);
    showToast("Oportunidad duplicada");
  }

  function copyOpp(opp: Opportunity) {
    navigator.clipboard.writeText(JSON.stringify(opp, null, 2));
    showToast("Copiada al portapapeles");
  }

  function moveUp(id: string) {
    const idx = opps.findIndex(o => o.id === id);
    if (idx <= 0) return;
    const arr = [...opps]; [arr[idx - 1], arr[idx]] = [arr[idx]!, arr[idx - 1]!];
    save(arr);
  }

  function moveDown(id: string) {
    const idx = opps.findIndex(o => o.id === id);
    if (idx >= opps.length - 1) return;
    const arr = [...opps]; [arr[idx], arr[idx + 1]] = [arr[idx + 1]!, arr[idx]!];
    save(arr);
  }

  // Drag and drop
  function handleDragOver(e: React.DragEvent) { e.preventDefault(); }
  function handleDrop(stage: Opportunity["stage"]) { if (dragging) { moveToStage(dragging, stage); setDragging(null); } }

  const totalPipeline = opps.filter(o => !o.stage.startsWith("closed")).reduce((s, o) => s + o.value, 0);
  const weighted = opps.filter(o => !o.stage.startsWith("closed")).reduce((s, o) => s + o.value * (o.probability / 100), 0);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">Oportunidades</h1>
            <p className="text-sm text-muted-foreground">Pipeline: {fmt(totalPipeline)} · Ponderado: {fmt(weighted)}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-md border">
              <button onClick={() => setView("board")} className={`px-3 py-1.5 text-xs font-medium ${view === "board" ? "bg-brand text-white" : "hover:bg-gray-50"}`}>Board</button>
              <button onClick={() => setView("list")} className={`px-3 py-1.5 text-xs font-medium ${view === "list" ? "bg-brand text-white" : "hover:bg-gray-50"}`}>Lista</button>
            </div>
            <button onClick={() => { setEditOpp(null); setForm({ name: "", company: "", value: "", stage: "discovery", probability: "50", owner: "", closeDate: "" }); setShowForm(true); }} className="flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"><Plus className="h-4 w-4" />Nueva</button>
          </div>
        </div>

        {/* Board View */}
        {view === "board" && (
          <div className="flex gap-3 overflow-x-auto pb-4">
            {STAGE_ORDER.map(key => {
              const stage = STAGES[key]!;
              const stageOpps = opps.filter(o => o.stage === key);
              const stageTotal = stageOpps.reduce((s, o) => s + o.value, 0);
              return (
                <div key={key} className="w-64 shrink-0" onDragOver={handleDragOver} onDrop={() => handleDrop(key)}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className={`rounded px-2 py-0.5 text-[10px] font-medium ${stage.color}`}>{stage.label}</span>
                    <span className="text-[10px] text-muted-foreground">{stageOpps.length} · {fmt(stageTotal)}</span>
                  </div>
                  <div className="space-y-2 min-h-[100px] rounded-lg border border-dashed p-2 bg-gray-50/30">
                    {stageOpps.map(opp => (
                      <div key={opp.id} draggable onDragStart={() => setDragging(opp.id)} className="group rounded-lg border bg-white p-3 shadow-sm cursor-grab active:cursor-grabbing hover:shadow transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => openEdit(opp)}>
                            <GripVertical className="h-3 w-3 text-muted-foreground/40" />
                            <div>
                              <p className="text-xs font-medium">{opp.name}</p>
                              <p className="text-[10px] text-muted-foreground">{opp.company}</p>
                            </div>
                          </div>
                          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => moveStage(opp.id, "prev")} className="rounded p-0.5 text-muted-foreground hover:text-brand" title="Etapa anterior"><ChevronLeft className="h-3 w-3" /></button>
                            <button onClick={() => moveStage(opp.id, "next")} className="rounded p-0.5 text-muted-foreground hover:text-brand" title="Siguiente etapa"><ChevronRight className="h-3 w-3" /></button>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs font-bold text-brand">{fmt(opp.value)}</span>
                          <span className="text-[10px] text-muted-foreground">{opp.probability}%</span>
                        </div>
                        {/* Action row on hover */}
                        <div className="mt-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity border-t pt-1.5">
                          <button onClick={() => openEdit(opp)} className="rounded p-0.5 text-muted-foreground hover:text-brand text-[9px]" title="Editar"><Edit3 className="h-3 w-3" /></button>
                          <button onClick={() => duplicateOpp(opp)} className="rounded p-0.5 text-muted-foreground hover:text-gray-700" title="Duplicar"><Copy className="h-3 w-3" /></button>
                          <button onClick={() => copyOpp(opp)} className="rounded p-0.5 text-muted-foreground hover:text-gray-700" title="Copiar"><ClipboardCopy className="h-3 w-3" /></button>
                          <button onClick={() => handleDelete(opp.id)} className="rounded p-0.5 text-muted-foreground hover:text-red-500 ml-auto" title="Eliminar"><Trash2 className="h-3 w-3" /></button>
                        </div>
                      </div>
                    ))}
                    {stageOpps.length === 0 && <div className="flex h-20 items-center justify-center text-[10px] text-muted-foreground">Arrastra aqui</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* List View */}
        {view === "list" && (
          <div className="rounded-lg border bg-white overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50/50">
                <tr>
                  <th className="px-3 py-2.5 text-left text-[10px] font-medium uppercase text-muted-foreground">Oportunidad</th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-medium uppercase text-muted-foreground">Etapa</th>
                  <th className="px-3 py-2.5 text-right text-[10px] font-medium uppercase text-muted-foreground">Valor</th>
                  <th className="px-3 py-2.5 text-center text-[10px] font-medium uppercase text-muted-foreground">Prob.</th>
                  <th className="px-3 py-2.5 text-center text-[10px] font-medium uppercase text-muted-foreground">Mover</th>
                  <th className="px-3 py-2.5 text-right text-[10px] font-medium uppercase text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {opps.map(opp => (
                  <tr key={opp.id} className="group border-b last:border-0 hover:bg-gray-50/50">
                    <td className="px-3 py-2.5 cursor-pointer" onClick={() => openEdit(opp)}><p className="text-sm font-medium">{opp.name}</p><p className="text-[10px] text-muted-foreground">{opp.company} · {opp.owner}</p></td>
                    <td className="px-3 py-2.5">
                      <select value={opp.stage} onChange={e => moveToStage(opp.id, e.target.value as Opportunity["stage"])} className="rounded border px-1.5 py-0.5 text-[10px] font-medium focus:border-brand focus:outline-none">
                        {STAGE_ORDER.map(s => <option key={s} value={s}>{STAGES[s]!.label}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2.5 text-right text-sm font-semibold">{fmt(opp.value)}</td>
                    <td className="px-3 py-2.5 text-center text-xs">{opp.probability}%</td>
                    <td className="px-3 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        <button onClick={() => moveUp(opp.id)} className="rounded p-0.5 text-muted-foreground hover:text-brand" title="Subir"><ArrowUp className="h-3.5 w-3.5" /></button>
                        <button onClick={() => moveDown(opp.id)} className="rounded p-0.5 text-muted-foreground hover:text-brand" title="Bajar"><ArrowDown className="h-3.5 w-3.5" /></button>
                        <button onClick={() => moveStage(opp.id, "prev")} className="rounded p-0.5 text-muted-foreground hover:text-brand" title="Etapa anterior"><ArrowLeft className="h-3.5 w-3.5" /></button>
                        <button onClick={() => moveStage(opp.id, "next")} className="rounded p-0.5 text-muted-foreground hover:text-brand" title="Siguiente etapa"><ArrowRight className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100">
                        <button onClick={() => openEdit(opp)} className="rounded p-1 hover:bg-blue-50 text-muted-foreground hover:text-brand"><Edit3 className="h-3.5 w-3.5" /></button>
                        <button onClick={() => duplicateOpp(opp)} className="rounded p-1 hover:bg-gray-100 text-muted-foreground"><Copy className="h-3.5 w-3.5" /></button>
                        <button onClick={() => handleDelete(opp.id)} className="rounded p-1 hover:bg-red-50 text-muted-foreground hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showForm || editOpp) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold">{editOpp ? "Editar oportunidad" : "Nueva oportunidad"}</h3>
              <button onClick={() => { setShowForm(false); setEditOpp(null); }} className="rounded p-1 hover:bg-gray-100"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><label className="text-xs font-medium text-muted-foreground">Nombre</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Nombre *" className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" /></div>
                <div><label className="text-xs font-medium text-muted-foreground">Empresa</label><input value={form.company} onChange={e => setForm({...form, company: e.target.value})} className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" /></div>
                <div><label className="text-xs font-medium text-muted-foreground">Valor ($)</label><input value={form.value} onChange={e => setForm({...form, value: e.target.value})} type="number" className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" /></div>
                <div><label className="text-xs font-medium text-muted-foreground">Etapa</label>
                  <select value={form.stage} onChange={e => setForm({...form, stage: e.target.value as Opportunity["stage"]})} className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none">
                    {STAGE_ORDER.map(s => <option key={s} value={s}>{STAGES[s]!.label}</option>)}
                  </select>
                </div>
                <div><label className="text-xs font-medium text-muted-foreground">Probabilidad %</label><input value={form.probability} onChange={e => setForm({...form, probability: e.target.value})} type="number" min="0" max="100" className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" /></div>
                <div><label className="text-xs font-medium text-muted-foreground">Responsable</label><input value={form.owner} onChange={e => setForm({...form, owner: e.target.value})} className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" /></div>
                <div><label className="text-xs font-medium text-muted-foreground">Fecha cierre</label><input value={form.closeDate} onChange={e => setForm({...form, closeDate: e.target.value})} type="date" className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" /></div>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={editOpp ? handleUpdate : handleAdd} className="flex-1 rounded-md bg-brand py-2 text-sm font-medium text-white hover:bg-brand-hover">{editOpp ? "Guardar cambios" : "Crear oportunidad"}</button>
                <button onClick={() => { setShowForm(false); setEditOpp(null); }} className="rounded-md border px-4 py-2 text-sm">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-lg">{toast}</div>}
    </div>
  );
}
