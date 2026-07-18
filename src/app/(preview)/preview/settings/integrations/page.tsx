"use client";
import { useState, useEffect } from "react";
import { Check, ExternalLink, Key, Link2, Plus, Shield, Zap } from "lucide-react";
import { loadFromStorage, saveToStorage } from "@/lib/local-storage";

type IntegrationConfig = { id: string; platform: string; apiKey: string; connected: boolean; connectedAt: string };

const DEFAULT: IntegrationConfig[] = [
  { id: "int1", platform: "composio", apiKey: "", connected: false, connectedAt: "" },
  { id: "int2", platform: "withone", apiKey: "", connected: false, connectedAt: "" },
];

const PLATFORMS = {
  composio: {
    name: "Composio.dev",
    tagline: "Conecta 250+ herramientas con una sola API",
    description: "Composio permite que tu agente de IA interactúe con Gmail, Slack, HubSpot, Notion, Google Sheets, Salesforce, y 250+ apps sin configurar cada una por separado.",
    color: "bg-violet-600",
    bgLight: "bg-violet-50",
    textColor: "text-violet-700",
    url: "https://composio.dev",
    docsUrl: "https://docs.composio.dev",
    keyUrl: "https://app.composio.dev/settings",
    placeholder: "comp_xxxxxxxxxxxxxxxxxxxxxxxxxx",
    benefits: [
      "Conecta Gmail, Calendar, Sheets, Drive con un click",
      "Integra CRMs como HubSpot, Salesforce, Pipedrive",
      "Automatiza Slack, Discord, Notion, Trello",
      "Tu agente IA ejecuta acciones en 250+ apps",
      "OAuth manejado por Composio (no necesitas configurar cada app)",
    ],
    recommended: true,
  },
  withone: {
    name: "WithOne.ai",
    tagline: "Orquestación de agentes IA multi-herramienta",
    description: "WithOne conecta múltiples agentes de IA y herramientas en un solo workflow. Ideal para secuencias complejas que combinan búsqueda, análisis, escritura y ejecución.",
    color: "bg-emerald-600",
    bgLight: "bg-emerald-50",
    textColor: "text-emerald-700",
    url: "https://withone.ai",
    docsUrl: "https://docs.withone.ai",
    keyUrl: "https://app.withone.ai/settings/api",
    placeholder: "wo_xxxxxxxxxxxxxxxxxxxxxx",
    benefits: [
      "Orquesta múltiples agentes IA en un solo flow",
      "Combina GPT + Claude + Gemini en workflows",
      "Conecta herramientas de scraping, enriquecimiento, envío",
      "Ideal para prospección automatizada end-to-end",
      "Monitoreo y logs de cada ejecución",
    ],
    recommended: false,
  },
};

