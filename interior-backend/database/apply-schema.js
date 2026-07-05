require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const fs = require("fs");
const path = require("path");
const pool = require("../src/config/db");

async function main() {
  const sqlPath = path.join(__dirname, "unified-schema.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");

  await pool.query(sql);

  const migrationsDir = path.join(__dirname, "migrations");
  if (fs.existsSync(migrationsDir)) {
    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();
    for (const file of files) {
      const migration = fs.readFileSync(path.join(migrationsDir, file), "utf8");
      await pool.query(migration);
    }
  }

  const tables = await pool.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);

  console.log("TABLES:", tables.rows.map((r) => r.table_name).join(", "));
  await pool.end();
}

main().catch((err) => {
  console.error(err.message);
  pool.end();
  process.exit(1);
});
