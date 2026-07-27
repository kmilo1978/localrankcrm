"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Minimize2, Send, Sparkles, X } from "lucide-react";
import { loadFromStorage } from "@/lib/local-storage";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

const SUGGESTIONS = [
  "¿Cuántos contactos tengo?",
  "¿Cómo va el pipeline?",
  "Resumen de leads activos",
  "¿Quién es Cristian Botero?",
];

/** Collect CRM data from localStorage to send as context to the AI. */
function getCrmContext(): Record<string, unknown> {
  const contacts = loadFromStorage("contacts", []);
  const pipelineStages = loadFromStorage("pipeline_stages", []);
  const pipelineLeads = loadFromStorage("pipeline_leads", []);
  const inboxConversations = loadFromStorage("inbox_conversations", []);
  const calendarAppointments = loadFromStorage("calendar_appointments", []);
  const focusTasks = loadFromStorage("focus_tasks", []);
  const checklists = loadFromStorage("checklists_v2", []);
  const meetingReminders = loadFromStorage("meeting_reminders", []);
  const automations = loadFromStorage("crm_automations", []);
  const proposals = loadFromStorage("proposals", []);
  const projects = loadFromStorage("projects_v3", []);
  const socialProfiles = loadFromStorage("social_profiles", []);
  const coldContacts = loadFromStorage("cold_contacts", []);
  const carteraInvoices = loadFromStorage("cartera_invoices", []);
  const carteraAgreements = loadFromStorage("cartera_agreements", []);
  const formEntries = loadFromStorage("crm_form_entries", []);
  const crmForms = loadFromStorage("crm_forms", []);
  const radarClips = loadFromStorage("radar_clips", []);
  const linkedinProfiles = loadFromStorage("linkedin_profiles", []);
  const notes = loadFromStorage("notes", []);
  const todos = loadFromStorage("todos", {});
  const companies = loadFromStorage("companies", []);
  const tasks = loadFromStorage("tasks", []);
  const suppliers = loadFromStorage("suppliers", []);
  const reminders = loadFromStorage("reminders_v2", []);

  return {
    contacts,
    pipelineStages,
    pipelineLeads,
    inboxConversations,
    calendarAppointments,
    focusTasks,
    checklists,
    meetingReminders,
    automations,
    proposals,
    projects,
    socialProfiles,
    coldContacts,
    carteraInvoices,
    carteraAgreements,
    formEntries,
    crmForms,
    radarClips,
    linkedinProfiles,
    notes,
    todos,
    companies,
    tasks,
    suppliers,
    reminders,
  };
}

export function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "¡Hola! 👋 Soy tu asistente IA. Pregúntame sobre tus clientes, leads, pipeline o cualquier dato de tu CRM.",
      timestamp: new Date().toLocaleTimeString("es", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString("es", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== "welcome")
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));

      // Gather CRM data from localStorage
      const crmContext = getCrmContext();

      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history, crmContext }),
      });

      let reply: string;

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        if (res.status === 503) {
          reply =
            "⚠️ El asistente IA no está configurado. Agrega GEMINI_API_KEY o OPENROUTER_API_TOKEN en las variables de entorno.";
        } else {
          reply =
            err?.error?.message ??
            "Hubo un error al procesar tu consulta. Intenta de nuevo.";
        }
      } else {
        const data = await res.json();
        reply = data.text;
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: reply,
        timestamp: new Date().toLocaleTimeString("es", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Error de conexión. Verifica tu conexión a internet e intenta de nuevo.",
        timestamp: new Date().toLocaleTimeString("es", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-40 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-brand text-white shadow-lg hover:scale-105 transition-transform"
        title="Asistente IA"
      >
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
          <div>
            <p className="text-sm font-semibold text-white">Asistente IA</p>
            <p className="text-[10px] text-white/70">
              Conectado a tus datos del CRM
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setOpen(false)}
            className="rounded p-1 text-white/70 hover:text-white hover:bg-white/10"
          >
            <Minimize2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setOpen(false)}
            className="rounded p-1 text-white/70 hover:text-white hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${msg.role === "user" ? "bg-brand text-white" : "bg-gray-100 text-foreground"}`}
            >
              <p className="whitespace-pre-wrap leading-relaxed text-xs">
                {msg.content.split("**").map((part, i) =>
                  i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                )}
              </p>
              <p
                className={`mt-1 text-[9px] ${msg.role === "user" ? "text-white/60" : "text-muted-foreground"}`}
              >
                {msg.timestamp}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-lg bg-gray-100 px-3 py-2">
              <span className="text-xs text-muted-foreground animate-pulse">
                Consultando datos...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEnd} />
      </div>

      {/* Suggestions */}
      {messages.length <= 2 && (
        <div className="px-3 pb-2 flex flex-wrap gap-1">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setInput(s)}
              className="rounded-full border px-2 py-0.5 text-[9px] text-muted-foreground hover:bg-gray-50 hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="border-t p-3">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Pregunta sobre tus datos..."
            disabled={loading}
            className="flex-1 rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand disabled:opacity-50"
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="rounded-md bg-brand p-2 text-white hover:bg-brand-hover disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
