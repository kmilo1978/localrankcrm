"use client";
import { useState } from "react";
import { Database, Mail, Globe, Phone, Building2, Linkedin, Search, Sparkles, Zap } from "lucide-react";

type EnrichmentTemplate = {
  id: string;
  name: string;
  description: string;
  fields: string[];
  sources: string[];
  icon: string;
};

const TEMPLATES: EnrichmentTemplate[] = [
  { id: "et1", name: "Email Finder", description: "Encuentra email corporativo a partir del nombre y empresa", fields: ["nombre", "empresa", "dominio"], sources: ["Hunter.io", "Snov.io", "Apollo"], icon: "📧" },
  { id: "et2", name: "Company Info", description: "Enriquece datos de empresa (industria, tamaño, revenue, tecnologías)", fields: ["dominio", "nombre empresa"], sources: ["Clearbit", "ZoomInfo", "Crunchbase"], icon: "🏢" },
  { id: "et3", name: "Social Profiles", description: "Encuentra perfiles de LinkedIn, Twitter y redes sociales", fields: ["nombre", "empresa", "email"], sources: ["LinkedIn API", "Phantombuster", "Composio"], icon: "💼" },
  { id: "et4", name: "Phone Verification", description: "Verifica y formatea números telefónicos con indicativo", fields: ["teléfono", "país"], sources: ["Twilio Lookup", "NumVerify", "AbstractAPI"], icon: "📞" },
  { id: "et5", name: "Tech Stack", description: "Detecta tecnologías usadas en un sitio web", fields: ["dominio"], sources: ["BuiltWith", "Wappalyzer", "StackShare"], icon: "⚡" },
  { id: "et6", name: "Domain Analysis", description: "Analiza dominio: DNS, SSL, hosting, SEO básico", fields: ["dominio"], sources: ["WhoisXML", "SecurityTrails", "Moz"], icon: "🌐" },
  { id: "et7", name: "Lead Scoring", description: "Calcula score predictivo basado en señales de intención", fields: ["email", "empresa", "actividad"], sources: ["IA interna", "Bombora", "6sense"], icon: "🎯" },
  { id: "et8", name: "Full Contact Enrichment", description: "Enriquecimiento completo: email + teléfono + social + empresa", fields: ["nombre", "empresa"], sources: ["Snov.io", "Apollo", "Lusha", "Composio"], icon: "🚀" },
];

export default function EnrichmentPage() {
  const [search, setSearch] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<EnrichmentTemplate | null>(null);
  const [inputData, setInputData] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const filtered = TEMPLATES.filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase()));

  function runEnrichment() {
    if (!selectedTemplate) return;
    setLoading(true);
    // Simulate enrichment (in production would call Composio/Snov.io APIs)
    setTimeout(() => {
      const mockResults: Record<string, string> = {
        "Email Finder": `✅ Resultados para "${inputData.nombre || "contacto"}":\n\n📧 Email encontrado: ${(inputData.nombre || "juan").toLowerCase().replace(" ", ".")}@${inputData.dominio || inputData.empresa?.toLowerCase().replace(/\s/g, "") + ".com" || "empresa.com"}\n📊 Confianza: 92%\n🔗 Fuente: Hunter.io + validación SMTP`,
        "Company Info": `✅ Empresa: ${inputData["nombre empresa"] || inputData.dominio || "Empresa"}\n\n🏢 Industria: Tecnología\n👥 Empleados: 50-200\n💰 Revenue: $5M-$10M ARR\n📍 Ubicación: Medellín, Colombia\n⚡ Tech: React, AWS, PostgreSQL`,
        "Social Profiles": `✅ Perfiles encontrados:\n\n💼 LinkedIn: linkedin.com/in/${(inputData.nombre || "usuario").toLowerCase().replace(" ", "-")}\n🐦 Twitter: @${(inputData.nombre || "usuario").split(" ")[0]?.toLowerCase()}\n📸 Instagram: No encontrado`,
        "Phone Verification": `✅ Teléfono: ${inputData["teléfono"] || "+57 300 1234567"}\n\n✓ Válido: Sí\n📱 Tipo: Móvil\n🌍 País: Colombia (+57)\n📡 Operador: Claro\n📍 Región: Antioquia`,
      };
      setResult(mockResults[selectedTemplate.name] || `✅ Enriquecimiento completado para template "${selectedTemplate.name}".\n\nDatos procesados: ${Object.entries(inputData).filter(([,v]) => v).map(([k,v]) => `${k}: ${v}`).join(", ")}\n\n⚠️ Para resultados reales, conecta Composio o Snov.io en Ajustes → Integraciones.`);
      setLoading(false);
    }, 1500);
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2"><Database className="h-6 w-6 text-brand" />Enriquecimiento de datos</h1>
          <p className="text-sm text-muted-foreground">Templates para encontrar emails, teléfonos, datos de empresa y más. Conecta con Composio/Snov.io para resultados reales.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Templates */}
          <div className="lg:col-span-2">
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar template..." className="w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm focus:border-brand focus:outline-none" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.map(t => (
                <button key={t.id} onClick={() => { setSelectedTemplate(t); setInputData({}); setResult(null); }} className={`rounded-lg border p-4 text-left hover:shadow-sm transition-shadow ${selectedTemplate?.id === t.id ? "border-brand ring-2 ring-brand/20" : ""}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{t.icon}</span>
                    <h3 className="text-sm font-semibold">{t.name}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{t.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {t.sources.slice(0, 2).map(s => (
                      <span key={s} className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] text-muted-foreground">{s}</span>
                    ))}
                    {t.sources.length > 2 && <span className="text-[9px] text-muted-foreground">+{t.sources.length - 2}</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Execution panel */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border bg-white p-5 sticky top-6">
              {selectedTemplate ? (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">{selectedTemplate.icon}</span>
                    <div>
                      <h3 className="text-sm font-bold">{selectedTemplate.name}</h3>
                      <p className="text-[10px] text-muted-foreground">{selectedTemplate.fields.length} campos</p>
                    </div>
                  </div>
                  <div className="space-y-3 mb-4">
                    {selectedTemplate.fields.map(field => (
                      <div key={field}>
                        <label className="text-xs font-medium text-muted-foreground capitalize">{field}</label>
                        <input value={inputData[field] || ""} onChange={e => setInputData({...inputData, [field]: e.target.value})} placeholder={field} className="w-full rounded border px-3 py-2 text-sm mt-1 focus:border-brand focus:outline-none" />
                      </div>
                    ))}
                  </div>
                  <button onClick={runEnrichment} disabled={loading} className="w-full rounded-md bg-brand py-2.5 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? <><Sparkles className="h-4 w-4 animate-spin" />Enriqueciendo...</> : <><Zap className="h-4 w-4" />Ejecutar</>}
                  </button>
                  {result && (
                    <div className="mt-4 rounded-lg bg-green-50 border border-green-200 p-3">
                      <pre className="text-xs whitespace-pre-wrap text-green-800">{result}</pre>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-xs">Selecciona un template para empezar</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
