"use client";
import { useState } from "react";
import { Bot, Brain, CheckCircle2, Clock, FileText, History, Sparkles, Star, TrendingUp, Users, XCircle, Zap } from "lucide-react";

type AiTab = "agent" | "summaries" | "drafts" | "scoring" | "audience" | "history";

const DEMO_SUMMARIES = [
  { id: "s1", contact: "Carlos Ruiz", date: "Hoy", summary: "Lead caliente interesado en plan Enterprise ($85K). Tiene presupuesto aprobado para Q3. Decisor: él mismo (CTO). Próximo paso: enviar propuesta final esta semana." },
  { id: "s2", contact: "María García", date: "Ayer", summary: "VP Ops en LogiNext. Busca módulo logístico. Comparando con LogiTrack (más barato). Necesita caso de éxito similar. Reunión pendiente." },
  { id: "s3", contact: "Roberto Méndez", date: "Hace 2d", summary: "Director Marketing en MediaGroup. Interesado en paquete completo (web + ads + CRM). Presupuesto $45K. No ha respondido último email." },
];

const DEMO_DRAFTS = [
  { id: "d1", type: "Email", to: "Carlos Ruiz", subject: "Propuesta Enterprise — LocalRank", preview: "Hola Carlos, como acordamos en nuestra llamada del martes, te adjunto la propuesta detallada para el plan Enterprise...", confidence: 92 },
  { id: "d2", type: "WhatsApp", to: "María García", subject: "Follow-up reunión", preview: "Hola María, espero que estés bien. Quería confirmar nuestra reunión del jueves a las 3pm para la demo del módulo logístico.", confidence: 88 },
  { id: "d3", type: "Email", to: "Roberto Méndez", subject: "Re: Paquete Marketing Digital", preview: "Hola Roberto, noté que no has podido revisar la cotización que envié la semana pasada. ¿Te parece si agendamos una llamada rápida de 10 min?", confidence: 85 },
];

const DEMO_SCORES = [
  { id: "sc1", contact: "Carlos Ruiz", company: "TechCorp", score: 95, icp: 98, engagement: 92, completeness: 95, intent: 94, trend: "up" },
  { id: "sc2", contact: "Dentart", company: "Dentart Odontology", score: 99, icp: 85, engagement: 70, completeness: 90, intent: 65, trend: "up" },
  { id: "sc3", contact: "María García", company: "LogiNext", score: 78, icp: 80, engagement: 85, completeness: 70, intent: 76, trend: "stable" },
  { id: "sc4", contact: "Roberto Méndez", company: "MediaGroup", score: 72, icp: 75, engagement: 60, completeness: 85, intent: 68, trend: "down" },
  { id: "sc5", contact: "Ana Torres", company: "InnovateLab", score: 55, icp: 60, engagement: 45, completeness: 60, intent: 55, trend: "down" },
];

