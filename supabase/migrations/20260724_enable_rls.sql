-- ============================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- Run this in Supabase SQL Editor to fix critical security vulnerabilities
-- ============================================================

-- ============ AUTH TABLES ============
-- These are managed by BetterAuth server-side, so we deny all direct API access

ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "verification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "organization" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "member" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "invitation" ENABLE ROW LEVEL SECURITY;

-- Auth tables: DENY all access from anon and authenticated via API
-- BetterAuth uses the service_role key server-side which bypasses RLS

CREATE POLICY "Deny all for user" ON "user" FOR ALL USING (false);
CREATE POLICY "Deny all for session" ON "session" FOR ALL USING (false);
CREATE POLICY "Deny all for account" ON "account" FOR ALL USING (false);
CREATE POLICY "Deny all for verification" ON "verification" FOR ALL USING (false);
CREATE POLICY "Deny all for organization" ON "organization" FOR ALL USING (false);
CREATE POLICY "Deny all for member" ON "member" FOR ALL USING (false);
CREATE POLICY "Deny all for invitation" ON "invitation" FOR ALL USING (false);

-- ============ DOMAIN TABLES ============
-- These hold sensitive business data. Deny all API access.
-- The app uses server-side queries with service_role key.

ALTER TABLE "contact" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pipeline_stage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "lead" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "conversation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "meta_credentials" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "agent_profile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "kb_entry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "template" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "agent_test_run" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "agent_test_case" ENABLE ROW LEVEL SECURITY;

-- Domain tables: DENY all access from API (anon + authenticated roles)
-- Server uses service_role which bypasses RLS

CREATE POLICY "Deny all for contact" ON "contact" FOR ALL USING (false);
CREATE POLICY "Deny all for pipeline_stage" ON "pipeline_stage" FOR ALL USING (false);
CREATE POLICY "Deny all for lead" ON "lead" FOR ALL USING (false);
CREATE POLICY "Deny all for conversation" ON "conversation" FOR ALL USING (false);
CREATE POLICY "Deny all for message" ON "message" FOR ALL USING (false);
CREATE POLICY "Deny all for meta_credentials" ON "meta_credentials" FOR ALL USING (false);
CREATE POLICY "Deny all for agent_profile" ON "agent_profile" FOR ALL USING (false);
CREATE POLICY "Deny all for kb_entry" ON "kb_entry" FOR ALL USING (false);
CREATE POLICY "Deny all for template" ON "template" FOR ALL USING (false);
CREATE POLICY "Deny all for agent_test_run" ON "agent_test_run" FOR ALL USING (false);
CREATE POLICY "Deny all for agent_test_case" ON "agent_test_case" FOR ALL USING (false);

-- ============================================================
-- VERIFY: After running, check Supabase Dashboard > Table Editor
-- All tables should show the 🔒 icon indicating RLS is enabled
-- ============================================================
