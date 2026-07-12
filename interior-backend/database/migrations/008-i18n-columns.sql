-- Trilingual support (en default + kn / hi)
-- Parallel translation columns; English remains the source of truth in existing columns.

ALTER TABLE content_blocks
  ADD COLUMN IF NOT EXISTS fields_kn JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS fields_hi JSONB DEFAULT '{}';

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS title_kn TEXT,
  ADD COLUMN IF NOT EXISTS description_kn TEXT,
  ADD COLUMN IF NOT EXISTS title_hi TEXT,
  ADD COLUMN IF NOT EXISTS description_hi TEXT;

ALTER TABLE disciplines
  ADD COLUMN IF NOT EXISTS title_kn TEXT,
  ADD COLUMN IF NOT EXISTS scope_kn TEXT,
  ADD COLUMN IF NOT EXISTS title_hi TEXT,
  ADD COLUMN IF NOT EXISTS scope_hi TEXT;

ALTER TABLE studios
  ADD COLUMN IF NOT EXISTS brand_kn TEXT,
  ADD COLUMN IF NOT EXISTS brand_hi TEXT;
