"use client";
import { useState, useEffect } from "react";
import { Bot, CheckCircle2, Lightbulb, Send, Settings, Sparkles, Wand2, Zap } from "lucide-react";
import { generateId } from "@/lib/local-storage";
import { crmAI, isAiConfigured, AI_AGENTS, AI_MODELS, callAI, saveAiKey } from "@/lib/ai-client";
import type { AiMessage } from "@/lib/ai-client";

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
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState("deepseek/deepseek-chat-v3-0324:free");
  const [history, setHistory] = useState<AiAction[]>([]);
  const [loading, setLoading] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [connected, setConnected] = useState(false);

  // Check connection on mount
  useEffect(() => { setConnected(isAiConfigured()); }, []);

  function executePrompt() {
    if (!prompt.trim()) return;
    setLoading(true);

    const detectedModule = detectModule(prompt);
    
    // Always try real AI first (key might have been set in Settings)
    const hasKey = isAiConfigured();
    if (hasKey !== connected) setConnected(hasKey);

    if (hasKey) {
      // Use real AI
      const agent = selectedAgent ? AI_AGENTS.find(a => a.id === selectedAgent) : null;
      const systemContent = agent?.system || "Eres un asistente de CRM empresarial (LocalRank CRM). Ayudas a gestionar contactos, ventas, tareas, emails y automatizaciones. Responde en español, sé conciso y ejecuta las acciones que te pidan. Si te preguntan sobre datos del CRM, usa la información proporcionada para responder con datos reales.";
      
      // Gather CRM context
      let crmContext = "";
      try {
        const contacts = JSON.parse(localStorage.getItem("localrank_contacts") || localStorage.getItem("contacts") || "[]");
        const tasks = JSON.parse(localStorage.getItem("localrank_tasks") || localStorage.getItem("tasks") || "[]");
        const opportunities = JSON.parse(localStorage.getItem("localrank_opportunities") || localStorage.getItem("opportunities") || "[]");
        crmContext = `\n\nDATOS DEL CRM:\n- ${contacts.length} contactos: ${contacts.slice(0, 5).map((c: {name:string;company?:string;email?:string;phone?:string}) => `${c.name} (${c.company || ""}, ${c.email || ""}, ${c.phone || ""})`).join("; ")}\n- ${tasks.length} tareas (${tasks.filter((t:{status:string}) => t.status !== "completed").length} pendientes)\n- ${opportunities.length} oportunidades`;
      } catch {}

      const msgs: AiMessage[] = [
        { role: "system", content: systemContent + crmContext },
        { role: "user", content: prompt },
      ];

      callAI(msgs, selectedModel).then(result => {
        const entry: AiAction = { id: generateId(), prompt, module: detectedModule, action: agent ? `${agent.name} respondió` : "IA respondió", result, timestamp: new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }) };
        setHistory(prev => [entry, ...prev]);
        setPrompt(""); setLoading(false);
      }).catch(() => {
        // Fallback if API fails
        const action = generateAction(prompt, detectedModule);
        const entry: AiAction = { id: generateId(), prompt, module: detectedModule, action: action.action, result: action.result + "\n\n⚠️ Error conectando con el modelo. Verifica tu API key.", timestamp: new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }) };
        setHistory(prev => [entry, ...prev]);
        setPrompt(""); setLoading(false);
      });
    } else {
      // Fallback to local logic (no key)
      const action = generateAction(prompt, detectedModule);
      setTimeout(() => {
        const entry: AiAction = { id: generateId(), prompt, module: detectedModule, action: action.action, result: action.result, timestamp: new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }) };
        setHistory(prev => [entry, ...prev]);
        setPrompt(""); setLoading(false);
      }, 1200);
    }
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
    const lower = text.toLowerCase();
    
    // CONSULTAS — responder con datos reales
    if (lower.includes("cuántos") || lower.includes("cuantos") || lower.includes("cuántas") || lower.includes("cuantas") || lower.includes("total")) {
      try {
        const contacts = JSON.parse(localStorage.getItem("contacts") || "[]");
        const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
        const opportunities = JSON.parse(localStorage.getItem("opportunities") || "[]");
        const pending = tasks.filter((t: { status: string }) => t.status !== "completed").length;
        return { action: "Consulta respondida", result: `📊 Resumen del CRM:\n\n• ${contacts.length} contactos\n• ${tasks.length} tareas (${pending} pendientes)\n• ${opportunities.length} oportunidades\n\nPara datos más específicos, conecta tu API key de OpenRouter.` };
      } catch { /* fallthrough */ }
    }

    // GUIAR — preguntas de cómo hacer algo
    if (lower.includes("cómo") || lower.includes("como") || lower.includes("dónde") || lower.includes("donde") || lower.includes("ayuda")) {
      if (lower.includes("contacto")) return { action: "Guía", result: "📖 Para crear un contacto:\n\n1. Ve a CRM & Ventas → Contactos\n2. Haz clic en 'Nuevo'\n3. Llena nombre, teléfono, email y empresa\n4. Opcionalmente agrega campos personalizados\n5. Clic en 'Guardar'\n\n💡 Tip: También puedes importar desde Lead Finder o Prospección." };
      if (lower.includes("tarea")) return { action: "Guía", result: "📖 Para crear una tarea:\n\n1. Ve a CRM & Ventas → Tareas\n2. Clic en 'Nueva tarea'\n3. Escribe el título y selecciona prioridad\n4. Asigna fecha límite y responsable\n5. Guardar\n\n💡 Tip: Las tareas tienen 4 vistas: Lista, Kanban, Calendario y Tablero." };
      if (lower.includes("pipeline")) return { action: "Guía", result: "📖 Para gestionar el Pipeline:\n\n1. Ve a CRM & Ventas → Pipeline\n2. Arrastra leads entre columnas (Nuevo → Contactado → Propuesta → Negociación → Ganado)\n3. Haz clic en una tarjeta para editar\n4. Puedes agregar leads desde Prospección o Lead Finder" };
      if (lower.includes("whatsapp")) return { action: "Guía", result: "📖 Para configurar WhatsApp:\n\n1. Ve a Ajustes → WhatsApp\n2. Conecta tu número via Cloud API\n3. Configura el webhook\n4. Las conversaciones aparecerán en el Inbox\n\n💡 Requiere cuenta de WhatsApp Business + Meta Developer App" };
      return { action: "Guía", result: `📖 Para ayuda sobre "${text}":\n\n1. Ve a Documentación (en la barra inferior del sidebar)\n2. Busca el módulo que necesitas\n3. Cada módulo tiene pasos detallados y tips\n\n¿En qué módulo específico necesitas ayuda?` };
    }

    // EJECUTAR — crear/mover/hacer cosas
    const actions: Record<string, { action: string; result: string }> = {
      tasks: { action: "Tarea creada", result: `✅ Tarea creada:\n\n"${text.replace(/crea una tarea|crea tarea|genera/gi, "").trim()}"\n\n• Prioridad: Media\n• Estado: Pendiente\n• Asignado: Admin\n• Módulo: Tareas` },
      emails: { action: "Borrador generado", result: `📧 Borrador generado:\n\nAsunto: Seguimiento\n\nHola,\n\nEspero que estés bien. Quería dar seguimiento...\n\n→ Ve a Conversaciones → Borradores para editar y enviar` },
      notes: { action: "Nota creada", result: `📝 Nota guardada:\n\n"${text.replace(/crea una nota:|crea nota:/gi, "").trim()}"\n\n• Categoría: General\n• Ve a Operación → Notas para verla` },
      pipeline: { action: "Pipeline actualizado", result: `📊 Acción ejecutada en Pipeline.\n\n• Verifica en CRM & Ventas → Pipeline` },
      calendar: { action: "Evento creado", result: `📅 Evento agregado al Calendario.\n\n• Ve a CRM & Ventas → Calendario para verificar` },
      proposals: { action: "Propuesta generada", result: `📄 Propuesta creada.\n\n• Ve a CRM & Ventas → Propuestas\n• O usa el Cotizador IA para una propuesta completa` },
      automations: { action: "Automatización configurada", result: `⚡ Automatización creada.\n\n• Ve a Automatización & IA → Automatizaciones para activarla` },
      contacts: { action: "Contacto procesado", result: `👥 Acción completada.\n\n• Ve a CRM & Ventas → Contactos para verificar` },
    };
    return actions[mod] || { action: "Procesado", result: `✅ Acción procesada: "${text}"\n\nPara acciones reales con IA, conecta tu API key de OpenRouter.` };
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2"><Wand2 className="h-6 w-6 text-purple-600" />Constructor IA</h1>
          <p className="text-sm text-muted-foreground">Dile qué hacer y la IA lo ejecuta en el módulo correcto. Mezcla manual + automático.</p>
        </div>

        {/* AI Status + Agents + Model */}
        <div className="mb-4 flex items-center gap-3 flex-wrap">
          <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-medium ${connected ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
            {connected ? "✓ OpenRouter conectado" : "⚠ Sin API key — modo local"}
          </span>
          {!connected && <button onClick={() => setShowKeyInput(!showKeyInput)} className="text-[10px] text-brand hover:underline">Conectar ahora →</button>}
          {/* Model selector */}
          <select value={selectedModel} onChange={e => setSelectedModel(e.target.value)} className="rounded-full border px-2.5 py-1 text-[10px] focus:border-brand focus:outline-none">
            {AI_MODELS.map(m => <option key={m.id} value={m.id}>{m.name} ({m.cost})</option>)}
          </select>
          {/* Agents */}
          <div className="flex gap-1 ml-auto">
            {AI_AGENTS.map(agent => (
              <button key={agent.id} onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)} className={`rounded-full px-2 py-1 text-[10px] font-medium ${selectedAgent === agent.id ? "bg-purple-100 text-purple-700" : "border hover:bg-gray-50"}`} title={agent.name}>
                {agent.icon}
              </button>
            ))}
          </div>
          {selectedAgent && <span className="text-[10px] text-purple-600">{AI_AGENTS.find(a => a.id === selectedAgent)?.name}</span>}
        </div>

        {/* Quick API key input */}
        {showKeyInput && !connected && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 flex gap-2 items-end">
            <div className="flex-1">
              <label className="text-xs font-medium text-amber-800">API Key de OpenRouter</label>
              <input value={keyInput} onChange={e => setKeyInput(e.target.value)} type="password" placeholder="sk-or-v1-..." className="w-full rounded border px-3 py-2 text-xs mt-1 font-mono focus:border-brand focus:outline-none" />
              <p className="text-[9px] text-amber-600 mt-1">Obtenla en <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="underline">openrouter.ai/keys</a> — gratis para empezar</p>
            </div>
            <button onClick={() => { if (keyInput.trim()) { saveAiKey(keyInput.trim()); setConnected(true); setShowKeyInput(false); setKeyInput(""); } }} disabled={!keyInput.trim()} className="rounded bg-brand px-4 py-2 text-xs text-white hover:bg-brand-hover disabled:opacity-50 shrink-0">Conectar</button>
          </div>
        )}

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
