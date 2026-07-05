-- Region saved at submit time for accurate analytics
ALTER TABLE contact_submissions
  ADD COLUMN IF NOT EXISTS region TEXT;
