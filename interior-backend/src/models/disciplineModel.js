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
      budget_range = $4,
      timeline = $5,
      scope = $6,
      tags = $7,
      image_url = $8,
      cta_projects_link = $9,
      cta_consult_link = $10,
      is_active = true
    WHERE id = $11
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
    id,
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
  update,
  remove,
};