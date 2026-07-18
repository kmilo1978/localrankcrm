"use client";
import { useState } from "react";
import { Bot, Brain, FileText, Sparkles, Star, TrendingUp, Zap } from "lucide-react";

type AiTab = "agent" | "summaries" | "drafts" | "scoring";

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

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2"><Brain className="h-6 w-6 text-brand" />IA & Automatización</h1>
          <p className="text-sm text-muted-foreground">Agente IA, resúmenes automáticos, borradores inteligentes y scoring predictivo.</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b pb-3">
          {[
            { key: "agent", label: "Agente IA", icon: Bot },
            { key: "summaries", label: "Resúmenes", icon: FileText },
            { key: "drafts", label: "Drafts IA", icon: Sparkles },
            { key: "scoring", label: "Scoring AI", icon: Star },
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
      </div>
    </div>
  );
}
