import { count } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { isAiConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

/**
 * GET /api/agent/chat/debug
 * Endpoint de diagnóstico: muestra si hay organización, contactos, leads, etc.
 * Permite verificar que la BD tiene datos y el AI está configurado.
 */
export async function GET() {
  const db = getDb();

  try {
    const [orgs, contacts, leads, stages, conversations] = await Promise.all([
      db.select({ id: schema.organization.id, name: schema.organization.name }).from(schema.organization).limit(5),
      db.select({ total: count() }).from(schema.contact),
      db.select({ total: count() }).from(schema.lead),
      db.select({ total: count() }).from(schema.pipelineStage),
      db.select({ total: count() }).from(schema.conversation),
    ]);

    return Response.json({
      status: "ok",
      aiConfigured: isAiConfigured(),
      database: {
        organizations: orgs,
        totalContacts: contacts[0]?.total ?? 0,
        totalLeads: leads[0]?.total ?? 0,
        totalStages: stages[0]?.total ?? 0,
        totalConversations: conversations[0]?.total ?? 0,
      },
    });
  } catch (err) {
    return Response.json(
      {
        status: "error",
        aiConfigured: isAiConfigured(),
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
