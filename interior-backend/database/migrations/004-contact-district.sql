-- Canonical district resolved at submit time (with city + region)
ALTER TABLE contact_submissions
  ADD COLUMN IF NOT EXISTS district TEXT;
