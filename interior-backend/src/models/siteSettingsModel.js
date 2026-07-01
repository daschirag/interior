const pool = require("../config/db");

const createTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS site_settings (
      id SERIAL PRIMARY KEY,
      company_name VARCHAR(255),
      phone VARCHAR(50),
      email VARCHAR(255),
      address TEXT,
      whatsapp VARCHAR(50),
      instagram_url TEXT,
      facebook_url TEXT,
      youtube_url TEXT,
      business_hours TEXT,
      catalog_pdf_url TEXT,
      studio_locations JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await pool.query(query);
};

const upsert = async (settings) => {
  const existing = await pool.query(
    "SELECT * FROM site_settings LIMIT 1"
  );

  const values = [
    settings.company_name || null,
    settings.phone || null,
    settings.email || null,
    settings.address || null,
    settings.whatsapp || null,
    settings.instagram_url || null,
    settings.facebook_url || null,
    settings.youtube_url || null,
    settings.business_hours || null,
    settings.catalog_pdf_url || null,
    JSON.stringify(settings.studio_locations || []),
  ];

  if (existing.rows.length === 0) {
    const result = await pool.query(
      `
      INSERT INTO site_settings (
        company_name,
        phone,
        email,
        address,
        whatsapp,
        instagram_url,
        facebook_url,
        youtube_url,
        business_hours,
        catalog_pdf_url,
        studio_locations
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb
      )
      RETURNING *;
      `,
      values
    );

    return result.rows[0];
  }

  values.push(existing.rows[0].id);

  const result = await pool.query(
    `
    UPDATE site_settings
    SET
      company_name = $1,
      phone = $2,
      email = $3,
      address = $4,
      whatsapp = $5,
      instagram_url = $6,
      facebook_url = $7,
      youtube_url = $8,
      business_hours = $9,
      catalog_pdf_url = $10,
      studio_locations = $11::jsonb
    WHERE id = $12
    RETURNING *;
    `,
    values
  );

  return result.rows[0];
};

module.exports = {
  createTable,
  upsert,
};