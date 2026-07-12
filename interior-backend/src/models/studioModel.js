const pool = require("../config/db");

const createTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS studios (
      id SERIAL PRIMARY KEY,
      city VARCHAR(255) UNIQUE NOT NULL,
      brand VARCHAR(255),
      address TEXT,
      hours VARCHAR(255),
      coordinates VARCHAR(255),
      maps_url TEXT,
      phone VARCHAR(50),
      phone_display VARCHAR(50),
      image_url TEXT,
      display_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await pool.query(query);

  await pool.query(`
    ALTER TABLE studios
      ADD COLUMN IF NOT EXISTS brand_kn TEXT,
      ADD COLUMN IF NOT EXISTS brand_hi TEXT;
  `);
};

const findAll = async () => {
  const result = await pool.query(`
    SELECT *
    FROM studios
    WHERE is_active = true
    ORDER BY display_order ASC, id ASC
  `);

  return result.rows;
};

const findById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM studios WHERE id = $1 AND is_active = true",
    [id],
  );

  return result.rows[0] || null;
};

const upsertByCity = async (studio) => {
  const result = await pool.query(
    `
    INSERT INTO studios (
      city, brand, address, hours, coordinates,
      maps_url, phone, phone_display, image_url, display_order
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    ON CONFLICT (city) DO UPDATE SET
      brand = EXCLUDED.brand,
      address = EXCLUDED.address,
      hours = EXCLUDED.hours,
      coordinates = EXCLUDED.coordinates,
      maps_url = EXCLUDED.maps_url,
      phone = EXCLUDED.phone,
      phone_display = EXCLUDED.phone_display,
      image_url = EXCLUDED.image_url,
      display_order = EXCLUDED.display_order,
      is_active = true
    RETURNING *
    `,
    [
      studio.city,
      studio.brand || null,
      studio.address || null,
      studio.hours || null,
      studio.coordinates || null,
      studio.maps_url || null,
      studio.phone || null,
      studio.phone_display || null,
      studio.image_url || null,
      studio.display_order || 0,
    ],
  );

  return result.rows[0];
};

const update = async (id, studio) => {
  const result = await pool.query(
    `
    UPDATE studios
    SET
      city = $1,
      brand = $2,
      address = $3,
      hours = $4,
      coordinates = $5,
      maps_url = $6,
      phone = $7,
      phone_display = $8,
      image_url = $9,
      display_order = $10,
      is_active = true
    WHERE id = $11
    RETURNING *
    `,
    [
      studio.city,
      studio.brand || null,
      studio.address || null,
      studio.hours || null,
      studio.coordinates || null,
      studio.maps_url || null,
      studio.phone || null,
      studio.phone_display || null,
      studio.image_url || null,
      studio.display_order || 0,
      id,
    ],
  );

  return result.rows[0];
};

const remove = async (id) => {
  const result = await pool.query(
    `
    UPDATE studios
    SET is_active = false
    WHERE id = $1
    RETURNING *
    `,
    [id],
  );

  return result.rows[0];
};

module.exports = {
  createTable,
  findAll,
  findById,
  upsertByCity,
  update,
  remove,
};
