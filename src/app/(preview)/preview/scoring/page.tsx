"use client";
import { useState, useEffect } from "react";
import { Plus, Save, Star, Trash2, TrendingUp } from "lucide-react";
import { loadFromStorage, saveToStorage, generateId } from "@/lib/local-storage";

type ScoreRule = { id: string; category: "icp" | "engagement" | "data" | "intent"; field: string; condition: string; points: number; active: boolean };

const CATEGORIES = { icp: { label: "ICP Match", color: "bg-blue-100 text-blue-700" }, engagement: { label: "Engagement", color: "bg-green-100 text-green-700" }, data: { label: "Completitud datos", color: "bg-amber-100 text-amber-700" }, intent: { label: "Señales de intención", color: "bg-purple-100 text-purple-700" } };

const SEED: ScoreRule[] = [
  { id: "sr1", category: "icp", field: "Industria = Tecnología", condition: "match", points: 20, active: true },
  { id: "sr2", category: "icp", field: "Empleados > 50", condition: "match", points: 15, active: true },
  { id: "sr3", category: "icp", field: "Tiene sitio web propio", condition: "match", points: 10, active: true },
  { id: "sr4", category: "engagement", field: "Respondió mensaje", condition: "action", points: 25, active: true },
  { id: "sr5", category: "engagement", field: "Abrió propuesta", condition: "action", points: 15, active: true },
  { id: "sr6", category: "engagement", field: "Agendó reunión", condition: "action", points: 30, active: true },
  { id: "sr7", category: "data", field: "Tiene email", condition: "field", points: 5, active: true },
  { id: "sr8", category: "data", field: "Tiene teléfono", condition: "field", points: 5, active: true },
  { id: "sr9", category: "data", field: "Tiene empresa", condition: "field", points: 5, active: true },
  { id: "sr10", category: "intent", field: "Visitó pricing page", condition: "signal", points: 20, active: true },
  { id: "sr11", category: "intent", field: "Preguntó por precios", condition: "signal", points: 25, active: true },
  { id: "sr12", category: "intent", field: "Solicitó demo", condition: "signal", points: 30, active: true },
];

export default function ScoringPage() {
  const [rules, setRules] = useState<ScoreRule[]>([]);
  const [saved, setSaved] = useState(false);
  useEffect(() => { setRules(loadFromStorage("scoring_rules", SEED)); }, []);
  function save(u: ScoreRule[]) { setRules(u); saveToStorage("scoring_rules", u); }
  function addRule(category: ScoreRule["category"]) { save([...rules, { id: generateId(), category, field: "Nuevo criterio", condition: "match", points: 10, active: true }]); }
  function updateRule(id: string, field: Partial<ScoreRule>) { save(rules.map((r) => r.id === id ? { ...r, ...field } : r)); }
  function removeRule(id: string) { save(rules.filter((r) => r.id !== id)); }
  function handleSave() { saveToStorage("scoring_rules", rules); setSaved(true); setTimeout(() => setSaved(false), 2000); }
  const maxScore = rules.filter((r) => r.active).reduce((s, r) => s + r.points, 0);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div><h1 className="text-2xl font-bold flex items-center gap-2"><Star className="h-6 w-6 text-brand" />Motor de Scoring</h1><p className="text-sm text-muted-foreground">Define reglas de puntuación por ICP, engagement, datos e intención. Score máximo: <strong>{maxScore} pts</strong></p></div>
          <button onClick={handleSave} className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover">{saved ? "✓ Guardado" : "Guardar reglas"}</button>
        </div>

        {Object.entries(CATEGORIES).map(([key, cat]) => {
          const catRules = rules.filter((r) => r.category === key);
          const catTotal = catRules.filter((r) => r.active).reduce((s, r) => s + r.points, 0);
          return (
            <div key={key} className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2"><span className={`rounded px-2 py-0.5 text-xs font-medium ${cat.color}`}>{cat.label}</span><span className="text-xs text-muted-foreground">{catTotal} pts</span></div>
                <button onClick={() => addRule(key as ScoreRule["category"])} className="text-xs text-brand hover:underline flex items-center gap-1"><Plus className="h-3 w-3" />Agregar</button>
              </div>
              <div className="space-y-1.5">
                {catRules.map((rule) => (
                  <div key={rule.id} className={`flex items-center gap-3 rounded border bg-white px-4 py-2 ${!rule.active ? "opacity-50" : ""}`}>
                    <input type="checkbox" checked={rule.active} onChange={(e) => updateRule(rule.id, { active: e.target.checked })} className="accent-[var(--accent)]" />
                    <input value={rule.field} onChange={(e) => updateRule(rule.id, { field: e.target.value })} className="flex-1 border-0 bg-transparent text-sm focus:outline-none" />
                    <div className="flex items-center gap-1"><TrendingUp className="h-3 w-3 text-brand" /><input type="number" value={rule.points} onChange={(e) => updateRule(rule.id, { points: Number(e.target.value) })} className="w-12 rounded border px-1.5 py-0.5 text-xs text-center focus:border-brand focus:outline-none" /><span className="text-[10px] text-muted-foreground">pts</span></div>
                    <button onClick={() => removeRule(rule.id)} className="text-muted-foreground hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
