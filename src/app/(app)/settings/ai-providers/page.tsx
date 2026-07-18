"use client";

import { useState } from "react";
import { Eye, EyeOff, Check, AlertCircle } from "lucide-react";

type Provider = {
  id: string;
  name: string;
  description: string;
  baseUrl: string;
  docsUrl: string;
  models: string[];
};

const AI_PROVIDERS: Provider[] = [
  {
    id: "openrouter",
    name: "OpenRouter",
    description: "Acceso unificado a cientos de modelos (Claude, GPT, Llama, Mistral, etc.)",
    baseUrl: "https://openrouter.ai/api",
    docsUrl: "https://openrouter.ai/docs",
    models: ["anthropic/claude-sonnet-4", "openai/gpt-4o", "meta-llama/llama-3.1-405b", "google/gemini-2.5-pro"],
  },
  {
    id: "openai",
    name: "OpenAI",
    description: "GPT-4o, GPT-4o-mini, o1 y más",
    baseUrl: "https://api.openai.com/v1",
    docsUrl: "https://platform.openai.com/docs",
    models: ["gpt-4o", "gpt-4o-mini", "o1", "o1-mini"],
  },
  {
    id: "anthropic",
    name: "Anthropic (Claude)",
    description: "Claude Sonnet 4, Claude Opus 4, Haiku",
    baseUrl: "https://api.anthropic.com/v1",
    docsUrl: "https://docs.anthropic.com",
    models: ["claude-sonnet-4-20250514", "claude-opus-4-20250514", "claude-haiku-3-20240307"],
  },
  {
    id: "google",
    name: "Google (Gemini)",
    description: "Gemini 2.5 Pro, Flash, y modelos multimodales",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    docsUrl: "https://ai.google.dev/docs",
    models: ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.0-flash"],
  },
  {
    id: "xai",
    name: "xAI (Grok)",
    description: "Grok-2, Grok-2-mini para conversaciones avanzadas",
    baseUrl: "https://api.x.ai/v1",
    docsUrl: "https://docs.x.ai",
    models: ["grok-2", "grok-2-mini"],
  },
  {
    id: "nvidia",
    name: "NVIDIA NIM",
    description: "Modelos optimizados para GPU: Llama, Mixtral, Nemotron",
    baseUrl: "https://integrate.api.nvidia.com/v1",
    docsUrl: "https://build.nvidia.com",
    models: ["nvidia/llama-3.1-nemotron-70b", "meta/llama-3.1-405b-instruct", "mistralai/mixtral-8x22b"],
  },
  {
    id: "omnirouter",
    name: "OmniRouter",
    description: "Router inteligente multi-proveedor con failover automático",
    baseUrl: "https://api.omnirouter.ai/v1",
    docsUrl: "https://docs.omnirouter.ai",
    models: ["auto", "fast", "quality"],
  },
  {
    id: "9router",
    name: "9Router",
    description: "Enrutamiento de modelos con optimización de costos",
    baseUrl: "https://api.9router.ai/v1",
    docsUrl: "https://docs.9router.ai",
    models: ["auto-best", "auto-fast", "auto-cheap"],
  },
  {
    id: "mistral",
    name: "Mistral AI",
    description: "Mistral Large, Medium, Small — modelos europeos de alto rendimiento",
    baseUrl: "https://api.mistral.ai/v1",
    docsUrl: "https://docs.mistral.ai",
    models: ["mistral-large-latest", "mistral-medium-latest", "mistral-small-latest"],
  },
  {
    id: "perplexity",
    name: "Perplexity",
    description: "Modelos con acceso a internet en tiempo real para búsqueda",
    baseUrl: "https://api.perplexity.ai",
    docsUrl: "https://docs.perplexity.ai",
    models: ["llama-3.1-sonar-huge-128k-online", "llama-3.1-sonar-large-128k-online"],
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    description: "DeepSeek-V3, DeepSeek-R1 — razonamiento avanzado",
    baseUrl: "https://api.deepseek.com/v1",
    docsUrl: "https://platform.deepseek.com/docs",
    models: ["deepseek-chat", "deepseek-reasoner"],
  },
  {
    id: "cohere",
    name: "Cohere",
    description: "Command R+, Embed — optimizados para empresas y RAG",
    baseUrl: "https://api.cohere.ai/v1",
    docsUrl: "https://docs.cohere.com",
    models: ["command-r-plus", "command-r", "command-light"],
  },
  {
    id: "groq",
    name: "Groq",
    description: "Inferencia ultra-rápida en hardware LPU: Llama, Mixtral",
    baseUrl: "https://api.groq.com/openai/v1",
    docsUrl: "https://console.groq.com/docs",
    models: ["llama-3.3-70b-versatile", "mixtral-8x7b-32768", "gemma2-9b-it"],
  },
  {
    id: "together",
    name: "Together AI",
    description: "Modelos open source a escala: Llama, CodeLlama, Qwen",
    baseUrl: "https://api.together.xyz/v1",
    docsUrl: "https://docs.together.ai",
    models: ["meta-llama/Llama-3.1-405B-Instruct-Turbo", "Qwen/Qwen2.5-72B-Instruct-Turbo"],
  },
  {
    id: "fireworks",
    name: "Fireworks AI",
    description: "Inferencia rápida de modelos open source con baja latencia",
    baseUrl: "https://api.fireworks.ai/inference/v1",
    docsUrl: "https://docs.fireworks.ai",
    models: ["accounts/fireworks/models/llama-v3p1-405b-instruct", "accounts/fireworks/models/mixtral-8x22b-instruct"],
  },
];

