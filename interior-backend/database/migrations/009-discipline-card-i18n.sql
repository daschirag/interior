-- Discipline card body i18n (subtitle, headline, description, tags)
ALTER TABLE disciplines
  ADD COLUMN IF NOT EXISTS subtitle_kn TEXT,
  ADD COLUMN IF NOT EXISTS subtitle_hi TEXT,
  ADD COLUMN IF NOT EXISTS headline_kn TEXT,
  ADD COLUMN IF NOT EXISTS headline_hi TEXT,
  ADD COLUMN IF NOT EXISTS description_kn TEXT,
  ADD COLUMN IF NOT EXISTS description_hi TEXT,
  ADD COLUMN IF NOT EXISTS tags_kn TEXT[],
  ADD COLUMN IF NOT EXISTS tags_hi TEXT[];
