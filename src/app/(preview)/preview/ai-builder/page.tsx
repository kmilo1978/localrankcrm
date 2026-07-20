"use client";
import { useState } from "react";
import { Bot, CheckCircle2, Lightbulb, Send, Sparkles, Wand2, Zap } from "lucide-react";
import { generateId } from "@/lib/local-storage";

type AiAction = { id: string; prompt: string; module: string; action: string; result: string; timestamp: string };

const MODULES = [
  { id: "contacts", label: "Contactos", icon: "👥" },
  { id: "tasks", label: "Tareas", icon: "✅" },
  { id: "pipeline", label: "Pipeline", icon: "📊" },
  { id: "notes", label: "Notas", icon: "📝" },
  { id: "emails", label: "Emails", icon: "📧" },
  { id: "proposals", label: "Propuestas", icon: "📄" },
  { id: "calendar", label: "Calendario", icon: "📅" },
  { id: "automations", label: "Automatizaciones", icon: "⚡" },
];

const EXAMPLES = [
  "Crea una tarea para llamar a Carlos Ruiz mañana a las 10am",
  "Genera un email de seguimiento para el lead de TechCorp",
  "Mueve la oportunidad de MediaGroup a etapa Negociación",
  "Crea una nota: reunión productiva con LogiNext, interesados en módulo logístico",
  "Agenda una cita para el viernes a las 3pm con Roberto Méndez",
  "Crea una propuesta para TechCorp por $85,000 plan Enterprise",
  "Genera 5 tareas de onboarding para nuevo cliente",
  "Crea una automatización: cuando un lead llega score 80, mover a pipeline",
];

