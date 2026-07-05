const pool = require("../config/db");

const createTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS content_block_history (
      id SERIAL PRIMARY KEY,
      section_key VARCHAR(100) NOT NULL,
      fields JSONB NOT NULL,
      images JSONB NOT NULL,
      edited_by VARCHAR(150),
      edited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_content_block_history_section_key
    ON content_block_history (section_key, edited_at DESC);
  `);
};

const insertSnapshot = async ({ sectionKey, fields, images, editedBy }) => {
  const result = await pool.query(
    `
    INSERT INTO content_block_history (section_key, fields, images, edited_by)
    VALUES ($1, $2::jsonb, $3::jsonb, $4)
    RETURNING *
    `,
    [
      sectionKey,
      JSON.stringify(fields || {}),
      JSON.stringify(images || []),
      editedBy || null,
    ],
  );

  return result.rows[0];
};

const findBySectionKey = async (sectionKey, limit = 20) => {
  const result = await pool.query(
    `
    SELECT id, section_key, fields, images, edited_by, edited_at
    FROM content_block_history
    WHERE section_key = $1
    ORDER BY edited_at DESC, id DESC
    LIMIT $2
    `,
    [sectionKey, limit],
  );

  return result.rows;
};

const findById = async (id) => {
  const result = await pool.query(
    `
    SELECT id, section_key, fields, images, edited_by, edited_at
    FROM content_block_history
    WHERE id = $1
    `,
    [id],
  );

  return result.rows[0] || null;
};

module.exports = {
  createTable,
  insertSnapshot,
  findBySectionKey,
  findById,
};
