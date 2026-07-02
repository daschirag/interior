const pool = require("../config/db");

const createTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      location VARCHAR(255),
      year INTEGER,
      area_sqft INTEGER,
      description TEXT,
      material_tags TEXT[],
      images TEXT[],
      before_image_url TEXT,
      after_image_url TEXT,
      is_featured BOOLEAN DEFAULT false,
      journey_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await pool.query(query);
};

const create = async (project) => {
  const query = `
    INSERT INTO projects (
      title,
      slug,
      location,
      year,
      area_sqft,
      description,
      material_tags,
      images,
      before_image_url,
      after_image_url,
      is_featured,
      journey_order
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    RETURNING *;
  `;

  const values = [
    project.title,
    project.slug,
    project.location || null,
    project.year || null,
    project.area_sqft || null,
    project.description || null,
    project.material_tags || [],
    project.images || [],
    project.before_image_url || null,
    project.after_image_url || null,
    project.is_featured || false,
    project.journey_order || 0,
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};

const update = async (id, project) => {
  // Get existing project
  const existing = await pool.query(
    "SELECT * FROM projects WHERE id = $1",
    [id]
  );

  if (existing.rows.length === 0) {
    throw new Error("Project not found");
  }

  const current = existing.rows[0];

  const query = `
    UPDATE projects
    SET
      title = $1,
      slug = $2,
      location = $3,
      year = $4,
      area_sqft = $5,
      description = $6,
      material_tags = $7,
      images = $8,
      before_image_url = $9,
      after_image_url = $10,
      is_featured = $11,
      journey_order = $12,
      is_active = true
    WHERE id = $13
    RETURNING *;
  `;

  const values = [
    project.title ?? current.title,
    project.slug ?? current.slug,
    project.location ?? current.location,
    project.year ?? current.year,
    project.area_sqft ?? current.area_sqft,
    project.description ?? current.description,
    project.material_tags ?? current.material_tags,
    project.images ?? current.images,
    project.before_image_url ?? current.before_image_url,
    project.after_image_url ?? current.after_image_url,
    project.is_featured ?? current.is_featured,
    project.journey_order ?? current.journey_order,
    id,
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};

const remove = async (id) => {
  const query = `
    UPDATE projects
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