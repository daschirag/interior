const pool = require("../config/db");
const { normalizeDisciplineImages } = require("../utils/disciplineImages");

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

  await pool.query(`
    ALTER TABLE disciplines
      ADD COLUMN IF NOT EXISTS title_kn TEXT,
      ADD COLUMN IF NOT EXISTS scope_kn TEXT,
      ADD COLUMN IF NOT EXISTS title_hi TEXT,
      ADD COLUMN IF NOT EXISTS scope_hi TEXT;
  `);

  await pool.query(`
    ALTER TABLE disciplines
      ADD COLUMN IF NOT EXISTS subtitle_kn TEXT,
      ADD COLUMN IF NOT EXISTS subtitle_hi TEXT,
      ADD COLUMN IF NOT EXISTS headline_kn TEXT,
      ADD COLUMN IF NOT EXISTS headline_hi TEXT,
      ADD COLUMN IF NOT EXISTS description_kn TEXT,
      ADD COLUMN IF NOT EXISTS description_hi TEXT,
      ADD COLUMN IF NOT EXISTS tags_kn TEXT[],
      ADD COLUMN IF NOT EXISTS tags_hi TEXT[];
  `);

  await pool.query(`
    ALTER TABLE disciplines
      ADD COLUMN IF NOT EXISTS images TEXT[];
  `);

  await pool.query(`
    UPDATE disciplines
    SET images = ARRAY[image_url]
    WHERE image_url IS NOT NULL
      AND image_url <> ''
      AND (images IS NULL OR cardinality(images) = 0);
  `);
};

const create = async (discipline) => {
  const imgs = normalizeDisciplineImages(discipline);
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
      images,
      cta_projects_link,
      cta_consult_link
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
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
    imgs.image_url,
    imgs.images,
    discipline.cta_projects_link || null,
    discipline.cta_consult_link || null,
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};

const findById = async (id) => {
  const result = await pool.query(
    `
    SELECT *
    FROM disciplines
    WHERE id = $1 AND is_active = true
    `,
    [id],
  );

  return result.rows[0] || null;
};

const applySnapshot = async (id, snapshot) => {
  const existing = await findById(id);
  if (!existing) {
    throw new Error("Discipline not found");
  }

  const imgs = normalizeDisciplineImages({
    images: snapshot.images !== undefined ? snapshot.images : existing.images,
    image_url:
      snapshot.image_url !== undefined ? snapshot.image_url : existing.image_url,
  });

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
      images = $12,
      cta_projects_link = $13,
      cta_consult_link = $14,
      is_active = $15
    WHERE id = $16
    RETURNING *;
  `;

  const values = [
    snapshot.slug ?? existing.slug,
    snapshot.title ?? existing.title,
    snapshot.display_order ?? 0,
    snapshot.subtitle ?? null,
    snapshot.headline ?? null,
    snapshot.description ?? null,
    snapshot.budget_range ?? null,
    snapshot.timeline ?? null,
    snapshot.scope ?? null,
    snapshot.tags ?? [],
    imgs.image_url,
    imgs.images,
    snapshot.cta_projects_link ?? null,
    snapshot.cta_consult_link ?? null,
    snapshot.is_active !== false,
    id,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

const update = async (id, discipline) => {
  const imgs = normalizeDisciplineImages(discipline);
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
      images = $12,
      cta_projects_link = $13,
      cta_consult_link = $14,
      is_active = true
    WHERE id = $15
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
    imgs.image_url,
    imgs.images,
    discipline.cta_projects_link || null,
    discipline.cta_consult_link || null,
    id,
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};

const upsertBySlug = async (discipline) => {
  const imgs = normalizeDisciplineImages(discipline);
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
      images,
      cta_projects_link,
      cta_consult_link
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
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
      images = EXCLUDED.images,
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
    imgs.image_url,
    imgs.images,
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
  findById,
  applySnapshot,
  update,
  upsertBySlug,
  remove,
};