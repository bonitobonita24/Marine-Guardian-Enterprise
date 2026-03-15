-- ─────────────────────────────────────────────────────────────────────────────
-- Marine Guardian Enterprise — PostgreSQL RLS Policies
-- Applied after initial migration via mg_migrate (BYPASSRLS).
-- Runtime enforcement: mg_app role (NOT superuser, NO BYPASSRLS).
-- Tenant context set per-transaction: SET LOCAL app.current_tenant_id = '...';
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Create runtime and migration roles ────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'mg_app') THEN
    CREATE ROLE mg_app LOGIN PASSWORD 'change_in_production';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'mg_migrate') THEN
    CREATE ROLE mg_migrate LOGIN PASSWORD 'change_in_production' BYPASSRLS;
  END IF;
END $$;

GRANT CONNECT ON DATABASE marine_guardian TO mg_app;
GRANT CONNECT ON DATABASE marine_guardian TO mg_migrate;

-- Grant all table permissions to mg_app (RLS filters rows)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO mg_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO mg_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO mg_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO mg_app;

-- Grant full permissions to mg_migrate (BYPASSRLS)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO mg_migrate;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO mg_migrate;

-- ── Enable RLS on all tenant-scoped tables ────────────────────────────────────

ALTER TABLE barangays ENABLE ROW LEVEL SECURITY;
ALTER TABLE fisherfolks ENABLE ROW LEVEL SECURITY;
ALTER TABLE vessels ENABLE ROW LEVEL SECURITY;
ALTER TABLE permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE catch_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE distribution_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE patrols ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ── Direct tenant_id tables ───────────────────────────────────────────────────

CREATE POLICY tenant_isolation ON barangays
  USING (tenant_id = current_setting('app.current_tenant_id', true)::text);

CREATE POLICY tenant_isolation ON fisherfolks
  USING (tenant_id = current_setting('app.current_tenant_id', true)::text);

CREATE POLICY tenant_isolation ON vessels
  USING (tenant_id = current_setting('app.current_tenant_id', true)::text);

CREATE POLICY tenant_isolation ON permits
  USING (tenant_id = current_setting('app.current_tenant_id', true)::text);

CREATE POLICY tenant_isolation ON catch_reports
  USING (tenant_id = current_setting('app.current_tenant_id', true)::text);

CREATE POLICY tenant_isolation ON programs
  USING (tenant_id = current_setting('app.current_tenant_id', true)::text);

CREATE POLICY tenant_isolation ON incidents
  USING (tenant_id = current_setting('app.current_tenant_id', true)::text);

CREATE POLICY tenant_isolation ON patrols
  USING (tenant_id = current_setting('app.current_tenant_id', true)::text);

-- AuditLog: allow SELECT by owning tenant, allow INSERT from any (cross-tenant events use NULL)
CREATE POLICY tenant_isolation_select ON audit_logs
  FOR SELECT
  USING (
    tenant_id IS NULL
    OR tenant_id = current_setting('app.current_tenant_id', true)::text
  );

CREATE POLICY tenant_isolation_insert ON audit_logs
  FOR INSERT
  WITH CHECK (true); -- AuditLogWriter inline job always runs with valid session

-- ── Indirect tenant tables (via join) ─────────────────────────────────────────
-- program_beneficiaries and distribution_events inherit tenant via program_id

CREATE POLICY tenant_isolation ON program_beneficiaries
  USING (
    program_id IN (
      SELECT id FROM programs
      WHERE tenant_id = current_setting('app.current_tenant_id', true)::text
    )
  );

CREATE POLICY tenant_isolation ON distribution_events
  USING (
    program_id IN (
      SELECT id FROM programs
      WHERE tenant_id = current_setting('app.current_tenant_id', true)::text
    )
  );

-- ── AuditLog immutability — deny UPDATE and DELETE for mg_app ─────────────────

CREATE POLICY no_update ON audit_logs FOR UPDATE USING (false);
CREATE POLICY no_delete ON audit_logs FOR DELETE USING (false);

-- ── BA cross-tenant analytics: separate session var ──────────────────────────
-- BA Admin / Analyst use a separate connection pool (ba_analytics_pool).
-- For consolidated queries, app.current_tenant_id is set to '__ALL__' and
-- application-level aggregation is used (raw PII never returned).
-- RLS allows BA users to read records where tenant_id matches their BA tenant,
-- but the consolidated dashboard reads are handled by a service account
-- that uses mg_migrate role only during the analytics session.
-- See src/rls.ts for SET LOCAL implementation.
