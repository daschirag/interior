/**
 * Seeds projects from public/Projects.html journey panels + dashboard featured cards.
 * Run: node database/seed-projects.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const pool = require("../src/config/db");
const Project = require("../src/models/projectModel");
const { getProjectDefaults } = require("../src/data/projectDefaults");

async function main() {
  await pool.query("DELETE FROM projects WHERE title = $1", [
    "Step1 Test Project",
  ]);

  const projects = getProjectDefaults();

  if (projects.length !== 3) {
    console.error("Expected 3 projects from Projects.html, got", projects.length);
    process.exit(1);
  }

  await Project.createTable();

  for (const project of projects) {
    const saved = await Project.upsertBySlug(project);
    console.log("Seeded project:", saved.title);
  }

  const count = await pool.query(
    "SELECT COUNT(*)::int AS n FROM projects WHERE is_active = true",
  );
  console.log("Done — projects count:", count.rows[0].n);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
