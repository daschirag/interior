CREATE TABLE IF NOT EXISTS content_block_history (
  id SERIAL PRIMARY KEY,
  section_key VARCHAR(100) NOT NULL,
  fields JSONB NOT NULL,
  images JSONB NOT NULL,
  edited_by VARCHAR(150),
  edited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_content_block_history_section_key
  ON content_block_history (section_key, edited_at DESC);
