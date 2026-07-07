-- =============================================================================
-- Vinayak Interiors — Supabase Realtime Phase 1
-- Run in: Supabase Dashboard → SQL Editor → New query
--
-- Prerequisites:
--   • Tables content_blocks, projects, disciplines already exist (CMS schema).
--   • studios table is created below if missing.
--
-- After run: Database → Replication → confirm tables appear under
--   supabase_realtime (or run the verification query at the bottom).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. Studios table (safe if Express already created it locally)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS studios (
  id SERIAL PRIMARY KEY,
  city VARCHAR(255) UNIQUE NOT NULL,
  brand VARCHAR(255),
  address TEXT,
  hours VARCHAR(255),
  coordinates VARCHAR(255),
  maps_url TEXT,
  phone VARCHAR(50),
  phone_display VARCHAR(50),
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optional: project_type on projects (Express migration — harmless if present)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_type VARCHAR(255);

-- -----------------------------------------------------------------------------
-- 1. Row Level Security — public read-only for anon (safe with anon key)
-- -----------------------------------------------------------------------------
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE disciplines ENABLE ROW LEVEL SECURITY;
ALTER TABLE studios ENABLE ROW LEVEL SECURITY;

-- Drop old policies if re-running this script
DROP POLICY IF EXISTS "Public read access for content" ON content_blocks;
DROP POLICY IF EXISTS "Public read access for projects" ON projects;
DROP POLICY IF EXISTS "Public read access for disciplines" ON disciplines;
DROP POLICY IF EXISTS "Public read access for studios" ON studios;

CREATE POLICY "Public read access for content"
  ON content_blocks FOR SELECT TO anon
  USING (true);

CREATE POLICY "Public read access for projects"
  ON projects FOR SELECT TO anon
  USING (true);

CREATE POLICY "Public read access for disciplines"
  ON disciplines FOR SELECT TO anon
  USING (true);

CREATE POLICY "Public read access for studios"
  ON studios FOR SELECT TO anon
  USING (true);

-- anon must be able to SELECT (RLS still applies)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON content_blocks TO anon;
GRANT SELECT ON projects TO anon;
GRANT SELECT ON disciplines TO anon;
GRANT SELECT ON studios TO anon;

-- -----------------------------------------------------------------------------
-- 2. Realtime publication (idempotent — skips if already added)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE content_blocks;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE projects;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE disciplines;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE studios;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Full row payloads on UPDATE (helps clients receive complete new row)
ALTER TABLE content_blocks REPLICA IDENTITY FULL;
ALTER TABLE projects REPLICA IDENTITY FULL;
ALTER TABLE disciplines REPLICA IDENTITY FULL;
ALTER TABLE studios REPLICA IDENTITY FULL;

-- -----------------------------------------------------------------------------
-- 3. Verify (optional — run separately after the above succeeds)
-- -----------------------------------------------------------------------------
-- SELECT schemaname, tablename
-- FROM pg_publication_tables
-- WHERE pubname = 'supabase_realtime'
-- ORDER BY tablename;
--
-- SELECT tablename, policyname, roles, cmd
-- FROM pg_policies
-- WHERE tablename IN ('content_blocks', 'projects', 'disciplines', 'studios');
