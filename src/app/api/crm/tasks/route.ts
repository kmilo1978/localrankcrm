import { z } from "zod";
import { desc, eq, and } from "drizzle-orm";
import { apiError, parseBody, withAuth } from "@/lib/api";
import { getDb, schema } from "@/lib/db";
import { scoped } from "@/lib/db/tenant";
import { newId } from "@/lib/db/ids";

export const dynamic = "force-dynamic";

export const GET = withAuth(async (session) => {
  const db = getDb();
  const rows = await db
    .select()
    .from(schema.crmTask)
    .where(scoped(schema.crmTask.organizationId, session.organizationId))
    .orderBy(desc(schema.crmTask.createdAt))
    .limit(500);
  return Response.json({ tasks: rows });
});

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().default(""),
  priority: z.string().optional().default("medium"),
  status: z.string().optional().default("pending"),
  dueDate: z.string().optional().default(""),
  assignee: z.string().optional().default(""),
  relatedTo: z.string().optional().default(""),
  category: z.string().optional().default(""),
  tags: z.array(z.string()).optional().default([]),
  done: z.boolean().optional().default(false),
});

export const POST = withAuth(async (session, req: Request) => {
  const body = await parseBody(req, createSchema);
  if (!body.ok) return body.response;

  const db = getDb();
  const id = newId("crmTask");
  await db.insert(schema.crmTask).values({
    id,
    organizationId: session.organizationId,
    ...body.data,
  });
  return Response.json({ ok: true, id });
});
