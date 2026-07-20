"use client";
import { useState } from "react";
import { ClipboardCopy, Download, FileText, Sparkles } from "lucide-react";
import { generateId } from "@/lib/local-storage";
import { crmAI, isAiConfigured } from "@/lib/ai-client";
import { exportToJSON } from "@/lib/email-tools";

type QuoteSection = { id: string; title: string; content: string };

export default function AiQuoterPage() {
  const [clientName, setClientName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [sections, setSections] = useState<QuoteSection[]>([]);
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState("");

  function notify(m: string) { setToast(m); setTimeout(() => setToast(""), 2500); }

  async function generateQuote() {
    if (!clientName.trim() || !projectDesc.trim()) return;
    setGenerating(true);

    if (isAiConfigured()) {
      const result = await crmAI(`Genera una propuesta comercial profesional para:
Cliente: ${clientName}
Proyecto: ${projectDesc}
Presupuesto: ${budget || "Por definir"}
Timeline: ${timeline || "Por definir"}

Estructura la propuesta con secciones claras: Resumen Ejecutivo, Alcance, Metodología, Entregables, Inversión, Timeline, Garantías. Sé conciso pero profesional.`);
      
      const generatedSections = result.split(/\n(?=#{1,3}\s|[A-Z][a-záéíóú]+:|\d+\.)/).filter(s => s.trim()).map(s => ({
        id: generateId(),
        title: s.split("\n")[0]?.replace(/^#+\s*/, "").trim() || "Sección",
        content: s.split("\n").slice(1).join("\n").trim() || s,
      }));
      setSections(generatedSections.length > 0 ? generatedSections : [{ id: generateId(), title: "Propuesta", content: result }]);
    } else {
      // Fallback local
      setSections([
        { id: generateId(), title: "Resumen Ejecutivo", content: `Propuesta de servicios para ${clientName}.\n\n${projectDesc}\n\nEsta propuesta detalla el alcance, metodología y inversión para lograr los objetivos planteados.` },
        { id: generateId(), title: "Alcance del Proyecto", content: `• Análisis y diagnóstico inicial\n• Diseño de solución personalizada\n• Implementación y configuración\n• Capacitación del equipo\n• Soporte post-implementación (30 días)` },
        { id: generateId(), title: "Metodología", content: `1. Discovery (Semana 1): Entender necesidades y mapear procesos actuales\n2. Diseño (Semana 2): Proponer solución y validar con el equipo\n3. Implementación (Semanas 3-4): Desarrollar e integrar\n4. Testing (Semana 5): Pruebas y ajustes\n5. Go-live (Semana 6): Lanzamiento y capacitación` },
        { id: generateId(), title: "Inversión", content: `Inversión total: ${budget || "$X,XXX USD"}\n\nForma de pago:\n• 50% al inicio del proyecto\n• 50% contra entrega final\n\nIncluye:\n• Todo lo mencionado en alcance\n• 30 días de soporte post-lanzamiento\n• Documentación técnica` },
        { id: generateId(), title: "Timeline", content: `Duración estimada: ${timeline || "6 semanas"}\n\nFecha estimada de inicio: A convenir\nFecha estimada de entrega: A convenir` },
        { id: generateId(), title: "Garantía & Soporte", content: `• 30 días de soporte incluido post-entrega\n• Corrección de bugs sin costo adicional\n• Canal directo de comunicación (WhatsApp/Email)\n• SLA de respuesta: 24 horas hábiles` },
      ]);
    }
    setGenerating(false);
  }

  function copyAll() {
    const text = `PROPUESTA COMERCIAL — ${clientName}\n${"=".repeat(40)}\n\n${sections.map(s => `## ${s.title}\n\n${s.content}`).join("\n\n---\n\n")}`;
    navigator.clipboard.writeText(text);
    notify("Propuesta copiada al portapapeles");
  }

  function exportQuote() {
    exportToJSON({ cliente: clientName, proyecto: projectDesc, presupuesto: budget, timeline, secciones: sections, generadaEl: new Date().toISOString() }, `propuesta-${clientName.toLowerCase().replace(/\s/g, "-")}`);
    notify("Propuesta exportada como JSON");
  }

  function updateSection(id: string, field: "title" | "content", value: string) {
    setSections(sections.map(s => s.id === id ? { ...s, [field]: value } : s));
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="h-6 w-6 text-brand" />Cotizador de Propuestas IA</h1>
          <p className="text-sm text-muted-foreground">Genera propuestas comerciales profesionales en segundos. Describe el proyecto y la IA estructura todo.</p>
        </div>

        {/* Input form */}
        <div className="rounded-lg border bg-white p-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div><label className="text-xs font-medium text-muted-foreground">Cliente *</label><input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="TechCorp Solutions" className="w-full rounded-md border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" /></div>
            <div><label className="text-xs font-medium text-muted-foreground">Presupuesto</label><input value={budget} onChange={e => setBudget(e.target.value)} placeholder="$5,000 USD" className="w-full rounded-md border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" /></div>
          </div>
          <div className="mb-4"><label className="text-xs font-medium text-muted-foreground">Descripción del proyecto *</label><textarea value={projectDesc} onChange={e => setProjectDesc(e.target.value)} placeholder="Ej: Implementación de CRM con integración WhatsApp, pipeline de ventas y automatización de follow-ups para equipo de 5 personas..." rows={3} className="w-full rounded-md border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" /></div>
          <div className="flex gap-4 items-end">
            <div className="flex-1"><label className="text-xs font-medium text-muted-foreground">Timeline</label><input value={timeline} onChange={e => setTimeline(e.target.value)} placeholder="6 semanas" className="w-full rounded-md border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" /></div>
            <button onClick={generateQuote} disabled={!clientName.trim() || !projectDesc.trim() || generating} className="rounded-md bg-purple-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 shrink-0">
              {generating ? <Sparkles className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {generating ? "Generando..." : "Generar propuesta"}
            </button>
          </div>
          {!isAiConfigured() && <p className="mt-2 text-[10px] text-amber-600">⚠ Sin API key de OpenRouter — se generará con plantilla local. Configura en Ajustes → IA/APIs para IA real.</p>}
        </div>

        {/* Generated proposal */}
        {sections.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Propuesta para {clientName}</h3>
              <div className="flex gap-2">
                <button onClick={copyAll} className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-gray-50"><ClipboardCopy className="h-3.5 w-3.5" />Copiar todo</button>
                <button onClick={exportQuote} className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-gray-50"><Download className="h-3.5 w-3.5" />Exportar</button>
              </div>
            </div>

            <div className="space-y-4">
              {sections.map(section => (
                <div key={section.id} className="rounded-lg border bg-white p-5">
                  <input value={section.title} onChange={e => updateSection(section.id, "title", e.target.value)} className="text-sm font-bold border-0 bg-transparent p-0 w-full focus:outline-none mb-2" />
                  <textarea value={section.content} onChange={e => updateSection(section.id, "content", e.target.value)} rows={4} className="w-full text-xs text-muted-foreground border-0 bg-transparent p-0 focus:outline-none resize-none" />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      {toast && <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-lg">{toast}</div>}
    </div>
  );
}
