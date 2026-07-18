"use client";

import { useState, useEffect } from "react";
import { GripVertical, Plus, Trash2, X } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";

type Lead = {
  id: string;
  name: string;
  company: string;
  value: string;
  stageId: string;
};

type Stage = {
  id: string;
  name: string;
  kind: "open" | "won" | "lost";
};

const SEED_STAGES: Stage[] = [
  { id: "s1", name: "Nuevo", kind: "open" },
  { id: "s2", name: "Contactado", kind: "open" },
  { id: "s3", name: "Propuesta", kind: "open" },
  { id: "s4", name: "Negociación", kind: "open" },
  { id: "s5", name: "Ganado", kind: "won" },
  { id: "s6", name: "Perdido", kind: "lost" },
];

const SEED_LEADS: Lead[] = [
  { id: "l1", name: "Carlos Ruiz", company: "TechCorp", value: "$85,000", stageId: "s4" },
  { id: "l2", name: "María García", company: "LogiNext", value: "$32,000", stageId: "s3" },
  { id: "l3", name: "Roberto Méndez", company: "MediaGroup", value: "$45,000", stageId: "s2" },
  { id: "l4", name: "Ana Torres", company: "InnovateLab", value: "$28,000", stageId: "s1" },
  { id: "l5", name: "Lucía Vega", company: "FinServ", value: "$55,000", stageId: "s1" },
  { id: "l6", name: "Diego Morales", company: "TechCorp", value: "$12,000", stageId: "s5" },
];

const STAGE_COLORS: Record<string, string> = {
  open: "border-t-blue-400",
  won: "border-t-green-400",
  lost: "border-t-red-400",
};

export default function PipelinePreviewPage() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", company: "", value: "", stageId: "" });
  const [dragging, setDragging] = useState<string | null>(null);

  useEffect(() => {
    setStages(loadFromStorage("pipeline_stages", SEED_STAGES));
    setLeads(loadFromStorage("pipeline_leads", SEED_LEADS));
  }, []);

  function saveLeads(u: Lead[]) { setLeads(u); saveToStorage("pipeline_leads", u); }
  function saveStages(u: Stage[]) { setStages(u); saveToStorage("pipeline_stages", u); }

  function handleAddLead() {
    if (!form.name.trim()) return;
    const stageId = form.stageId || stages[0]?.id || "";
    saveLeads([{ id: generateId(), name: form.name, company: form.company, value: form.value || "$0", stageId }, ...leads]);
    setForm({ name: "", company: "", value: "", stageId: "" });
    setShowForm(false);
  }

  function handleDeleteLead(id: string) { saveLeads(leads.filter((l) => l.id !== id)); }

  function moveLead(leadId: string, toStageId: string) {
    saveLeads(leads.map((l) => l.id === leadId ? { ...l, stageId: toStageId } : l));
  }

  // Simple drag and drop
  function handleDragStart(leadId: string) { setDragging(leadId); }
  function handleDragOver(e: React.DragEvent) { e.preventDefault(); }
  function handleDrop(stageId: string) {
    if (dragging) { moveLead(dragging, stageId); setDragging(null); }
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h2 className="font-semibold">Pipeline</h2>
          <p className="text-xs text-muted-foreground">{leads.length} leads · Arrastra tarjetas entre columnas</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover transition-colors">
          <Plus className="h-4 w-4" />Nuevo lead
        </button>
      </header>

      {showForm && (
        <div className="border-b bg-white px-6 py-4">
          <div className="flex flex-wrap items-end gap-3">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nombre *" className="w-40 rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
            <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Empresa" className="w-36 rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
            <input value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="Valor (ej: $50,000)" className="w-32 rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
            <select value={form.stageId} onChange={(e) => setForm({ ...form, stageId: e.target.value })} className="rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand">
              <option value="">Etapa...</option>
              {stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <button onClick={handleAddLead} className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover">Agregar</button>
            <button onClick={() => setShowForm(false)} className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"><X className="h-4 w-4" /></button>
          </div>
        </div>
      )}

      <div className="flex flex-1 gap-4 overflow-x-auto p-4">
        {stages.map((stage) => {
          const stageLeads = leads.filter((l) => l.stageId === stage.id);
          return (
            <div
              key={stage.id}
              className={`flex w-64 shrink-0 flex-col rounded-lg border border-t-4 bg-gray-50/50 ${STAGE_COLORS[stage.kind]}`}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(stage.id)}
            >
              <div className="flex items-center justify-between px-3 py-2.5">
                <span className="text-sm font-semibold">{stage.name}</span>
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gray-200 px-1.5 text-xs font-medium">{stageLeads.length}</span>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto px-2 pb-2">
                {stageLeads.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={() => handleDragStart(lead.id)}
                    className="group cursor-grab rounded-md border bg-white p-3 shadow-sm hover:shadow transition-shadow active:cursor-grabbing"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50" />
                        <div>
                          <p className="text-sm font-medium">{lead.name}</p>
                          <p className="text-xs text-muted-foreground">{lead.company}</p>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteLead(lead.id)} className="opacity-0 group-hover:opacity-100 rounded p-0.5 text-muted-foreground hover:text-red-500 transition-opacity">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {lead.value && <p className="mt-1.5 text-right text-xs font-semibold text-brand">{lead.value}</p>}
                  </div>
                ))}
                {stageLeads.length === 0 && (
                  <div className="flex h-20 items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
                    Arrastra aquí
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
