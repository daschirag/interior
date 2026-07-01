const pool = require("../config/db");

const createTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS districts (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      hero_title TEXT,
      hero_description TEXT,
      seo_title TEXT,
      seo_description TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  console.log("Creating districts table...");
  await pool.query(query);
  console.log("Districts table created!");
};

const create = async (district) => {
  const query = `
    INSERT INTO districts (
      name,
      slug,
      hero_title,
      hero_description,
      seo_title,
      seo_description
    )
    VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING *;
  `;

  const result = await pool.query(
    query,
    [
      district.name,
      district.slug,
      district.hero_title,
      district.hero_description,
      district.seo_title,
      district.seo_description,
    ]
  );

  return result.rows[0];
};

const update = async (id, district) => {
  const query = `
    UPDATE districts
    SET
      name = $1,
      slug = $2,
      hero_title = $3,
      hero_description = $4,
      seo_title = $5,
      seo_description = $6
    WHERE id = $7
    RETURNING *;
  `;

  const result = await pool.query(
    query,
    [
      district.name,
      district.slug,
      district.hero_title,
      district.hero_description,
      district.seo_title,
      district.seo_description,
      id,
    ]
  );

  return result.rows[0];
};

const remove = async (id) => {
  const query = `
    UPDATE districts
    SET is_active = false
    WHERE id = $1
    RETURNING *;
  `;

  const result = await pool.query(
    query,
    [id]
  );

  return result.rows[0];
};

module.exports = {
  createTable,
  create,
  update,
  remove,
};