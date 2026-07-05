-- Add structured contact wizard fields (safe on existing databases)
ALTER TABLE contact_submissions
  ADD COLUMN IF NOT EXISTS space_type TEXT,
  ADD COLUMN IF NOT EXISTS style TEXT;