const COMPOSIO_APPS = [
  { id: "ca1", name: "Gmail", icon: "📧", category: "Email", active: true },
  { id: "ca2", name: "Google Calendar", icon: "📅", category: "Calendario", active: true },
  { id: "ca3", name: "Google Sheets", icon: "📊", category: "Datos", active: true },
  { id: "ca4", name: "Google Drive", icon: "📁", category: "Archivos", active: true },
  { id: "ca5", name: "Slack", icon: "💬", category: "Mensajeria", active: true },
  { id: "ca6", name: "HubSpot", icon: "🟠", category: "CRM", active: false },
  { id: "ca7", name: "Notion", icon: "📝", category: "Productividad", active: true },
  { id: "ca8", name: "Trello", icon: "📋", category: "Proyectos", active: false },
  { id: "ca9", name: "GitHub", icon: "🐙", category: "Desarrollo", active: true },
  { id: "ca10", name: "LinkedIn", icon: "💼", category: "Redes", active: true },
  { id: "ca11", name: "Twitter/X", icon: "🐦", category: "Redes", active: false },
  { id: "ca12", name: "WhatsApp", icon: "💚", category: "Mensajeria", active: true },
  { id: "ca13", name: "Salesforce", icon: "☁️", category: "CRM", active: false },
  { id: "ca14", name: "Zapier", icon: "⚡", category: "Automatizacion", active: false },
  { id: "ca15", name: "Stripe", icon: "💳", category: "Pagos", active: false },
  { id: "ca16", name: "Airtable", icon: "📊", category: "Datos", active: false },
  { id: "ca17", name: "Discord", icon: "🎮", category: "Mensajeria", active: false },
  { id: "ca18", name: "Telegram", icon: "✈️", category: "Mensajeria", active: true },
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([]);
  const [saved, setSaved] = useState<string | null>(null);
  const [showKey, setShowKey] = useState<string | null>(null);

  useEffect(() => { setIntegrations(loadFromStorage("crm_integrations", DEFAULT)); }, []);
  function save(u: IntegrationConfig[]) { setIntegrations(u); saveToStorage("crm_integrations", u); }

  function connect(platformId: string) {
    const int = integrations.find((i) => i.platform === platformId);
    if (!int?.apiKey.trim()) return;
    save(integrations.map((i) => i.platform === platformId ? { ...i, connected: true, connectedAt: new Date().toLocaleString("es") } : i));
    setSaved(platformId); setTimeout(() => setSaved(null), 2000);
  }

  function disconnect(platformId: string) {
    save(integrations.map((i) => i.platform === platformId ? { ...i, connected: false, apiKey: "", connectedAt: "" } : i));
  }

  function updateKey(platformId: string, key: string) {
    save(integrations.map((i) => i.platform === platformId ? { ...i, apiKey: key } : i));
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2"><Link2 className="h-5 w-5 text-brand" />Integraciones & Conectores</h3>
        <p className="mt-1 text-sm text-muted-foreground">Conecta LocalRank CRM con plataformas de orquestación para automatizar cientos de herramientas con una sola clave.</p>
      </div>

      {/* Recommendation banner */}
      <div className="rounded-lg border border-violet-200 bg-violet-50 p-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-violet-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-violet-800">¿Por qué necesitas una clave de integración?</p>
            <p className="mt-1 text-xs text-violet-700">En vez de configurar cada herramienta por separado (Gmail, Slack, HubSpot, Sheets...), estas plataformas te dan <strong>una sola API key</strong> que conecta todo. Tu agente IA puede ejecutar acciones en 250+ apps automáticamente.</p>
          </div>
        </div>
      </div>

      {/* Platforms */}
      {Object.entries(PLATFORMS).map(([key, platform]) => {
        const int = integrations.find((i) => i.platform === key);
        const isConnected = int?.connected || false;
        return (
          <div key={key} className={`rounded-lg border bg-white overflow-hidden ${isConnected ? "border-green-200" : ""}`}>
            {/* Header */}
            <div className={`px-5 py-4 ${platform.bgLight} border-b`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${platform.color} text-white font-bold text-sm`}>
                    {platform.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{platform.name}</h4>
                      {platform.recommended && <span className="rounded-full bg-violet-200 px-2 py-0.5 text-[9px] font-bold text-violet-800 uppercase">Recomendado</span>}
                      {isConnected && <span className="flex items-center gap-1 rounded-full bg-green-200 px-2 py-0.5 text-[9px] font-bold text-green-800"><Check className="h-2.5 w-2.5" />Conectado</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">{platform.tagline}</p>
                  </div>
                </div>
                <a href={platform.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-brand hover:underline"><ExternalLink className="h-3 w-3" />Visitar</a>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              <p className="text-sm text-muted-foreground">{platform.description}</p>

              {/* Benefits */}
              <div>
                <p className="text-xs font-medium mb-2">Lo que puedes hacer:</p>
                <ul className="space-y-1">
                  {platform.benefits.map((b, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Zap className={`h-3 w-3 shrink-0 ${platform.textColor}`} />{b}
                    </li>
                  ))}
                </ul>
              </div>

              {/* API Key input */}
              <div className="rounded border bg-gray-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  <label className="text-sm font-medium">API Key</label>
                  {!isConnected && <a href={platform.keyUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-brand hover:underline ml-auto">Obtener key →</a>}
                </div>
                <div className="flex gap-2">
                  <input
                    type={showKey === key ? "text" : "password"}
                    value={int?.apiKey || ""}
                    onChange={(e) => updateKey(key, e.target.value)}
                    placeholder={platform.placeholder}
                    disabled={isConnected}
                    className="flex-1 rounded-md border px-3 py-2 text-sm font-mono focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand disabled:bg-gray-100 disabled:text-muted-foreground"
                  />
                  <button onClick={() => setShowKey(showKey === key ? null : key)} className="rounded border px-3 py-2 text-xs hover:bg-gray-50">{showKey === key ? "Ocultar" : "Ver"}</button>
                </div>
                <div className="mt-3 flex gap-2">
                  {isConnected ? (
                    <>
                      <span className="flex items-center gap-1 text-xs text-green-600"><Check className="h-3.5 w-3.5" />Conectado desde {int?.connectedAt}</span>
                      <button onClick={() => disconnect(key)} className="ml-auto rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">Desconectar</button>
                    </>
                  ) : (
                    <button onClick={() => connect(key)} disabled={!int?.apiKey?.trim()} className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${platform.color} hover:opacity-90`}>
                      <Link2 className="h-4 w-4" />{saved === key ? "✓ Conectado" : `Conectar ${platform.name}`}
                    </button>
                  )}
                </div>
              </div>

              {/* Docs link */}
              <a href={platform.docsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-brand hover:underline">
                <ExternalLink className="h-3 w-3" />Ver documentación de {platform.name}
              </a>

              {/* Connected Apps Panel (Composio) */}
              {isConnected && key === "composio" && (
                <div className="rounded-lg border bg-white p-4 mt-2">
                  <h5 className="text-xs font-semibold uppercase text-muted-foreground mb-3 flex items-center gap-1"><Zap className="h-3 w-3 text-violet-600" />Conexiones disponibles ({COMPOSIO_APPS.length})</h5>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {COMPOSIO_APPS.map(app => (
                      <div key={app.id} className="flex items-center gap-2 rounded border px-2.5 py-2 text-xs hover:bg-gray-50">
                        <span className="text-base">{app.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{app.name}</p>
                          <p className="text-[9px] text-muted-foreground">{app.category}</p>
                        </div>
                        <span className={`h-2 w-2 rounded-full shrink-0 ${app.active ? "bg-green-500" : "bg-gray-300"}`} />
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-[10px] text-muted-foreground text-center">Estas apps se activan automaticamente cuando tu agente IA las necesita · <a href="https://app.composio.dev/apps" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">Ver todas las apps en Composio</a></p>
                </div>
              )}

              {/* Connected Apps Panel (WithOne) */}
              {isConnected && key === "withone" && (
                <div className="rounded-lg border bg-white p-4 mt-2">
                  <h5 className="text-xs font-semibold uppercase text-muted-foreground mb-3 flex items-center gap-1"><Zap className="h-3 w-3 text-emerald-600" />Agentes disponibles</h5>
                  <div className="space-y-2">
                    {[{ name: "Research Agent", desc: "Busqueda web + analisis", active: true }, { name: "Writer Agent", desc: "Redaccion de contenido", active: true }, { name: "Scraper Agent", desc: "Extraccion de datos web", active: false }].map((a, i) => (
                      <div key={i} className="flex items-center gap-3 rounded border px-3 py-2 text-xs">
                        <span className={`h-2 w-2 rounded-full ${a.active ? "bg-green-500" : "bg-gray-300"}`} />
                        <div><p className="font-medium">{a.name}</p><p className="text-[9px] text-muted-foreground">{a.desc}</p></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* How it works */}
      <div className="rounded-lg border border-dashed bg-gray-50 p-5">
        <h4 className="font-medium mb-2">¿Cómo funciona?</h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs text-muted-foreground">
          <div className="rounded border bg-white p-3 text-center">
            <span className="block text-2xl mb-1">🔑</span>
            <p className="font-medium text-foreground">1. Obtén tu API Key</p>
            <p>Regístrate en la plataforma y genera tu clave</p>
          </div>
          <div className="rounded border bg-white p-3 text-center">
            <span className="block text-2xl mb-1">🔗</span>
            <p className="font-medium text-foreground">2. Pega aquí</p>
            <p>Conecta con un click desde LocalRank</p>
          </div>
          <div className="rounded border bg-white p-3 text-center">
            <span className="block text-2xl mb-1">🤖</span>
            <p className="font-medium text-foreground">3. Automatiza</p>
            <p>Tu agente IA ejecuta acciones en 250+ herramientas</p>
          </div>
        </div>
      </div>
    </div>
  );
}
