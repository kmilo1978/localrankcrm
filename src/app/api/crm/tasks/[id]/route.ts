import { eq, and } from "drizzle-orm";
import { apiError, withAuth } from "@/lib/api";
import { getDb, schema } from "@/lib/db";

export const dynamic = "force-dynamic";

export const PUT = withAuth(async (session, req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const body = await req.json();
  const db = getDb();
  const updated = await db
    .update(schema.crmTask)
    .set({ ...body, updatedAt: new Date() })
    .where(and(eq(schema.crmTask.id, id), eq(schema.crmTask.organizationId, session.organizationId)))
    .returning();
  if (!updated[0]) return apiError(404, "not_found", "Tarea no encontrada");
  return Response.json({ ok: true, task: updated[0] });
});

export const DELETE = withAuth(async (session, _req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const db = getDb();
  await db.delete(schema.crmTask).where(and(eq(schema.crmTask.id, id), eq(schema.crmTask.organizationId, session.organizationId)));
  return Response.json({ ok: true });
});
