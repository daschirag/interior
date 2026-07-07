const pool = require("../config/db");

const createTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS entity_history (
      id SERIAL PRIMARY KEY,
      entity_type VARCHAR(50) NOT NULL,
      entity_id INTEGER NOT NULL,
      snapshot JSONB NOT NULL,
      edited_by VARCHAR(150),
      edited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_entity_history_entity
    ON entity_history (entity_type, entity_id, edited_at DESC);
  `);
};

const insertSnapshot = async ({ entityType, entityId, snapshot, editedBy }) => {
  const result = await pool.query(
    `
    INSERT INTO entity_history (entity_type, entity_id, snapshot, edited_by)
    VALUES ($1, $2, $3::jsonb, $4)
    RETURNING *
    `,
    [
      entityType,
      entityId,
      JSON.stringify(snapshot || {}),
      editedBy || null,
    ],
  );

  return result.rows[0];
};

const findByEntity = async (entityType, entityId, limit = 20) => {
  const result = await pool.query(
    `
    SELECT id, entity_type, entity_id, snapshot, edited_by, edited_at
    FROM entity_history
    WHERE entity_type = $1 AND entity_id = $2
    ORDER BY edited_at DESC, id DESC
    LIMIT $3
    `,
    [entityType, entityId, limit],
  );

  return result.rows;
};

const findById = async (id) => {
  const result = await pool.query(
    `
    SELECT id, entity_type, entity_id, snapshot, edited_by, edited_at
    FROM entity_history
    WHERE id = $1
    `,
    [id],
  );

  return result.rows[0] || null;
};

module.exports = {
  createTable,
  insertSnapshot,
  findByEntity,
  findById,
};
