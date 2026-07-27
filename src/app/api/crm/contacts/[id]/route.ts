import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { apiError, parseBody, withAuth } from "@/lib/api";
import { getDb, schema } from "@/lib/db";
import { scoped } from "@/lib/db/tenant";

export const dynamic = "force-dynamic";

export const PUT = withAuth(async (session, req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const body = await req.json();

  const db = getDb();
  const updated = await db
    .update(schema.crmContact)
    .set({ ...body, updatedAt: new Date() })
    .where(and(eq(schema.crmContact.id, id), eq(schema.crmContact.organizationId, session.organizationId)))
    .returning();

  if (!updated[0]) return apiError(404, "not_found", "Contacto no encontrado");
  return Response.json({ ok: true, contact: updated[0] });
});

export const DELETE = withAuth(async (session, _req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const db = getDb();
  await db
    .delete(schema.crmContact)
    .where(and(eq(schema.crmContact.id, id), eq(schema.crmContact.organizationId, session.organizationId)));
  return Response.json({ ok: true });
});
