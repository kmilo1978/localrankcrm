/**
 * AI Client — connects to OpenRouter for real AI responses.
 * Falls back to local logic if no API key is configured.
 */

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export type AiMessage = { role: "system" | "user" | "assistant"; content: string };

/** Get the configured AI API key from localStorage */
function getApiKey(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const providers = JSON.parse(localStorage.getItem("localrank_ai_providers") || "[]");
    const openrouter = providers.find((p: { id: string; key: string }) => p.id === "openrouter" && p.key);
    if (openrouter) return openrouter.key;
    // Also check settings
    const settings = localStorage.getItem("localrank_openrouter_key");
    return settings || null;
  } catch { return null; }
}

/** Check if AI is configured */
export function isAiConfigured(): boolean {
  return !!getApiKey();
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