export default function AiHubPage() {
  const [tab, setTab] = useState<AiTab>("agent");
  const [suggestions, setSuggestions] = useState([
    { id: "sg1", author: "IA", text: "Recomendar enviar caso de éxito de TechCorp a LogiNext para cerrar objeción de precio.", status: "pending" as "pending" | "accepted" | "rejected", date: "Hoy" },
    { id: "sg2", author: "Ana López", text: "Agregar descuento 10% para MediaGroup si cierra antes del viernes.", status: "pending" as "pending" | "accepted" | "rejected", date: "Hoy" },
    { id: "sg3", author: "IA", text: "El lead Dentart no ha respondido en 5 días. Sugerencia: cambiar canal a WhatsApp.", status: "accepted" as "pending" | "accepted" | "rejected", date: "Ayer" },
  ]);

  const AUDIENCE_DATA = [
    { segment: "CTOs / Decisores técnicos", size: 12, conversion: "32%", avgDeal: "$65K", channels: "LinkedIn, Email", behavior: "Responden mejor a demos técnicas y casos de éxito con métricas" },
    { segment: "VPs Operaciones", size: 8, conversion: "25%", avgDeal: "$40K", channels: "Email, WhatsApp", behavior: "Necesitan ROI claro y timeline de implementación rápido" },
    { segment: "Directors Marketing", size: 15, conversion: "18%", avgDeal: "$30K", channels: "Instagram, Email", behavior: "Buscan resultados visuales, portafolio y casos de éxito creativos" },
    { segment: "CEOs / Founders", size: 5, conversion: "40%", avgDeal: "$85K", channels: "Referral, LinkedIn", behavior: "Deciden rápido si ven valor. Necesitan propuesta ejecutiva sin tecnicismos" },
    { segment: "Clínicas / Salud", size: 20, conversion: "22%", avgDeal: "$15K", channels: "WhatsApp, Google", behavior: "Buscan presencia digital y captación de pacientes. Sensibles al precio" },
  ];

  const HISTORY_DATA = [
    { id: "h1", user: "Camilo Rivera", action: "Movió deal TechCorp a Negociación", module: "Pipeline", date: "Hoy 14:30", type: "move" },
    { id: "h2", user: "Ana López", action: "Creó tarea: Llamar a LogiNext", module: "Tareas", date: "Hoy 13:15", type: "create" },
    { id: "h3", user: "IA (Agente)", action: "Respondió automáticamente a María García", module: "Conversaciones", date: "Hoy 11:00", type: "ai" },
    { id: "h4", user: "Juan Pérez", action: "Envió propuesta a MediaGroup ($45K)", module: "Propuestas", date: "Hoy 10:20", type: "send" },
    { id: "h5", user: "Camilo Rivera", action: "Aceptó sugerencia IA: cambiar canal Dentart", module: "IA", date: "Ayer 16:45", type: "accept" },
    { id: "h6", user: "Ana López", action: "Agregó nota: Reunión productiva con TechCorp", module: "Notas", date: "Ayer 15:00", type: "create" },
    { id: "h7", user: "IA (Scoring)", action: "Score de Carlos Ruiz subió a 95 (+3)", module: "Scoring", date: "Ayer 09:00", type: "ai" },
    { id: "h8", user: "Juan Pérez", action: "Rechazó sugerencia: descuento 15% a RetailMax", module: "IA", date: "Hace 2d", type: "reject" },
  ];

  function updateSuggestion(id: string, status: "accepted" | "rejected") {
    setSuggestions(suggestions.map(s => s.id === id ? { ...s, status } : s));
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2"><Brain className="h-6 w-6 text-brand" />IA & Automatización</h1>
          <p className="text-sm text-muted-foreground">Agente IA, resúmenes automáticos, borradores inteligentes y scoring predictivo.</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b pb-3 flex-wrap">
          {[
            { key: "agent", label: "Agente IA", icon: Bot },
            { key: "audience", label: "Audiencia", icon: Users },
            { key: "summaries", label: "Resúmenes", icon: FileText },
            { key: "drafts", label: "Drafts IA", icon: Sparkles },
            { key: "scoring", label: "Scoring AI", icon: Star },
            { key: "history", label: "Historial", icon: History },
          ].map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key as AiTab)} className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${tab === key ? "bg-brand text-white" : "hover:bg-gray-100"}`}>
              <Icon className="h-4 w-4" />{label}
            </button>
          ))}
        </div>

        {/* Agent tab */}
        {tab === "agent" && (
          <div className="space-y-4">
            <div className="rounded-lg border bg-white p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><Bot className="h-4 w-4 text-brand" />Agente IA Conversacional</h3>
              <p className="text-sm text-muted-foreground mb-4">El agente responde automáticamente a mensajes entrantes usando tu base de conocimiento, tono y reglas de escalación.</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded border p-3 text-center"><p className="text-2xl font-bold text-brand">245</p><p className="text-xs text-muted-foreground">Mensajes respondidos (30d)</p></div>
                <div className="rounded border p-3 text-center"><p className="text-2xl font-bold text-green-600">87%</p><p className="text-xs text-muted-foreground">Tasa de resolución</p></div>
                <div className="rounded border p-3 text-center"><p className="text-2xl font-bold">4.2s</p><p className="text-xs text-muted-foreground">Tiempo de respuesta</p></div>
              </div>
              <div className="mt-4 flex gap-2">
                <a href="/settings/ai-providers" className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover">Configurar proveedores IA</a>
                <a href="/settings/flows" className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50">Ver flows</a>
              </div>
            </div>
          </div>
        )}

        {/* Summaries tab */}
        {tab === "summaries" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-2">Resúmenes generados por IA de cada interacción con un contacto:</p>
            {DEMO_SUMMARIES.map((s) => (
              <div key={s.id} className="rounded-lg border bg-white p-4">
                <div className="flex items-center justify-between mb-2"><span className="text-sm font-semibold">{s.contact}</span><span className="text-[10px] text-muted-foreground">{s.date}</span></div>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.summary}</p>
              </div>
            ))}
          </div>
        )}

        {/* Drafts tab */}
        {tab === "drafts" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-2">Borradores sugeridos por IA basados en el contexto de cada conversación:</p>
            {DEMO_DRAFTS.map((d) => (
              <div key={d.id} className="rounded-lg border bg-white p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2"><span className="rounded bg-brand/10 px-2 py-0.5 text-[10px] font-medium text-brand">{d.type}</span><span className="text-sm font-semibold">Para: {d.to}</span></div>
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">{d.confidence}% confianza</span>
                </div>
                <p className="text-xs font-medium mb-1">{d.subject}</p>
                <p className="text-xs text-muted-foreground">{d.preview}</p>
                <div className="mt-2 flex gap-2"><button className="rounded bg-brand px-3 py-1 text-xs text-white hover:bg-brand-hover">Enviar</button><button className="rounded border px-3 py-1 text-xs hover:bg-gray-50">Editar</button><button className="rounded border px-3 py-1 text-xs hover:bg-gray-50">Descartar</button></div>
              </div>
            ))}
          </div>
        )}

        {/* Scoring tab */}
        {tab === "scoring" && (
          <div>
            <p className="text-sm text-muted-foreground mb-4">Score predictivo por IA basado en ICP, engagement, completitud de datos y señales de intención:</p>
            <div className="rounded-lg border bg-white overflow-hidden">
              <table className="w-full">
                <thead className="border-b bg-gray-50"><tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Contacto</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase text-muted-foreground">Score</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase text-muted-foreground">ICP</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase text-muted-foreground">Engagement</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase text-muted-foreground">Datos</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase text-muted-foreground">Intención</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase text-muted-foreground">Trend</th>
                </tr></thead>
                <tbody className="divide-y">
                  {DEMO_SCORES.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3"><p className="text-sm font-medium">{s.contact}</p><p className="text-[10px] text-muted-foreground">{s.company}</p></td>
                      <td className="px-4 py-3 text-center"><span className={`rounded-full px-2 py-0.5 text-xs font-bold ${s.score >= 80 ? "bg-green-100 text-green-700" : s.score >= 60 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>{s.score}</span></td>
                      <td className="px-4 py-3 text-center text-xs">{s.icp}%</td>
                      <td className="px-4 py-3 text-center text-xs">{s.engagement}%</td>
                      <td className="px-4 py-3 text-center text-xs">{s.completeness}%</td>
                      <td className="px-4 py-3 text-center text-xs">{s.intent}%</td>
                      <td className="px-4 py-3 text-center">{s.trend === "up" ? <TrendingUp className="inline h-4 w-4 text-green-500" /> : s.trend === "down" ? <TrendingUp className="inline h-4 w-4 text-red-500 rotate-180" /> : <span className="text-xs text-muted-foreground">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Audience tab */}
        {tab === "audience" && (
          <div>
            <p className="text-sm text-muted-foreground mb-4">Segmentos de audiencia identificados por IA basados en tus leads y conversiones:</p>
            <div className="space-y-3">
              {AUDIENCE_DATA.map((seg, i) => (
                <div key={i} className="rounded-lg border bg-white p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2"><Users className="h-4 w-4 text-brand" />{seg.segment}</h4>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="rounded-full bg-brand/10 px-2 py-0.5 text-brand font-medium">{seg.size} leads</span>
                      <span className="text-green-600 font-medium">{seg.conversion} conv.</span>
                      <span className="font-bold">{seg.avgDeal}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{seg.behavior}</p>
                  <div className="flex items-center gap-1 text-[10px]">
                    <span className="text-muted-foreground">Canales preferidos:</span>
                    {seg.channels.split(", ").map(ch => <span key={ch} className="rounded bg-gray-100 px-1.5 py-0.5 font-medium">{ch}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History + Suggestions tab */}
        {tab === "history" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activity history */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><History className="h-4 w-4 text-muted-foreground" />Historial de actividad</h3>
              <div className="rounded-lg border bg-white divide-y">
                {HISTORY_DATA.map(h => (
                  <div key={h.id} className="flex items-start gap-3 px-4 py-3">
                    <div className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full shrink-0 text-[10px] ${h.type === "ai" ? "bg-purple-100 text-purple-700" : h.type === "accept" ? "bg-green-100 text-green-700" : h.type === "reject" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>
                      {h.type === "ai" ? "🤖" : h.type === "accept" ? "✓" : h.type === "reject" ? "✕" : h.user.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs"><span className="font-medium">{h.user}</span> — {h.action}</p>
                      <p className="text-[10px] text-muted-foreground">{h.module} · {h.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggestions */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Sparkles className="h-4 w-4 text-purple-600" />Sugerencias</h3>
              <div className="space-y-2">
                {suggestions.map(s => (
                  <div key={s.id} className={`rounded-lg border p-4 ${s.status === "accepted" ? "border-green-200 bg-green-50/50" : s.status === "rejected" ? "border-red-200 bg-red-50/50 opacity-60" : "bg-white"}`}>
                    <div className="flex items-start gap-2 mb-2">
                      <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[9px] font-medium text-purple-700">{s.author}</span>
                      <span className="text-[9px] text-muted-foreground">{s.date}</span>
                      {s.status !== "pending" && <span className={`ml-auto rounded-full px-2 py-0.5 text-[9px] font-medium ${s.status === "accepted" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{s.status === "accepted" ? "✓ Aceptada" : "✕ Rechazada"}</span>}
                    </div>
                    <p className="text-xs mb-2">{s.text}</p>
                    {s.status === "pending" && (
                      <div className="flex gap-2">
                        <button onClick={() => updateSuggestion(s.id, "accepted")} className="flex items-center gap-1 rounded px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200"><CheckCircle2 className="h-3 w-3" />Aceptar</button>
                        <button onClick={() => updateSuggestion(s.id, "rejected")} className="flex items-center gap-1 rounded px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200"><XCircle className="h-3 w-3" />Rechazar</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
