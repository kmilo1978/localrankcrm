import { z } from "zod";
import { and, asc, desc, eq, ilike, or, count } from "drizzle-orm";
import { apiError, parseBody } from "@/lib/api";
import { getDb, schema } from "@/lib/db";
import { scoped } from "@/lib/db/tenant";
import { isAiConfigured } from "@/lib/env";
import { chatJson, type ChatMessage } from "@/lib/ai";
import { getSessionOrNull } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  message: z.string().trim().min(1).max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .max(20)
    .optional(),
});

/** Esquema de respuesta del modelo para el chat interno del CRM. */
const CrmChatResponse = z.object({
  text: z.string().min(1),
});

/**
 * Resuelve la organización: primero intenta la sesión del usuario,
 * si no hay sesión usa la primera organización disponible en la BD.
 */
async function resolveOrganizationId(): Promise<string | null> {
  // Intentar obtener sesión si existe
  const session = await getSessionOrNull();
  if (session) return session.organizationId;

  // Sin sesión: buscar la primera organización (instancia single-tenant)
  const db = getDb();
  const orgs = await db
    .select({ id: schema.organization.id })
    .from(schema.organization)
    .limit(1);
  return orgs[0]?.id ?? null;
}

export async function POST(req: Request) {
  const body = await parseBody(req, bodySchema);
  if (!body.ok) return body.response;

  if (!isAiConfigured()) {
    return apiError(
      503,
      "ai_not_configured",
      "No hay proveedor de IA configurado. Configura GEMINI_API_KEY o OPENROUTER_API_TOKEN en las variables de entorno."
    );
  }

  const orgId = await resolveOrganizationId();
  if (!orgId) {
    return apiError(
      404,
      "no_organization",
      "No se encontró una organización en el sistema. Crea una cuenta primero."
    );
  }

  const { message, history } = body.data;

  // Gather CRM context in parallel
  const db = getDb();
  const [
    contactsCount,
    leadsWithStages,
    recentContacts,
    pipelineStages,
    conversationsStats,
    searchResults,
  ] = await Promise.all([
    // Total contacts
    db
      .select({ total: count() })
      .from(schema.contact)
      .where(scoped(schema.contact.organizationId, orgId)),

    // Leads with stage info
    db
      .select({
        leadId: schema.lead.id,
        contactName: schema.contact.name,
        contactPhone: schema.contact.phone,
        contactNotes: schema.contact.notes,
        stageName: schema.pipelineStage.name,
        stageKind: schema.pipelineStage.kind,
        lastActivity: schema.lead.lastActivityAt,
        leadCreated: schema.lead.createdAt,
      })
      .from(schema.lead)
      .innerJoin(schema.contact, eq(schema.lead.contactId, schema.contact.id))
      .innerJoin(
        schema.pipelineStage,
        eq(schema.lead.stageId, schema.pipelineStage.id)
      )
      .where(scoped(schema.lead.organizationId, orgId))
      .orderBy(desc(schema.lead.lastActivityAt))
      .limit(50),

    // Recent contacts (last 10 created)
    db
      .select()
      .from(schema.contact)
      .where(scoped(schema.contact.organizationId, orgId))
      .orderBy(desc(schema.contact.createdAt))
      .limit(10),

    // Pipeline stages
    db
      .select()
      .from(schema.pipelineStage)
      .where(scoped(schema.pipelineStage.organizationId, orgId))
      .orderBy(asc(schema.pipelineStage.position)),

    // Conversation stats
    db
      .select({
        total: count(),
      })
      .from(schema.conversation)
      .where(
        and(
          scoped(schema.conversation.organizationId, orgId),
          eq(schema.conversation.isTest, false)
        )
      ),

    // Search contacts if message mentions a name
    searchContacts(orgId, message),
  ]);

  // Build pipeline summary
  const pipelineSummary = pipelineStages.map((stage) => {
    const leadsInStage = leadsWithStages.filter(
      (l) => l.stageName === stage.name
    );
    return `- ${stage.name} (${stage.kind}): ${leadsInStage.length} leads`;
  });

  // Build leads detail
  const leadsDetail = leadsWithStages
    .slice(0, 20)
    .map(
      (l) =>
        `• ${l.contactName} (${l.contactPhone}) — Etapa: ${l.stageName}${l.contactNotes ? ` — Notas: ${l.contactNotes.slice(0, 100)}` : ""}${l.lastActivity ? ` — Última actividad: ${l.lastActivity.toLocaleDateString("es")}` : ""}`
    );

  // Build search results section
  const searchSection =
    searchResults.length > 0
      ? `\nRESULTADOS DE BÚSQUEDA (coincidencias con lo que preguntó el usuario):\n${searchResults.map((c) => `• ${c.name} — Tel: ${c.phone}${c.notes ? ` — Notas: ${c.notes.slice(0, 150)}` : ""}`).join("\n")}`
      : "";

  const systemPrompt = `Eres el asistente IA interno del CRM LocalRank. Tu rol es ayudar al USUARIO (el dueño del negocio/vendedor) a consultar datos de su CRM, analizar su pipeline y obtener insights de sus clientes. Respondes SIEMPRE en español.

DATOS ACTUALES DEL CRM DE ESTA ORGANIZACIÓN:

RESUMEN GENERAL:
- Total de contactos: ${contactsCount[0]?.total ?? 0}
- Total de conversaciones activas: ${conversationsStats[0]?.total ?? 0}
- Total de leads en pipeline: ${leadsWithStages.length}

PIPELINE (etapas y cantidad de leads):
${pipelineSummary.join("\n")}

LEADS ACTIVOS (máximo 20 más recientes):
${leadsDetail.length > 0 ? leadsDetail.join("\n") : "(Sin leads registrados aún)"}

CONTACTOS RECIENTES:
${recentContacts.map((c) => `• ${c.name} — ${c.phone}${c.notes ? ` — ${c.notes.slice(0, 80)}` : ""}`).join("\n") || "(Sin contactos)"}
${searchSection}

INSTRUCCIONES:
- Responde basándote SOLO en los datos reales que ves arriba. NO inventes datos.
- Si no hay datos suficientes para responder, dilo claramente.
- Sé conciso y útil. Usa formato con bullet points y negritas (**texto**) para resaltar datos.
- Si preguntan por un contacto específico que no aparece en los datos, di que no lo encontraste.
- Puedes hacer cálculos y resúmenes con la información disponible.
- Si preguntan por funcionalidades de creación o acciones (crear contacto, mover lead, etc.), indica que por ahora solo puedes consultar datos y que esas capacidades llegarán pronto.

Responde ÚNICAMENTE un objeto JSON: {"text": "tu respuesta aquí"}
No incluyas nada más que el JSON.`;

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
  ];

  // Add conversation history if provided
  if (history && history.length > 0) {
    for (const msg of history.slice(-10)) {
      messages.push({
        role: msg.role,
        content:
          msg.role === "assistant"
            ? JSON.stringify({ text: msg.content })
            : msg.content,
      });
    }
  }

  messages.push({ role: "user", content: message });

  const result = await chatJson(CrmChatResponse, messages);

  if (!result.ok) {
    if (result.error === "not_configured") {
      return apiError(
        503,
        "ai_not_configured",
        "Proveedor de IA no configurado."
      );
    }
    console.error("[agent/chat] LLM error:", result.detail);
    return apiError(
      502,
      "ai_error",
      "No pude procesar tu consulta. Intenta de nuevo en unos segundos."
    );
  }

  return Response.json({ text: result.data.text });
}

