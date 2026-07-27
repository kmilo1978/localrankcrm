import { z } from "zod";
import { desc, eq, ilike, or } from "drizzle-orm";
import { apiError, parseBody, withAuth } from "@/lib/api";
import { getDb, schema } from "@/lib/db";
import { scoped } from "@/lib/db/tenant";
import { newId } from "@/lib/db/ids";

export const dynamic = "force-dynamic";

export const GET = withAuth(async (session, req: Request) => {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim();
  const includeArchived = url.searchParams.get("archived") === "true";

  const db = getDb();
  const rows = await db
    .select()
    .from(schema.crmContact)
    .where(
      scoped(
        schema.crmContact.organizationId,
        session.organizationId,
        q ? or(ilike(schema.crmContact.name, `%${q}%`), ilike(schema.crmContact.phone, `%${q}%`), ilike(schema.crmContact.company, `%${q}%`)) : undefined
      )
    )
    .orderBy(desc(schema.crmContact.createdAt))
    .limit(500);

  const contacts = includeArchived ? rows : rows.filter(c => !c.archived);
  return Response.json({ contacts });
});

const createSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional().default(""),
  email: z.string().optional().default(""),
  company: z.string().optional().default(""),
  role: z.string().optional().default(""),
  image: z.string().optional().default(""),
  tags: z.array(z.string()).optional().default([]),
  customFields: z.array(z.object({ id: z.string(), label: z.string(), value: z.string() })).optional().default([]),
  notes: z.array(z.unknown()).optional().default([]),
  reminders: z.array(z.unknown()).optional().default([]),
});

export const POST = withAuth(async (session, req: Request) => {
  const body = await parseBody(req, createSchema);
  if (!body.ok) return body.response;

  const db = getDb();
  const id = newId("crmContact");
  await db.insert(schema.crmContact).values({
    id,
    organizationId: session.organizationId,
    name: body.data.name,
    phone: body.data.phone,
    email: body.data.email,
    company: body.data.company,
    role: body.data.role,
    image: body.data.image,
    tags: body.data.tags,
    customFields: body.data.customFields,
    notes: body.data.notes,
    reminders: body.data.reminders,
  });

  return Response.json({ ok: true, id });
});
