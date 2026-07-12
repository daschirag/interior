require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const pool = require("../src/config/db");

(async () => {
  const p = await pool.query(`
    SELECT slug, title, description, location, project_type
    FROM projects
    WHERE is_active = true
    ORDER BY journey_order ASC
    LIMIT 5
  `);
  console.log("=== PROJECTS ===");
  console.log(JSON.stringify(p.rows, null, 2));

  const b = await pool.query(`
    SELECT section_key, page, fields
    FROM content_blocks
    WHERE section_key IN (
      'dashboard-hero',
      'services-hero',
      'projects-hero',
      'contact-hero'
    )
    ORDER BY section_key
  `);
  console.log("=== KEY BLOCKS ===");
  b.rows.forEach((r) => {
    console.log("\n---", r.page, r.section_key);
    console.log(JSON.stringify(r.fields, null, 2));
  });
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