/** Search contacts by name fragments from the user message. */
async function searchContacts(orgId: string, message: string) {
  const db = getDb();
  // Extract potential name-like words (3+ chars, not common Spanish words)
  const stopwords = new Set([
    "que",
    "como",
    "para",
    "por",
    "con",
    "los",
    "las",
    "del",
    "una",
    "unos",
    "más",
    "tiene",
    "hay",
    "son",
    "fue",
    "está",
    "cuántos",
    "cuáles",
    "cuál",
    "quién",
    "dónde",
    "tiene",
    "tengo",
    "todos",
    "todo",
    "sobre",
    "desde",
    "hasta",
    "pero",
    "también",
    "cuando",
    "puede",
    "puedo",
    "este",
    "esta",
    "esos",
    "esas",
    "dame",
    "cliente",
    "contacto",
    "lead",
    "pipeline",
    "ventas",
    "datos",
    "información",
    "mes",
    "semana",
    "día",
    "hoy",
    "ayer",
    "mañana",
  ]);

  const words = message
    .split(/\s+/)
    .map((w) => w.replace(/[^a-záéíóúñü]/gi, ""))
    .filter((w) => w.length >= 3 && !stopwords.has(w.toLowerCase()));

  if (words.length === 0) return [];

  const conditions = words.map((w) => ilike(schema.contact.name, `%${w}%`));

  return db
    .select()
    .from(schema.contact)
    .where(and(scoped(schema.contact.organizationId, orgId), or(...conditions)))
    .limit(5);
}
