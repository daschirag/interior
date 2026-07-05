const pool = require("../config/db");

const createTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS disciplines (
      id SERIAL PRIMARY KEY,
      slug VARCHAR(100) UNIQUE NOT NULL,
      title VARCHAR(255) NOT NULL,
      display_order INTEGER DEFAULT 0,
      budget_range VARCHAR(255),
      timeline VARCHAR(255),
      scope TEXT,
      tags TEXT[],
      image_url TEXT,
      cta_projects_link TEXT,
      cta_consult_link TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await pool.query(query);

  await pool.query(`
    ALTER TABLE disciplines
      ADD COLUMN IF NOT EXISTS subtitle VARCHAR(255),
      ADD COLUMN IF NOT EXISTS headline TEXT,
      ADD COLUMN IF NOT EXISTS description TEXT;
  `);
};

const create = async (discipline) => {
  const query = `
    INSERT INTO disciplines (
      slug,
      title,
      display_order,
      budget_range,
      timeline,
      scope,
      tags,
      image_url,
      cta_projects_link,
      cta_consult_link
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING *;
  `;

  const values = [
    discipline.slug,
    discipline.title,
    discipline.display_order || 0,
    discipline.budget_range || null,
    discipline.timeline || null,
    discipline.scope || null,
    discipline.tags || [],
    discipline.image_url || null,
    discipline.cta_projects_link || null,
    discipline.cta_consult_link || null,
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};

const update = async (id, discipline) => {
  const query = `
    UPDATE disciplines
    SET
      slug = $1,
      title = $2,
      display_order = $3,
      subtitle = $4,
      headline = $5,
      description = $6,
      budget_range = $7,
      timeline = $8,
      scope = $9,
      tags = $10,
      image_url = $11,
      cta_projects_link = $12,
      cta_consult_link = $13,
      is_active = true
    WHERE id = $14
    RETURNING *;
  `;

  const values = [
    discipline.slug,
    discipline.title,
    discipline.display_order || 0,
    discipline.subtitle || null,
    discipline.headline || null,
    discipline.description || null,
    discipline.budget_range || null,
    discipline.timeline || null,
    discipline.scope || null,
    discipline.tags || [],
    discipline.image_url || null,
    discipline.cta_projects_link || null,
    discipline.cta_consult_link || null,
    id,
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};

const upsertBySlug = async (discipline) => {
  const query = `
    INSERT INTO disciplines (
      slug,
      title,
      display_order,
      subtitle,
      headline,
      description,
      budget_range,
      timeline,
      scope,
      tags,
      image_url,
      cta_projects_link,
      cta_consult_link
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title,
      display_order = EXCLUDED.display_order,
      subtitle = EXCLUDED.subtitle,
      headline = EXCLUDED.headline,
      description = EXCLUDED.description,
      budget_range = EXCLUDED.budget_range,
      timeline = EXCLUDED.timeline,
      scope = EXCLUDED.scope,
      tags = EXCLUDED.tags,
      image_url = EXCLUDED.image_url,
      cta_projects_link = EXCLUDED.cta_projects_link,
      cta_consult_link = EXCLUDED.cta_consult_link,
      is_active = true
    RETURNING *;
  `;

  const values = [
    discipline.slug,
    discipline.title,
    discipline.display_order || 0,
    discipline.subtitle || null,
    discipline.headline || null,
    discipline.description || null,
    discipline.budget_range || null,
    discipline.timeline || null,
    discipline.scope || null,
    discipline.tags || [],
    discipline.image_url || null,
    discipline.cta_projects_link || null,
    discipline.cta_consult_link || null,
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};

const remove = async (id) => {
  const query = `
    UPDATE disciplines
    SET is_active = false
    WHERE id = $1
    RETURNING *;
  `;

  const result = await pool.query(query, [id]);

  return result.rows[0];
};

module.exports = {
  createTable,
  create,
  upsertBySlug,
  update,
  remove,
};