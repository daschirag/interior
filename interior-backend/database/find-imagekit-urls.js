require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const pool = require("../src/config/db");

async function main() {
  const cb = await pool.query(`
    SELECT section_key, section_label, images
    FROM content_blocks
    WHERE images::text ILIKE '%imagekit%'
    LIMIT 10
  `);
  const proj = await pool.query(`
    SELECT id, title, images, before_image_url, after_image_url
    FROM projects
    WHERE images::text ILIKE '%imagekit%'
       OR before_image_url ILIKE '%imagekit%'
       OR after_image_url ILIKE '%imagekit%'
    LIMIT 10
  `);
  const disc = await pool.query(`
    SELECT id, title, image_url FROM disciplines WHERE image_url ILIKE '%imagekit%' LIMIT 10
  `);
  const stud = await pool.query(`
    SELECT id, city, image_url FROM studios WHERE image_url ILIKE '%imagekit%' LIMIT 10
  `);

  console.log("content_blocks", JSON.stringify(cb.rows, null, 2));
  console.log("projects", JSON.stringify(proj.rows, null, 2));
  console.log("disciplines", JSON.stringify(disc.rows, null, 2));
  console.log("studios", JSON.stringify(stud.rows, null, 2));
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
