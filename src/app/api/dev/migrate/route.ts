import { getSql } from "@/lib/db";
import { withAuth } from "@/lib/api";

export const dynamic = "force-dynamic";

/**
 * POST /api/dev/migrate
 * Runs the CRM modules migration SQL on the database.
 * Only accessible by authenticated users (owner).
 */
export const POST = withAuth(async () => {
  const sql = getSql();

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS "crm_contact" (
        "id" text PRIMARY KEY NOT NULL,
        "organization_id" text NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
        "name" text NOT NULL,
        "phone" text NOT NULL DEFAULT '',
        "email" text NOT NULL DEFAULT '',
        "company" text NOT NULL DEFAULT '',
        "role" text NOT NULL DEFAULT '',
        "image" text NOT NULL DEFAULT '',
        "archived" boolean NOT NULL DEFAULT false,
        "tags" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "custom_fields" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "notes" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "reminders" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS "crm_contact_org_idx" ON "crm_contact" ("organization_id")`;
    await sql`CREATE INDEX IF NOT EXISTS "crm_contact_org_name_idx" ON "crm_contact" ("organization_id", "name")`;

    await sql`
      CREATE TABLE IF NOT EXISTS "crm_task" (
        "id" text PRIMARY KEY NOT NULL,
        "organization_id" text NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
        "title" text NOT NULL,
        "description" text NOT NULL DEFAULT '',
        "priority" text NOT NULL DEFAULT 'medium',
        "status" text NOT NULL DEFAULT 'pending',
        "due_date" text NOT NULL DEFAULT '',
        "assignee" text NOT NULL DEFAULT '',
        "related_to" text NOT NULL DEFAULT '',
        "category" text NOT NULL DEFAULT '',
        "tags" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "done" boolean NOT NULL DEFAULT false,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS "crm_task_org_idx" ON "crm_task" ("organization_id")`;
    await sql`CREATE INDEX IF NOT EXISTS "crm_task_org_status_idx" ON "crm_task" ("organization_id", "status")`;

    await sql`
      CREATE TABLE IF NOT EXISTS "crm_note" (
        "id" text PRIMARY KEY NOT NULL,
        "organization_id" text NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
        "title" text NOT NULL,
        "content" text NOT NULL DEFAULT '',
        "image" text NOT NULL DEFAULT '',
        "related_to" text NOT NULL DEFAULT '',
        "category" text NOT NULL DEFAULT 'General',
        "tags" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "pinned" boolean NOT NULL DEFAULT false,
        "locked" boolean NOT NULL DEFAULT false,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS "crm_note_org_idx" ON "crm_note" ("organization_id")`;

    return Response.json({ ok: true, message: "Migration completed: crm_contact, crm_task, crm_note tables created." });
  } catch (err) {
    console.error("[migrate] error:", err);
    return Response.json({ ok: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
});
