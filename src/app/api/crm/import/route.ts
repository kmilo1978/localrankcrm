import { z } from "zod";
import { apiError, withAuth } from "@/lib/api";
import { getDb, schema } from "@/lib/db";
import { newId } from "@/lib/db/ids";

export const dynamic = "force-dynamic";

/**
 * POST /api/crm/import
 * Imports localStorage backup data into Supabase tables.
 * Expects { contacts: [...], tasks: [...], notes: [...] }
 */
export const POST = withAuth(async (session, req: Request) => {
  const body = await req.json();
  const orgId = session.organizationId;
  const db = getDb();
  const results = { contacts: 0, tasks: 0, notes: 0 };

  // Import contacts
  const contacts = Array.isArray(body.contacts) ? body.contacts : [];
  for (const c of contacts) {
    try {
      await db.insert(schema.crmContact).values({
        id: c.id || newId("crmContact"),
        organizationId: orgId,
        name: c.name || "",
        phone: c.phone || "",
        email: c.email || "",
        company: c.company || "",
        role: c.role || "",
        image: c.image || "",
        archived: c.archived || false,
        tags: c.tags || [],
        customFields: c.customFields || [],
        notes: c.notes || [],
        reminders: c.reminders || [],
        createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
      }).onConflictDoNothing();
      results.contacts++;
    } catch (e) {
      // Skip duplicates or invalid entries
    }
  }

  // Import tasks
  const tasks = Array.isArray(body.tasks) ? body.tasks : [];
  for (const t of tasks) {
    try {
      await db.insert(schema.crmTask).values({
        id: t.id || newId("crmTask"),
        organizationId: orgId,
        title: t.title || "",
        description: t.description || "",
        priority: t.priority || "medium",
        status: t.status || "pending",
        dueDate: t.dueDate || "",
        assignee: t.assignee || "",
        relatedTo: t.relatedTo || "",
        category: t.category || "",
        tags: t.tags || [],
        done: t.done || false,
        createdAt: t.createdAt ? new Date(t.createdAt) : new Date(),
      }).onConflictDoNothing();
      results.tasks++;
    } catch (e) {
      // Skip
    }
  }

  // Import notes
  const notes = Array.isArray(body.notes) ? body.notes : [];
  for (const n of notes) {
    try {
      await db.insert(schema.crmNote).values({
        id: n.id || newId("crmNote"),
        organizationId: orgId,
        title: n.title || "",
        content: n.content || "",
        image: n.image || "",
        relatedTo: n.relatedTo || "",
        category: n.category || "General",
        tags: n.tags || [],
        pinned: n.pinned || false,
        locked: n.locked || false,
        createdAt: n.createdAt ? new Date(n.createdAt) : new Date(),
      }).onConflictDoNothing();
      results.notes++;
    } catch (e) {
      // Skip
    }
  }

  return Response.json({ ok: true, imported: results });
});
