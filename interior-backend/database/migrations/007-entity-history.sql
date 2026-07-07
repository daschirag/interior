CREATE TABLE IF NOT EXISTS entity_history (
  id SERIAL PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INTEGER NOT NULL,
  snapshot JSONB NOT NULL,
  edited_by VARCHAR(150),
  edited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_entity_history_entity
  ON entity_history (entity_type, entity_id, edited_at DESC);
