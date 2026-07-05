require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const pool = require("../src/config/db");

pool
  .query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'contact_submissions'
    ORDER BY ordinal_position
  `)
  .then((r) => {
    console.log("contact_submissions columns:", r.rows.map((x) => x.column_name).join(", "));
    return pool.end();
  })
  .catch((e) => {
    console.error(e.message);
    pool.end();
    process.exit(1);
  });