type ProviderConfig = {
  apiKey: string;
  baseUrl: string;
  model: string;
  enabled: boolean;
};

export default function AIProvidersPage() {
  const [configs, setConfigs] = useState<Record<string, ProviderConfig>>(() => {
    const initial: Record<string, ProviderConfig> = {};
    for (const p of AI_PROVIDERS) {
      initial[p.id] = {
        apiKey: "",
        baseUrl: p.baseUrl,
        model: p.models[0] ?? "",
        enabled: false,
      };
    }
    // Load saved configs from localStorage
    if (typeof window !== "undefined") {
      try {
        const stored = JSON.parse(localStorage.getItem("localrank_ai_providers") || "{}");
        for (const [id, cfg] of Object.entries(stored)) {
          if (initial[id]) initial[id] = cfg as ProviderConfig;
        }
      } catch {}
    }
    return initial;
  });
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function updateConfig(providerId: string, field: keyof ProviderConfig, value: string | boolean) {
    setConfigs((prev) => ({
      ...prev,
      [providerId]: { ...prev[providerId]!, [field]: value },
    }));
    // Auto-expand when enabling
    if (field === "enabled" && value === true) {
      setExpandedId(providerId);
    }
    // Auto-collapse when disabling
    if (field === "enabled" && value === false && expandedId === providerId) {
      setExpandedId(null);
    }
  }

  function toggleKeyVisibility(providerId: string) {
    setVisibleKeys((prev) => ({ ...prev, [providerId]: !prev[providerId] }));
  }

  function handleSave(providerId: string) {
    // Persist to localStorage
    if (typeof window !== "undefined") {
      try {
        const stored = JSON.parse(localStorage.getItem("localrank_ai_providers") || "{}");
        stored[providerId] = configs[providerId];
        localStorage.setItem("localrank_ai_providers", JSON.stringify(stored));
      } catch {}
    }
    setSaved(providerId);
    setTimeout(() => {
      setSaved(null);
      setExpandedId(null); // collapse after save
    }, 1200);
  }

  const enabledCount = Object.values(configs).filter((c) => c.enabled).length;
  const [defaultModel, setDefaultModel] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("localrank_default_ai_model") || "";
    return "";
  });

  function saveDefaultModel(model: string) {
    setDefaultModel(model);
    if (typeof window !== "undefined") localStorage.setItem("localrank_default_ai_model", model);
    setSaved("default");
    setTimeout(() => setSaved(null), 1200);
  }

  // Collect all available models from enabled providers
  const availableModels = AI_PROVIDERS.filter(p => configs[p.id]?.enabled).flatMap(p => p.models.map(m => ({ provider: p.name, model: m })));

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Proveedores de IA</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Configura las API keys de los proveedores de inteligencia artificial.
          El CRM usará el proveedor activo para el agente de WhatsApp, análisis y automatizaciones.
        </p>
        {enabledCount > 0 && (
          <div className="mt-2 flex items-center gap-1.5 text-sm text-green-700">
            <Check className="h-4 w-4" />
            {enabledCount} proveedor{enabledCount > 1 ? "es" : ""} activo{enabledCount > 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Default AI Model Selector */}
      <div className="rounded-lg border border-brand/30 bg-brand-tint/20 p-4">
        <h4 className="text-sm font-semibold mb-1">Modelo predeterminado</h4>
        <p className="text-xs text-muted-foreground mb-3">Elige cual modelo de IA usa el CRM para el asistente, resúmenes, y automatizaciones.</p>
        {availableModels.length > 0 ? (
          <div className="flex items-center gap-3">
            <select value={defaultModel} onChange={e => saveDefaultModel(e.target.value)} className="flex-1 rounded-md border px-3 py-2 text-sm focus:border-brand focus:outline-none">
              <option value="">Seleccionar modelo...</option>
              {availableModels.map((m, i) => <option key={i} value={m.model}>{m.model} ({m.provider})</option>)}
            </select>
            {saved === "default" && <span className="text-xs text-green-600 flex items-center gap-1"><Check className="h-3.5 w-3.5" />Guardado</span>}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-amber-700">
            <AlertCircle className="h-3.5 w-3.5" />Activa al menos un proveedor para seleccionar un modelo
          </div>
        )}
      </div>

      <div className="grid gap-4">
        {AI_PROVIDERS.map((provider) => {
          const config = configs[provider.id]!;
          const isVisible = visibleKeys[provider.id] ?? false;

          return (
            <div
              key={provider.id}
              className={`rounded-lg border p-4 transition-colors ${
                config.enabled ? "border-brand bg-brand-tint/30" : "border-border"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 cursor-pointer" onClick={() => config.enabled && setExpandedId(expandedId === provider.id ? null : provider.id)}>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{provider.name}</h4>
                    {config.enabled && config.apiKey && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        <Check className="h-3 w-3" /> Activo
                      </span>
                    )}
                    {config.enabled && !config.apiKey && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                        <AlertCircle className="h-3 w-3" /> Sin API Key
                      </span>
                    )}
                    {config.enabled && expandedId !== provider.id && (
                      <span className="text-xs text-muted-foreground">— click para editar</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{provider.description}</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={config.enabled}
                    onChange={(e) => updateConfig(provider.id, "enabled", e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="peer h-5 w-9 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-brand peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-2 peer-focus:ring-brand/20" />
                </label>
              </div>

              {expandedId === provider.id && config.enabled && (
                <div className="mt-4 space-y-3">
                  {/* API Key */}
                  <div>
                    <label className="mb-1 block text-sm font-medium">API Key</label>
                    <div className="relative">
                      <input
                        type={isVisible ? "text" : "password"}
                        value={config.apiKey}
                        onChange={(e) => updateConfig(provider.id, "apiKey", e.target.value)}
                        placeholder={`sk-... o tu clave de ${provider.name}`}
                        className="w-full rounded-md border bg-background px-3 py-2 pr-10 text-sm placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                      />
                      <button
                        type="button"
                        onClick={() => toggleKeyVisibility(provider.id)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Base URL */}
                  <div>
                    <label className="mb-1 block text-sm font-medium">Base URL</label>
                    <input
                      type="url"
                      value={config.baseUrl}
                      onChange={(e) => updateConfig(provider.id, "baseUrl", e.target.value)}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                    />
                  </div>

                  {/* Model */}
                  <div>
                    <label className="mb-1 block text-sm font-medium">Modelo</label>
                    <select
                      value={config.model}
                      onChange={(e) => updateConfig(provider.id, "model", e.target.value)}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                    >
                      {provider.models.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-muted-foreground">
                      O escribe un modelo personalizado en el campo de arriba.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleSave(provider.id)}
                      className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover transition-colors"
                    >
                      {saved === provider.id ? "✓ Guardado" : "Guardar"}
                    </button>
                    <a
                      href={provider.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-brand hover:underline"
                    >
                      Ver documentación →
                    </a>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border border-dashed p-4">
        <h4 className="font-medium">¿No encuentras tu proveedor?</h4>
        <p className="mt-1 text-sm text-muted-foreground">
          Cualquier proveedor compatible con la API de OpenAI (formato /v1/chat/completions)
          funciona. Simplemente activa "OpenRouter" o cualquier entrada y cambia la Base URL
          al endpoint de tu proveedor.
        </p>
      </div>
    </div>
  );
}
