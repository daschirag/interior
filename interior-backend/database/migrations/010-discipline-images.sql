-- Discipline gallery images (cover-flow + lightbox)
ALTER TABLE disciplines
  ADD COLUMN IF NOT EXISTS images TEXT[];

-- Backfill from existing single cover image
UPDATE disciplines
SET images = ARRAY[image_url]
WHERE image_url IS NOT NULL
  AND image_url <> ''
  AND (images IS NULL OR cardinality(images) = 0);
