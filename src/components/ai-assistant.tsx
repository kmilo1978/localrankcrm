"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Minimize2, Send, Sparkles, X } from "lucide-react";

type Message = { id: string; role: "user" | "assistant"; content: string; timestamp: string };

const SUGGESTIONS = [
  "¿Cuántos leads tengo activos?",
  "¿Cuál es mi deal más grande?",
  "Resumen de ventas del mes",
  "¿Quién no ha respondido en 7 días?",
  "Crea un recordatorio para mañana",
  "¿Cómo va el pipeline?",
];

// Simulated AI responses based on keywords
function getAiResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("lead") && (lower.includes("cuántos") || lower.includes("activos")))
    return "Tienes **10 leads activos** en Prospección:\n- 3 con score > 100 (calientes)\n- 5 sin contactar\n- 2 en primer contacto\n\n¿Quieres ver los de mayor score primero?";
  if (lower.includes("deal") && (lower.includes("grande") || lower.includes("mayor")))
    return "Tu deal más grande es **Contrato Enterprise — TechCorp** por **$85,000 USD** en etapa de Negociación (75% probabilidad).\n\nPróximo paso: enviar propuesta final esta semana.";
  if (lower.includes("ventas") || lower.includes("resumen"))
    return "📊 **Resumen de ventas (último mes):**\n- Ingresos: $48,500\n- Deals cerrados: 12\n- Tasa de cierre: 34%\n- Pipeline total: $245,000\n\nTendencia: +18% vs mes anterior. ¡Vas bien!";
  if (lower.includes("respondido") || lower.includes("sin respuesta"))
    return "🔴 **3 contactos sin respuesta en 7+ días:**\n1. Roberto Méndez (MediaGroup) — último: email hace 10d\n2. Ana Torres (InnovateLab) — último: WhatsApp hace 8d\n3. Jorge Hernández (RetailMax) — último: llamada hace 14d\n\n¿Envío un follow-up automático?";
  if (lower.includes("recordatorio") || lower.includes("tarea"))
    return "✅ Recordatorio creado para mañana. ¿Sobre qué tema quieres que sea? Puedo agregarlo a tu To-Do o Calendario.";
  if (lower.includes("pipeline") || lower.includes("embudo"))
    return "📈 **Estado del Pipeline:**\n- Sin contactar: 5 leads\n- Primer contacto: 2\n- Interesado: 3\n- Reunión agendada: 1\n- Propuesta enviada: 2\n- Convertido: 12 (este mes)\n\nTotal pipeline: $245K · Ponderado: $89K";
  if (lower.includes("crear") || lower.includes("agregar") || lower.includes("nuevo"))
    return "¿Qué quieres crear?\n- 👤 Contacto (dame nombre, email, teléfono)\n- 🏢 Compañía\n- 💰 Oportunidad\n- 📋 Tarea\n- 📝 Nota\n\nDime los datos y lo creo por ti.";
  if (lower.includes("hola") || lower.includes("hi") || lower.includes("hey"))
    return "¡Hola! 👋 Soy tu asistente IA de LocalRank CRM. Puedo ayudarte con:\n\n- Buscar información de contactos y deals\n- Crear registros nuevos\n- Analizar métricas y resultados\n- Enviar follow-ups automáticos\n- Programar tareas y recordatorios\n\n¿En qué te ayudo?";
  if (lower.includes("gracias") || lower.includes("perfecto"))
    return "¡Con gusto! Si necesitas algo más, solo pregunta. Estoy aquí para ayudarte a cerrar más deals. 🚀";
  return "Entiendo tu pregunta. Basado en los datos del CRM, puedo buscar información sobre contactos, oportunidades, pipeline, métricas o ejecutar acciones.\n\n¿Podrías darme más contexto? Por ejemplo:\n- Nombre de un cliente específico\n- Período de tiempo\n- Módulo del CRM que te interesa";
}

export function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "assistant", content: "¡Hola! 👋 Soy tu asistente IA. Pregúntame sobre clientes, ventas, pipeline o pídeme crear registros. ¿En qué te ayudo?", timestamp: new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" }) },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function send() {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input, timestamp: new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" }) };
    setMessages((prev) => [...prev, userMsg]);
    const q = input;
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const response = getAiResponse(q);
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: response, timestamp: new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" }) };
      setMessages((prev) => [...prev, aiMsg]);
      setTyping(false);
    }, 800 + Math.random() * 1200);
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="fixed bottom-4 right-4 z-40 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-brand text-white shadow-lg hover:scale-105 transition-transform" title="Asistente IA">
        <Sparkles className="h-4 w-4 md:h-5 md:w-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 md:bottom-6 md:right-6 z-40 flex h-[100dvh] w-full md:h-[500px] md:w-[380px] flex-col md:rounded-xl border bg-white shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between bg-brand px-4 py-3">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-white" />
          <div><p className="text-sm font-semibold text-white">Asistente IA</p><p className="text-[10px] text-white/70">Pregúntame lo que necesites</p></div>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setOpen(false)} className="rounded p-1 text-white/70 hover:text-white hover:bg-white/10"><Minimize2 className="h-4 w-4" /></button>
          <button onClick={() => setOpen(false)} className="rounded p-1 text-white/70 hover:text-white hover:bg-white/10"><X className="h-4 w-4" /></button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${msg.role === "user" ? "bg-brand text-white" : "bg-gray-100 text-foreground"}`}>
              <p className="whitespace-pre-wrap leading-relaxed text-xs">{msg.content.split("**").map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}</p>
              <p className={`mt-1 text-[9px] ${msg.role === "user" ? "text-white/60" : "text-muted-foreground"}`}>{msg.timestamp}</p>
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start"><div className="rounded-lg bg-gray-100 px-3 py-2"><span className="text-xs text-muted-foreground animate-pulse">Escribiendo...</span></div></div>
        )}
        <div ref={messagesEnd} />
      </div>

      {/* Suggestions */}
      {messages.length <= 2 && (
        <div className="px-3 pb-2 flex flex-wrap gap-1">
          {SUGGESTIONS.slice(0, 4).map((s) => (
            <button key={s} onClick={() => { setInput(s); }} className="rounded-full border px-2 py-0.5 text-[9px] text-muted-foreground hover:bg-gray-50 hover:text-foreground">{s}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="border-t p-3">
        <div className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Escribe tu pregunta..." className="flex-1 rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
          <button onClick={send} disabled={!input.trim()} className="rounded-md bg-brand p-2 text-white hover:bg-brand-hover disabled:opacity-50"><Send className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
}
