const pool = require("../config/db");

const createTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS content_blocks (
      id SERIAL PRIMARY KEY,
      page VARCHAR(50) NOT NULL,
      section_key VARCHAR(100) UNIQUE NOT NULL,
      section_label VARCHAR(150) NOT NULL,
      fields JSONB DEFAULT '{}',
      images JSONB DEFAULT '[]',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await pool.query(query);

  await pool.query(`
    ALTER TABLE content_blocks
      ADD COLUMN IF NOT EXISTS fields_kn JSONB DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS fields_hi JSONB DEFAULT '{}';
  `);
};

const findAll = async (page) => {
  if (page) {
    const result = await pool.query(
      `
      SELECT *
      FROM content_blocks
      WHERE page = $1
      ORDER BY id ASC
      `,
      [page],
    );
    return result.rows;
  }

  const result = await pool.query(`
    SELECT *
    FROM content_blocks
    ORDER BY page ASC, id ASC
  `);

  return result.rows;
};

const findBySectionKey = async (sectionKey) => {
  const result = await pool.query(
    `
    SELECT *
    FROM content_blocks
    WHERE section_key = $1
    `,
    [sectionKey],
  );

  return result.rows[0] || null;
};

const upsert = async (block) => {
  const fieldsJson = JSON.stringify(block.fields || {});
  const imagesJson = JSON.stringify(block.images || []);

  const result = await pool.query(
    `
    INSERT INTO content_blocks (page, section_key, section_label, fields, images)
    VALUES ($1, $2, $3, $4::jsonb, $5::jsonb)
    ON CONFLICT (section_key) DO UPDATE SET
      page = EXCLUDED.page,
      section_label = EXCLUDED.section_label,
      fields = EXCLUDED.fields,
      images = EXCLUDED.images,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
    `,
    [
      block.page,
      block.section_key,
      block.section_label,
      fieldsJson,
      imagesJson,
    ],
  );

  return result.rows[0];
};

/** Force-reset a block to the given defaults (full replace, not merge). */
const resetToDefaults = async (block) => upsert(block);

const updateBySectionKey = async (sectionKey, { fields, images }) => {
  const existing = await findBySectionKey(sectionKey);

  if (!existing) {
    throw new Error("Content block not found");
  }

  const nextFields =
    fields !== undefined ? fields : existing.fields || {};
  const nextImages =
    images !== undefined ? images : existing.images || [];

  const result = await pool.query(
    `
    UPDATE content_blocks
    SET
      fields = $2::jsonb,
      images = $3::jsonb,
      updated_at = CURRENT_TIMESTAMP
    WHERE section_key = $1
    RETURNING *
    `,
    [sectionKey, JSON.stringify(nextFields), JSON.stringify(nextImages)],
  );

  return result.rows[0];
};

const removeBySectionKey = async (sectionKey) => {
  const result = await pool.query(
    `
    DELETE FROM content_blocks
    WHERE section_key = $1
    RETURNING *
    `,
    [sectionKey],
  );

  return result.rows[0] || null;
};

module.exports = {
  createTable,
  findAll,
  findBySectionKey,
  upsert,
  resetToDefaults,
  updateBySectionKey,
  removeBySectionKey,
};
