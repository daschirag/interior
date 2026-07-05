-- City / location from contact form (for regional analytics)
ALTER TABLE contact_submissions
  ADD COLUMN IF NOT EXISTS city TEXT;
