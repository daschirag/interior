/**
 * Seeds disciplines from public/Services.html #svcList (data-svc 0–12).
 * Run: node database/seed-disciplines.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const pool = require("../src/config/db");
const Discipline = require("../src/models/disciplineModel");
const { getDisciplineDefaults } = require("../src/data/disciplineDefaults");

async function main() {
  await pool.query("DELETE FROM disciplines WHERE title = $1", [
    "Step2 Test Discipline",
  ]);

  const disciplines = getDisciplineDefaults();

  if (disciplines.length !== 13) {
    console.error("Expected 13 disciplines from Services.html, got", disciplines.length);
    process.exit(1);
  }

  await Discipline.createTable();

  for (const discipline of disciplines) {
    const saved = await Discipline.upsertBySlug(discipline);
    console.log("Seeded discipline:", saved.title);
  }

  const count = await pool.query(
    "SELECT COUNT(*)::int AS n FROM disciplines WHERE is_active = true",
  );
  console.log("Done — disciplines count:", count.rows[0].n);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