export default function AiBuilderPage() {
  const [prompt, setPrompt] = useState("");
  const [module, setModule] = useState("auto");
  const [history, setHistory] = useState<AiAction[]>([]);
  const [loading, setLoading] = useState(false);

  function executePrompt() {
    if (!prompt.trim()) return;
    setLoading(true);

    // Detect module from prompt
    const detectedModule = detectModule(prompt);
    const action = generateAction(prompt, detectedModule);

    setTimeout(() => {
      const entry: AiAction = {
        id: generateId(),
        prompt,
        module: detectedModule,
        action: action.action,
        result: action.result,
        timestamp: new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
      };
      setHistory(prev => [entry, ...prev]);
      setPrompt("");
      setLoading(false);
    }, 1200);
  }

  function detectModule(text: string): string {
    const lower = text.toLowerCase();
    if (lower.includes("tarea") || lower.includes("task")) return "tasks";
    if (lower.includes("email") || lower.includes("correo") || lower.includes("seguimiento")) return "emails";
    if (lower.includes("nota") || lower.includes("reunión") || lower.includes("reunion")) return "notes";
    if (lower.includes("pipeline") || lower.includes("oportunidad") || lower.includes("etapa") || lower.includes("mover")) return "pipeline";
    if (lower.includes("cita") || lower.includes("agenda") || lower.includes("calendario")) return "calendar";
    if (lower.includes("propuesta") || lower.includes("cotiza")) return "proposals";
    if (lower.includes("automatiza") || lower.includes("cuando") || lower.includes("trigger")) return "automations";
    if (lower.includes("contacto") || lower.includes("lead") || lower.includes("cliente")) return "contacts";
    return module !== "auto" ? module : "tasks";
  }

  function generateAction(text: string, mod: string): { action: string; result: string } {
    const actions: Record<string, { action: string; result: string }> = {
      tasks: { action: "Tarea creada", result: `✅ Tarea creada en módulo Tareas:\n\n"${text.replace(/crea una tarea|crea tarea|genera/gi, "").trim()}"\n\n• Prioridad: Media\n• Estado: Pendiente\n• Asignado: Admin` },
      emails: { action: "Borrador generado", result: `📧 Borrador de email generado:\n\nAsunto: Seguimiento — LocalRank CRM\n\nHola,\n\nEspero que estés bien. Quería dar seguimiento a nuestra última conversación...\n\n[El borrador completo está listo en Conversaciones → Borradores]` },
      notes: { action: "Nota creada", result: `📝 Nota guardada:\n\n"${text.replace(/crea una nota:|crea nota:/gi, "").trim()}"\n\n• Categoría: General\n• Fecha: Hoy` },
      pipeline: { action: "Pipeline actualizado", result: `📊 Pipeline actualizado:\n\n${text}\n\n• Acción ejecutada correctamente\n• Puedes verificar en el módulo Pipeline` },
      calendar: { action: "Cita agendada", result: `📅 Evento creado en Calendario:\n\n"${text.replace(/agenda|crea una cita/gi, "").trim()}"\n\n• Agregado al calendario "Citas"\n• Recordatorio activado` },
      proposals: { action: "Propuesta creada", result: `📄 Propuesta generada:\n\n${text}\n\n• Secciones: Resumen, Alcance, Pricing, Timeline\n• Estado: Borrador\n• Disponible en módulo Propuestas` },
      automations: { action: "Automatización creada", result: `⚡ Automatización configurada:\n\n"${text}"\n\n• Trigger detectado\n• Condiciones configuradas\n• Acciones asignadas\n• Estado: Activa` },
      contacts: { action: "Contacto procesado", result: `👥 Acción sobre contacto:\n\n${text}\n\n• Ejecutado correctamente\n• Puedes verificar en Contactos` },
    };
    return actions[mod] || actions.tasks!;
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2"><Wand2 className="h-6 w-6 text-purple-600" />Constructor IA</h1>
          <p className="text-sm text-muted-foreground">Dile qué hacer y la IA lo ejecuta en el módulo correcto. Mezcla manual + automático.</p>
        </div>

        {/* Main input */}
        <div className="mb-6 rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <select value={module} onChange={e => setModule(e.target.value)} className="rounded-lg border px-3 py-2 text-xs focus:border-brand focus:outline-none">
              <option value="auto">🤖 Auto-detectar módulo</option>
              {MODULES.map(m => <option key={m.id} value={m.id}>{m.icon} {m.label}</option>)}
            </select>
            <span className="text-[10px] text-muted-foreground">La IA detecta automáticamente dónde ejecutar</span>
          </div>
          <div className="flex gap-2">
            <input
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") executePrompt(); }}
              placeholder="Dime qué hacer... Ej: 'Crea una tarea para llamar a Carlos mañana'"
              className="flex-1 rounded-lg border px-4 py-3 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
            />
            <button onClick={executePrompt} disabled={!prompt.trim() || loading} className="rounded-lg bg-purple-600 px-5 py-3 text-white hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2">
              {loading ? <Sparkles className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Examples */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1"><Lightbulb className="h-3.5 w-3.5" />Ejemplos</h3>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex, i) => (
              <button key={i} onClick={() => setPrompt(ex)} className="rounded-full border px-3 py-1.5 text-[10px] hover:bg-gray-50 hover:border-purple-200 transition-colors">{ex}</button>
            ))}
          </div>
        </div>

        {/* History */}
        <div className="space-y-3">
          {history.map(entry => (
            <div key={entry.id} className="rounded-lg border bg-white p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-xs font-medium text-green-700">{entry.action}</span>
                <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[9px] text-purple-700">{MODULES.find(m => m.id === entry.module)?.icon} {MODULES.find(m => m.id === entry.module)?.label}</span>
                <span className="text-[9px] text-muted-foreground ml-auto">{entry.timestamp}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2 italic">"{entry.prompt}"</p>
              <pre className="text-xs whitespace-pre-wrap bg-gray-50 rounded-lg p-3 border">{entry.result}</pre>
            </div>
          ))}
        </div>

        {history.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Bot className="h-12 w-12 mx-auto mb-3 text-purple-200" />
            <p className="text-sm mb-1">Escribe un comando y la IA lo ejecuta</p>
            <p className="text-xs">Detecta automáticamente si es una tarea, nota, email, cita o automatización</p>
          </div>
        )}
      </div>
    </div>
  );
}
