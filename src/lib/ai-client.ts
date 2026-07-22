/**
 * AI Client — connects to OpenRouter for real AI responses.
 * Falls back to local logic if no API key is configured.
 */

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export type AiMessage = { role: "system" | "user" | "assistant"; content: string };

/** Available models */
export const AI_MODELS = [
  { id: "openai/gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI", speed: "Rápido", cost: "$" },
  { id: "openai/gpt-4o", name: "GPT-4o", provider: "OpenAI", speed: "Medio", cost: "$$" },
  { id: "anthropic/claude-sonnet-4", name: "Claude Sonnet 4", provider: "Anthropic", speed: "Medio", cost: "$$" },
  { id: "anthropic/claude-haiku-3.5", name: "Claude Haiku 3.5", provider: "Anthropic", speed: "Rápido", cost: "$" },
  { id: "google/gemini-2.0-flash", name: "Gemini 2.0 Flash", provider: "Google", speed: "Rápido", cost: "$" },
  { id: "meta-llama/llama-3.1-70b", name: "Llama 3.1 70B", provider: "Meta", speed: "Medio", cost: "$" },
  { id: "deepseek/deepseek-chat", name: "DeepSeek Chat", provider: "DeepSeek", speed: "Rápido", cost: "$" },
  { id: "mistralai/mistral-large", name: "Mistral Large", provider: "Mistral", speed: "Medio", cost: "$$" },
];

/** Get the configured AI API key from localStorage */
function getApiKey(): string | null {
  if (typeof window === "undefined") return null;
  try {
    // Check multiple possible storage locations for the key
    // 1. AI providers array (settings page format)
    const providers = localStorage.getItem("localrank_ai_providers");
    if (providers) {
      const parsed = JSON.parse(providers);
      const openrouter = parsed.find((p: { id?: string; platform?: string; key?: string; token?: string }) => 
        (p.id === "openrouter" || p.platform === "openrouter") && (p.key || p.token)
      );
      if (openrouter) return openrouter.key || openrouter.token;
    }
    // 2. Direct key storage
    const directKey = localStorage.getItem("localrank_openrouter_key");
    if (directKey) return directKey;
    // 3. AI settings format from the settings page
    const aiSettings = localStorage.getItem("localrank_ai_settings");
    if (aiSettings) {
      const parsed = JSON.parse(aiSettings);
      if (parsed.openrouterKey) return parsed.openrouterKey;
    }
    return null;
  } catch { return null; }
}

/** Check if AI is configured */
export function isAiConfigured(): boolean {
  return !!getApiKey();
}

/** Save API key to localStorage (for quick setup from AI Builder) */
export function saveAiKey(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("localrank_openrouter_key", key);
}

/** Get current model name */
export function getModelName(modelId: string): string {
  return AI_MODELS.find(m => m.id === modelId)?.name || modelId;
}

/** Call OpenRouter AI with messages */
export async function callAI(messages: AiMessage[], model?: string): Promise<string> {
  const key = getApiKey();
  if (!key) {
    return "[IA no conectada] Configura tu API key de OpenRouter en Ajustes → IA/APIs para respuestas reales.";
  }

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`,
        "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "https://localrank.com.co",
        "X-Title": "LocalRank CRM",
      },
      body: JSON.stringify({
        model: model || "openai/gpt-4o-mini",
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return `[Error IA] ${response.status}: ${error.slice(0, 200)}`;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "[Sin respuesta de la IA]";
  } catch (err) {
    return `[Error de conexión] ${err instanceof Error ? err.message : "No se pudo conectar con OpenRouter"}`;
  }
}

/** Generate CRM-specific AI response */
export async function crmAI(prompt: string, context?: string): Promise<string> {
  const systemMessage: AiMessage = {
    role: "system",
    content: `Eres un asistente de CRM empresarial (LocalRank CRM). Ayudas a gestionar contactos, ventas, tareas, emails y automatizaciones. Responde en español, sé conciso y ejecuta las acciones que te pidan. ${context || ""}`
  };

  return callAI([systemMessage, { role: "user", content: prompt }]);
}

/** AI Agents by function */
export const AI_AGENTS = [
  { id: "sales", name: "Agente de Ventas", system: "Eres un experto en ventas B2B. Ayudas a redactar propuestas, hacer follow-ups, calificar leads y cerrar tratos.", icon: "💼" },
  { id: "support", name: "Agente de Soporte", system: "Eres un agente de soporte al cliente. Respondes preguntas, resuelves problemas y escalas cuando es necesario.", icon: "🎯" },
  { id: "marketing", name: "Agente de Marketing", system: "Eres un experto en marketing digital. Ayudas con copy, campañas, análisis de métricas y estrategia de contenido.", icon: "📢" },
  { id: "analyst", name: "Agente Analista", system: "Eres un analista de datos de CRM. Interpretas métricas, identificas tendencias y sugieres optimizaciones.", icon: "📊" },
  { id: "writer", name: "Agente Escritor", system: "Eres un redactor profesional. Generas emails, propuestas, textos de venta y contenido comercial de alta calidad.", icon: "✍️" },
  { id: "automation", name: "Agente de Automatización", system: "Eres un experto en automatización de procesos. Diseñas flujos, triggers y acciones para optimizar operaciones.", icon: "⚡" },
];
