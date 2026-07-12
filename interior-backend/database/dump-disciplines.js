require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const pool = require("../src/config/db");

(async () => {
  const r = await pool.query(`
    SELECT *
    FROM disciplines
    WHERE is_active = true
    ORDER BY display_order ASC, id ASC
  `);
  console.log(JSON.stringify(r.rows, null, 2));
  console.log("---");
  console.log("count:", r.rows.length);
  console.log("columns:", r.rows[0] ? Object.keys(r.rows[0]) : []);
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
